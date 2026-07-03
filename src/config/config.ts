export const DEFAULT_SIGNALING_SERVER_URL = "ws://localhost:4747";
export const DEFAULT_SIGNALING_PORT = 4747;
export const DEFAULT_CHUNK_SIZE_BYTES = 64 * 1024;
export const DEFAULT_OUTPUT_DIRECTORY = ".";

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
