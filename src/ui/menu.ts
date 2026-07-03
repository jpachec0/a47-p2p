import { select } from "@inquirer/prompts";

export type MainMenuAction = "send" | "receive" | "help" | "settings" | "exit";

export async function promptMainMenu(): Promise<MainMenuAction> {
  return select<MainMenuAction>({
    message: "Choose an action",
    choices: [
      { name: "Send file", value: "send" },
      { name: "Receive file", value: "receive" },
      { name: "Help", value: "help" },
      { name: "Settings/configuration", value: "settings" },
      { name: "Exit", value: "exit" }
    ]
  });
}
