import { PEER_ID_PREFIX, ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH, ROOM_CODE_REGEX } from "./constants";

export function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)];
  }
  return code;
}

export function normalizeRoomCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

export function isValidRoomCode(code: string): boolean {
  return ROOM_CODE_REGEX.test(code);
}

export function roomCodeToPeerId(code: string): string {
  return `${PEER_ID_PREFIX}${code}`;
}
