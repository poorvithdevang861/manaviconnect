"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { chipCls } from "./styles";

/** Search box that reports its value after the user stops typing. */
export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  useEffect(() => {
    if (text === value) return;
    const t = setTimeout(() => onChange(text), 300);
    return () => clearTimeout(t);
  }, [text, value, onChange]);

  return (
    <div className="relative flex-1 basis-full sm:basis-auto min-w-0 sm:min-w-[200px]">
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full pl-9 pr-4 py-2 text-base sm:text-sm bg-zinc-50/60 hover:bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-orange-500 rounded-lg outline-none transition-colors placeholder:text-zinc-400"
      />
    </div>
  );
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: ReadonlyArray<{ id: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto max-w-full min-w-0 -mx-1 px-1 py-0.5 [scrollbar-width:none]" role="group" aria-label={label}>
      {label && <span className="text-xs font-medium text-zinc-500 mr-1 shrink-0">{label}:</span>}
      {options.map((o) => (
        <button key={o.id} type="button" onClick={() => onChange(o.id)} className={chipCls(o.id === value)} aria-pressed={o.id === value}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="bg-white border border-zinc-200/80 rounded-xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center gap-3">{children}</div>;
}
