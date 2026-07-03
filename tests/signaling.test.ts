import { once } from "node:events";
import { describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { WebSocketServer } from "ws";

import { SignalingClient } from "../src/signaling/client.js";
import { startSignalingServer } from "../src/signaling/server.js";

describe("signaling server", () => {
  it("relays signaling messages between two peers in the same room", async () => {
    const server = await startTestSignalingServer();
    const serverUrl = getServerUrl(server);
    const firstClient = new SignalingClient(serverUrl);
    const secondClient = new SignalingClient(serverUrl);

    try {
      await Promise.all([firstClient.connect(), secondClient.connect()]);
      await firstClient.join("relay-room");

      const peerJoinedPromise = firstClient.waitForMessage((message) => message.type === "peer-joined");
      await secondClient.join("relay-room");
      expect((await peerJoinedPromise).type).toBe("peer-joined");

      const offerPromise = secondClient.waitForMessage((message) => message.type === "offer");
      firstClient.send({
        type: "offer",
        description: {
          type: "offer",
          sdp: "test-offer"
        }
      });

      expect(await offerPromise).toEqual({
        type: "offer",
        description: {
          type: "offer",
          sdp: "test-offer"
        }
      });
    } finally {
      firstClient.close();
      secondClient.close();
      await closeServer(server);
    }
  });

  it("rejects a third peer in a two-peer room", async () => {
    const server = await startTestSignalingServer();
    const serverUrl = getServerUrl(server);
    const firstClient = new SignalingClient(serverUrl);
    const secondClient = new SignalingClient(serverUrl);
    const thirdClient = new SignalingClient(serverUrl);

    try {
      await Promise.all([firstClient.connect(), secondClient.connect(), thirdClient.connect()]);
      await firstClient.join("limited-room");
      await secondClient.join("limited-room");

      await expect(thirdClient.join("limited-room")).rejects.toThrow(
        "This room already has two peers. Multi-peer rooms are not supported yet."
      );
    } finally {
      firstClient.close();
      secondClient.close();
      thirdClient.close();
      await closeServer(server);
    }
  });

  it("rejects weak or unsafe room codes", async () => {
    const server = await startTestSignalingServer();
    const serverUrl = getServerUrl(server);
    const client = new SignalingClient(serverUrl);

    try {
      await client.connect();

      await expect(client.join("abc")).rejects.toThrow("Room must be between 4 and 64 characters.");
      await expect(client.join("unsafe room")).rejects.toThrow(
        "Room may only contain letters, numbers, dots, underscores, and hyphens."
      );
      await expect(client.join("a".repeat(65))).rejects.toThrow("Room must be between 4 and 64 characters.");
    } finally {
      client.close();
      await closeServer(server);
    }
  });
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
