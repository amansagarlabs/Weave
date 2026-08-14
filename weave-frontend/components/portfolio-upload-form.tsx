"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { FileDropzone } from "./file-dropzone";
import { Card } from "./ui";

type Draft = {
  id: string;
  name: string;
  fileName: string;
  size: number;
  createdAt: string;
};

export function PortfolioUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) {
        window.clearInterval(timer.current);
      }
    };
  }, []);

  function animatePreparation() {
    if (timer.current) {
      window.clearInterval(timer.current);
    }
    setBusy(true);
    setProgress(0);
    timer.current = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          if (timer.current) window.clearInterval(timer.current);
          setBusy(false);
          return 100;
        }
        return current + 20;
      });
    }, 120);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("Choose a file before saving the portfolio item.");
      return;
    }

    const current: Draft[] = JSON.parse(window.localStorage.getItem("weave_portfolio_drafts") ?? "[]");
    current.unshift({
      id: crypto.randomUUID(),
      name: name.trim() || file.name,
      fileName: file.name,
      size: file.size,
      createdAt: new Date().toISOString(),
    });
    window.localStorage.setItem("weave_portfolio_drafts", JSON.stringify(current));
    setSaved(true);
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-5">
        <FileDropzone
          accept="image/*,video/*"
          file={file}
          busy={busy}
          progress={progress}
          error={error}
          onFile={(selected, message) => {
            setFile(selected);
            setError(message ?? "");
            setSaved(false);
            if (selected) animatePreparation();
          }}
          onClear={() => {
            setFile(null);
            setError("");
            setSaved(false);
            setBusy(false);
            setProgress(0);
          }}
          onRetry={() => {
            setError("");
            setSaved(false);
          }}
        />

        <label className="block text-sm font-bold">
          Portfolio title
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Product launch story"
            className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--line)] px-4"
          />
        </label>

        {saved ? (
          <p role="status" className="text-sm font-bold text-[var(--forest)]">
            Upload metadata saved locally. Connect S3/R2 to persist the file.
          </p>
        ) : null}

        <button type="submit" className="min-h-12 rounded-full bg-[var(--forest)] px-6 font-bold text-white">
          Prepare upload →
        </button>

        <p className="text-xs leading-5 text-[var(--muted)]">
          This development flow stores file metadata only in your browser. The file is not uploaded until S3/R2 storage is configured.
        </p>
      </form>
    </Card>
  );
}
