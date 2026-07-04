import { input } from "@inquirer/prompts";

import { normalizeRoomCode } from "../signaling/rooms.js";
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

  console.log("A47 P2P send file");
  console.log(`File: ${resolvedFilePath}`);

  const room = await input({ message: "Room code" });
  await runSendCommand(resolvedFilePath, { room: normalizeRoomCode(room) });
  return true;
}
