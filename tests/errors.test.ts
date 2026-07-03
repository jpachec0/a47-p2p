import { describe, expect, it } from "vitest";

import { A47Error, getDebugError, getReadableError, isDebugModeEnabled } from "../src/utils/errors.js";

describe("error utilities", () => {
  it("returns human-readable messages by default", () => {
    expect(getReadableError(new A47Error("Missing room."))).toBe("Missing room.");
    expect(getReadableError("unexpected")).toBe("An unknown error occurred.");
  });

  it("returns stack traces for debug output when available", () => {
    const error = new Error("Debug failure.");
    const debugOutput = getDebugError(error);

    expect(debugOutput).toContain("Error: Debug failure.");
    expect(debugOutput).toContain("errors.test.ts");
  });

  it("detects debug mode from argv or environment", () => {
    expect(isDebugModeEnabled(["node", "dist/cli.js", "--debug"], {})).toBe(true);
    expect(isDebugModeEnabled(["node", "dist/cli.js"], { A47_DEBUG: "1" })).toBe(true);
    expect(isDebugModeEnabled(["node", "dist/cli.js"], { A47_DEBUG: "true" })).toBe(true);
    expect(isDebugModeEnabled(["node", "dist/cli.js"], {})).toBe(false);
  });
});
