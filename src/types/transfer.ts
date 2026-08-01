export type Role = "sender" | "receiver";

export type ConnectionState =
  | "idle"
  | "creating-room"
  | "waiting-for-peer"
  | "joining-room"
  | "connected"
  | "peer-disconnected"
  | "invalid-room-code"
  | "connection-failed";

export type TransferState =
  | "idle"
  | "file-selected"
  | "awaiting-approval"
  | "transferring"
  | "completed"
  | "declined"
  | "failed";

export interface FileMeta {
  name: string;
  size: number;
  type: string;
}

export type ControlMessage =
  | { kind: "file-meta"; meta: FileMeta }
  | { kind: "accept" }
  | { kind: "decline" }
  | { kind: "transfer-complete" }
  | { kind: "transfer-error"; message: string }
  | { kind: "cancel" };

export interface TransferProgress {
  transferredBytes: number;
  totalBytes: number;
  percentage: number;
}
