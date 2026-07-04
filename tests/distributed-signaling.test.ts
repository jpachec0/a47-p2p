import { describe, expect, it } from "vitest";

import {
  createJsonLineReader,
  encodeDistributedSignalMessage,
  getDistributedRoomTopic
} from "../src/discovery/distributed-signaling.js";

describe("distributed signaling helpers", () => {
  it("creates stable 32-byte topics from normalized room codes", () => {
    const topic = getDistributedRoomTopic(" a47-sk2s29 ");
    const normalizedTopic = getDistributedRoomTopic("A47-SK2S29");

    expect(topic.byteLength).toBe(32);
    expect(topic.equals(normalizedTopic)).toBe(true);
  });

  it("reads JSON line messages across chunks", () => {
    const reader = createJsonLineReader();
    const offerLine = encodeDistributedSignalMessage({
      offerCode: "A47-OFFER-example",
      type: "offer"
    });

    expect(reader.push(Buffer.from(offerLine.slice(0, 10)))).toEqual([]);
    expect(reader.push(Buffer.from(offerLine.slice(10)))).toEqual([
      {
        offerCode: "A47-OFFER-example",
        type: "offer"
      }
    ]);
  });
});
