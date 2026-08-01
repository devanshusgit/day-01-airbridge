import { formatBytes } from "@/lib/format";
import type { TransferProgress as TransferProgressData } from "@/types/transfer";

interface TransferProgressProps {
  progress: TransferProgressData;
  label: string;
}

export function TransferProgress({ progress, label }: TransferProgressProps) {
  const { transferredBytes, totalBytes, percentage } = progress;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-muted">{percentage}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="relative h-2.5 w-full overflow-hidden rounded-full bg-surface-hover"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-hover to-accent transition-[width] duration-200 ease-out"
          style={{ width: `${percentage}%` }}
        >
          <div className="h-full w-full animate-pulse opacity-40" />
        </div>
      </div>
      <p className="text-xs tabular-nums text-muted">
        {formatBytes(transferredBytes)} of {formatBytes(totalBytes)}
      </p>
    </div>
  );
}
