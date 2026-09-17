// Lunorsoft — centralised API client.
// ALL browser -> backend communication flows through here so that:
//  - the base URL is configurable via NEXT_PUBLIC_API_BASE_URL
//  - auth cookies (httpOnly session) are always forwarded
//  - error shapes are normalised for UI consumption
//
// To point the frontend at a separately-hosted backend later,
// set NEXT_PUBLIC_API_BASE_URL=https://api.example.com — no component changes needed.

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  code?: string;
  fields?: Record<string, string>;

  constructor(message: string, status = 500, code?: string, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

function url(path: string): string {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${BASE_URL}${path}`;
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const res = await fetch(url(path), {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await parseBody(res);

  if (!res.ok) {
    const fallback = `Request failed (${res.status})`;
    if (data && typeof data === "object") {
      const d = data as { message?: string; error?: string; code?: string; fields?: Record<string, string> };
      throw new ApiError(d.message ?? d.error ?? fallback, res.status, d.code, d.fields);
    }
    throw new ApiError(fallback, res.status);
  }

  return data as T;
}

export const apiGet = <T,>(path: string, options?: ApiOptions) =>
  api<T>(path, { ...options, method: "GET" });
export const apiPost = <T,>(path: string, body?: unknown, options?: ApiOptions) =>
  api<T>(path, { ...options, method: "POST", body });
export const apiPatch = <T,>(path: string, body?: unknown, options?: ApiOptions) =>
  api<T>(path, { ...options, method: "PATCH", body });
export const apiDelete = <T,>(path: string, options?: ApiOptions) =>
  api<T>(path, { ...options, method: "DELETE" });
