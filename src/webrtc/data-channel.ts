import type { RTCDataChannel } from "werift";

export type DataChannelPayload = string | Buffer;

export function waitForDataChannelOpen(channel: RTCDataChannel): Promise<void> {
  if (channel.readyState === "open") {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    channel.onopen = () => resolve();
    channel.onerror = (event) => reject(event.error instanceof Error ? event.error : new Error("DataChannel failed."));
  });
}

export async function waitForBufferedAmountLow(channel: RTCDataChannel, thresholdBytes: number): Promise<void> {
  if (channel.bufferedAmount <= thresholdBytes) {
    return;
  }

  channel.bufferedAmountLowThreshold = thresholdBytes;

  await new Promise<void>((resolve) => {
    channel.bufferedAmountLow.subscribe(() => resolve());
  });
}
