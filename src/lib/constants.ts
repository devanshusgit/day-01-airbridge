/** Bytes per DataChannel chunk. Kept well under browser DataChannel message limits. */
export const CHUNK_SIZE = 16 * 1024;

/** Pause sending once this many bytes are buffered on the DataChannel, to avoid overwhelming it. */
export const BUFFERED_AMOUNT_HIGH_THRESHOLD = CHUNK_SIZE * 16;

/** Prototype limit — kept conservative since the whole file is buffered in memory. */
export const MAX_FILE_SIZE_BYTES = 512 * 1024 * 1024;

/** Above this, desktop-to-desktop transfers are still expected to work but may be slow. */
export const RECOMMENDED_DESKTOP_BYTES = 250 * 1024 * 1024;

/** Above this, mobile devices (more limited memory/CPU) may struggle or run out of memory. */
export const RECOMMENDED_MOBILE_BYTES = 100 * 1024 * 1024;

/** Length of the human-facing room code (excludes ambiguous characters). */
export const ROOM_CODE_LENGTH = 6;

export const ROOM_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Namespaces our room codes on PeerJS's shared public broker to reduce collisions. */
export const PEER_ID_PREFIX = "airbridge-";

export const ROOM_CODE_REGEX = new RegExp(`^[${ROOM_CODE_ALPHABET}]{${ROOM_CODE_LENGTH}}$`);
