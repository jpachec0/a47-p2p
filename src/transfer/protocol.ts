export const TRANSFER_PROTOCOL_VERSION = 1;

export type TransferMessageType =
  | "file-meta"
  | "receiver-ready"
  | "receiver-accepted"
  | "file-complete"
  | "file-error"
  | "hash-result"
  | "sender-complete";

export interface FileMetaMessage {
  type: "file-meta";
  protocolVersion: number;
  fileName: string;
  fileSize: number;
  sha256: string;
}

export interface ReceiverReadyMessage {
  type: "receiver-ready";
}

export interface ReceiverAcceptedMessage {
  type: "receiver-accepted";
}

export interface FileCompleteMessage {
  type: "file-complete";
}

export interface FileErrorMessage {
  type: "file-error";
  message: string;
}

export interface HashResultMessage {
  type: "hash-result";
  ok: boolean;
  expectedSha256: string;
  actualSha256: string;
}

export interface SenderCompleteMessage {
  type: "sender-complete";
}

export type TransferControlMessage =
  | FileMetaMessage
  | ReceiverReadyMessage
  | ReceiverAcceptedMessage
  | FileCompleteMessage
  | FileErrorMessage
  | HashResultMessage
  | SenderCompleteMessage;

export function encodeTransferMessage(message: TransferControlMessage): string {
  return JSON.stringify(message);
}

export function tryDecodeTransferMessage(data: string): TransferControlMessage | undefined {
  try {
    const parsedMessage = JSON.parse(data) as TransferControlMessage;
    if (!parsedMessage || typeof parsedMessage.type !== "string") {
      return undefined;
    }

    return parsedMessage;
  } catch {
    return undefined;
  }
}
