import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { receiveFile } from "../src/transfer/receiver.js";
import { sendFile } from "../src/transfer/sender.js";
import { createManualReceiverOffer, createManualSenderAnswer } from "../src/webrtc/manual-signaling.js";

describe("manual signaling transfer integration", () => {
  it("transfers a file through WebRTC DataChannel without a signaling server", async () => {
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "a47-manual-transfer-"));
    const sourcePath = path.join(temporaryDirectory, "manual.txt");
    const outputDirectory = path.join(temporaryDirectory, "received");
    const fileContent = "manual signaling transfer\n".repeat(128);

    await writeFile(sourcePath, fileContent, "utf8");

    const receiverOffer = await createManualReceiverOffer([]);
    const senderAnswer = await createManualSenderAnswer(receiverOffer.offerCode, []);
    const receiverPeer = await receiverOffer.answer(senderAnswer.answerCode);
    const senderPeer = await senderAnswer.waitForPeer();

    const [outputPath] = await Promise.all([
      receiveFile({ outputDirectory, peer: receiverPeer }),
      sendFile({ filePath: sourcePath, peer: senderPeer })
    ]);

    await receiverPeer.close();
    await senderPeer.close();

    await expect(readFile(outputPath, "utf8")).resolves.toBe(fileContent);
  });
});
