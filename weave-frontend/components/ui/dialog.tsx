"use client";

import { type ReactNode, createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DialogContext = createContext<DialogContextValue>({ open: false, setOpen: () => {} });

function useDialog() {
  return useContext(DialogContext);
}

export function Dialog({ children, open: controlledOpen, onOpenChange }: { children: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  return <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({ children, asChild }: { children: ReactNode; asChild?: boolean }) {
  const { setOpen } = useDialog();
  if (asChild) {
    return <span onClick={() => setOpen(true)} className="cursor-pointer">{children}</span>;
  }
  return (
    <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--forest)] px-5 text-sm font-bold text-white transition-transform active:scale-[.97]">
      {children}
    </button>
  );
}

export function DialogContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { open, setOpen } = useDialog();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastActiveRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = dialogRef.current;
    const focusables = root ? getFocusable(root) : [];
    (focusables[0] ?? root)?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !root) return;
      const items = getFocusable(root);
      if (!items.length) { event.preventDefault(); root.focus(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      lastActiveRef.current?.focus();
    };
  }, [open, setOpen]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(23,34,31,.58)] px-4 py-6 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={`w-full max-w-lg rounded-3xl bg-[var(--card)] p-6 text-[var(--ink)] shadow-[0_24px_80px_rgba(23,34,31,.28)] outline-none ${className}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function DialogHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`space-y-1.5 ${className}`}>{children}</div>;
}

export function DialogTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`text-2xl font-black tracking-[-.04em] ${className}`}>{children}</h2>;
}

export function DialogDescription({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-sm leading-6 text-[var(--muted)] ${className}`}>{children}</p>;
}

export function DialogFooter({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end ${className}`}>{children}</div>;
}

function getFocusable(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((item) => !item.hasAttribute("disabled") && item.tabIndex >= 0);
}
