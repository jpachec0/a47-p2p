import { createHash } from "node:crypto";
import { createWriteStream, type WriteStream } from "node:fs";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";

import { getAvailableFilePath } from "../utils/paths.js";
import type { A47Peer, DataChannelPayload } from "../webrtc/peer.js";
import {
  encodeTransferMessage,
  tryDecodeTransferMessage,
  type FileMetaMessage
} from "./protocol.js";
import { ProgressRenderer } from "./progress.js";

interface ReceiveFileOptions {
  acceptFile?: (metadata: FileMetaMessage) => Promise<boolean>;
  outputDirectory: string;
  peer: A47Peer;
}

export async function receiveFile(options: ReceiveFileOptions): Promise<string> {
  await mkdir(options.outputDirectory, { recursive: true });
  await options.peer.waitUntilOpen();
  console.log("WebRTC DataChannel is open.");

  return new Promise<string>((resolve, reject) => {
    let metadata: FileMetaMessage | undefined;
    let outputPath: string | undefined;
    let writeStream: WriteStream | undefined;
    let receivedBytes = 0;
    let isSettled = false;
    let isFinalizing = false;
    let progress: ProgressRenderer | undefined;
    const hash = createHash("sha256");

    const rejectTransfer = async (error: Error): Promise<void> => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      writeStream?.destroy();

      if (outputPath) {
        await unlink(outputPath).catch(() => undefined);
      }

      reject(error);
    };

    options.peer.onClose(() => {
      if (!isSettled && !isFinalizing) {
        void rejectTransfer(new Error("Transfer interrupted because the peer disconnected."));
      }
    });

    options.peer.onData((payload) => {
      void (async () => {
        try {
          if (typeof payload === "string") {
            const message = tryDecodeTransferMessage(payload);

            if (!message) {
              throw new Error("Received an invalid transfer control message.");
            }

            if (message.type === "file-meta") {
              metadata = message;
              const isAccepted = options.acceptFile ? await options.acceptFile(metadata) : true;

              if (!isAccepted) {
                throw new Error("Transfer rejected by receiver.");
              }

              outputPath = await getAvailableFilePath(options.outputDirectory, metadata.fileName);
              writeStream = createWriteStream(outputPath);
              progress = new ProgressRenderer("Received", metadata.fileSize);
              options.peer.send(encodeTransferMessage({ type: "receiver-accepted" }));
              console.log(`Receiving ${metadata.fileName} -> ${path.resolve(outputPath)}`);
            }

            if (message.type === "file-complete") {
              if (!metadata || !writeStream || !outputPath) {
                throw new Error("Transfer completed before file metadata was received.");
              }

              if (receivedBytes !== metadata.fileSize) {
                throw new Error("Transfer completed before all file bytes were received.");
              }

              const completedOutputPath = outputPath;
              isFinalizing = true;

              writeStream.end(async () => {
                const actualSha256 = hash.digest("hex");
                const ok = actualSha256 === metadata?.sha256;

                progress?.finish(receivedBytes);

                if (ok) {
                  isSettled = true;
                }

                options.peer.send(
                  encodeTransferMessage({
                    type: "hash-result",
                    ok,
                    expectedSha256: metadata?.sha256 ?? "",
                    actualSha256
                  })
                );

                if (!ok) {
                  await rejectTransfer(new Error("SHA-256 verification failed. The received file was removed."));
                  return;
                }

                console.log("Transfer completed and SHA-256 hash verified.");
                resolve(completedOutputPath);
              });
            }

            if (message.type === "file-error") {
              throw new Error(message.message);
            }

            return;
          }

          if (!metadata || !writeStream) {
            throw new Error("Received file data before metadata.");
          }

          const chunk = normalizeBinaryPayload(payload);
          hash.update(chunk);
          writeStream.write(chunk);
          receivedBytes += chunk.length;
          progress?.render(receivedBytes);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Receive failed.";
          options.peer.send(encodeTransferMessage({ type: "file-error", message }));
          await rejectTransfer(error instanceof Error ? error : new Error(message));
        }
      })();
    });

    options.peer.send(encodeTransferMessage({ type: "receiver-ready" }));
  });
}

function normalizeBinaryPayload(payload: DataChannelPayload): Buffer {
  return Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
}
