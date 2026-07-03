import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { getAvailableFilePath, getSafeBaseName, resolveExistingFile } from "../src/utils/paths.js";

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

  it("resolves a leading-slash shortcut relative to the current directory when the absolute path is missing", async () => {
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "a47-shortcut-path-"));
    const originalDirectory = process.cwd();
    const fileName = `shortcut-${Date.now()}.txt`;
    const filePath = path.join(temporaryDirectory, fileName);

    await writeFile(filePath, "shortcut");

    try {
      process.chdir(temporaryDirectory);
      await expect(resolveExistingFile(`/${fileName}`)).resolves.toBe(filePath);
    } finally {
      process.chdir(originalDirectory);
    }
  });
});
