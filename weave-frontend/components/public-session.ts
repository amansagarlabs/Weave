"use client";

import { useEffect, useState } from "react";
import { csrfHeaders } from "../lib/api";

export type PublicRole = "creator" | "brand" | "editor" | "admin";

export type PublicSession = {
  ready: boolean;
  authenticated: boolean;
  role: PublicRole | null;
};

export function dashboardHrefForRole(role: PublicRole | null) {
  if (role === "creator") return "/creator/dashboard";
  if (role === "brand") return "/brand/dashboard";
  if (role === "editor") return "/editor/dashboard";
  if (role === "admin") return "/admin/users";
  return "/login";
}

export function clearPublicSession() {
  void fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/auth/logout`, { method: "POST", credentials: "include", headers: csrfHeaders() });
}

export function usePublicSession() {
  const [session, setSession] = useState<PublicSession>({ ready: false, authenticated: false, role: null });

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/auth/session`, { credentials: "include" })
      .then(async response => response.ok ? response.json() : null)
      .then(user => { const value = String(user?.user?.role ?? "").toLowerCase(); const role = value === "creator" || value === "brand" || value === "editor" || value === "admin" ? value : null; setSession({ ready: true, authenticated: Boolean(role), role }); })
      .catch(() => setSession({ ready: true, authenticated: false, role: null }));
  }, []);

  return session;
}
