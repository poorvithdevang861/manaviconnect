import { toLocalInput } from "./format";

const pad = (n: number) => String(n).padStart(2, "0");

/** yyyy-mm-dd for <input type="date">, in local time. */
export function toDateInput(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

/** The next given weekday (0 = Sunday) at a local hour, at least one day out, plus `weeks` extra weeks. */
export function nextWeekday(day: number, hour: number, weeks = 0): Date {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  let diff = (day - d.getDay() + 7) % 7;
  if (diff === 0) diff = 7;
  d.setDate(d.getDate() + diff + weeks * 7);
  return d;
}

export const localInputAt = (d: Date) => toLocalInput(d.toISOString());

export const today = () => toDateInput(new Date());
