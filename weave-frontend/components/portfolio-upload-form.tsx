"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FileDropzone } from "./file-dropzone";
import { Card } from "./ui";
import { api } from "../lib/api";
import { useAppToast } from "./hooks/use-app-toast";

export function PortfolioUploadForm() {
  const router = useRouter();
  const { success, error: notifyError } = useAppToast();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!file) {
      setError("Choose a file before uploading the portfolio item.");
      return;
    }
    setBusy(true);
    setProgress(20);
    try {
      const body = new FormData();
      body.append("title", name.trim() || file.name);
      body.append("file", file);
      await api("/creator/portfolio/upload", { method: "POST", body });
      setProgress(100);
      setSaved(true);
      success("Portfolio work uploaded", "Your new work is now visible on your portfolio.");
      router.push("/creator/portfolio");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not upload portfolio work.";
      notifyError("Upload failed", message);
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  return <Card>
    <form onSubmit={submit} className="space-y-5">
      <FileDropzone accept="image/*,video/*" file={file} busy={busy} progress={progress} error={error}
        onFile={(selected, message) => { setFile(selected); setError(message ?? ""); setSaved(false); }}
        onClear={() => { setFile(null); setError(""); setSaved(false); setProgress(0); }}
        onRetry={() => { setError(""); setSaved(false); }} />
      <label className="block text-sm font-bold">Portfolio title
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Product launch story" className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--line)] px-4" />
      </label>
      {saved ? <p role="status" className="text-sm font-bold text-[var(--forest)]">Portfolio work uploaded to local Docker storage.</p> : null}
      <button type="submit" disabled={busy} className="min-h-12 rounded-full bg-[var(--forest)] px-6 font-bold text-white disabled:opacity-60">{busy ? "Uploading..." : "Upload work"}</button>
      <p className="text-xs leading-5 text-[var(--muted)]">Local Docker uses the MinIO S3-compatible bucket. Production can use the same API with S3, R2, or Cloudinary configuration.</p>
    </form>
  </Card>;
}
