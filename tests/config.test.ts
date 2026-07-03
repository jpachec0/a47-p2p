import { describe, expect, it } from "vitest";

import {
  getConfigValue,
  getDefaultConfig,
  parseConfigKey,
  setConfigValue
} from "../src/config/config.js";

describe("config", () => {
  it("updates the signaling server URL", () => {
    const updatedConfig = setConfigValue(getDefaultConfig(), "server", "ws://localhost:5757");

    expect(getConfigValue(updatedConfig, "server")).toBe("ws://localhost:5757");
  });

  it("rejects unsupported signaling server URL protocols", () => {
    expect(() => setConfigValue(getDefaultConfig(), "server", "http://localhost:4747")).toThrow(
      "Server URL must start with ws:// or wss://."
    );
  });

  it("parses supported config keys", () => {
    expect(parseConfigKey("server")).toBe("server");
    expect(parseConfigKey("chunk-size")).toBe("chunk-size");
  });

  it("rejects unsupported config keys", () => {
    expect(() => parseConfigKey("unknown")).toThrow("Unknown config key.");
  });
});
