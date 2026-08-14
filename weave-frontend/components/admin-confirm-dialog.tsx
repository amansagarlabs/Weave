"use client";

import { Modal } from "./modal";

type AdminConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  busy?: boolean;
  tone?: "danger" | "default";
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  busy = false,
  tone = "danger",
  onClose,
  onConfirm,
}: AdminConfirmDialogProps) {
  return (
    <Modal open={open} title={title} description={description} onClose={busy ? () => undefined : onClose}>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-[var(--ink)] bg-white px-5 py-3 text-sm font-bold transition-transform active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-sm font-bold transition-transform active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-50 ${
            tone === "danger"
              ? "bg-[var(--danger)] text-white shadow-[4px_4px_0_var(--ink)]"
              : "bg-[var(--accent)] text-[var(--ink)] shadow-[4px_4px_0_var(--ink)]"
          }`}
        >
          {busy ? "Working..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
