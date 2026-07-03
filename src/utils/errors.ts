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
