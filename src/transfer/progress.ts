const DEFAULT_PROGRESS_INTERVAL_MS = 100;

export class ProgressRenderer {
  private lastRenderedBytes = -1;
  private lastRenderedAt = 0;

  constructor(
    private readonly label: string,
    private readonly totalBytes: number,
    private readonly intervalMs = DEFAULT_PROGRESS_INTERVAL_MS
  ) {}

  render(currentBytes: number, force = false): void {
    const now = Date.now();

    if (!force && now - this.lastRenderedAt < this.intervalMs && currentBytes < this.totalBytes) {
      return;
    }

    this.lastRenderedAt = now;
    this.lastRenderedBytes = currentBytes;
    const percentage = this.totalBytes === 0 ? 100 : Math.floor((currentBytes / this.totalBytes) * 100);
    process.stdout.write(`\r${this.label}: ${percentage}% (${currentBytes}/${this.totalBytes} bytes)`);
  }

  finish(currentBytes: number): void {
    if (this.lastRenderedBytes !== currentBytes) {
      this.render(currentBytes, true);
    }

    process.stdout.write("\n");
  }
}
