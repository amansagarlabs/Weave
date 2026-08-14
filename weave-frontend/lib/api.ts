const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function accessToken() {
  return typeof window === "undefined" ? undefined : window.localStorage.getItem("weave_access_token");
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(accessToken() ? { Authorization: `Bearer ${accessToken()}` } : {}), ...(init?.headers ?? {}) },
  });
  if (response.status === 401 && typeof window !== "undefined") {
    window.localStorage.removeItem("weave_access_token");
    window.localStorage.removeItem("weave_role");
    const next = `${window.location.pathname}${window.location.search}`;
    window.location.assign(`/login?next=${encodeURIComponent(next)}`);
  }
  if (!response.ok) throw new Error(`Weave API error: ${response.status}`);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
