#!/usr/bin/env node
import { Command } from "commander";

import { showConfigValue, updateConfigValue } from "./commands/config.js";
import { runInteractiveMode } from "./commands/interactive.js";
import { runReceiveCommand } from "./commands/receive.js";
import { runSendCommand } from "./commands/send.js";
import { runSignalingCommand } from "./commands/signaling.js";
import { showHelp } from "./commands/help.js";
import { showVersion } from "./commands/version.js";
import { getDebugError, getReadableError, isDebugModeEnabled } from "./utils/errors.js";
import { printDebugError, printError } from "./utils/logger.js";

async function main(): Promise<void> {
  const program = new Command();

  program
    .name("a47")
    .description("A47 P2P is a command-line peer-to-peer file transfer tool using WebRTC DataChannels.")
    .option("--debug", "Print raw stack traces for troubleshooting.")
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

  program
    .command("signaling")
    .description("Run the local WebSocket signaling server.")
    .option("--host <host>", "Host interface to bind. Use 0.0.0.0 for LAN access.")
    .option("--port <port>", "Port to listen on.")
    .action((options: { host?: string; port?: string }) => {
      runSignalingCommand(options);
    });

  const configCommand = program
    .command("config")
    .description("Read and update local A47 configuration.");

  configCommand
    .command("get")
    .description("Show a config value.")
    .argument("<key>", "Config key. Supported keys: server, chunk-size.")
    .action(async (key: string) => {
      await showConfigValue(key);
    });

  configCommand
    .command("set")
    .description("Update a config value.")
    .argument("<key>", "Config key. Supported keys: server, chunk-size.")
    .argument("<value>", "New config value.")
    .action(async (key: string, value: string) => {
      await updateConfigValue(key, value);
    });

  program.exitOverride();

  if (process.argv.length <= 2) {
    await runInteractiveMode();
    return;
  }

  await program.parseAsync(process.argv);
}

main().catch((error: unknown) => {
  if (isDebugModeEnabled()) {
    printDebugError(getDebugError(error));
  } else {
    printError(getReadableError(error));
  }

  process.exitCode = 1;
});
