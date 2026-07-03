import { DEFAULT_SIGNALING_PORT } from "../config/config.js";
import { startSignalingServer } from "../signaling/server.js";
import { A47Error } from "../utils/errors.js";

export interface SignalingCommandOptions {
  host?: string;
  port?: string;
}

export function runSignalingCommand(options: SignalingCommandOptions): void {
  const port = parsePort(options.port);
  const host = options.host?.trim() || undefined;
  startSignalingServer({ host, port });
}

function parsePort(rawPort: string | undefined): number {
  if (!rawPort) {
    return DEFAULT_SIGNALING_PORT;
  }

  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new A47Error("Port must be an integer between 0 and 65535.");
  }

  return port;
}
