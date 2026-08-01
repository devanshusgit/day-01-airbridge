"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface RoomCodeProps {
  code: string;
}

export function RoomCode({ code }: RoomCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface p-6 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">Room code</p>
      <p className="font-mono text-4xl font-semibold tracking-[0.3em] text-accent sm:text-5xl">
        {code}
      </p>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-hover px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent/50 hover:text-accent"
      >
        {copied ? (
          <Check className="h-4 w-4 text-success" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4" aria-hidden="true" />
        )}
        {copied ? "Copied" : "Copy code"}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Room code copied to clipboard" : ""}
      </span>
    </div>
  );
}
