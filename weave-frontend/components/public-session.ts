"use client";

import { useEffect, useState } from "react";
import { csrfHeaders } from "../lib/api";

export type PublicRole = "creator" | "brand" | "editor" | "admin";

export type PublicSession = {
  ready: boolean;
  authenticated: boolean;
  role: PublicRole | null;
};

let cachedPublicSession: PublicSession | null = null;
let cachedPublicSessionPromise: Promise<PublicSession> | null = null;

export function setPublicSession(session: PublicSession) {
  cachedPublicSession = session;
  cachedPublicSessionPromise = null;
}

async function loadPublicSession() {
  if (cachedPublicSession) return cachedPublicSession;
  if (!cachedPublicSessionPromise) {
    cachedPublicSessionPromise = fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/auth/session`, { credentials: "include" })
      .then(async response => {
        if (!response.ok) return { ready: true, authenticated: false, role: null } as PublicSession;
        const user = await response.json();
        const value = String(user?.user?.role ?? "").toLowerCase();
        const role: PublicRole | null = value === "creator" || value === "brand" || value === "editor" || value === "admin" ? value as PublicRole : null;
        return { ready: true, authenticated: Boolean(role), role };
      })
      .catch(() => ({ ready: true, authenticated: false, role: null } as PublicSession))
      .then((session) => {
        cachedPublicSession = session;
        return session;
      })
      .finally(() => {
        cachedPublicSessionPromise = null;
      });
  }
  return cachedPublicSessionPromise;
}

export function dashboardHrefForRole(role: PublicRole | null) {
  if (role === "creator") return "/creator/dashboard";
  if (role === "brand") return "/brand/dashboard";
  if (role === "editor") return "/editor/dashboard";
  if (role === "admin") return "/admin/users";
  return "/login";
}

export function clearPublicSession() {
  setPublicSession({ ready: true, authenticated: false, role: null });
  void fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/auth/logout`, { method: "POST", credentials: "include", headers: csrfHeaders() });
}

export function usePublicSession() {
  const [session, setSession] = useState<PublicSession>(cachedPublicSession ?? { ready: false, authenticated: false, role: null });

  useEffect(() => {
    if (cachedPublicSession) {
      setSession(cachedPublicSession);
      return;
    }
    void loadPublicSession().then((value) => setSession(value));
  }, []);

  return session;
}
