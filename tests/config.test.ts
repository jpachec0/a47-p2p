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
    expect(parseConfigKey("ice-servers")).toBe("ice-servers");
  });

  it("rejects unsupported config keys", () => {
    expect(() => parseConfigKey("unknown")).toThrow(
      "Unknown config key. Supported keys: server, chunk-size, ice-servers."
    );
  });

  it("updates ICE server URLs", () => {
    const updatedConfig = setConfigValue(
      getDefaultConfig(),
      "ice-servers",
      "stun:stun.example.test:3478,turn:turn.example.test:3478"
    );

    expect(getConfigValue(updatedConfig, "ice-servers")).toBe(
      "stun:stun.example.test:3478,turn:turn.example.test:3478"
    );
  });

  it("updates authenticated ICE servers from JSON", () => {
    const updatedConfig = setConfigValue(
      getDefaultConfig(),
      "ice-servers",
      '[{"urls":"turn:turn.example.test:3478","username":"a47","credential":"test-turn-credential"}]'
    );

    expect(getConfigValue(updatedConfig, "ice-servers")).toBe(
      '[{"urls":"turn:turn.example.test:3478","username":"a47","credential":"test-turn-credential"}]'
    );
  });

  it("rejects invalid ICE server JSON", () => {
    expect(() => setConfigValue(getDefaultConfig(), "ice-servers", "[bad-json")).toThrow(
      "ICE server JSON must be valid JSON."
    );
  });

  it("rejects unsupported ICE server URL protocols", () => {
    expect(() => setConfigValue(getDefaultConfig(), "ice-servers", "https://example.test")).toThrow(
      "ICE server URLs must start with stun:, turn:, or turns:."
    );
  });
});
