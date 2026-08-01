import { FileMeta } from "@/types/transfer";

/** Strips path separators and control characters so a received name is safe to use in a download. */
export function sanitizeFileName(name: string): string {
  const stripped = name
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/[\x00-\x1f]/g, "")
    .trim();
  const fallback = "downloaded-file";
  const safe = stripped.length > 0 ? stripped : fallback;
  return safe.length > 255 ? safe.slice(0, 255) : safe;
}

export function isValidFileMeta(value: unknown): value is FileMeta {
  if (!value || typeof value !== "object") return false;
  const meta = value as Record<string, unknown>;
  return (
    typeof meta.name === "string" &&
    typeof meta.size === "number" &&
    Number.isFinite(meta.size) &&
    meta.size >= 0 &&
    typeof meta.type === "string"
  );
}

/** Yields sequential ArrayBuffer chunks for a File, in order, at the given chunk size. */
export async function* chunkFile(file: File, chunkSize: number): AsyncGenerator<ArrayBuffer> {
  let offset = 0;
  while (offset < file.size) {
    const slice = file.slice(offset, offset + chunkSize);
    yield await slice.arrayBuffer();
    offset += chunkSize;
  }
}
