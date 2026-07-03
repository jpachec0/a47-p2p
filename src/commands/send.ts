import { input } from "@inquirer/prompts";

import { loadConfig } from "../config/config.js";
import { SignalingClient } from "../signaling/client.js";
import { normalizeRoomCode } from "../signaling/rooms.js";
import { sendFile } from "../transfer/sender.js";
import { A47Error } from "../utils/errors.js";
import { resolveExistingFile } from "../utils/paths.js";
import { createManualSenderAnswer } from "../webrtc/manual-signaling.js";
import { createSenderPeer } from "../webrtc/peer.js";

export interface SendCommandOptions {
  manual?: boolean;
  room?: string;
  server?: string;
}

export async function runSendCommand(filePath: string, options: SendCommandOptions): Promise<void> {
  const room = options.room?.trim() ? normalizeRoomCode(options.room) : "";
  const config = await loadConfig();
  const serverUrl = options.server?.trim() || config.signalingServerUrl;
  const resolvedFilePath = await resolveExistingFile(filePath);

  if (options.manual) {
    await runManualSend(resolvedFilePath, config);
    return;
  }

  if (!room) {
    throw new A47Error("Missing required option: --room <room>.");
  }

  const signalingClient = new SignalingClient(serverUrl);

  try {
    console.log(`Connecting to signaling server: ${serverUrl}`);
    await signalingClient.connect();
    await signalingClient.join(room);
    console.log(`Joined room: ${room}`);

    const peer = await createSenderPeer({ iceServers: config.iceServers, signalingClient });
    await sendFile({ filePath: resolvedFilePath, peer, chunkSizeBytes: config.chunkSizeBytes });
    await peer.close();
  } finally {
    signalingClient.close();
  }
}

async function runManualSend(resolvedFilePath: string, config: Awaited<ReturnType<typeof loadConfig>>): Promise<void> {
  console.log("Manual signaling mode does not use the WebSocket signaling server.");
  const offerCode = await input({ message: "Paste receiver offer code" });
  const manualAnswer = await createManualSenderAnswer(offerCode, config.iceServers);

  console.log("");
  console.log("Paste this answer code into the receiver:");
  console.log(manualAnswer.answerCode);
  console.log("");
  console.log("Waiting for receiver...");
  const peer = await manualAnswer.waitForPeer();

  await sendFile({
    chunkSizeBytes: config.chunkSizeBytes,
    filePath: resolvedFilePath,
    peer
  });
  await peer.close();
}
