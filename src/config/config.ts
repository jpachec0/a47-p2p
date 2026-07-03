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
export const DEFAULT_ICE_SERVERS: IceServerConfig[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" }
];

export interface IceServerConfig {
  urls: string;
  username?: string;
  credential?: string;
}

export interface A47Config {
  signalingServerUrl: string;
  chunkSizeBytes: number;
  iceServers: IceServerConfig[];
}

export function getDefaultConfig(): A47Config {
  return {
    signalingServerUrl: DEFAULT_SIGNALING_SERVER_URL,
    chunkSizeBytes: DEFAULT_CHUNK_SIZE_BYTES,
    iceServers: DEFAULT_ICE_SERVERS
  };
}

export type ConfigKey = "server" | "chunk-size" | "ice-servers";

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
      chunkSizeBytes: parsedConfig.chunkSizeBytes ?? defaultConfig.chunkSizeBytes,
      iceServers: normalizeIceServers(parsedConfig.iceServers ?? defaultConfig.iceServers)
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

  if (key === "ice-servers") {
    if (config.iceServers.some((iceServer) => iceServer.username || iceServer.credential)) {
      return JSON.stringify(config.iceServers);
    }

    return config.iceServers.map((iceServer) => iceServer.urls).join(",");
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

  if (key === "ice-servers") {
    return {
      ...config,
      iceServers: parseIceServerUrls(value)
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
  if (key === "server" || key === "chunk-size" || key === "ice-servers") {
    return key;
  }

  throw new A47Error("Unknown config key. Supported keys: server, chunk-size, ice-servers.");
}

function normalizeServerUrl(serverUrl: string): string {
  const trimmedServerUrl = serverUrl.trim();

  if (!trimmedServerUrl.startsWith("ws://") && !trimmedServerUrl.startsWith("wss://")) {
    throw new A47Error("Server URL must start with ws:// or wss://.");
  }

  return trimmedServerUrl;
}

function parseIceServerUrls(value: string): IceServerConfig[] {
  const trimmedValue = value.trim();

  if (trimmedValue.startsWith("[") || trimmedValue.startsWith("{")) {
    return parseIceServerJson(trimmedValue);
  }

  const iceServers = value
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => ({ urls: normalizeIceServerUrl(url) }));

  if (iceServers.length === 0) {
    throw new A47Error("ICE servers must include at least one STUN, TURN, or TURNS URL.");
  }

  return iceServers;
}

function parseIceServerJson(value: string): IceServerConfig[] {
  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(value);
  } catch {
    throw new A47Error("ICE server JSON must be valid JSON.");
  }

  const iceServers = Array.isArray(parsedValue) ? parsedValue : [parsedValue];

  if (iceServers.length === 0) {
    throw new A47Error("ICE servers must include at least one STUN, TURN, or TURNS URL.");
  }

  return iceServers.map(normalizeIceServerObject);
}

function normalizeIceServers(iceServers: IceServerConfig[]): IceServerConfig[] {
  if (!Array.isArray(iceServers) || iceServers.length === 0) {
    return DEFAULT_ICE_SERVERS;
  }

  return iceServers.map(normalizeIceServerObject);
}

function normalizeIceServerObject(iceServer: unknown): IceServerConfig {
  if (!isIceServerObject(iceServer)) {
    throw new A47Error("ICE server entries must include a string urls field.");
  }

  return {
    urls: normalizeIceServerUrl(iceServer.urls),
    username: normalizeOptionalString(iceServer.username, "ICE server username must be a string."),
    credential: normalizeOptionalString(iceServer.credential, "ICE server credential must be a string.")
  };
}

function isIceServerObject(value: unknown): value is IceServerConfig {
  return typeof value === "object" && value !== null && "urls" in value && typeof value.urls === "string";
}

function normalizeIceServerUrl(url: string): string {
  const trimmedUrl = url.trim();

  if (
    !trimmedUrl.startsWith("stun:") &&
    !trimmedUrl.startsWith("turn:") &&
    !trimmedUrl.startsWith("turns:")
  ) {
    throw new A47Error("ICE server URLs must start with stun:, turn:, or turns:.");
  }

  return trimmedUrl;
}

function normalizeOptionalString(value: unknown, errorMessage: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new A47Error(errorMessage);
  }

  const trimmedValue = value.trim();
  return trimmedValue || undefined;
}

function isMissingFileError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
