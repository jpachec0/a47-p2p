export function printInfo(message: string): void {
  console.log(message);
}

export function printSuccess(message: string): void {
  console.log(message);
}

export function printWarning(message: string): void {
  console.warn(message);
}

export function printError(message: string): void {
  console.error(`Error: ${message}`);
}

export function printDebugError(message: string): void {
  console.error(message);
}
