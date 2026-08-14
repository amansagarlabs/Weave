"use client";

import { DragEvent, KeyboardEvent, useId, useRef, useState } from "react";
import { ArrowUp, File, RotateCcw, X } from "lucide-react";

export function FileDropzone({
  accept,
  maxBytes = 100 * 1024 * 1024,
  file,
  busy = false,
  progress = 0,
  error = "",
  onFile,
  onClear,
  onRetry,
}: {
  accept?: string;
  maxBytes?: number;
  file: File | null;
  busy?: boolean;
  progress?: number;
  error?: string;
  onFile: (file: File | null, error?: string) => void;
  onClear?: () => void;
  onRetry?: () => void;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function validate(file: File | undefined) {
    if (!file) {
      onFile(null);
      return;
    }
    if (file.size > maxBytes) {
      onFile(null, `Choose a file smaller than ${Math.round(maxBytes / 1024 / 1024)}MB.`);
      return;
    }
    onFile(file);
  }

  function openPicker() {
    inputRef.current?.click();
  }

  function handleKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openPicker();
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    validate(event.dataTransfer.files[0]);
  }

  const progressValue = Math.max(0, Math.min(100, progress));

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        aria-describedby={`${id}-description`}
        aria-label="Upload file"
        onClick={openPicker}
        onKeyDown={handleKeyboard}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`group block rounded-2xl border-2 border-dashed p-6 text-center outline-none transition-colors focus-visible:ring-4 focus-visible:ring-[var(--accent)] ${
          dragging ? "border-[var(--forest)] bg-[var(--accent)]" : "border-[var(--line)] bg-white hover:border-[var(--forest)]"
        }`}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--paper)] text-[var(--forest)]">
          <ArrowUp size={22} aria-hidden="true" />
        </div>
        <strong className="mt-4 block text-base font-black">Drop a file here or browse</strong>
        <p id={`${id}-description`} className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Images and videos up to {Math.round(maxBytes / 1024 / 1024)}MB
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 text-sm font-bold">
            <File size={16} aria-hidden="true" />
            {file ? file.name : "No file selected"}
          </span>
          <span className="inline-flex min-h-11 items-center rounded-full bg-[var(--forest)] px-4 text-sm font-bold text-white">
            {busy ? "Preparing…" : "Choose file"}
          </span>
        </div>

        {busy ? (
          <div className="mt-5">
            <div className="h-2 rounded-full bg-[var(--paper)]">
              <div className="h-2 rounded-full bg-[var(--forest)] transition-all" style={{ width: `${progressValue}%` }} />
            </div>
            <p className="mt-2 text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">{progressValue}% ready</p>
          </div>
        ) : null}
      </div>

      {(file || error) && !busy ? (
        <div className="flex flex-wrap items-center gap-3">
          {file ? (
            <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--accent)] px-4 text-sm font-bold">
              {file.name}
              <button type="button" onClick={onClear} className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--paper)]" aria-label="Clear selected file">
                <X size={14} aria-hidden="true" />
              </button>
            </span>
          ) : null}
          {error ? <span className="text-sm font-bold text-[var(--danger)]">{error}</span> : null}
          {error ? (
            <button
              type="button"
              onClick={() => {
                onRetry?.();
                openPicker();
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-bold"
            >
              <RotateCcw size={16} aria-hidden="true" />
              Retry
            </button>
          ) : null}
        </div>
      ) : null}

      <input ref={inputRef} id={id} type="file" accept={accept} onChange={(event) => validate(event.target.files?.[0])} className="sr-only" />
    </div>
  );
}
