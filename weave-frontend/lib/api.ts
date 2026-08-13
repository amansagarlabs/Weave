const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function accessToken() {
  return typeof window === "undefined" ? undefined : window.localStorage.getItem("weave_access_token");
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(accessToken() ? { Authorization: `Bearer ${accessToken()}` } : {}), ...(init?.headers ?? {}) },
  });
  if (!response.ok) throw new Error(`Weave API error: ${response.status}`);
  return response.json() as Promise<T>;
}
