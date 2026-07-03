import { DEFAULT_SIGNALING_SERVER_URL } from "../config/config.js";
import { SignalingClient } from "../signaling/client.js";
import { sendFile } from "../transfer/sender.js";
import { A47Error } from "../utils/errors.js";
import { resolveExistingFile } from "../utils/paths.js";
import { createSenderPeer } from "../webrtc/peer.js";

export interface SendCommandOptions {
  room?: string;
  server?: string;
}

export async function runSendCommand(filePath: string, options: SendCommandOptions): Promise<void> {
  const room = options.room?.trim();
  const serverUrl = options.server?.trim() || DEFAULT_SIGNALING_SERVER_URL;

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
    await sendFile({ filePath: resolvedFilePath, peer });
    await peer.close();
  } finally {
    signalingClient.close();
  }
}
