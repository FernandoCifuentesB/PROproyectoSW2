const API = process.env.NEXT_PUBLIC_API_URL;

export async function apiGet<T>(path: string): Promise<T> {
  if (!API) throw new Error("NEXT_PUBLIC_API_URL no está definido (.env.local)");
  const res = await fetch(`${API}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  if (!API) throw new Error("NEXT_PUBLIC_API_URL no está definido (.env.local)");

  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`POST ${path} -> ${res.status} | ${text}`);
  }

  return text ? (JSON.parse(text) as T) : ({} as T);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  if (!API) throw new Error("NEXT_PUBLIC_API_URL no está definido (.env.local)");
  const res = await fetch(`${API}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path} -> ${res.status}`);
  return res.json();
}

export async function apiDelete<T>(path: string): Promise<T> {
  if (!API) throw new Error("NEXT_PUBLIC_API_URL no está definido (.env.local)");
  const res = await fetch(`${API}${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`DELETE ${path} -> ${res.status}`);
  return res.json();
}
