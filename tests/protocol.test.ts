import { describe, expect, it } from "vitest";

import {
  encodeTransferMessage,
  TRANSFER_PROTOCOL_VERSION,
  tryDecodeTransferMessage
} from "../src/transfer/protocol.js";

describe("transfer protocol", () => {
  it("encodes and decodes file metadata messages", () => {
    const encodedMessage = encodeTransferMessage({
      type: "file-meta",
      protocolVersion: TRANSFER_PROTOCOL_VERSION,
      fileName: "example.txt",
      fileSize: 20,
      sha256: "abc123"
    });

    expect(tryDecodeTransferMessage(encodedMessage)).toEqual({
      type: "file-meta",
      protocolVersion: TRANSFER_PROTOCOL_VERSION,
      fileName: "example.txt",
      fileSize: 20,
      sha256: "abc123"
    });
  });

  it("returns undefined for invalid control messages", () => {
    expect(tryDecodeTransferMessage("not-json")).toBeUndefined();
  });
});
