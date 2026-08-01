"use client";

import { motion, useReducedMotion } from "framer-motion";

export type VisualStatus = "idle" | "connecting" | "connected" | "transferring";

interface ConnectionVisualProps {
  status: VisualStatus;
}

const DEVICE_X = { left: 40, right: 260 };
const LINE = { x1: 78, x2: 222, y: 60 };

export function ConnectionVisual({ status }: ConnectionVisualProps) {
  const reduceMotion = useReducedMotion();
  const isActive = status === "connected" || status === "transferring";
  const isBusy = status === "connecting" || status === "transferring";

  return (
    <svg
      viewBox="0 0 300 120"
      className="w-full max-w-md"
      role="img"
      aria-label={`Connection visual: ${status.replace("-", " ")}`}
    >
      <line
        x1={LINE.x1}
        y1={LINE.y}
        x2={LINE.x2}
        y2={LINE.y}
        stroke="var(--border)"
        strokeWidth={2}
      />
      <motion.line
        x1={LINE.x1}
        y1={LINE.y}
        x2={LINE.x2}
        y2={LINE.y}
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.6, ease: "easeOut" }}
      />

      {!reduceMotion && isBusy && (
        <motion.circle
          r={4}
          fill="var(--accent)"
          initial={{ cx: LINE.x1, opacity: 0 }}
          animate={{ cx: [LINE.x1, LINE.x2, LINE.x1], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {[DEVICE_X.left, DEVICE_X.right].map((x, i) => (
        <g key={x}>
          <rect
            x={x - 22}
            y={30}
            width={44}
            height={60}
            rx={10}
            fill="var(--surface)"
            stroke={isActive ? "var(--accent)" : "var(--border)"}
            strokeWidth={2}
          />
          <rect x={x - 14} y={40} width={28} height={34} rx={2} fill="var(--surface-hover)" />
          <circle
            cx={x}
            cy={82}
            r={2.5}
            fill={isActive ? "var(--accent)" : "var(--border)"}
          />
          {isActive && !reduceMotion && (
            <motion.circle
              cx={x}
              cy={60}
              r={30}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={1}
              initial={{ opacity: 0.4, scale: 0.9 }}
              animate={{ opacity: [0.4, 0, 0.4], scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
            />
          )}
        </g>
      ))}
    </svg>
  );
}
