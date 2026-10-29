"use client";

import { useState } from "react";
import { FileDropzone } from "./file-dropzone";
import { Card } from "./ui";

export function AssetUploadState({ kind }: { kind: "preview" | "final" }) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  return (
    <Card>
      <h2 className="text-xl font-black">Prepare {kind} asset</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Select the file metadata now. Actual storage upload will be connected to S3/R2 after credentials are configured.
      </p>
      <div className="mt-5">
        <FileDropzone
          accept="video/*,image/*"
          file={file}
          onFile={(selected, error) => {
            setFile(selected);
            setMessage(error ?? (selected ? `${selected.name} is ready for upload metadata.` : ""));
          }}
          onClear={() => {
            setFile(null);
            setMessage("");
          }}
          onRetry={() => setMessage("")}
        />
      </div>
      {message ? (
        <p role="status" className="mt-4 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-bold text-[var(--on-bright)]">
          {message}
        </p>
      ) : null}
      {file ? (
        <p className="mt-3 text-xs text-[var(--muted)]">
          {Math.ceil(file.size / 1024)}KB · {file.type || "Unknown type"}
        </p>
      ) : null}
    </Card>
  );
}
