const RAW_API = process.env.NEXT_PUBLIC_API_URL;

function normalizeBaseUrl(url: string) {
  // Quita espacios y slash final
  return url.trim().replace(/\/+$/, "");
}

function requireApiUrl() {
  if (!RAW_API) {
    throw new Error("NEXT_PUBLIC_API_URL no está definido (.env.local)");
  }
  return normalizeBaseUrl(RAW_API);
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function parseBody(res: Response) {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function stringifyErrorBody(body: unknown) {
  if (!body) return "";

  // Si el backend manda { message, error, statusCode }
  if (typeof body === "object" && body !== null) {
    const anyBody = body as any;
    const msg =
      (Array.isArray(anyBody.message) ? anyBody.message.join(", ") : anyBody.message) ||
      anyBody.error ||
      anyBody.detail;

    if (msg) return String(msg);

    try {
      return JSON.stringify(body);
    } catch {
      return String(body);
    }
  }

  if (typeof body === "string") return body;

  try {
    return JSON.stringify(body);
  } catch {
    return String(body);
  }
}

async function handleResponse<T>(res: Response, method: string, path: string): Promise<T> {
  const body = await parseBody(res);

  if (!res.ok) {
    const detail = stringifyErrorBody(body);
    throw new Error(`${method} ${path} -> ${res.status}${detail ? ` | ${detail}` : ""}`);
  }

  return (body ?? ({} as T)) as T;
}

// Opcional: timeout por defecto 20s
function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit, timeoutMs = 20000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(t));
}

export async function apiGet<T>(path: string): Promise<T> {
  const API = requireApiUrl();

  const res = await fetchWithTimeout(`${API}${path}`, {
    cache: "no-store",
    headers: {
      ...getAuthHeaders(),
    },
  });

  return handleResponse<T>(res, "GET", path);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const API = requireApiUrl();

  const res = await fetchWithTimeout(`${API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return handleResponse<T>(res, "POST", path);
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const API = requireApiUrl();

  const res = await fetchWithTimeout(`${API}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return handleResponse<T>(res, "PATCH", path);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const API = requireApiUrl();

  const res = await fetchWithTimeout(`${API}${path}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  return handleResponse<T>(res, "DELETE", path);
}