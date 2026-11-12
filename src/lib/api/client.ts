const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

/** With no backend URL configured, requests are served by the in-browser mock in ./mock. */
export const USE_MOCK = BASE_URL === "";

const TOKEN_KEY = "community_hub_token";
export const AUTH_EXPIRED_EVENT = "community-hub:auth-expired";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

type Query = Record<string, string | number | boolean | null | undefined>;

export interface RequestOptions {
  query?: Query;
  body?: unknown;
  form?: FormData;
  /** Return the raw Blob instead of parsing JSON (file downloads). */
  blob?: boolean;
}

export type Method = "GET" | "POST" | "PUT" | "DELETE";

function buildQuery(query?: Query): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function errorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "detail" in payload) {
    const detail = (payload as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d) => (d && typeof d === "object" && "msg" in d ? String((d as { msg: unknown }).msg).replace(/^Value error, /, "") : ""))
        .filter(Boolean)
        .join(". ");
    }
  }
  return fallback;
}

export async function request<T>(method: Method, path: string, opts: RequestOptions = {}): Promise<T> {
  if (USE_MOCK) {
    const { mockRequest } = await import("./mock");
    try {
      return (await mockRequest(method, path, opts, getToken())) as T;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
      throw err;
    }
  }

  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (opts.form) body = opts.form;
  else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}${buildQuery(opts.query)}`, { method, headers, body });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    if (res.status === 401 && token) window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    throw new ApiError(res.status, errorMessage(payload, `Request failed (${res.status})`));
  }

  if (opts.blob) return (await res.blob()) as T;
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Resolve an upload path like /uploads/events/x.jpg against the API origin. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  return `${BASE_URL}${path}`;
}

export function fileForm(file: File, field = "file"): FormData {
  const form = new FormData();
  form.append(field, file);
  return form;
}
