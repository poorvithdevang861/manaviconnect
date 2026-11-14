"use client";

import { useRef } from "react";
import type { IconComponent } from "./IconTile";

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: IconComponent;
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
              aria-controls={`${idBase}-panel-${t.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`chip-press inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-gradient-to-r from-orange-100 to-amber-50 text-orange-800 font-semibold border border-orange-200/70 shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70"
              }`}
            >
              {Icon && <Icon size={14} stroke={1.6} className={active ? "text-orange-600" : "text-zinc-400"} />}
              {t.label}
              {t.count !== undefined && (
                <span
                  className={`min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full text-[10px] font-semibold tabular-nums ${
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
