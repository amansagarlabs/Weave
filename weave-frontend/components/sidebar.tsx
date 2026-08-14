"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type SidebarContextValue = {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  toggleCollapsed: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);
const STORAGE_KEY = "weave_sidebar_collapsed";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === "true") {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const value = useMemo<SidebarContextValue>(
    () => ({
      collapsed,
      setCollapsed,
      toggleCollapsed: () => setCollapsed((current) => !current),
    }),
    [collapsed],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used inside SidebarProvider");
  }
  return context;
}

export function SidebarInset({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { collapsed } = useSidebar();

  return <div className={`min-h-screen transition-[padding] duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-72"} ${className}`}>{children}</div>;
}

export function SidebarTrigger({ className = "" }: { className?: string }) {
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <button
      type="button"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-pressed={collapsed}
      onClick={toggleCollapsed}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--ink)] shadow-[2px_2px_0_var(--ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0 ${className}`}
    >
      {collapsed ? <PanelLeftOpen size={18} aria-hidden="true" /> : <PanelLeftClose size={18} aria-hidden="true" />}
    </button>
  );
}

export function SidebarExpandHandle({ className = "" }: { className?: string }) {
  const { collapsed, toggleCollapsed } = useSidebar();

  if (!collapsed) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="Expand sidebar"
      onClick={toggleCollapsed}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white text-[var(--forest)] shadow-[0_6px_16px_rgba(23,34,31,.22)] transition-all duration-200 hover:bg-[var(--paper)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${className}`}
    >
      <PanelLeftOpen size={18} aria-hidden="true" />
    </button>
  );
}
