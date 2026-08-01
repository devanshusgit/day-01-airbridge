"use client";

import { File as FileIcon, RotateCcw, Send } from "lucide-react";
import type { usePeerTransfer } from "@/hooks/use-peer-transfer";
import { formatBytes } from "@/lib/format";
import { ConnectionVisual } from "./connection-visual";
import { RoomCode } from "./room-code";
import { FileDropZone } from "./file-drop-zone";
import { TransferProgress } from "./transfer-progress";
import { StatusMessage } from "./status-message";

type Transfer = ReturnType<typeof usePeerTransfer>;

export function SenderPanel({ transfer, onReset }: { transfer: Transfer; onReset: () => void }) {
  const { connectionState, transferState, roomCode, selectedFile, progress, errorMessage } = transfer;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-2xl border border-border bg-surface/60 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Send a file</h3>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/50 hover:text-accent"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Start over
        </button>
      </div>

      <div className="flex justify-center">
        <ConnectionVisual
          status={
            connectionState === "connected"
              ? "connected"
              : connectionState === "waiting-for-peer" || connectionState === "creating-room"
                ? "connecting"
                : "idle"
          }
        />
      </div>

      {connectionState === "creating-room" && (
        <StatusMessage tone="pending" title="Creating your room…" />
      )}

      {connectionState === "waiting-for-peer" && roomCode && (
        <div className="space-y-4">
          <RoomCode code={roomCode} />
          <StatusMessage
            tone="pending"
            title="Waiting for the other device to connect"
            description="Share the code above with the receiver."
          />
        </div>
      )}

      {connectionState === "connection-failed" && (
        <StatusMessage tone="error" title="Couldn't create a room" description={errorMessage ?? undefined} />
      )}

      {connectionState === "peer-disconnected" && (
        <StatusMessage
          tone="error"
          title="The other device disconnected"
          description="Start over to generate a new room code."
        />
      )}

      {connectionState === "connected" && (
        <div className="space-y-5">
            <StatusMessage tone="success" title="Device connected" />

          {(transferState === "idle" ||
            transferState === "file-selected" ||
            transferState === "declined" ||
            transferState === "failed") && (
            <div className="space-y-4">
              {transferState === "declined" && (
                <StatusMessage tone="error" title="Receiver declined the file" description="Pick another file or try sending it again." />
              )}
              {transferState === "failed" && (
                <StatusMessage tone="error" title="Transfer failed" description={errorMessage ?? undefined} />
              )}

              <FileDropZone onFileSelected={transfer.selectFile} />

              {selectedFile && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-hover px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileIcon className="h-5 w-5 flex-none text-accent" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-xs text-muted">
                        {formatBytes(selectedFile.size)} · {selectedFile.type || "unknown type"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={transfer.startTransfer}
                    className="inline-flex flex-none items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                    Send
                  </button>
                </div>
              )}
            </div>
          )}

          {transferState === "awaiting-approval" && (
            <StatusMessage tone="pending" title="Waiting for the receiver to accept…" />
          )}

          {transferState === "transferring" && (
            <TransferProgress progress={progress} label={`Sending ${selectedFile?.name ?? "file"}`} />
          )}

          {transferState === "completed" && (
            <div className="space-y-4">
              <StatusMessage tone="success" title="Transfer complete" description={`${selectedFile?.name} was sent successfully.`} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
