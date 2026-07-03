import { createReadStream } from "node:fs";

import { DEFAULT_CHUNK_SIZE_BYTES } from "../config/config.js";

export async function* readFileChunks(
  filePath: string,
  chunkSizeBytes = DEFAULT_CHUNK_SIZE_BYTES
): AsyncGenerator<Buffer> {
  const stream = createReadStream(filePath, { highWaterMark: chunkSizeBytes });

  for await (const chunk of stream) {
    yield Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
  }
}
