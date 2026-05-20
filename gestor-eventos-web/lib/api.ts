const RAW_API = process.env.NEXT_PUBLIC_API_URL;

function normalizeBaseUrl(url: string) {
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

function isHtmlResponse(text: string) {
  const normalized = text.trim().toLowerCase();

  return (
    normalized.startsWith("<!doctype html") ||
    normalized.startsWith("<html") ||
    normalized.includes("<script") ||
    normalized.includes("__next_f.push")
  );
}

async function parseBody(res: Response) {
  const text = await res.text();

  if (!text) return null;

  if (isHtmlResponse(text)) {
    return {
      __htmlError: true,
      message:
        "La API respondió HTML en vez de JSON. Revisa que NEXT_PUBLIC_API_URL apunte al backend correcto y que la ruta exista.",
      status: res.status,
      contentType: res.headers.get("content-type"),
    };
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function stringifyErrorBody(body: unknown) {
  if (!body) return "";

  if (typeof body === "object" && body !== null) {
    const anyBody = body as Record<string, unknown>;

    if (anyBody.__htmlError === true) {
      return String(
        anyBody.message ||
          "La API respondió HTML en vez de JSON. Revisa la URL del backend.",
      );
    }

    const msg =
      (Array.isArray(anyBody.message)
        ? anyBody.message.join(", ")
        : typeof anyBody.message === "string"
          ? anyBody.message
          : undefined) ||
      (typeof anyBody.reason === "string" ? anyBody.reason : undefined) ||
      (typeof anyBody.error === "string" ? anyBody.error : undefined) ||
      (typeof anyBody.detail === "string" ? anyBody.detail : undefined);

    if (msg) return String(msg);

    try {
      return JSON.stringify(body);
    } catch {
      return String(body);
    }
  }

  if (typeof body === "string") {
    if (isHtmlResponse(body)) {
      return "La API respondió HTML en vez de JSON. Revisa NEXT_PUBLIC_API_URL y la ruta del backend.";
    }

    return body;
  }

  try {
    return JSON.stringify(body);
  } catch {
    return String(body);
  }
}

async function handleResponse<T>(
  res: Response,
  method: string,
  path: string,
): Promise<T> {
  const body = await parseBody(res);

  if (!res.ok) {
    const detail = stringifyErrorBody(body);

    throw new Error(
      `${method} ${path} -> ${res.status}${detail ? ` | ${detail}` : ""}`,
    );
  }

  if (
    typeof body === "object" &&
    body !== null &&
    "__htmlError" in body
  ) {
    throw new Error(
      `${method} ${path} -> La API respondió HTML en vez de JSON. Revisa NEXT_PUBLIC_API_URL y confirma que el backend de eventos esté corriendo.`,
    );
  }

  return (body ?? ({} as T)) as T;
}

function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = 20000,
) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(input, {
    ...init,
    signal: controller.signal,
  }).finally(() => clearTimeout(t));
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

export async function apiPostForm<T>(
  path: string,
  body: FormData,
): Promise<T> {
  const API = requireApiUrl();

  const res = await fetchWithTimeout(`${API}${path}`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
    body,
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

export async function apiPatchForm<T>(
  path: string,
  body: FormData,
): Promise<T> {
  const API = requireApiUrl();

  const res = await fetchWithTimeout(`${API}${path}`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
    },
    body,
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

export function resolveApiAssetUrl(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const API = requireApiUrl();
  return `${API}${path.startsWith("/") ? path : `/${path}`}`;
}