"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DataConnection, Peer as PeerType } from "peerjs";
import {
  BUFFERED_AMOUNT_HIGH_THRESHOLD,
  CHUNK_SIZE,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/constants";
import { chunkFile, isValidFileMeta, sanitizeFileName } from "@/lib/file-transfer";
import { generateRoomCode, isValidRoomCode, roomCodeToPeerId } from "@/lib/room-code";
import { formatPercentage } from "@/lib/format";
import type {
  ConnectionState,
  ControlMessage,
  FileMeta,
  Role,
  TransferProgress,
  TransferState,
} from "@/types/transfer";

const ICE_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const CREATE_ROOM_MAX_ATTEMPTS = 3;

interface State {
  role: Role | null;
  connectionState: ConnectionState;
  transferState: TransferState;
  roomCode: string | null;
  errorMessage: string | null;
  incomingFileMeta: FileMeta | null;
  selectedFile: File | null;
  progress: TransferProgress;
  downloadUrl: string | null;
  statusAnnouncement: string;
}

const initialState: State = {
  role: null,
  connectionState: "idle",
  transferState: "idle",
  roomCode: null,
  errorMessage: null,
  incomingFileMeta: null,
  selectedFile: null,
  progress: { transferredBytes: 0, totalBytes: 0, percentage: 0 },
  downloadUrl: null,
  statusAnnouncement: "",
};

export function usePeerTransfer() {
  const [state, setState] = useState<State>(initialState);
  const peerRef = useRef<PeerType | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const cancelledRef = useRef(false);
  const receivedChunksRef = useRef<BlobPart[]>([]);
  const downloadUrlRef = useRef<string | null>(null);
  const lastProgressUpdateRef = useRef(0);
  // Mirrors `state` for callbacks that need to read the latest value without
  // re-subscribing on every change (e.g. inside a chunk-sending loop).
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  const patch = useCallback((partial: Partial<State>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const announce = useCallback((message: string) => {
    setState((prev) => ({ ...prev, statusAnnouncement: message }));
  }, []);

  const revokeDownloadUrl = useCallback(() => {
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = null;
    }
  }, []);

  const teardownConnection = useCallback(() => {
    connRef.current?.close();
    connRef.current = null;
  }, []);

  const teardownPeer = useCallback(() => {
    teardownConnection();
    peerRef.current?.destroy();
    peerRef.current = null;
  }, [teardownConnection]);

  const reset = useCallback(() => {
    cancelledRef.current = true;
    teardownPeer();
    revokeDownloadUrl();
    receivedChunksRef.current = [];
    setState(initialState);
  }, [teardownPeer, revokeDownloadUrl]);

  useEffect(() => {
    return () => {
      teardownPeer();
      revokeDownloadUrl();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateProgress = useCallback(
    (transferredBytes: number, totalBytes: number, force = false) => {
      const now = Date.now();
      if (!force && now - lastProgressUpdateRef.current < 80 && transferredBytes < totalBytes) {
        return;
      }
      lastProgressUpdateRef.current = now;
      patch({
        progress: {
          transferredBytes,
          totalBytes,
          percentage: formatPercentage(transferredBytes, totalBytes),
        },
      });
    },
    [patch]
  );

  const sendControlMessage = useCallback((message: ControlMessage) => {
    connRef.current?.send(message);
  }, []);

  const finishReceivedFile = useCallback(
    (meta: FileMeta) => {
      const blob = new Blob(receivedChunksRef.current, { type: meta.type || "application/octet-stream" });
      receivedChunksRef.current = [];
      revokeDownloadUrl();
      const url = URL.createObjectURL(blob);
      downloadUrlRef.current = url;
      patch({ transferState: "completed", downloadUrl: url });
      announce(`Transfer complete. ${sanitizeFileName(meta.name)} is ready to download.`);
    },
    [patch, announce, revokeDownloadUrl]
  );

  const handleControlOrChunk = useCallback(
    (data: unknown) => {
      // PeerJS's BinaryPack serialization decodes raw binary payloads as Uint8Array
      // (not ArrayBuffer), so chunks must be recognized via ArrayBuffer.isView too.
      if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
        receivedChunksRef.current.push(data as BlobPart);
        const transferred = receivedChunksRef.current.reduce(
          (sum, chunk) => sum + (chunk as ArrayBuffer | ArrayBufferView).byteLength,
          0
        );
        const total = stateRef.current.incomingFileMeta?.size ?? stateRef.current.progress.totalBytes;
        updateProgress(transferred, total);
        return;
      }

      const message = data as ControlMessage;
      switch (message.kind) {
        case "file-meta": {
          if (!isValidFileMeta(message.meta)) {
            sendControlMessage({ kind: "transfer-error", message: "Invalid file metadata received." });
            return;
          }
          if (
            stateRef.current.transferState === "awaiting-approval" ||
            stateRef.current.transferState === "transferring"
          ) {
            sendControlMessage({ kind: "transfer-error", message: "A transfer is already in progress." });
            return;
          }
          receivedChunksRef.current = [];
          patch({
            incomingFileMeta: message.meta,
            transferState: "awaiting-approval",
            progress: { transferredBytes: 0, totalBytes: message.meta.size, percentage: 0 },
          });
          announce(`Incoming file ${sanitizeFileName(message.meta.name)}. Awaiting your approval.`);
          break;
        }
        case "accept": {
          patch({ transferState: "transferring" });
          announce("Receiver accepted. Transfer starting.");
          break;
        }
        case "decline": {
          patch({ transferState: "declined" });
          announce("Receiver declined the transfer.");
          break;
        }
        case "transfer-complete": {
          if (stateRef.current.incomingFileMeta) {
            finishReceivedFile(stateRef.current.incomingFileMeta);
          }
          break;
        }
        case "transfer-error": {
          patch({ transferState: "failed", errorMessage: message.message });
          announce(`Transfer failed: ${message.message}`);
          break;
        }
        case "cancel": {
          patch({ transferState: "failed", errorMessage: "The other device cancelled the transfer." });
          announce("Transfer cancelled by the other device.");
          break;
        }
      }
    },
    [patch, announce, sendControlMessage, finishReceivedFile, updateProgress]
  );

  const wireConnection = useCallback(
    (conn: DataConnection) => {
      connRef.current = conn;

      conn.on("open", () => {
        patch({ connectionState: "connected" });
        announce("Peer connected.");
      });

      conn.on("data", (data) => handleControlOrChunk(data));

      conn.on("close", () => {
        cancelledRef.current = true;
        connRef.current = null;
        setState((prev) => {
          if (prev.transferState === "completed") return prev;
          return {
            ...prev,
            connectionState: "peer-disconnected",
            transferState: prev.transferState === "transferring" ? "failed" : prev.transferState,
            errorMessage:
              prev.transferState === "transferring" ? "The other device disconnected mid-transfer." : prev.errorMessage,
          };
        });
        announce("The other device disconnected.");
      });

      conn.on("error", (err) => {
        patch({ connectionState: "connection-failed", errorMessage: err.message || "Connection error." });
        announce("Connection error.");
      });
    },
    [patch, announce, handleControlOrChunk]
  );

  // Holds the latest `createRoom` so the retry-on-collision path below can call
  // back into it without a direct self-reference (which upsets the compiler).
  const createRoomRef = useRef<(attempt: number) => void>(() => {});

  const createRoom = useCallback(
    async (attempt = 1) => {
      cancelledRef.current = false;
      patch({ ...initialState, role: "sender", connectionState: "creating-room" });
      const { Peer } = await import("peerjs");
      const code = generateRoomCode();
      const peer = new Peer(roomCodeToPeerId(code), { config: ICE_CONFIG, debug: 0 });
      peerRef.current = peer;

      peer.on("open", () => {
        patch({ connectionState: "waiting-for-peer", roomCode: code });
        announce(`Room created. Share code ${code} with the other device.`);
      });

      peer.on("connection", (conn) => {
        if (connRef.current) {
          conn.close();
          return;
        }
        wireConnection(conn);
      });

      peer.on("disconnected", () => {
        setState((prev) =>
          prev.connectionState === "connected" ? prev : { ...prev, connectionState: "connection-failed" }
        );
      });

      peer.on("error", (err) => {
        if (err.type === "unavailable-id" && attempt < CREATE_ROOM_MAX_ATTEMPTS) {
          peer.destroy();
          createRoomRef.current(attempt + 1);
          return;
        }
        patch({ connectionState: "connection-failed", errorMessage: err.message || "Could not create room." });
        announce("Could not create room.");
      });
    },
    [patch, announce, wireConnection]
  );

  useEffect(() => {
    createRoomRef.current = createRoom;
  }, [createRoom]);

  const joinRoom = useCallback(
    async (rawCode: string) => {
      cancelledRef.current = false;
      const code = rawCode.trim().toUpperCase().replace(/\s+/g, "");
      if (!isValidRoomCode(code)) {
        patch({ connectionState: "invalid-room-code", errorMessage: "That room code doesn't look right." });
        return;
      }
      patch({ ...initialState, role: "receiver", connectionState: "joining-room", roomCode: code });
      const { Peer } = await import("peerjs");
      const peer = new Peer({ config: ICE_CONFIG, debug: 0 });
      peerRef.current = peer;

      peer.on("open", () => {
        const conn = peer.connect(roomCodeToPeerId(code), { reliable: true });
        wireConnection(conn);
      });

      peer.on("error", (err) => {
        if (err.type === "peer-unavailable") {
          patch({ connectionState: "invalid-room-code", errorMessage: "No active room found with that code." });
          announce("No active room found with that code.");
          return;
        }
        patch({ connectionState: "connection-failed", errorMessage: err.message || "Connection failed." });
        announce("Connection failed.");
      });
    },
    [patch, announce, wireConnection]
  );

  const selectFile = useCallback(
    (file: File) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        patch({
          errorMessage: `File is too large for this prototype (limit ${Math.round(
            MAX_FILE_SIZE_BYTES / (1024 * 1024)
          )} MB).`,
        });
        announce("File exceeds the prototype size limit.");
        return;
      }
      patch({ selectedFile: file, transferState: "file-selected", errorMessage: null });
    },
    [patch, announce]
  );

  const startTransfer = useCallback(async () => {
    const conn = connRef.current;
    const file = state.selectedFile;
    if (!conn || !conn.open || !file || state.connectionState !== "connected") {
      return;
    }

    const meta: FileMeta = { name: sanitizeFileName(file.name), size: file.size, type: file.type };
    patch({ transferState: "awaiting-approval", errorMessage: null });
    sendControlMessage({ kind: "file-meta", meta });

    const waitForApproval = () =>
      new Promise<"accept" | "decline" | "disconnected">((resolve) => {
        const intervalId = setInterval(() => {
          if (cancelledRef.current || !connRef.current) {
            clearInterval(intervalId);
            resolve("disconnected");
            return;
          }
          if (stateRef.current.transferState === "transferring") {
            clearInterval(intervalId);
            resolve("accept");
          } else if (stateRef.current.transferState === "declined") {
            clearInterval(intervalId);
            resolve("decline");
          }
        }, 150);
      });

    const outcome = await waitForApproval();
    if (outcome !== "accept") return;

    cancelledRef.current = false;
    lastProgressUpdateRef.current = 0;
    updateProgress(0, file.size, true);

    try {
      let sentBytes = 0;
      for await (const chunk of chunkFile(file, CHUNK_SIZE)) {
        if (cancelledRef.current || !connRef.current || !connRef.current.open) {
          throw new Error("Connection lost during transfer.");
        }
        while (
          connRef.current.dataChannel &&
          connRef.current.dataChannel.bufferedAmount > BUFFERED_AMOUNT_HIGH_THRESHOLD
        ) {
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
        connRef.current.send(chunk);
        sentBytes += chunk.byteLength;
        updateProgress(sentBytes, file.size);
      }
      if (connRef.current && connRef.current.open) {
        sendControlMessage({ kind: "transfer-complete" });
        updateProgress(file.size, file.size, true);
        patch({ transferState: "completed" });
        announce("Transfer complete.");
      }
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Transfer failed.";
      patch({ transferState: "failed", errorMessage: messageText });
      announce(`Transfer failed: ${messageText}`);
    }
  }, [state.selectedFile, state.connectionState, patch, announce, sendControlMessage, updateProgress]);

  const acceptTransfer = useCallback(() => {
    receivedChunksRef.current = [];
    lastProgressUpdateRef.current = 0;
    sendControlMessage({ kind: "accept" });
    patch({ transferState: "transferring" });
    announce("Accepted. Receiving file.");
  }, [sendControlMessage, patch, announce]);

  const declineTransfer = useCallback(() => {
    sendControlMessage({ kind: "decline" });
    patch({ transferState: "idle", incomingFileMeta: null });
    announce("Declined the incoming file.");
  }, [sendControlMessage, patch, announce]);

  return {
    ...state,
    createRoom: () => createRoom(),
    joinRoom,
    selectFile,
    startTransfer,
    acceptTransfer,
    declineTransfer,
    reset,
  };
}
