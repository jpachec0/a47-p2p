import { RTCPeerConnection, type RTCDataChannel } from "werift";

import { DEFAULT_ICE_SERVERS, type IceServerConfig } from "../config/config.js";
import { A47Error } from "../utils/errors.js";
import { createA47Peer, type A47Peer } from "./peer.js";

const MANUAL_OFFER_PREFIX = "A47-OFFER-";
const MANUAL_ANSWER_PREFIX = "A47-ANSWER-";
const MANUAL_SIGNAL_VERSION = 1;

interface ManualSignalPayload {
  description: {
    sdp: string;
    type: "offer" | "answer";
  };
  version: number;
}

export interface ManualReceiverOffer {
  answer(answerCode: string): Promise<A47Peer>;
  offerCode: string;
}

export interface ManualSenderAnswer {
  answerCode: string;
  waitForPeer(): Promise<A47Peer>;
}

export async function createManualReceiverOffer(iceServers?: IceServerConfig[]): Promise<ManualReceiverOffer> {
  const peerConnection = createManualPeerConnection(iceServers);
  const dataChannel = peerConnection.createDataChannel("a47-file-transfer", {
    ordered: true
  });

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  const localDescription = getLocalDescription(peerConnection, "offer");

  return {
    offerCode: encodeManualSignal(MANUAL_OFFER_PREFIX, {
      description: localDescription,
      version: MANUAL_SIGNAL_VERSION
    }),
    async answer(answerCode: string): Promise<A47Peer> {
      const answerPayload = decodeManualSignal(answerCode, MANUAL_ANSWER_PREFIX, "answer");
      await peerConnection.setRemoteDescription(answerPayload.description);
      return createA47Peer(peerConnection, dataChannel);
    }
  };
}

export async function createManualSenderAnswer(
  offerCode: string,
  iceServers?: IceServerConfig[]
): Promise<ManualSenderAnswer> {
  const offerPayload = decodeManualSignal(offerCode, MANUAL_OFFER_PREFIX, "offer");
  const peerConnection = createManualPeerConnection(iceServers);
  const dataChannelPromise = waitForRemoteDataChannel(peerConnection);

  await peerConnection.setRemoteDescription(offerPayload.description);

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  const localDescription = getLocalDescription(peerConnection, "answer");

  return {
    answerCode: encodeManualSignal(MANUAL_ANSWER_PREFIX, {
      description: localDescription,
      version: MANUAL_SIGNAL_VERSION
    }),
    async waitForPeer(): Promise<A47Peer> {
      const dataChannel = await dataChannelPromise;
      return createA47Peer(peerConnection, dataChannel);
    }
  };
}

export function encodeManualSignal(prefix: string, payload: ManualSignalPayload): string {
  return `${prefix}${Buffer.from(JSON.stringify(payload), "utf8").toString("base64url")}`;
}

export function decodeManualSignal(
  code: string,
  expectedPrefix: string,
  expectedType: "offer" | "answer"
): ManualSignalPayload {
  const trimmedCode = code.trim();

  if (!trimmedCode.startsWith(expectedPrefix)) {
    throw new A47Error(`Manual signaling code must start with ${expectedPrefix}.`);
  }

  try {
    const rawPayload = Buffer.from(trimmedCode.slice(expectedPrefix.length), "base64url").toString("utf8");
    const payload = JSON.parse(rawPayload) as ManualSignalPayload;

    if (
      payload.version !== MANUAL_SIGNAL_VERSION ||
      !payload.description ||
      payload.description.type !== expectedType ||
      typeof payload.description.sdp !== "string"
    ) {
      throw new Error("Invalid manual signaling payload.");
    }

    return payload;
  } catch (error) {
    if (error instanceof A47Error) {
      throw error;
    }

    throw new A47Error("Manual signaling code is invalid.");
  }
}

function createManualPeerConnection(iceServers?: IceServerConfig[]): RTCPeerConnection {
  return new RTCPeerConnection({
    iceServers: iceServers ?? DEFAULT_ICE_SERVERS
  });
}

function getLocalDescription(
  peerConnection: RTCPeerConnection,
  expectedType: "offer" | "answer"
): ManualSignalPayload["description"] {
  const localDescription = peerConnection.localDescription;

  if (!localDescription || localDescription.type !== expectedType) {
    throw new A47Error(`Unable to create a local WebRTC ${expectedType}.`);
  }

  return {
    sdp: localDescription.sdp,
    type: expectedType
  };
}

function waitForRemoteDataChannel(peerConnection: RTCPeerConnection): Promise<RTCDataChannel> {
  return new Promise((resolve) => {
    peerConnection.onDataChannel.subscribe((channel) => resolve(channel));
  });
}
