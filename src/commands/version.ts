import { readFile } from "node:fs/promises";
import path from "node:path";

export async function getVersion(): Promise<string> {
  const packageJsonPath = path.resolve("package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8")) as { version?: string };
  return packageJson.version ?? "0.0.0";
}

export async function showVersion(): Promise<void> {
  console.log(await getVersion());
}
