export const MIN_ROOM_CODE_LENGTH = 4;
export const MAX_ROOM_CODE_LENGTH = 64;
export const ROOM_CODE_PATTERN = /^[A-Za-z0-9._-]+$/;

export function normalizeRoomCode(room: string): string {
  return room.trim();
}

export function getRoomCodeValidationError(room: string): string | undefined {
  const normalizedRoom = normalizeRoomCode(room);

  if (!normalizedRoom) {
    return "Room is required.";
  }

  if (normalizedRoom.length < MIN_ROOM_CODE_LENGTH || normalizedRoom.length > MAX_ROOM_CODE_LENGTH) {
    return `Room must be between ${MIN_ROOM_CODE_LENGTH} and ${MAX_ROOM_CODE_LENGTH} characters.`;
  }

  if (!ROOM_CODE_PATTERN.test(normalizedRoom)) {
    return "Room may only contain letters, numbers, dots, underscores, and hyphens.";
  }

  return undefined;
}
