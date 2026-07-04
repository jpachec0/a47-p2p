import { stat } from "node:fs/promises";
import path from "node:path";

import { DEFAULT_CHUNK_SIZE_BYTES } from "../config/config.js";
import type { A47Peer } from "../webrtc/peer.js";
import { waitForBufferedAmountLow } from "../webrtc/data-channel.js";
import { readFileChunks } from "./chunks.js";
import { calculateFileSha256 } from "./hash.js";
import { ProgressRenderer } from "./progress.js";
import {
  encodeTransferMessage,
  TRANSFER_PROTOCOL_VERSION,
  type TransferControlMessage
} from "./protocol.js";

interface SendFileOptions {
  filePath: string;
  peer: A47Peer;
  chunkSizeBytes?: number;
}

const MAX_BUFFERED_AMOUNT_BYTES = 32 * 1024 * 1024;
const TRANSFER_CONTROL_TIMEOUT_MS = 120_000;

export async function sendFile(options: SendFileOptions): Promise<void> {
  const chunkSizeBytes = options.chunkSizeBytes ?? DEFAULT_CHUNK_SIZE_BYTES;
  const fileStat = await stat(options.filePath);
  const fileName = path.basename(options.filePath);
  const receiverReadyPromise = waitForTransferMessage(options.peer, "receiver-ready");

  console.log("Calculating SHA-256 hash...");
  const sha256 = await calculateFileSha256(options.filePath);

  await options.peer.waitUntilOpen();
  console.log("WebRTC DataChannel is open.");
  await receiverReadyPromise;

  options.peer.send(
    encodeTransferMessage({
      type: "file-meta",
      protocolVersion: TRANSFER_PROTOCOL_VERSION,
      fileName,
      fileSize: fileStat.size,
      sha256
    })
  );

  await waitForTransferMessage(options.peer, "receiver-accepted");

  let sentBytes = 0;
  const progress = new ProgressRenderer("Sent", fileStat.size);

  for await (const chunk of readFileChunks(options.filePath, chunkSizeBytes)) {
    await waitForBufferedAmountLow(options.peer.getDataChannel(), MAX_BUFFERED_AMOUNT_BYTES);
    options.peer.send(chunk);
    sentBytes += chunk.length;
    progress.render(sentBytes);
  }

  progress.finish(sentBytes);
  options.peer.send(encodeTransferMessage({ type: "file-complete" }));

  const hashResult = await waitForTransferMessage(options.peer, "hash-result");
  if (hashResult.type === "hash-result" && hashResult.ok) {
    options.peer.send(encodeTransferMessage({ type: "sender-complete" }));
    await waitForBufferedAmountLow(options.peer.getDataChannel(), 0);
    console.log("Transfer completed and SHA-256 hash verified.");
    return;
  }

  throw new Error("Transfer completed, but SHA-256 verification failed.");
}

function waitForTransferMessage<TType extends TransferControlMessage["type"]>(
  peer: A47Peer,
  messageType: TType
): Promise<Extract<TransferControlMessage, { type: TType }>> {
  return new Promise((resolve, reject) => {
    let isSettled = false;
    const timeout = setTimeout(() => {
      rejectOnce(new Error(`Timed out waiting for ${messageType}.`));
    }, TRANSFER_CONTROL_TIMEOUT_MS);

    const rejectOnce = (error: Error): void => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      clearTimeout(timeout);
      reject(error);
    };

    const resolveOnce = (message: Extract<TransferControlMessage, { type: TType }>): void => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      clearTimeout(timeout);
      resolve(message);
    };

    peer.onClose(() => {
      rejectOnce(new Error("Transfer interrupted because the peer disconnected."));
    });

    peer.onData((payload) => {
      if (typeof payload !== "string") {
        return;
      }

      try {
        const message = JSON.parse(payload) as TransferControlMessage;
        if (message.type === "file-error") {
          rejectOnce(new Error(message.message));
        }

        if (message.type === messageType) {
          resolveOnce(message as Extract<TransferControlMessage, { type: TType }>);
        }
      } catch {
        rejectOnce(new Error("Received an invalid transfer control message."));
      }
    });
  });
}
