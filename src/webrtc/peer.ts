import { RTCPeerConnection, type RTCDataChannel, type RTCIceCandidate } from "werift";

import { DEFAULT_ICE_SERVERS, type IceServerConfig } from "../config/config.js";
import { SignalingClient } from "../signaling/client.js";
import type { AnswerMessage, OfferMessage, SignalingMessage } from "../signaling/messages.js";
import { A47Error } from "../utils/errors.js";
import { waitForDataChannelOpen, type DataChannelPayload } from "./data-channel.js";
export type { DataChannelPayload } from "./data-channel.js";

export interface A47Peer {
  onData(callback: (payload: DataChannelPayload) => void): void;
  onClose(callback: () => void): void;
  send(payload: DataChannelPayload): void;
  waitUntilOpen(): Promise<void>;
  close(): Promise<void>;
  getBufferedAmount(): number;
  getDataChannel(): RTCDataChannel;
}

export interface PeerOptions {
  iceServers?: IceServerConfig[];
  signalingClient: SignalingClient;
}

class WeriftA47Peer implements A47Peer {
  constructor(
    private readonly peerConnection: RTCPeerConnection,
    private readonly dataChannel: RTCDataChannel
  ) {}

  onData(callback: (payload: DataChannelPayload) => void): void {
    this.dataChannel.onMessage.subscribe((message) => callback(message));
  }

  onClose(callback: () => void): void {
    this.dataChannel.stateChange.subscribe((state) => {
      if (state === "closed") {
        callback();
      }
    });
  }

  send(payload: DataChannelPayload): void {
    if (this.dataChannel.readyState !== "open") {
      throw new A47Error("DataChannel is not open.");
    }

    this.dataChannel.send(payload);
  }

  waitUntilOpen(): Promise<void> {
    return waitForDataChannelOpen(this.dataChannel);
  }

  async close(): Promise<void> {
    this.dataChannel.close();
    await this.peerConnection.close();
  }

  getBufferedAmount(): number {
    return this.dataChannel.bufferedAmount;
  }

  getDataChannel(): RTCDataChannel {
    return this.dataChannel;
  }
}

export async function createSenderPeer(options: PeerOptions): Promise<A47Peer> {
  const peerConnection = createPeerConnection(options);
  const dataChannel = peerConnection.createDataChannel("a47-file-transfer", {
    ordered: true
  });

  const peer = new WeriftA47Peer(peerConnection, dataChannel);
  attachSignalingHandlers(peerConnection, options.signalingClient);

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  const localDescription = peerConnection.localDescription;

  if (!localDescription) {
    throw new A47Error("Unable to create a local WebRTC offer.");
  }

  options.signalingClient.send({
    type: "offer",
    description: {
      type: "offer",
      sdp: localDescription.sdp
    }
  });

  const answerMessage = await options.signalingClient.waitForMessage(
    (message) => message.type === "answer" || message.type === "error"
  );

  if (answerMessage.type === "error") {
    throw new A47Error(answerMessage.message);
  }

  await peerConnection.setRemoteDescription((answerMessage as AnswerMessage).description);
  return peer;
}

export async function createReceiverPeer(options: PeerOptions): Promise<A47Peer> {
  const peerConnection = createPeerConnection(options);
  attachSignalingHandlers(peerConnection, options.signalingClient);

  const offerMessage = await options.signalingClient.waitForMessage(
    (message) => message.type === "offer" || message.type === "error"
  );

  if (offerMessage.type === "error") {
    throw new A47Error(offerMessage.message);
  }

  const dataChannelPromise = waitForRemoteDataChannel(peerConnection);
  await peerConnection.setRemoteDescription((offerMessage as OfferMessage).description);

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  const localDescription = peerConnection.localDescription;

  if (!localDescription) {
    throw new A47Error("Unable to create a local WebRTC answer.");
  }

  options.signalingClient.send({
    type: "answer",
    description: {
      type: "answer",
      sdp: localDescription.sdp
    }
  });

  const dataChannel = await dataChannelPromise;
  return new WeriftA47Peer(peerConnection, dataChannel);
}

function createPeerConnection(options: PeerOptions): RTCPeerConnection {
  const peerConnection = new RTCPeerConnection({
    iceServers: options.iceServers ?? DEFAULT_ICE_SERVERS
  });

  peerConnection.onIceCandidate.subscribe((candidate) => {
    if (candidate) {
      options.signalingClient.send({ type: "ice-candidate", candidate });
    }
  });

  return peerConnection;
}

function attachSignalingHandlers(peerConnection: RTCPeerConnection, signalingClient: SignalingClient): void {
  signalingClient.onMessage((message: SignalingMessage) => {
    if (message.type === "ice-candidate" && message.candidate) {
      void peerConnection.addIceCandidate(message.candidate as RTCIceCandidate);
    }
  });
}

function waitForRemoteDataChannel(peerConnection: RTCPeerConnection): Promise<RTCDataChannel> {
  return new Promise((resolve) => {
    peerConnection.onDataChannel.subscribe((channel) => resolve(channel));
  });
}
