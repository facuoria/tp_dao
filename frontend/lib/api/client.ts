// frontend/lib/api/client.ts
const USE_MSW = process.env.NEXT_PUBLIC_USE_MSW === '1';
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, ''); // sin "/" final

type ApiOptions = {
  method?: string;
  body?: BodyInit | null;
  headers?: HeadersInit;
  searchParams?: Record<string, unknown>;
  cache?: RequestCache;
};

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  // Si usamos MSW, la request queda relativa a :3000; si no, va a :8000 (o lo que tengas en .env)
  const base = USE_MSW ? window.location.origin : API_BASE || window.location.origin;
  const url = new URL(path, base);

  // Agregar ?query=string solo si tienen valor
  if (opts.searchParams) {
    Object.entries(opts.searchParams)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }

  const res = await fetch(url.toString(), {
    method: opts.method ?? 'GET',
    headers: {
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
      ...opts.headers,
    },
    body: opts.body ?? null,
    cache: opts.cache ?? 'no-store',
    // credentials: 'include', // <- si algún día necesitás cookies/sesión
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}
