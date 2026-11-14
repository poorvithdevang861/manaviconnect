"use client";

import { useEffect, useId, useRef, useState } from "react";
import { IconCalendar, IconChevronDown, IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { btnPrimary } from "./styles";

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = (s: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
};
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = Array.from({ length: 12 }, (_, i) => new Intl.DateTimeFormat("en-IN", { month: "short" }).format(new Date(2000, i, 1)));
const monthTitle = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });
const dateLabel = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const dayLabel = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const timeLabel = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" });

/** Half-hour slots across a usual day for events: 6:00 am to 11:30 pm. */
const SLOTS = Array.from({ length: 36 }, (_, i) => `${pad(6 + Math.floor(i / 2))}:${i % 2 ? "30" : "00"}`);
const formatSlot = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return timeLabel.format(new Date(2000, 0, 1, h, m));
};

const POPOVER_HEIGHT = 400;
const POPOVER_WIDTH = 320;
const POPOVER_WIDTH_TIME = 440;
const BOTTOM_BAR = 88;

export function DatePicker({
  value,
  onChange,
  withTime = false,
  min,
  max,
  placeholder = "Pick a date",
  clearable = false,
  className = "",
}: {
  /** `yyyy-mm-dd`, or `yyyy-mm-ddTHH:mm` when `withTime` is set. Empty for no value. */
  value: string;
  onChange: (value: string) => void;
  withTime?: boolean;
  /** `yyyy-mm-dd` bounds, inclusive. */
  min?: string;
  max?: string;
  placeholder?: string;
  clearable?: boolean;
  className?: string;
}) {
  const dialogId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef<HTMLDivElement>(null);
  const focusOnRender = useRef(false);

  const datePart = value.slice(0, 10);
  const timePart = withTime ? value.slice(11, 16) : "";
  const selected = parseYmd(datePart);
  const minDate = min ? parseYmd(min) : null;
  const maxDate = max ? parseYmd(max) : null;
  const todayKey = ymd(new Date());
  const inRange = (d: Date) => (!minDate || d >= minDate) && (!maxDate || d <= maxDate);

  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const [alignEnd, setAlignEnd] = useState(false);
  const [view, setView] = useState<"days" | "months">("days");
  const [month, setMonth] = useState(() => startOfMonth(selected ?? new Date()));
  const [focusDay, setFocusDay] = useState(() => datePart || todayKey);

  const slots = timePart && !SLOTS.includes(timePart) ? [...SLOTS, timePart].sort() : SLOTS;

  const openPicker = () => {
    const start = selected ?? (minDate && minDate > new Date() ? minDate : new Date());
    setMonth(startOfMonth(start));
    setFocusDay(ymd(start));
    setView("days");
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const below = window.innerHeight - rect.bottom - BOTTOM_BAR;
      setUp(below < POPOVER_HEIGHT && rect.top > below);
      setAlignEnd(rect.left + (withTime ? POPOVER_WIDTH_TIME : POPOVER_WIDTH) > document.documentElement.clientWidth - 16);
    }
    focusOnRender.current = true;
    setOpen(true);
  };

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open || view !== "days" || !focusOnRender.current) return;
    focusOnRender.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${focusDay}"]`)?.focus();
  }, [open, view, focusDay, month]);

  useEffect(() => {
    if (!open || !withTime) return;
    const list = slotsRef.current;
    const el = list?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (list && el) list.scrollTop = el.offsetTop - list.clientHeight / 2 + el.offsetHeight / 2;
  }, [open, withTime]);

  const pickDay = (d: Date) => {
    if (!inRange(d)) return;
    const key = ymd(d);
    setFocusDay(key);
    if (d.getMonth() !== month.getMonth()) setMonth(startOfMonth(d));
    if (withTime) onChange(`${key}T${timePart || "10:00"}`);
    else {
      onChange(key);
      close();
    }
  };

  const pickTime = (t: string) => {
    onChange(`${datePart || focusDay}T${t}`);
    close();
  };

  const moveFocus = (d: Date) => {
    if (!inRange(d)) return;
    focusOnRender.current = true;
    setFocusDay(ymd(d));
    if (d.getMonth() !== month.getMonth() || d.getFullYear() !== month.getFullYear()) setMonth(startOfMonth(d));
  };

  const onGridKey = (e: React.KeyboardEvent) => {
    const current = parseYmd(focusDay) ?? new Date();
    const step: Record<string, () => Date> = {
      ArrowLeft: () => addDays(current, -1),
      ArrowRight: () => addDays(current, 1),
      ArrowUp: () => addDays(current, -7),
      ArrowDown: () => addDays(current, 7),
      Home: () => addDays(current, -current.getDay()),
      End: () => addDays(current, 6 - current.getDay()),
      PageUp: () => new Date(current.getFullYear(), current.getMonth() - (e.shiftKey ? 12 : 1), current.getDate()),
      PageDown: () => new Date(current.getFullYear(), current.getMonth() + (e.shiftKey ? 12 : 1), current.getDate()),
    };
    const next = step[e.key];
    if (!next) return;
    e.preventDefault();
    moveFocus(next());
  };

  const gridStart = addDays(month, -month.getDay());
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const canPrev = !minDate || addMonths(month, -1) >= startOfMonth(minDate);
  const canNext = !maxDate || addMonths(month, 1) <= maxDate;
  const thisYear = new Date().getFullYear();
  const years = Array.from(
    { length: (maxDate?.getFullYear() ?? thisYear + 5) - (minDate?.getFullYear() ?? 1950) + 1 },
    (_, i) => (minDate?.getFullYear() ?? 1950) + i,
  ).reverse();
  const today = parseYmd(todayKey)!;

  const display = selected ? `${dateLabel.format(selected)}${withTime && timePart ? ` · ${formatSlot(timePart)}` : ""}` : "";

  return (
    <div
      ref={rootRef}
      className={`relative ${className}`}
      onKeyDown={(e) => {
        if (e.key !== "Escape" || !open) return;
        e.stopPropagation();
        close();
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        data-field-control
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        onClick={() => (open ? close(false) : openPicker())}
        className={`w-full min-w-0 flex items-center gap-2.5 pl-3 ${clearable && selected && !open ? "pr-10" : "pr-2.5"} py-2.5 text-left text-base sm:text-sm bg-white border rounded-lg shadow-xs transition-[border-color,box-shadow] duration-150 hover:border-zinc-300 focus:outline-none focus-visible:border-orange-400 focus-visible:shadow-focus ${
          open ? "border-orange-400 shadow-focus" : "border-zinc-200"
        }`}
      >
        <IconCalendar size={17} stroke={1.6} className={`shrink-0 ${selected ? "text-orange-600" : "text-zinc-400"}`} />
        <span className={`flex-1 min-w-0 truncate ${selected ? "text-zinc-900" : "text-zinc-400"}`}>{display || placeholder}</span>
        {!(clearable && selected && !open) && <IconChevronDown size={15} stroke={1.6} className={`shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />}
      </button>

      {clearable && selected && !open && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear date"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 inline-flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
        >
          <IconX size={14} stroke={1.6} />
        </button>
      )}

      {open && (
        <div
          id={dialogId}
          role="dialog"
          aria-label={withTime ? "Choose date and time" : "Choose a date"}
          className={`absolute z-40 ${alignEnd ? "right-0" : "left-0"} ${up ? "bottom-full mb-2" : "top-full mt-2"} ${
            up ? (alignEnd ? "origin-bottom-right" : "origin-bottom-left") : alignEnd ? "origin-top-right" : "origin-top-left"
          } w-[min(20rem,calc(100vw-2rem))] ${
            withTime ? "sm:w-auto" : ""
          } bg-white border border-zinc-200/80 rounded-2xl shadow-dropdown p-3 animate-pop-in`}
        >
          <div className={`flex flex-col gap-3 ${withTime ? "sm:flex-row" : ""}`}>
            <div className={`min-w-0 ${withTime ? "sm:w-[18rem]" : ""}`}>
              <div className="flex items-center justify-between gap-1 mb-2">
                <button
                  type="button"
                  onClick={() => (view === "days" ? setMonth(addMonths(month, -1)) : setMonth(new Date(month.getFullYear() - 1, month.getMonth(), 1)))}
                  disabled={view === "days" && !canPrev}
                  aria-label={view === "days" ? "Previous month" : "Previous year"}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <IconChevronLeft size={16} stroke={1.6} />
                </button>
                <button
                  type="button"
                  onClick={() => setView(view === "days" ? "months" : "days")}
                  aria-expanded={view === "months"}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
                >
                  {view === "days" ? monthTitle.format(month) : month.getFullYear()}
                  <IconChevronDown size={14} stroke={1.6} className={`text-zinc-400 transition-transform ${view === "months" ? "rotate-180" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={() => (view === "days" ? setMonth(addMonths(month, 1)) : setMonth(new Date(month.getFullYear() + 1, month.getMonth(), 1)))}
                  disabled={view === "days" && !canNext}
                  aria-label={view === "days" ? "Next month" : "Next year"}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <IconChevronRight size={16} stroke={1.6} />
                </button>
              </div>

              {view === "days" ? (
                <>
                  <div className="grid grid-cols-7 mb-1" aria-hidden>
                    {WEEKDAYS.map((w) => (
                      <span key={w} className="text-center text-[11px] font-medium text-zinc-400 py-1">
                        {w}
                      </span>
                    ))}
                  </div>
                  <div ref={gridRef} role="group" aria-label={monthTitle.format(month)} onKeyDown={onGridKey} className="grid grid-cols-7 gap-y-0.5">
                    {days.map((d) => {
                      const key = ymd(d);
                      const outside = d.getMonth() !== month.getMonth();
                      const isSelected = key === datePart;
                      const isToday = key === todayKey;
                      const disabled = !inRange(d);
                      return (
                        <button
                          key={key}
                          type="button"
                          data-day={key}
                          tabIndex={key === focusDay ? 0 : -1}
                          disabled={disabled}
                          aria-pressed={isSelected}
                          aria-label={`${dayLabel.format(d)}${isToday ? ", today" : ""}`}
                          onClick={() => pickDay(d)}
                          className={`mx-auto w-9 h-9 inline-flex items-center justify-center rounded-full text-sm tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-1 ${
                            isSelected
                              ? "bg-gradient-to-b from-orange-500 to-orange-600 text-white font-semibold shadow-[0_1px_2px_rgba(154,52,18,0.3)]"
                              : disabled
                                ? "text-zinc-300 cursor-not-allowed"
                                : isToday
                                  ? "text-orange-700 font-semibold ring-1 ring-inset ring-orange-300 hover:bg-orange-50"
                                  : outside
                                    ? "text-zinc-400 hover:bg-zinc-100"
                                    : "text-zinc-800 hover:bg-orange-50 hover:text-orange-800"
                          }`}
                        >
                          {d.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="space-y-3 animate-fade-in">
                  <select
                    value={month.getFullYear()}
                    onChange={(e) => setMonth(new Date(Number(e.target.value), month.getMonth(), 1))}
                    aria-label="Year"
                    className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-orange-400 focus:shadow-focus"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-3 gap-1.5">
                    {MONTHS.map((label, i) => {
                      const first = new Date(month.getFullYear(), i, 1);
                      const last = new Date(month.getFullYear(), i + 1, 0);
                      const disabled = (!!minDate && last < minDate) || (!!maxDate && first > maxDate);
                      const current = selected?.getFullYear() === month.getFullYear() && selected.getMonth() === i;
                      return (
                        <button
                          key={label}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            setMonth(first);
                            setView("days");
                          }}
                          className={`py-2.5 rounded-lg text-sm font-medium transition-colors disabled:text-zinc-300 disabled:pointer-events-none ${
                            current ? "bg-orange-100 text-orange-800" : "text-zinc-700 hover:bg-orange-50 hover:text-orange-800"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {withTime && (
              <div className="border-t sm:border-t-0 sm:border-l border-zinc-100 pt-3 sm:pt-0 sm:pl-3 sm:w-28 flex flex-col min-h-0">
                <span className="text-[11px] font-medium text-zinc-500 mb-1.5 px-1">Time</span>
                <div ref={slotsRef} className="relative grid grid-cols-4 sm:grid-cols-1 gap-1 max-h-[7.5rem] sm:max-h-[17rem] overflow-y-auto overscroll-contain pr-0.5" role="group" aria-label="Time">
                  {slots.map((t) => {
                    const active = t === timePart;
                    return (
                      <button
                        key={t}
                        type="button"
                        aria-pressed={active}
                        onClick={() => pickTime(t)}
                        className={`px-1.5 py-1.5 rounded-lg text-xs tabular-nums whitespace-nowrap transition-colors ${
                          active ? "bg-gradient-to-b from-orange-500 to-orange-600 text-white font-semibold" : "text-zinc-700 hover:bg-orange-50 hover:text-orange-800"
                        }`}
                      >
                        {formatSlot(t)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => pickDay(today)}
              disabled={!inRange(today)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-orange-600 hover:bg-orange-50 disabled:text-zinc-300 disabled:pointer-events-none"
            >
              Today
            </button>
            <div className="flex items-center gap-1.5">
              {clearable && selected && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    close();
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                >
                  Clear
                </button>
              )}
              {withTime && (
                <button type="button" onClick={() => close()} className={`${btnPrimary} !px-3 !py-1.5`}>
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
