import { stat } from "node:fs/promises";
import path from "node:path";

import { DEFAULT_CHUNK_SIZE_BYTES } from "../config/config.js";
import type { A47Peer } from "../webrtc/peer.js";
import { waitForBufferedAmountLow } from "../webrtc/data-channel.js";
import { readFileChunks } from "./chunks.js";
import { calculateFileSha256 } from "./hash.js";
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

const MAX_BUFFERED_AMOUNT_BYTES = 1024 * 1024;

export async function sendFile(options: SendFileOptions): Promise<void> {
  const chunkSizeBytes = options.chunkSizeBytes ?? DEFAULT_CHUNK_SIZE_BYTES;
  const fileStat = await stat(options.filePath);
  const fileName = path.basename(options.filePath);

  console.log("Calculating SHA-256 hash...");
  const sha256 = await calculateFileSha256(options.filePath);

  await options.peer.waitUntilOpen();
  console.log("WebRTC DataChannel is open.");

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
  for await (const chunk of readFileChunks(options.filePath, chunkSizeBytes)) {
    await waitForBufferedAmountLow(options.peer.getDataChannel(), MAX_BUFFERED_AMOUNT_BYTES);
    options.peer.send(chunk);
    sentBytes += chunk.length;
    renderProgress("Sent", sentBytes, fileStat.size);
  }

  process.stdout.write("\n");
  options.peer.send(encodeTransferMessage({ type: "file-complete" }));

  const hashResult = await waitForTransferMessage(options.peer, "hash-result");
  if (hashResult.type === "hash-result" && hashResult.ok) {
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
    peer.onData((payload) => {
      if (typeof payload !== "string") {
        return;
      }

      try {
        const message = JSON.parse(payload) as TransferControlMessage;
        if (message.type === "file-error") {
          reject(new Error(message.message));
        }

        if (message.type === messageType) {
          resolve(message as Extract<TransferControlMessage, { type: TType }>);
        }
      } catch {
        reject(new Error("Received an invalid transfer control message."));
      }
    });
  });
}

function renderProgress(label: string, currentBytes: number, totalBytes: number): void {
  const percentage = totalBytes === 0 ? 100 : Math.floor((currentBytes / totalBytes) * 100);
  process.stdout.write(`\r${label}: ${percentage}% (${currentBytes}/${totalBytes} bytes)`);
}
