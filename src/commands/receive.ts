import { confirm, input } from "@inquirer/prompts";

import { DEFAULT_OUTPUT_DIRECTORY, loadConfig } from "../config/config.js";
import { createDistributedReceiverPeer } from "../discovery/distributed-signaling.js";
import { SignalingClient } from "../signaling/client.js";
import { generateRoomCode, normalizeRoomCode } from "../signaling/rooms.js";
import type { FileMetaMessage } from "../transfer/protocol.js";
import { receiveFile } from "../transfer/receiver.js";
import { resolveOutputDirectory } from "../utils/paths.js";
import { createManualReceiverOffer } from "../webrtc/manual-signaling.js";
import { createReceiverPeer } from "../webrtc/peer.js";

export interface ReceiveCommandOptions {
  manual?: boolean;
  room?: string;
  output?: string;
  server?: string;
}

export async function runReceiveCommand(options: ReceiveCommandOptions): Promise<void> {
  const room = options.room?.trim() ? normalizeRoomCode(options.room) : generateRoomCode();
  const config = await loadConfig();
  const serverUrl = options.server?.trim() || config.signalingServerUrl;
  const outputDirectory = await resolveOutputDirectory(options.output?.trim() || DEFAULT_OUTPUT_DIRECTORY);

  if (options.manual) {
    await runManualReceive(outputDirectory, config);
    return;
  }

  if (!options.server?.trim()) {
    console.log(`Room code: ${room}`);
    console.log("Waiting for sender through distributed discovery...");
    const peer = await createDistributedReceiverPeer(room, config.iceServers);

    try {
      const outputPath = await receiveFile({
        acceptFile: promptTransferAcceptance,
        outputDirectory,
        peer
      });
      console.log(`Saved file: ${outputPath}`);
    } finally {
      await peer.close();
    }

    return;
  }

  const signalingClient = new SignalingClient(serverUrl);

  try {
    console.log(`Connecting to signaling server: ${serverUrl}`);
    await signalingClient.connect();
    await signalingClient.join(room);
    console.log(`Room code: ${room}`);
    console.log("Waiting for sender...");

    const peer = await createReceiverPeer({ iceServers: config.iceServers, signalingClient });
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

async function runManualReceive(
  outputDirectory: string,
  config: Awaited<ReturnType<typeof loadConfig>>
): Promise<void> {
  console.log("Manual signaling mode does not use the WebSocket signaling server.");
  const manualOffer = await createManualReceiverOffer(config.iceServers);

  console.log("");
  console.log("Paste this offer code into the sender:");
  console.log(manualOffer.offerCode);
  console.log("");

  const answerCode = await input({ message: "Paste sender answer code" });
  const peer = await manualOffer.answer(answerCode);

  const outputPath = await receiveFile({
    acceptFile: promptTransferAcceptance,
    outputDirectory,
    peer
  });

  console.log(`Saved file: ${outputPath}`);
  await peer.close();
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
