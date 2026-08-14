"use client";

import { useEffect, useState } from "react";

export type PublicRole = "creator" | "brand" | "editor" | "admin";

export type PublicSession = {
  ready: boolean;
  token: string | null;
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
  window.localStorage.removeItem("weave_access_token");
  window.localStorage.removeItem("weave_role");
}

export function usePublicSession() {
  const [session, setSession] = useState<PublicSession>({ ready: false, token: null, role: null });

  useEffect(() => {
    const token = window.localStorage.getItem("weave_access_token");
    const value = window.localStorage.getItem("weave_role");
    const role = value === "creator" || value === "brand" || value === "editor" || value === "admin" ? value : null;
    setSession({ ready: true, token, role });
  }, []);

  return session;
}
