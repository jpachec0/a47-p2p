import { loadConfig } from "../config/config.js";
import { SignalingClient } from "../signaling/client.js";
import { normalizeRoomCode } from "../signaling/rooms.js";
import { sendFile } from "../transfer/sender.js";
import { A47Error } from "../utils/errors.js";
import { resolveExistingFile } from "../utils/paths.js";
import { createSenderPeer } from "../webrtc/peer.js";

export interface SendCommandOptions {
  room?: string;
  server?: string;
}

export async function runSendCommand(filePath: string, options: SendCommandOptions): Promise<void> {
  const room = options.room?.trim() ? normalizeRoomCode(options.room) : "";
  const config = await loadConfig();
  const serverUrl = options.server?.trim() || config.signalingServerUrl;

  if (!room) {
    throw new A47Error("Missing required option: --room <room>.");
  }

  const resolvedFilePath = await resolveExistingFile(filePath);
  const signalingClient = new SignalingClient(serverUrl);

  try {
    console.log(`Connecting to signaling server: ${serverUrl}`);
    await signalingClient.connect();
    await signalingClient.join(room);
    console.log(`Joined room: ${room}`);

    const peer = await createSenderPeer({ signalingClient });
    await sendFile({ filePath: resolvedFilePath, peer, chunkSizeBytes: config.chunkSizeBytes });
    await peer.close();
  } finally {
    signalingClient.close();
  }
}
