import { describe, expect, it } from "vitest";

import { decodeManualSignal, encodeManualSignal } from "../src/webrtc/manual-signaling.js";

describe("manual signaling", () => {
  it("encodes and decodes manual offer codes", () => {
    const code = encodeManualSignal("A47-OFFER-", {
      description: {
        sdp: "v=0",
        type: "offer"
      },
      version: 1
    });

    expect(code.startsWith("A47-OFFER-")).toBe(true);
    expect(decodeManualSignal(code, "A47-OFFER-", "offer")).toEqual({
      description: {
        sdp: "v=0",
        type: "offer"
      },
      version: 1
    });
  });

  it("rejects codes with the wrong prefix", () => {
    expect(() => decodeManualSignal("A47-ANSWER-bad", "A47-OFFER-", "offer")).toThrow(
      "Manual signaling code must start with A47-OFFER-."
    );
  });

  it("rejects invalid code payloads", () => {
    expect(() => decodeManualSignal("A47-OFFER-bad", "A47-OFFER-", "offer")).toThrow(
      "Manual signaling code is invalid."
    );
  });
});
