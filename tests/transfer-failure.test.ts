import { mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { RTCDataChannel } from "werift";

import { receiveFile } from "../src/transfer/receiver.js";
import { sendFile } from "../src/transfer/sender.js";
import { encodeTransferMessage, TRANSFER_PROTOCOL_VERSION } from "../src/transfer/protocol.js";
import type { A47Peer, DataChannelPayload } from "../src/webrtc/peer.js";

describe("transfer failure handling", () => {
  it("rejects a hash mismatch and removes the failed output file", async () => {
    const outputDirectory = await mkdtemp(path.join(os.tmpdir(), "a47-hash-mismatch-"));
    const peer = new FakePeer();
    const receivePromise = receiveFile({ outputDirectory, peer });
    await peer.waitForDataHandler();

    peer.emit(
      encodeTransferMessage({
        type: "file-meta",
        protocolVersion: TRANSFER_PROTOCOL_VERSION,
        fileName: "mismatch.txt",
        fileSize: 11,
        sha256: "not-the-real-hash"
      })
    );
    await peer.waitForSentMessage((message) => message.includes('"type":"receiver-accepted"'));

    peer.emit(Buffer.from("hello world"));
    await waitForAsyncReceiverWork();

    peer.emit(encodeTransferMessage({ type: "file-complete" }));

    await expect(receivePromise).rejects.toThrow("SHA-256 verification failed.");
    await expect(readdir(outputDirectory)).resolves.toEqual([]);
    expect(peer.sentMessages.some((message) => message.includes('"type":"hash-result"'))).toBe(true);
    expect(peer.sentMessages.some((message) => message.includes('"ok":false'))).toBe(true);
  });

  it("rejects an interrupted receive and removes the partial output file", async () => {
    const outputDirectory = await mkdtemp(path.join(os.tmpdir(), "a47-interrupted-transfer-"));
    const peer = new FakePeer();
    const receivePromise = receiveFile({ outputDirectory, peer });
    await peer.waitForDataHandler();

    peer.emit(
      encodeTransferMessage({
        type: "file-meta",
        protocolVersion: TRANSFER_PROTOCOL_VERSION,
        fileName: "interrupted.txt",
        fileSize: 1024,
        sha256: "not-finished"
      })
    );
    await peer.waitForSentMessage((message) => message.includes('"type":"receiver-accepted"'));

    peer.emit(Buffer.from("partial data"));
    await waitForAsyncReceiverWork();
    peer.emitClose();

    await expect(receivePromise).rejects.toThrow("Transfer interrupted because the peer disconnected.");
    await expect(readdir(outputDirectory)).resolves.toEqual([]);
  });

  it("keeps a verified file when the peer closes during final receiver cleanup", async () => {
    const outputDirectory = await mkdtemp(path.join(os.tmpdir(), "a47-finalizing-transfer-"));
    const peer = new FakePeer();
    const fileContent = Buffer.from("complete file");
    const receivePromise = receiveFile({ outputDirectory, peer });
    await peer.waitForDataHandler();

    peer.emit(
      encodeTransferMessage({
        type: "file-meta",
        protocolVersion: TRANSFER_PROTOCOL_VERSION,
        fileName: "complete.txt",
        fileSize: fileContent.length,
        sha256: createHash("sha256").update(fileContent).digest("hex")
      })
    );
    await peer.waitForSentMessage((message) => message.includes('"type":"receiver-accepted"'));

    peer.emit(fileContent);
    await waitForAsyncReceiverWork();
    peer.emit(encodeTransferMessage({ type: "file-complete" }));
    await peer.waitForSentMessage((message) => message.includes('"type":"hash-result"'));
    peer.emitClose();

    const outputPath = await receivePromise;

    await expect(readFile(outputPath, "utf8")).resolves.toBe("complete file");
  });

  it("rejects an interrupted send while waiting for the receiver", async () => {
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "a47-interrupted-send-"));
    const filePath = path.join(temporaryDirectory, "send.txt");
    const peer = new FakePeer();

    await writeFile(filePath, "send data", "utf8");

    const sendPromise = sendFile({ filePath, peer });
    await peer.waitForDataHandler();
    peer.emit(encodeTransferMessage({ type: "receiver-ready" }));
    await peer.waitForSentMessage((message) => message.includes('"type":"file-meta"'));
    peer.emitClose();

    await expect(sendPromise).rejects.toThrow("Transfer interrupted because the peer disconnected.");
  });

  it("waits for receiver readiness before sending file metadata", async () => {
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "a47-ready-send-"));
    const filePath = path.join(temporaryDirectory, "ready.txt");
    const peer = new FakePeer();

    await writeFile(filePath, "ready data", "utf8");

    const sendPromise = sendFile({ filePath, peer });
    await peer.waitForDataHandler();
    await waitForAsyncReceiverWork();

    expect(peer.sentMessages.some((message) => message.includes('"type":"file-meta"'))).toBe(false);

    peer.emit(encodeTransferMessage({ type: "receiver-ready" }));
    await peer.waitForSentMessage((message) => message.includes('"type":"file-meta"'));
    peer.emitClose();

    await expect(sendPromise).rejects.toThrow("Transfer interrupted because the peer disconnected.");
  });
});

class FakePeer implements A47Peer {
  readonly sentMessages: string[] = [];
  private dataHandler?: (payload: DataChannelPayload) => void;
  private closeHandler?: () => void;
  private resolveDataHandlerReady?: () => void;
  private readonly dataHandlerReady = new Promise<void>((resolve) => {
    this.resolveDataHandlerReady = resolve;
  });
  private sentMessageWaiters: Array<{
    predicate: (message: string) => boolean;
    resolve: () => void;
  }> = [];

  onData(callback: (payload: DataChannelPayload) => void): void {
    this.dataHandler = callback;
    this.resolveDataHandlerReady?.();
  }

  onClose(callback: () => void): void {
    this.closeHandler = callback;
  }

  send(payload: DataChannelPayload): void {
    const message = Buffer.isBuffer(payload) ? payload.toString("utf8") : payload;
    this.sentMessages.push(message);
    this.resolveMatchingSentMessageWaiters(message);
  }

  waitUntilOpen(): Promise<void> {
    return Promise.resolve();
  }

  close(): Promise<void> {
    return Promise.resolve();
  }

  getBufferedAmount(): number {
    return 0;
  }

  getDataChannel(): RTCDataChannel {
    throw new Error("FakePeer does not expose a DataChannel.");
  }

  emit(payload: DataChannelPayload): void {
    if (!this.dataHandler) {
      throw new Error("No data handler registered.");
    }

    this.dataHandler(payload);
  }

  emitClose(): void {
    this.closeHandler?.();
  }

  waitForDataHandler(): Promise<void> {
    return this.dataHandlerReady;
  }

  waitForSentMessage(predicate: (message: string) => boolean): Promise<void> {
    if (this.sentMessages.some(predicate)) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.sentMessageWaiters.push({ predicate, resolve });
    });
  }

  private resolveMatchingSentMessageWaiters(message: string): void {
    const matchingWaiters = this.sentMessageWaiters.filter((waiter) => waiter.predicate(message));
    this.sentMessageWaiters = this.sentMessageWaiters.filter((waiter) => !waiter.predicate(message));
    matchingWaiters.forEach((waiter) => waiter.resolve());
  }
}

async function waitForAsyncReceiverWork(): Promise<void> {
  await new Promise<void>((resolve) => {
    setImmediate(resolve);
  });
}
