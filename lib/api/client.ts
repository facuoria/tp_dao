export async function api<T>(
  path: string,
  init?: RequestInit & { searchParams?: Record<string, string | number | boolean | undefined> }
): Promise<T> {
  const url = new URL(path, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  if (init?.searchParams) {
    Object.entries(init.searchParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(errorText || `Error ${res.status}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}
