"use client";

import { useRef } from "react";
import type { LucideIcon } from "lucide-react";

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

/** Pill tab bar. Arrow keys move between tabs; the panel is labelled by the active tab. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
  idBase,
}: {
  tabs: ReadonlyArray<TabItem<T>>;
  value: T;
  onChange: (value: T) => void;
  label: string;
  idBase: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + tabs.length) % tabs.length;
    refs.current[next]?.focus();
    onChange(tabs[next].id);
  };

  return (
    <div className="max-w-full overflow-x-auto no-scrollbar">
      <div role="tablist" aria-label={label} className="inline-flex items-center gap-1 p-1 rounded-2xl bg-white border border-zinc-200/70 shadow-card">
        {tabs.map((t, i) => {
          const active = t.id === value;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${idBase}-tab-${t.id}`}
              aria-selected={active}
              aria-controls={`${idBase}-panel`}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`shrink-0 inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-150 ${
                active
                  ? "bg-gradient-to-b from-orange-50 to-orange-100/80 text-orange-800 shadow-[inset_0_0_0_1px_rgba(251,146,60,0.35)]"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              {Icon && <Icon size={15} className={active ? "text-orange-600" : "text-zinc-400"} />}
              {t.label}
              {t.count !== undefined && (
                <span
                  className={`min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center rounded-full text-[11px] font-semibold tabular-nums ${
                    active ? "bg-white text-orange-700" : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
