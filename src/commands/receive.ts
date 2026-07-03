import { confirm } from "@inquirer/prompts";

import { DEFAULT_OUTPUT_DIRECTORY, loadConfig } from "../config/config.js";
import { SignalingClient } from "../signaling/client.js";
import { generateRoomCode, normalizeRoomCode } from "../signaling/rooms.js";
import type { FileMetaMessage } from "../transfer/protocol.js";
import { receiveFile } from "../transfer/receiver.js";
import { resolveOutputDirectory } from "../utils/paths.js";
import { createReceiverPeer } from "../webrtc/peer.js";

export interface ReceiveCommandOptions {
  room?: string;
  output?: string;
  server?: string;
}

export async function runReceiveCommand(options: ReceiveCommandOptions): Promise<void> {
  const room = options.room?.trim() ? normalizeRoomCode(options.room) : generateRoomCode();
  const config = await loadConfig();
  const serverUrl = options.server?.trim() || config.signalingServerUrl;
  const outputDirectory = await resolveOutputDirectory(options.output?.trim() || DEFAULT_OUTPUT_DIRECTORY);

  const signalingClient = new SignalingClient(serverUrl);

  try {
    console.log(`Connecting to signaling server: ${serverUrl}`);
    await signalingClient.connect();
    await signalingClient.join(room);
    console.log(`Room code: ${room}`);
    console.log("Waiting for sender...");

    const peer = await createReceiverPeer({ signalingClient });
    const outputPath = await receiveFile({
      acceptFile: promptTransferAcceptance,
      outputDirectory,
      peer
    });
    console.log(`Saved file: ${outputPath}`);
    await peer.close();
  } finally {
    signalingClient.close();
  }
}

async function promptTransferAcceptance(metadata: FileMetaMessage): Promise<boolean> {
  console.log("");
  console.log(`Incoming file: ${metadata.fileName}`);
  console.log(`Size: ${metadata.fileSize} bytes`);

  return confirm({
    message: "Receive this file?",
    default: true
  });
}
