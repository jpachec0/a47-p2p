import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { A47Error } from "../utils/errors.js";

export const DEFAULT_SIGNALING_SERVER_URL = "ws://localhost:4747";
export const DEFAULT_SIGNALING_PORT = 4747;
export const DEFAULT_CHUNK_SIZE_BYTES = 256 * 1024;
export const DEFAULT_OUTPUT_DIRECTORY = ".";
export const CONFIG_DIRECTORY_NAME = ".a47";
export const CONFIG_FILE_NAME = "config.json";

export interface A47Config {
  signalingServerUrl: string;
  chunkSizeBytes: number;
}

export function getDefaultConfig(): A47Config {
  return {
    signalingServerUrl: DEFAULT_SIGNALING_SERVER_URL,
    chunkSizeBytes: DEFAULT_CHUNK_SIZE_BYTES
  };
}

export type ConfigKey = "server" | "chunk-size";

export function getConfigFilePath(): string {
  return path.join(os.homedir(), CONFIG_DIRECTORY_NAME, CONFIG_FILE_NAME);
}

export async function loadConfig(): Promise<A47Config> {
  const defaultConfig = getDefaultConfig();
  const configFilePath = getConfigFilePath();

  try {
    const rawConfig = await readFile(configFilePath, "utf8");
    const parsedConfig = JSON.parse(rawConfig) as Partial<A47Config>;

    return {
      signalingServerUrl: parsedConfig.signalingServerUrl ?? defaultConfig.signalingServerUrl,
      chunkSizeBytes: parsedConfig.chunkSizeBytes ?? defaultConfig.chunkSizeBytes
    };
  } catch (error) {
    if (isMissingFileError(error)) {
      return defaultConfig;
    }

    throw new A47Error(`Unable to read config file: ${configFilePath}`);
  }
}

export async function saveConfig(config: A47Config): Promise<void> {
  const configFilePath = getConfigFilePath();
  await mkdir(path.dirname(configFilePath), { recursive: true });
  await writeFile(configFilePath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

export function getConfigValue(config: A47Config, key: ConfigKey): string {
  if (key === "server") {
    return config.signalingServerUrl;
  }

  return String(config.chunkSizeBytes);
}

export function setConfigValue(config: A47Config, key: ConfigKey, value: string): A47Config {
  if (key === "server") {
    return {
      ...config,
      signalingServerUrl: normalizeServerUrl(value)
    };
  }

  const chunkSizeBytes = Number(value);
  if (!Number.isInteger(chunkSizeBytes) || chunkSizeBytes <= 0) {
    throw new A47Error("Chunk size must be a positive integer in bytes.");
  }

  return {
    ...config,
    chunkSizeBytes
  };
}

export function parseConfigKey(key: string): ConfigKey {
  if (key === "server" || key === "chunk-size") {
    return key;
  }

  throw new A47Error("Unknown config key. Supported keys: server, chunk-size.");
}

function normalizeServerUrl(serverUrl: string): string {
  const trimmedServerUrl = serverUrl.trim();

  if (!trimmedServerUrl.startsWith("ws://") && !trimmedServerUrl.startsWith("wss://")) {
    throw new A47Error("Server URL must start with ws:// or wss://.");
  }

  return trimmedServerUrl;
}

function isMissingFileError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
