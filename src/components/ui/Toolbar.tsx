"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { History, Search, X } from "lucide-react";
import { chipCls } from "./styles";

const RECENT_LIMIT = 6;
const recentKey = (path: string) => `community_hub_recent:${path}`;

function readRecent(path: string): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(recentKey(path)) ?? "[]");
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeRecent(path: string, list: string[]) {
  try {
    if (list.length) localStorage.setItem(recentKey(path), JSON.stringify(list));
    else localStorage.removeItem(recentKey(path));
  } catch {}
}

/**
 * Search box that reports its value after the user stops typing.
 * Remembers recent searches per page; press "/" anywhere to focus it.
 */
export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const pathname = usePathname();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(value);
  const [recent, setRecent] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);

  useEffect(() => setText(value), [value]);
  useEffect(() => setRecent(readRecent(pathname)), [pathname]);
  useEffect(() => {
    if (text === value) return;
    const t = setTimeout(() => onChange(text), 300);
    return () => clearTimeout(t);
  }, [text, value, onChange]);

  const updateRecent = useCallback(
    (fn: (list: string[]) => string[]) =>
      setRecent((list) => {
        const next = fn(list);
        writeRecent(pathname, next);
        return next;
      }),
    [pathname]
  );

  const remember = (q: string) => {
    const term = q.trim();
    if (term.length < 2) return;
    updateRecent((list) => [term, ...list.filter((x) => x.toLowerCase() !== term.toLowerCase())].slice(0, RECENT_LIMIT));
  };

  const apply = (q: string) => {
    setText(q);
    onChange(q);
    remember(q);
    setOpen(false);
    setCursor(-1);
  };

  const clear = () => {
    setText("");
    onChange("");
    setCursor(-1);
    inputRef.current?.focus();
  };

  const showRecent = open && !text && recent.length > 0;

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (text) clear();
      else {
        setOpen(false);
        inputRef.current?.blur();
      }
      return;
    }
    if (e.key === "Enter") {
      if (showRecent && cursor >= 0) {
        e.preventDefault();
        apply(recent[cursor]);
      } else {
        onChange(text);
        remember(text);
        setOpen(false);
      }
      return;
    }
    if (!showRecent) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (c + 1) % recent.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (c <= 0 ? recent.length - 1 : c - 1));
    }
  };

  return (
    <div className="relative flex-1 basis-full sm:basis-auto min-w-0 sm:min-w-[220px]">
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
      <input
        ref={inputRef}
        data-search
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        role="combobox"
        aria-expanded={showRecent}
        aria-controls={listId}
        aria-activedescendant={showRecent && cursor >= 0 ? `${listId}-${cursor}` : undefined}
        aria-label={placeholder}
        value={text}
        placeholder={placeholder}
        onChange={(e) => {
          setText(e.target.value);
          setCursor(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          remember(text);
          setOpen(false);
          setCursor(-1);
        }}
        onKeyDown={onKeyDown}
        className="w-full pl-10 pr-11 py-2.5 text-base sm:text-sm bg-zinc-100/80 hover:bg-zinc-100 focus:bg-white border border-transparent focus:border-orange-300 focus:shadow-focus rounded-xl outline-none transition-[background-color,border-color,box-shadow] duration-150 placeholder:text-zinc-400 [&::-webkit-search-cancel-button]:appearance-none"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
        {text ? (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={clear}
            data-tip="Clear"
            aria-label="Clear search"
            className="animate-pop-in w-6 h-6 inline-flex items-center justify-center rounded-full bg-zinc-300/80 hover:bg-zinc-400/80 text-white transition-colors"
          >
            <X size={13} strokeWidth={2.75} />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-md border border-zinc-200 bg-white text-[11px] font-mono text-zinc-400 pointer-events-none" aria-hidden>
            /
          </kbd>
        )}
      </div>

      {showRecent && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute z-30 left-0 right-0 mt-2 origin-top bg-white border border-zinc-200/70 rounded-2xl shadow-dropdown p-2 animate-pop-in"
        >
          <div className="flex items-center justify-between px-2 pt-1 pb-2">
            <span className="text-xs font-semibold text-zinc-900">Recent</span>
            <button type="button" onClick={() => updateRecent(() => [])} className="text-xs font-medium text-orange-600 hover:text-orange-700 px-1.5 py-0.5 rounded-md hover:bg-orange-50">
              Clear all
            </button>
          </div>
          <ul id={listId} role="listbox" aria-label="Recent searches">
            {recent.map((q, i) => (
              <li
                key={q}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === cursor}
                className={`group flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-xl cursor-pointer ${i === cursor ? "bg-zinc-100" : "hover:bg-zinc-50"}`}
                onClick={() => apply(q)}
                onMouseEnter={() => setCursor(i)}
              >
                <span className="w-7 h-7 shrink-0 inline-flex items-center justify-center rounded-lg bg-zinc-100 text-zinc-400 group-hover:text-orange-600 transition-colors">
                  <History size={14} />
                </span>
                <span className="flex-1 min-w-0 truncate text-sm text-zinc-700">{q}</span>
                <button
                  type="button"
                  data-tip="Remove"
                  aria-label={`Remove ${q} from recent searches`}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateRecent((list) => list.filter((x) => x !== q));
                  }}
                  className="w-7 h-7 shrink-0 inline-flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/70 transition-colors"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: ReadonlyArray<{ id: T; label: string; count?: number }>;
  value: T;
  onChange: (value: T) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto max-w-full min-w-0 -mx-1 px-1 py-0.5 no-scrollbar" role="group" aria-label={label}>
      {label && <span className="text-xs font-medium text-zinc-500 mr-1 shrink-0">{label}:</span>}
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button key={o.id} type="button" onClick={() => onChange(o.id)} className={chipCls(active)} aria-pressed={active}>
            {o.label}
            {o.count !== undefined && (
              <span
                className={`min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full text-[10px] font-semibold tabular-nums ${
                  active ? "bg-white/80 text-orange-700" : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="bg-white border border-zinc-200/70 rounded-2xl p-3 sm:p-4 shadow-card flex flex-wrap items-center gap-3">{children}</div>;
}
