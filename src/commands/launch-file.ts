import { input } from "@inquirer/prompts";

import { loadConfig } from "../config/config.js";
import { resolveExistingFile } from "../utils/paths.js";
import { runSendCommand } from "./send.js";

const KNOWN_COMMANDS = new Set([
  "help",
  "version",
  "send",
  "receive",
  "signaling",
  "config"
]);

export async function runLaunchFileFlow(args: string[]): Promise<boolean> {
  const firstArg = args[0];

  if (!firstArg || firstArg.startsWith("-") || KNOWN_COMMANDS.has(firstArg)) {
    return false;
  }

  let resolvedFilePath: string;

  try {
    resolvedFilePath = await resolveExistingFile(firstArg);
  } catch {
    return false;
  }

  const config = await loadConfig();
  console.log("A47 P2P send file");
  console.log(`File: ${resolvedFilePath}`);

  const room = await input({ message: "Room code" });
  const server = await input({
    message: "Signaling server URL",
    default: config.signalingServerUrl
  });

  await runSendCommand(resolvedFilePath, { room, server });
  return true;
}
