import { createHash } from "node:crypto";
import type { Duplex } from "node:stream";

import Hyperswarm from "hyperswarm";

import type { IceServerConfig } from "../config/config.js";
import { normalizeRoomCode } from "../signaling/rooms.js";
import { A47Error } from "../utils/errors.js";
import { createManualReceiverOffer, createManualSenderAnswer } from "../webrtc/manual-signaling.js";
import type { A47Peer } from "../webrtc/peer.js";

const DISCOVERY_TOPIC_PREFIX = "a47-p2p-room-v1:";
const DISCOVERY_TIMEOUT_MS = 120_000;
const TEXT_DECODER = new TextDecoder();

type DistributedSignalMessage =
  | {
      offerCode: string;
      type: "offer";
    }
  | {
      answerCode: string;
      type: "answer";
    }
  | {
      message: string;
      type: "error";
    };

interface JsonLineReader {
  push(chunk: Buffer): DistributedSignalMessage[];
}

export function getDistributedRoomTopic(room: string): Buffer {
  return createHash("sha256").update(`${DISCOVERY_TOPIC_PREFIX}${normalizeRoomCode(room)}`).digest();
}

export function encodeDistributedSignalMessage(message: DistributedSignalMessage): string {
  return `${JSON.stringify(message)}\n`;
}

export function createJsonLineReader(): JsonLineReader {
  let pendingText = "";

  return {
    push(chunk: Buffer): DistributedSignalMessage[] {
      pendingText += TEXT_DECODER.decode(chunk, { stream: true });
      const lines = pendingText.split("\n");
      pendingText = lines.pop() ?? "";

      return lines.filter(Boolean).map(parseDistributedSignalMessage);
    }
  };
}

export async function createDistributedReceiverPeer(
  room: string,
  iceServers?: IceServerConfig[]
): Promise<A47Peer> {
  const normalizedRoom = normalizeRoomCode(room);
  const manualOffer = await createManualReceiverOffer(iceServers);
  const swarm = new Hyperswarm({ maxPeers: 8 });
  const topic = getDistributedRoomTopic(normalizedRoom);

  try {
    return await withDiscoveryTimeout(
      new Promise<A47Peer>((resolve, reject) => {
        let isSettled = false;

        swarm.on("error", reject);
        swarm.on("connection", (connection) => {
          if (isSettled) {
            connection.destroy();
            return;
          }

          const reader = createJsonLineReader();
          sendDistributedSignalMessage(connection, {
            offerCode: manualOffer.offerCode,
            type: "offer"
          });

          connection.on("data", (chunk: Buffer | string) => {
            try {
              void handleMessages(reader.push(Buffer.from(chunk)), async (message) => {
                if (isSettled) {
                  return;
                }

                if (message.type === "error") {
                  throw new A47Error(message.message);
                }

                if (message.type !== "answer") {
                  return;
                }

                isSettled = true;
                resolve(await manualOffer.answer(message.answerCode));
              }).catch(reject);
            } catch (error) {
              reject(error);
            }
          });

          connection.on("error", reject);
        });

        const discovery = swarm.join(topic, { client: false, server: true });
        discovery.flushed().catch(reject);
      }),
      `Timed out waiting for a sender in room ${normalizedRoom}. Check the room code and try again.`
    );
  } finally {
    await swarm.destroy().catch(() => undefined);
  }
}

export async function createDistributedSenderPeer(
  room: string,
  iceServers?: IceServerConfig[]
): Promise<A47Peer> {
  const normalizedRoom = normalizeRoomCode(room);
  const swarm = new Hyperswarm({ maxPeers: 8 });
  const topic = getDistributedRoomTopic(normalizedRoom);

  try {
    return await withDiscoveryTimeout(
      new Promise<A47Peer>((resolve, reject) => {
        let isSettled = false;

        swarm.on("error", reject);
        swarm.on("connection", (connection) => {
          if (isSettled) {
            connection.destroy();
            return;
          }

          const reader = createJsonLineReader();

          connection.on("data", (chunk: Buffer | string) => {
            try {
              void handleMessages(reader.push(Buffer.from(chunk)), async (message) => {
                if (isSettled) {
                  return;
                }

                if (message.type === "error") {
                  throw new A47Error(message.message);
                }

                if (message.type !== "offer") {
                  return;
                }

                isSettled = true;
                const manualAnswer = await createManualSenderAnswer(message.offerCode, iceServers);
                sendDistributedSignalMessage(connection, {
                  answerCode: manualAnswer.answerCode,
                  type: "answer"
                });
                resolve(await manualAnswer.waitForPeer());
              }).catch(reject);
            } catch (error) {
              reject(error);
            }
          });

          connection.on("error", reject);
        });

        swarm.join(topic, { client: true, server: false });
        swarm.flush().catch(reject);
      }),
      `Timed out looking for room ${normalizedRoom}. Make sure the receiver is already waiting.`
    );
  } finally {
    await swarm.destroy().catch(() => undefined);
  }
}

function parseDistributedSignalMessage(line: string): DistributedSignalMessage {
  try {
    const message = JSON.parse(line) as DistributedSignalMessage;

    if (message.type === "offer" && typeof message.offerCode === "string") {
      return message;
    }

    if (message.type === "answer" && typeof message.answerCode === "string") {
      return message;
    }

    if (message.type === "error" && typeof message.message === "string") {
      return message;
    }
  } catch {
    throw new A47Error("Received invalid distributed discovery metadata.");
  }

  throw new A47Error("Received unsupported distributed discovery metadata.");
}

function sendDistributedSignalMessage(connection: Duplex, message: DistributedSignalMessage): void {
  connection.write(encodeDistributedSignalMessage(message));
}

async function handleMessages(
  messages: DistributedSignalMessage[],
  handler: (message: DistributedSignalMessage) => Promise<void>
): Promise<void> {
  for (const message of messages) {
    await handler(message);
  }
}

function withDiscoveryTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  let timeout: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeout = setTimeout(() => reject(new A47Error(message)), DISCOVERY_TIMEOUT_MS);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });
}
