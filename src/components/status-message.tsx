import { AlertTriangle, CheckCircle2, Loader2, Info, XCircle } from "lucide-react";

export type StatusTone = "info" | "pending" | "success" | "error";

const TONE_STYLES: Record<StatusTone, string> = {
  info: "border-border bg-surface text-foreground",
  pending: "border-accent/40 bg-accent/10 text-foreground",
  success: "border-success/40 bg-success/10 text-foreground",
  error: "border-danger/40 bg-danger/10 text-foreground",
};

const TONE_ICONS: Record<StatusTone, React.ComponentType<{ className?: string }>> = {
  info: Info,
  pending: Loader2,
  success: CheckCircle2,
  error: XCircle,
};

const TONE_ICON_COLOR: Record<StatusTone, string> = {
  info: "text-muted",
  pending: "text-accent animate-spin",
  success: "text-success",
  error: "text-danger",
};

interface StatusMessageProps {
  tone: StatusTone;
  title: string;
  description?: string;
}

export function StatusMessage({ tone, title, description }: StatusMessageProps) {
  const Icon = TONE_ICONS[tone];
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${TONE_STYLES[tone]}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 flex-none ${TONE_ICON_COLOR[tone]}`} aria-hidden="true" />
      <div>
        <p className="font-medium">{title}</p>
        {description ? <p className="mt-0.5 text-muted">{description}</p> : null}
      </div>
    </div>
  );
}

export function AlertBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-foreground"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-danger" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
