"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { MAX_FILE_SIZE_BYTES } from "@/lib/constants";
import { formatBytes } from "@/lib/format";

interface FileDropZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function FileDropZone({ onFileSelected, disabled }: FileDropZoneProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onFileSelected(file);
  };

  return (
    <label
      htmlFor="airbridge-file-input"
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDraggingOver(false);
        if (!disabled) handleFiles(event.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background ${
        disabled
          ? "cursor-not-allowed border-border/60 opacity-50"
          : isDraggingOver
            ? "border-accent bg-accent/10"
            : "border-border bg-surface hover:border-accent/50 hover:bg-surface-hover"
      }`}
    >
      <UploadCloud className="h-8 w-8 text-accent" aria-hidden="true" />
      <div>
        <p className="font-medium text-foreground">Drag and drop a file, or click to browse</p>
        <p className="mt-1 text-xs text-muted">One file at a time · up to {formatBytes(MAX_FILE_SIZE_BYTES)} (prototype limit)</p>
      </div>
      <input
        ref={inputRef}
        id="airbridge-file-input"
        type="file"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </label>
  );
}
