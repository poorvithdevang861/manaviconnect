const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" });
const dayFmt = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" });

/** Plain YYYY-MM-DD dates are parsed as local dates, not UTC midnight. */
function parse(value: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
}

export const formatDate = (value: string | null | undefined) => (value ? dateFmt.format(parse(value)) : "");
export const formatTime = (value: string) => timeFmt.format(parse(value));
export const formatDay = (value: string) => dayFmt.format(parse(value));
export const formatDateTime = (value: string) => `${formatDay(value)}, ${formatTime(value)}`;

export function timeAgo(value: string): string {
  const seconds = Math.round((Date.now() - parse(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value);
}

export const isPast = (value: string) => parse(value).getTime() < Date.now();

export function splitTags(tags: string | null | undefined): string[] {
  return (tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const formatPrice = (price: string | null) => (price === null ? "Price on request" : inr.format(Number(price)));

export const titleCase = (s: string) => s.replace(/(^|[-\s])(\w)/g, (_, sep, c) => sep + c.toUpperCase());

/** datetime-local input value <-> ISO string */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export const fromLocalInput = (value: string) => new Date(value).toISOString();

/** Empty strings become null so optional API fields are cleared rather than set to "". */
export function nullable<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) out[k] = typeof v === "string" && v.trim() === "" ? null : v;
  return out as T;
}
