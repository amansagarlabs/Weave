"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Loader2 } from "lucide-react";

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
    <Dialog open={open} onOpenChange={busy ? undefined : onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-[var(--ink)] bg-[var(--card)] px-5 py-3 text-sm font-bold text-[var(--ink)] transition-transform active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-transform active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-50 ${
              tone === "danger"
                ? "bg-[var(--danger)] text-white shadow-[4px_4px_0_var(--ink)]"
                : "bg-[var(--accent)] text-[var(--on-bright)] shadow-[4px_4px_0_var(--ink)]"
            }`}
          >
            {busy ? <><Loader2 size={14} className="animate-spin" /> Working…</> : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
