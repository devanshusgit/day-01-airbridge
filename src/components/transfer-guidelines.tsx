import { Info } from "lucide-react";

export function TransferGuidelines() {
  return (
    <p className="flex items-start gap-2 text-xs text-muted">
      <Info className="mt-0.5 h-3.5 w-3.5 flex-none text-muted" aria-hidden="true" />
      Keep both tabs open until the transfer finishes — transfer speed depends on both devices and networks.
    </p>
  );
}
