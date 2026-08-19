"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      closeButton
      expand={false}
      toastOptions={{
        duration: 4200,
        classNames: {
          toast: "group toast border border-[var(--line)] bg-[var(--card)] text-[var(--ink)] shadow-[6px_6px_0_var(--ink)]",
          title: "font-black tracking-[-.02em]",
          description: "text-sm font-medium text-[var(--muted)]",
          actionButton: "!rounded-full !bg-[var(--forest)] !font-bold !text-white",
          cancelButton: "!rounded-full !bg-[var(--paper)] !font-bold !text-[var(--ink)]",
          closeButton: "!border-[var(--line)] !bg-[var(--paper)] !text-[var(--ink)]",
          success: "!border-[var(--forest)]",
          error: "!border-[var(--orange)]",
        },
      }}
    />
  );
}
