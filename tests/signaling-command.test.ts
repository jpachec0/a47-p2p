import { describe, expect, it } from "vitest";

import { runSignalingCommand } from "../src/commands/signaling.js";

describe("signaling command", () => {
  it("rejects invalid ports", () => {
    expect(() => runSignalingCommand({ port: "not-a-port" })).toThrow("Port must be an integer between 0 and 65535.");
    expect(() => runSignalingCommand({ port: "70000" })).toThrow("Port must be an integer between 0 and 65535.");
  });
});
