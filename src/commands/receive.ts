import { DEFAULT_OUTPUT_DIRECTORY, DEFAULT_SIGNALING_SERVER_URL } from "../config/config.js";
import { SignalingClient } from "../signaling/client.js";
import { receiveFile } from "../transfer/receiver.js";
import { A47Error } from "../utils/errors.js";
import { resolveOutputDirectory } from "../utils/paths.js";
import { createReceiverPeer } from "../webrtc/peer.js";

export interface ReceiveCommandOptions {
  room?: string;
  output?: string;
  server?: string;
}

export async function runReceiveCommand(options: ReceiveCommandOptions): Promise<void> {
  const room = options.room?.trim();
  const serverUrl = options.server?.trim() || DEFAULT_SIGNALING_SERVER_URL;
  const outputDirectory = await resolveOutputDirectory(options.output?.trim() || DEFAULT_OUTPUT_DIRECTORY);

  if (!room) {
    throw new A47Error("Missing required option: --room <room>.");
  }

  const signalingClient = new SignalingClient(serverUrl);

  try {
    console.log(`Connecting to signaling server: ${serverUrl}`);
    await signalingClient.connect();
    await signalingClient.join(room);
    console.log(`Joined room: ${room}`);
    console.log("Waiting for sender...");

    const peer = await createReceiverPeer({ signalingClient });
    const outputPath = await receiveFile({ outputDirectory, peer });
    console.log(`Saved file: ${outputPath}`);
    await peer.close();
  } finally {
    signalingClient.close();
  }
}
