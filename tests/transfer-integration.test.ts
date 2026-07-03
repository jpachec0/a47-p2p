import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { once } from "node:events";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import type { WebSocketServer } from "ws";
import { describe, expect, it } from "vitest";

import { SignalingClient } from "../src/signaling/client.js";
import { startSignalingServer } from "../src/signaling/server.js";
import { receiveFile } from "../src/transfer/receiver.js";
import { sendFile } from "../src/transfer/sender.js";
import { createReceiverPeer, createSenderPeer } from "../src/webrtc/peer.js";

describe("file transfer integration", () => {
  it("transfers a file through WebRTC DataChannel using signaling metadata only", async () => {
    const server = await startTestSignalingServer();
    const serverUrl = getServerUrl(server);
    const room = `transfer-${Date.now()}`;
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "a47-transfer-"));
    const outputDirectory = path.join(temporaryDirectory, "received");
    const filePath = path.join(temporaryDirectory, "example.txt");
    const fileContent = "A47 integration transfer\n".repeat(128);
    const senderClient = new SignalingClient(serverUrl);
    const receiverClient = new SignalingClient(serverUrl);

    try {
      await writeFile(filePath, fileContent, "utf8");
      await Promise.all([receiverClient.connect(), senderClient.connect()]);
      await receiverClient.join(room);
      await senderClient.join(room);

      const receiverPeerPromise = createReceiverPeer({ signalingClient: receiverClient });
      const senderPeer = await createSenderPeer({ signalingClient: senderClient });
      const receiverPeer = await receiverPeerPromise;

      const receivePromise = receiveFile({ outputDirectory, peer: receiverPeer });
      await sendFile({ filePath, peer: senderPeer, chunkSizeBytes: 1024 });
      const receivedPath = await receivePromise;

      await senderPeer.close();
      await receiverPeer.close();

      expect(await readFile(receivedPath, "utf8")).toBe(fileContent);
    } finally {
      senderClient.close();
      receiverClient.close();
      await closeServer(server);
    }
  }, 15000);
});

async function startTestSignalingServer(): Promise<WebSocketServer> {
  const server = startSignalingServer(0);

  if (!server.address()) {
    await once(server, "listening");
  }

  return server;
}

function getServerUrl(server: WebSocketServer): string {
  const address = server.address() as AddressInfo;
  return `ws://127.0.0.1:${address.port}`;
}

async function closeServer(server: WebSocketServer): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
