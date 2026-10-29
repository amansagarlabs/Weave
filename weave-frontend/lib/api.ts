export function getApiUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") return `http://${window.location.hostname}:8080`;
  return "http://localhost:8080";
}

function csrfToken() {
  if (typeof document === "undefined") return undefined;
  return document.cookie.split("; ").find(value => value.startsWith("weave_csrf="))?.split("=")[1];
}

export function csrfHeaders(): Record<string, string> {
  const token = csrfToken();
  return token ? { "X-Weave-CSRF": token } : {};
}

async function ensureCsrfCookie() {
  if (csrfToken()) return csrfToken();
  try {
    await fetch(`${getApiUrl()}/auth/session`, { credentials: "include" });
  } catch {
    // The protected request will report the actual backend connectivity error.
  }
  return csrfToken();
}

export async function api<T>(path: string, init?: RequestInit, retry = true): Promise<T> {
  const headers = new Headers(init?.headers);
  const method = (init?.method ?? "GET").toUpperCase();
  if (init?.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const csrf = method !== "GET" && method !== "HEAD" && !path.startsWith("/auth/login") && !path.startsWith("/auth/signup") && !path.startsWith("/auth/verify-email")
    ? await ensureCsrfCookie()
    : csrfToken();
  if (csrf && method !== "GET" && method !== "HEAD") headers.set("X-Weave-CSRF", csrf);
  let response: Response;
  try {
    response = await fetch(`${getApiUrl()}${path}`, {
      ...init,
      credentials: "include",
      headers,
    });
  } catch (error) {
    throw new Error("Weave is temporarily unavailable. Check your connection and try again.", { cause: error });
  }
  if (response.status === 401 && retry && !path.startsWith("/auth/refresh") && !path.startsWith("/auth/login") && !path.startsWith("/auth/signup")) {
    let refreshed: Response;
    try {
      refreshed = await fetch(`${getApiUrl()}/auth/refresh`, { method: "POST", credentials: "include", headers: csrfHeaders() });
    } catch (error) {
      throw new Error("Your session could not be refreshed. Please try again.", { cause: error });
    }
    if (refreshed.ok) return api<T>(path, init, false);
  }
  if (response.status === 401 && typeof window !== "undefined") {
    const next = `${window.location.pathname}${window.location.search}`;
    window.location.assign(`/login?next=${encodeURIComponent(next)}`);
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string; message?: string } | null;
    throw new Error(payload?.error ?? payload?.message ?? `Weave API error: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
