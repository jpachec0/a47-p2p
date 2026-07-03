export class A47Error extends Error {
  constructor(message: string) {
    super(message);
    this.name = "A47Error";
  }
}

export function getReadableError(error: unknown): string {
  if (error instanceof A47Error) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown error occurred.";
}

export function getDebugError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }

  return getReadableError(error);
}

export function isDebugModeEnabled(argv = process.argv, env = process.env): boolean {
  return argv.includes("--debug") || env.A47_DEBUG === "1" || env.A47_DEBUG === "true";
}
