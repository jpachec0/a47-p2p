import { input } from "@inquirer/prompts";

import { loadConfig } from "../config/config.js";
import { normalizeRoomCode } from "../signaling/rooms.js";
import { clearScreen } from "../ui/clear.js";
import { renderHeader } from "../ui/header.js";
import { promptMainMenu } from "../ui/menu.js";
import { renderSectionTitle } from "../ui/messages.js";
import { getHelpText } from "./help.js";
import { runReceiveCommand } from "./receive.js";
import { runSendCommand } from "./send.js";

export async function runInteractiveMode(): Promise<void> {
  let isRunning = true;

  while (isRunning) {
    clearScreen();
    renderHeader();

    const action = await promptMainMenu();

    if (action === "send") {
      await runSendFlow();
    }

    if (action === "receive") {
      await runReceiveFlow();
    }

    if (action === "help") {
      await runHelpFlow();
    }

    if (action === "settings") {
      await runSettingsFlow();
    }

    if (action === "exit") {
      isRunning = false;
      clearScreen();
      console.log("Goodbye.");
    }
  }
}

async function runSendFlow(): Promise<void> {
  clearScreen();
  renderHeader();
  renderSectionTitle("Send file");

  const filePath = await input({ message: "File path" });
  const room = await input({ message: "Room code" });

  await runWithPause(async () => {
    await runSendCommand(filePath, { room: normalizeRoomCode(room) });
  });
}

async function runReceiveFlow(): Promise<void> {
  clearScreen();
  renderHeader();
  renderSectionTitle("Receive file");

  await runWithPause(async () => {
    await runReceiveCommand({});
  });
}

async function runHelpFlow(): Promise<void> {
  clearScreen();
  console.log(getHelpText());
  await waitForEnter();
}

async function runSettingsFlow(): Promise<void> {
  clearScreen();
  renderHeader();
  renderSectionTitle("Settings");

  const config = await loadConfig();
  console.log(`Default signaling server: ${config.signalingServerUrl}`);
  console.log(`Default chunk size: ${config.chunkSizeBytes} bytes`);
  console.log(`ICE servers: ${config.iceServers.map((iceServer) => iceServer.urls).join(",")}`);
  console.log("");
  console.log("Default transfers use distributed room discovery unless --server or --manual is used.");
  console.log("");
  console.log("Use a47 config get <key> or a47 config set <key> <value> to manage defaults.");

  await waitForEnter();
}

async function runWithPause(action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed.";
    console.error(`Error: ${message}`);
  }

  await waitForEnter();
}

async function waitForEnter(): Promise<void> {
  await input({ message: "Press Enter to continue" });
}
