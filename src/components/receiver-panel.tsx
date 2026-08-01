"use client";

import { useState } from "react";
import { Check, Download, File as FileIcon, LogIn, RotateCcw, X } from "lucide-react";
import type { usePeerTransfer } from "@/hooks/use-peer-transfer";
import { formatBytes } from "@/lib/format";
import { sanitizeFileName } from "@/lib/file-transfer";
import { ConnectionVisual } from "./connection-visual";
import { TransferProgress } from "./transfer-progress";
import { StatusMessage } from "./status-message";

type Transfer = ReturnType<typeof usePeerTransfer>;

const NOT_CONNECTED_STATES = new Set(["idle", "joining-room", "invalid-room-code", "connection-failed"]);

export function ReceiverPanel({ transfer, onReset }: { transfer: Transfer; onReset: () => void }) {
  const { connectionState, transferState, incomingFileMeta, progress, downloadUrl, errorMessage } = transfer;
  const [codeInput, setCodeInput] = useState("");

  const showJoinForm = NOT_CONNECTED_STATES.has(connectionState);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-2xl border border-border bg-surface/60 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Receive a file</h3>
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
              : connectionState === "joining-room"
                ? "connecting"
                : "idle"
          }
        />
      </div>

      {showJoinForm && (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            transfer.joinRoom(codeInput);
          }}
        >
          <div className="space-y-2">
            <label htmlFor="room-code-input" className="block text-sm font-medium text-foreground">
              Room code
            </label>
            <input
              id="room-code-input"
              name="room-code"
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={codeInput}
              onChange={(event) => setCodeInput(event.target.value)}
              placeholder="e.g. K7QX2M"
              className="w-full rounded-lg border border-border bg-surface-hover px-4 py-3 font-mono text-lg tracking-[0.2em] text-foreground placeholder:text-muted/60 focus:border-accent"
            />
          </div>

          {connectionState === "invalid-room-code" && (
            <StatusMessage tone="error" title="Invalid room code" description={errorMessage ?? undefined} />
          )}
          {connectionState === "connection-failed" && (
            <StatusMessage tone="error" title="Connection failed" description={errorMessage ?? undefined} />
          )}
          {connectionState === "joining-room" && <StatusMessage tone="pending" title="Connecting…" />}

          <button
            type="submit"
            disabled={connectionState === "joining-room" || codeInput.trim().length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Join room
          </button>
        </form>
      )}

      {connectionState === "peer-disconnected" && (
        <StatusMessage
          tone="error"
          title="The other device disconnected"
          description="Start over to join a new room."
        />
      )}

      {connectionState === "connected" && (
        <div className="space-y-5">
          <StatusMessage tone="success" title="Connected to sender" />

          {transferState === "idle" && (
            <StatusMessage tone="info" title="Waiting for the sender to choose a file" />
          )}

          {transferState === "failed" && (
            <StatusMessage tone="error" title="Transfer failed" description={errorMessage ?? undefined} />
          )}

          {transferState === "awaiting-approval" && incomingFileMeta && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-hover px-4 py-3">
                <FileIcon className="h-5 w-5 flex-none text-accent" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{incomingFileMeta.name}</p>
                  <p className="text-xs text-muted">
                    {formatBytes(incomingFileMeta.size)} · {incomingFileMeta.type || "unknown type"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={transfer.acceptTransfer}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Accept
                </button>
                <button
                  type="button"
                  onClick={transfer.declineTransfer}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-danger/50 hover:text-danger"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Decline
                </button>
              </div>
            </div>
          )}

          {transferState === "transferring" && incomingFileMeta && (
            <TransferProgress progress={progress} label={`Receiving ${incomingFileMeta.name}`} />
          )}

          {transferState === "completed" && downloadUrl && incomingFileMeta && (
            <div className="space-y-4">
              <StatusMessage tone="success" title="Transfer complete" description="Your file is ready to download." />
              <a
                href={downloadUrl}
                download={sanitizeFileName(incomingFileMeta.name)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download {incomingFileMeta.name}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
