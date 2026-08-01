"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Download, ExternalLink, ShieldCheck, Upload, Waypoints } from "lucide-react";
import { usePeerTransfer } from "@/hooks/use-peer-transfer";
import { ConnectionVisual } from "./connection-visual";
import { SenderPanel } from "./sender-panel";
import { ReceiverPanel } from "./receiver-panel";

type View = "hero" | "sender" | "receiver";

export function AirbridgeApp() {
  const transfer = usePeerTransfer();
  const [view, setView] = useState<View>("hero");
  const reduceMotion = useReducedMotion();
  const entranceTransition = { duration: reduceMotion ? 0 : 0.4, ease: "easeOut" as const };
  const panelTransition = { duration: reduceMotion ? 0 : 0.3, ease: "easeOut" as const };

  const handleSend = () => {
    setView("sender");
    transfer.createRoom();
  };

  const handleReceive = () => {
    setView("receiver");
  };

  const handleReset = () => {
    transfer.reset();
    setView("hero");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <span className="sr-only" role="status" aria-live="polite">
        {transfer.statusAnnouncement}
      </span>

      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Waypoints className="h-5 w-5 text-accent" aria-hidden="true" />
            <span className="text-lg font-semibold tracking-tight text-foreground">AirBridge</span>
            <span className="hidden text-sm text-muted sm:inline">Peer-to-peer file transfer</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" />
            Files never stay on our server
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {view === "hero" && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={entranceTransition}
            className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center"
          >
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                A direct bridge between two devices.
              </h1>
              <p className="mx-auto max-w-xl text-balance text-muted sm:text-lg">
                Send a file straight from one device to another over a peer-to-peer connection.
                No accounts, no permanent storage — just a room code and a bridge.
              </p>
            </div>

            <ConnectionVisual status="idle" />

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleSend}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                Send a file
              </button>
              <button
                type="button"
                onClick={handleReceive}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-accent/50 hover:text-accent"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Receive a file
              </button>
            </div>
          </motion.section>
        )}

        {view === "sender" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={panelTransition}
            className="flex flex-1 items-center justify-center px-6 py-12"
          >
            <SenderPanel transfer={transfer} onReset={handleReset} />
          </motion.div>
        )}

        {view === "receiver" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={panelTransition}
            className="flex flex-1 items-center justify-center px-6 py-12"
          >
            <ReceiverPanel transfer={transfer} onReset={handleReset} />
          </motion.div>
        )}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 py-6 text-xs text-muted sm:flex-row sm:justify-between">
          <p>Built by Devanshu</p>
          <a
            href="https://github.com/devanshusgit/day-01-airbridge"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View AirBridge on GitHub"
            className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-accent"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
