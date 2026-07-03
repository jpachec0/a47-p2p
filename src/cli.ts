#!/usr/bin/env node
import { Command } from "commander";

import { runInteractiveMode } from "./commands/interactive.js";
import { runReceiveCommand } from "./commands/receive.js";
import { runSendCommand } from "./commands/send.js";
import { showHelp } from "./commands/help.js";
import { showVersion } from "./commands/version.js";
import { getReadableError } from "./utils/errors.js";
import { printError } from "./utils/logger.js";

async function main(): Promise<void> {
  const program = new Command();

  program
    .name("a47")
    .description("A47 P2P is a command-line peer-to-peer file transfer tool using WebRTC DataChannels.")
    .allowExcessArguments(false)
    .showHelpAfterError(false)
    .helpOption(false);

  program
    .command("help")
    .description("Show the custom A47 help screen.")
    .action(() => {
      showHelp();
    });

  program
    .command("version")
    .description("Show the current version.")
    .action(async () => {
      await showVersion();
    });

  program
    .command("send")
    .description("Send one file to a peer.")
    .argument("<path>", "Path to the file to send.")
    .requiredOption("--room <room>", "Room code shared with the receiver.")
    .option("--server <url>", "Signaling server URL.")
    .action(async (filePath: string, options: { room?: string; server?: string }) => {
      await runSendCommand(filePath, options);
    });

  program
    .command("receive")
    .description("Receive one file from a peer.")
    .requiredOption("--room <room>", "Room code shared with the sender.")
    .option("--output <dir>", "Output directory.")
    .option("--server <url>", "Signaling server URL.")
    .action(async (options: { room?: string; output?: string; server?: string }) => {
      await runReceiveCommand(options);
    });

  program.exitOverride();

  if (process.argv.length <= 2) {
    await runInteractiveMode();
    return;
  }

  await program.parseAsync(process.argv);
}

main().catch((error: unknown) => {
  printError(getReadableError(error));
  process.exitCode = 1;
});
