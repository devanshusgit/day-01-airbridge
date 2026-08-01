export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  const precision = exponent === 0 ? 0 : 1;
  const formatted = value.toFixed(precision).replace(/\.0$/, "");
  return `${formatted} ${units[exponent]}`;
}

export function formatPercentage(transferred: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((transferred / total) * 100));
}
