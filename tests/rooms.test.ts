import { describe, expect, it } from "vitest";

import { generateRoomCode, getRoomCodeValidationError, normalizeRoomCode } from "../src/signaling/rooms.js";

describe("room code validation", () => {
  it("normalizes surrounding whitespace and casing", () => {
    expect(normalizeRoomCode("  test-room  ")).toBe("TEST-ROOM");
  });

  it("generates user-friendly room codes", () => {
    const roomCode = generateRoomCode();

    expect(roomCode).toMatch(/^A47-[A-Z2-9]{6}$/);
    expect(getRoomCodeValidationError(roomCode)).toBeUndefined();
  });

  it("accepts supported room code characters", () => {
    expect(getRoomCodeValidationError("room-01.test_ok")).toBeUndefined();
  });

  it("rejects missing, short, long, and unsafe room codes", () => {
    expect(getRoomCodeValidationError("")).toBe("Room is required.");
    expect(getRoomCodeValidationError("abc")).toBe("Room must be between 4 and 64 characters.");
    expect(getRoomCodeValidationError("a".repeat(65))).toBe("Room must be between 4 and 64 characters.");
    expect(getRoomCodeValidationError("unsafe room")).toBe(
      "Room may only contain letters, numbers, dots, underscores, and hyphens."
    );
  });
});
