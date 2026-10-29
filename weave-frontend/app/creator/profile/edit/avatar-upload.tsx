"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check, Loader2, X } from "lucide-react";
import { api } from "../../../../lib/api";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export function AvatarUpload({
  avatarUrl,
  onUpload,
  onRemove,
}: {
  avatarUrl: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [justUploaded, setJustUploaded] = useState(false);

  function pick() {
    inputRef.current?.click();
  }

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setError("");
    if (!ACCEPTED.includes(selected.type)) {
      setError("Please select a JPEG, PNG, or WebP image.");
      return;
    }
    if (selected.size > MAX_BYTES) {
      setError("Image must be under 5MB.");
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setZoom(1);
  }

  async function upload() {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("title", "Profile photo");
      const tick = setInterval(() => setProgress((p) => Math.min(p + 10, 90)), 200);
      const result = await api<{ url: string }>("/creator/profile/avatar", { method: "POST", body: form });
      clearInterval(tick);
      setProgress(100);
      if (result?.url) {
        onUpload(result.url);
        setJustUploaded(true);
      }
      setFile(null);
      setPreviewUrl(null);
      setZoom(1);
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : "";
      setError(msg.includes("404") || msg.includes("Not Found") ? "Photo upload is coming soon." : msg || "Could not upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function remove() {
    setFile(null);
    setPreviewUrl(null);
    setZoom(1);
    setError("");
    setJustUploaded(false);
    onRemove();
  }

  function cancelEdit() {
    setFile(null);
    setPreviewUrl(null);
    setZoom(1);
    setJustUploaded(false);
    setError("");
  }

  const src = previewUrl || avatarUrl;

  useEffect(() => {
    if (justUploaded && avatarUrl) {
      setPreviewUrl(null);
      setJustUploaded(false);
    }
  }, [avatarUrl, justUploaded]);

  return (
    <div className="flex flex-wrap items-start gap-6">
      <div className="h-[120px] w-[120px] shrink-0 overflow-hidden rounded-full border-2 border-dashed border-[var(--line)] bg-[var(--paper)]">
        {src ? (
          <img src={src} alt="Profile photo" className="h-full w-full object-cover" style={{ transform: `scale(${zoom})` }} />
        ) : (
          <button type="button" onClick={pick} className="flex h-full w-full items-center justify-center text-[var(--muted)] transition-colors hover:text-[var(--forest)]" aria-label="Upload profile photo">
            <Camera size={28} />
          </button>
        )}
      </div>

      <div className="min-w-[200px] flex-1 space-y-3">
        {previewUrl && (
          <label htmlFor="avatar-zoom" className="block text-xs font-bold text-[var(--muted)]">
            Zoom
            <input id="avatar-zoom" type="range" min="1" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="mt-1 w-full" />
          </label>
        )}

        <div className="flex flex-wrap gap-2">
          {!previewUrl && !avatarUrl && (
            <button type="button" onClick={pick} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--accent)] px-4 text-sm font-bold text-[var(--on-bright)] transition-transform active:scale-[.97]">
              <Camera size={16} /> Upload photo
            </button>
          )}
          {previewUrl && (
            <>
              <button type="button" onClick={upload} disabled={uploading} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--forest)] px-4 text-sm font-bold text-white disabled:opacity-60">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {uploading ? `Uploading… ${progress}%` : "Confirm & upload"}
              </button>
              <button type="button" onClick={cancelEdit} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--card)] px-4 text-sm font-bold transition-transform active:scale-[.97]">
                <X size={14} /> Cancel
              </button>
            </>
          )}
          {!previewUrl && avatarUrl && (
            <>
              <button type="button" onClick={pick} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--card)] px-4 text-sm font-bold transition-transform active:scale-[.97]">
                <Camera size={14} /> Change photo
              </button>
              <button type="button" onClick={remove} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--card)] px-4 text-sm font-bold text-[var(--muted)] transition-transform active:scale-[.97]">
                <X size={14} /> Remove photo
              </button>
            </>
          )}
        </div>

        {error && <p role="alert" className="text-sm font-bold text-[var(--danger)]">{error}</p>}
        {!previewUrl && <p className="text-xs text-[var(--muted)]">JPEG, PNG, or WebP. Max 5MB.</p>}
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="sr-only" />
    </div>
  );
}
