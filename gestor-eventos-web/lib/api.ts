const API = process.env.NEXT_PUBLIC_API_URL;

function requireApiUrl() {
  if (!API) {
    throw new Error("NEXT_PUBLIC_API_URL no está definido (.env.local)");
  }
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

export async function apiGet<T>(path: string): Promise<T> {
  requireApiUrl();
  const res = await fetch(`${API}${path}`, { cache: "no-store" });
  return handleResponse<T>(res, "GET", path);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  requireApiUrl();
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res, "POST", path);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  requireApiUrl();
  const res = await fetch(`${API}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res, "PATCH", path);
}

export async function apiDelete<T>(path: string): Promise<T> {
  requireApiUrl();
  const res = await fetch(`${API}${path}`, { method: "DELETE" });
  return handleResponse<T>(res, "DELETE", path);
}