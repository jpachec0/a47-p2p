import path from "node:path";
import { access, mkdir, stat } from "node:fs/promises";
import { constants } from "node:fs";

import { A47Error } from "./errors.js";

export async function resolveExistingFile(filePath: string): Promise<string> {
  const resolvedPath = path.resolve(filePath);

  try {
    const fileStat = await stat(resolvedPath);

    if (fileStat.isDirectory()) {
      throw new A47Error("Folder transfer is planned, but this version only supports single files.");
    }

    if (!fileStat.isFile()) {
      throw new A47Error("The selected path is not a regular file.");
    }

    await access(resolvedPath, constants.R_OK);
    return resolvedPath;
  } catch (error) {
    if (error instanceof A47Error) {
      throw error;
    }

    throw new A47Error(`File not found or not readable: ${resolvedPath}`);
  }
}

export async function resolveOutputDirectory(outputDirectory: string): Promise<string> {
  const resolvedPath = path.resolve(outputDirectory);
  await mkdir(resolvedPath, { recursive: true });

  const directoryStat = await stat(resolvedPath);
  if (!directoryStat.isDirectory()) {
    throw new A47Error(`Output path is not a directory: ${resolvedPath}`);
  }

  await access(resolvedPath, constants.W_OK);
  return resolvedPath;
}

export function getSafeBaseName(filePath: string): string {
  return path.basename(filePath).replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_");
}

export async function getAvailableFilePath(outputDirectory: string, fileName: string): Promise<string> {
  const safeFileName = getSafeBaseName(fileName);
  const parsedPath = path.parse(safeFileName);
  let candidatePath = path.join(outputDirectory, safeFileName);
  let suffix = 1;

  while (await pathExists(candidatePath)) {
    candidatePath = path.join(outputDirectory, `${parsedPath.name} (${suffix})${parsedPath.ext}`);
    suffix += 1;
  }

  return candidatePath;
}

async function pathExists(candidatePath: string): Promise<boolean> {
  try {
    await access(candidatePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
