import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { getAvailableFilePath, getSafeBaseName } from "../src/utils/paths.js";

describe("path utilities", () => {
  it("sanitizes unsafe file name characters", () => {
    expect(getSafeBaseName("bad:name?.txt")).toBe("bad_name_.txt");
  });

  it("creates a safe non-overwriting target path", async () => {
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "a47-paths-"));
    await writeFile(path.join(temporaryDirectory, "example.txt"), "existing");

    const availablePath = await getAvailableFilePath(temporaryDirectory, "example.txt");

    expect(path.basename(availablePath)).toBe("example (1).txt");
  });
});
