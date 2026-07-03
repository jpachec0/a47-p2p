import { randomUUID } from "node:crypto";
import { WebSocket, WebSocketServer } from "ws";

import { DEFAULT_SIGNALING_PORT } from "../config/config.js";
import {
  decodeSignalingMessage,
  encodeSignalingMessage,
  type SignalingMessage
} from "./messages.js";
import { getRoomCodeValidationError, normalizeRoomCode } from "./rooms.js";

interface PeerConnection {
  id: string;
  socket: WebSocket;
  room?: string;
}

const rooms = new Map<string, Set<PeerConnection>>();

export function startSignalingServer(port = DEFAULT_SIGNALING_PORT): WebSocketServer {
  const server = new WebSocketServer({ port });

  server.on("connection", (socket) => {
    const peer: PeerConnection = {
      id: randomUUID(),
      socket
    };

    socket.on("message", (data) => handleClientMessage(peer, data.toString()));
    socket.on("close", () => removePeerFromRoom(peer));
    socket.on("error", () => removePeerFromRoom(peer));
  });

  console.log(`A47 signaling server is running on ws://localhost:${port}`);
  console.log("Files are never uploaded to this server. It only relays signaling metadata.");

  return server;
}

function handleClientMessage(peer: PeerConnection, rawData: string): void {
  let message: SignalingMessage;

  try {
    message = decodeSignalingMessage(rawData);
  } catch {
    sendToPeer(peer, { type: "error", message: "Invalid signaling message." });
    return;
  }

  if (message.type === "join") {
    joinRoom(peer, message.room);
    return;
  }

  relayToRoom(peer, message);
}

function joinRoom(peer: PeerConnection, room: string): void {
  const roomValidationError = getRoomCodeValidationError(room);

  if (roomValidationError) {
    sendToPeer(peer, { type: "error", message: roomValidationError });
    return;
  }

  const normalizedRoom = normalizeRoomCode(room);
  const currentRoom = rooms.get(normalizedRoom) ?? new Set<PeerConnection>();

  if (currentRoom.size >= 2 && !currentRoom.has(peer)) {
    sendToPeer(peer, {
      type: "error",
      message: "This room already has two peers. Multi-peer rooms are not supported yet."
    });
    return;
  }

  removePeerFromRoom(peer);
  peer.room = normalizedRoom;
  currentRoom.add(peer);
  rooms.set(normalizedRoom, currentRoom);

  sendToPeer(peer, {
    type: "joined",
    room: normalizedRoom,
    peerId: peer.id,
    peers: currentRoom.size
  });

  relayToRoom(peer, { type: "peer-joined", peerId: peer.id });
}

function relayToRoom(sender: PeerConnection, message: SignalingMessage): void {
  if (!sender.room) {
    sendToPeer(sender, { type: "error", message: "Join a room before sending signaling messages." });
    return;
  }

  const peers = rooms.get(sender.room);
  if (!peers) {
    return;
  }

  peers.forEach((peer) => {
    if (peer !== sender) {
      sendToPeer(peer, message);
    }
  });
}

function removePeerFromRoom(peer: PeerConnection): void {
  if (!peer.room) {
    return;
  }

  const room = rooms.get(peer.room);
  if (!room) {
    peer.room = undefined;
    return;
  }

  room.delete(peer);
  relayToRoom(peer, { type: "peer-left", peerId: peer.id });

  if (room.size === 0) {
    rooms.delete(peer.room);
  }

  peer.room = undefined;
}

function sendToPeer(peer: PeerConnection, message: SignalingMessage): void {
  if (peer.socket.readyState === WebSocket.OPEN) {
    peer.socket.send(encodeSignalingMessage(message));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.A47_SIGNALING_PORT ?? DEFAULT_SIGNALING_PORT);
  startSignalingServer(port);
}
