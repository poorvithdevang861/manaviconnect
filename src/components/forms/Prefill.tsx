"use client";

import { useState } from "react";
import { Check, ChevronRight, RotateCcw, Sparkles, type LucideIcon } from "lucide-react";
import { IconTile, type TileTone } from "@/components/ui/IconTile";
import { listCls } from "@/components/ui/styles";

export interface Template<T> {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone?: TileTone;
  values: Partial<T> | (() => Partial<T>);
}

/**
 * Grouped list of starting points. Picking one fills the form so people edit
 * instead of composing from a blank page.
 */
export function TemplatePicker<T>({
  templates,
  onPick,
  title = "Start from a template",
  subtitle = "Fills the form for you. Everything stays editable.",
}: {
  templates: Template<T>[];
  onPick: (values: Partial<T>) => void;
  title?: string;
  subtitle?: string;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <section aria-label={title} className="space-y-2.5">
      <div className="flex items-start gap-2.5 px-1">
        <Sparkles size={15} className="text-orange-500 mt-0.5 shrink-0" />
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
          <p className="text-xs text-zinc-500">{subtitle}</p>
        </div>
      </div>
      <ul className={`${listCls} stagger`}>
        {templates.map((t) => {
          const active = picked === t.id;
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  setPicked(t.id);
                  onPick(typeof t.values === "function" ? t.values() : t.values);
                }}
                aria-pressed={active}
                className={`group w-full flex items-center gap-3 px-3.5 py-3 text-left transition-colors ${active ? "bg-orange-50/60" : "hover:bg-zinc-50 active:bg-zinc-100/70"}`}
              >
                <IconTile icon={t.icon} tone={t.tone} />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-zinc-900 truncate">{t.title}</span>
                  <span className="block text-xs text-zinc-500 truncate">{t.description}</span>
                </span>
                {active ? (
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white inline-flex items-center justify-center animate-pop shrink-0">
                    <Check size={13} strokeWidth={3} />
                  </span>
                ) : (
                  <ChevronRight size={16} className="text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export interface Suggestion {
  label: string;
  value: string;
}

/** One-tap answers for a single field. */
export function Suggestions({
  options,
  current,
  onPick,
  label = "Quick pick",
}: {
  options: ReadonlyArray<Suggestion | string>;
  current?: string;
  onPick: (value: string) => void;
  label?: string;
}) {
  const list = options.map((o) => (typeof o === "string" ? { label: o, value: o } : o));
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={label}>
      {list.map((o) => {
        const active = current !== undefined && current === o.value;
        return (
          <button
            key={o.label}
            type="button"
            onClick={() => onPick(o.value)}
            aria-pressed={active}
            className={`chip-press shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
              active
                ? "bg-gradient-to-r from-orange-100 to-amber-50 border-orange-200 text-orange-800"
                : "bg-zinc-50 border-zinc-200/80 text-zinc-600 hover:bg-white hover:text-zinc-900 hover:border-zinc-300"
            }`}
          >
            {active && <Check size={11} strokeWidth={3} className="animate-pop" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Adds or removes a tag in a comma-separated list. */
export function toggleTag(tags: string, tag: string): string {
  const list = tags.split(",").map((t) => t.trim()).filter(Boolean);
  const has = list.some((t) => t.toLowerCase() === tag.toLowerCase());
  return (has ? list.filter((t) => t.toLowerCase() !== tag.toLowerCase()) : [...list, tag]).join(", ");
}

/** Tag suggestions that toggle in and out of a comma-separated field. */
export function TagSuggestions({ tags, value, onChange }: { tags: readonly string[]; value: string; onChange: (value: string) => void }) {
  const chosen = new Set(value.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean));
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Suggested tags">
      {tags.map((t) => {
        const active = chosen.has(t.toLowerCase());
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(toggleTag(value, t))}
            aria-pressed={active}
            className={`chip-press inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
              active
                ? "bg-gradient-to-r from-orange-100 to-amber-50 border-orange-200 text-orange-800"
                : "bg-zinc-50 border-zinc-200/80 text-zinc-600 hover:bg-white hover:text-zinc-900 hover:border-zinc-300"
            }`}
          >
            {active ? <Check size={11} strokeWidth={3} className="animate-pop" /> : <span className="text-zinc-400">+</span>}
            {t}
          </button>
        );
      })}
    </div>
  );
}

/** All options visible at once, for short enums (job type, category, severity). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: ReadonlyArray<{ id: T; label: string; icon?: LucideIcon }>;
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1 p-1 rounded-xl bg-zinc-100/90 border border-zinc-200/60">
      {options.map((o) => {
        const active = o.id === value;
        const Icon = o.icon;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className={`flex-1 min-w-fit inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-150 ${
              active ? "bg-white text-zinc-900 shadow-[0_1px_2px_rgba(24,24,27,0.08),0_0_0_1px_rgba(24,24,27,0.04)]" : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {Icon && <Icon size={13} className={active ? "text-orange-600" : ""} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (checked: boolean) => void; label: string; description?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group w-full flex items-center justify-between gap-4 p-3 rounded-xl border border-zinc-200/80 bg-white hover:bg-zinc-50 text-left transition-colors"
    >
      <span className="min-w-0">
        <span className="block text-xs font-medium text-zinc-800">{label}</span>
        {description && <span className="block text-[11px] text-zinc-500 mt-0.5">{description}</span>}
      </span>
      <span className={`relative w-10 h-6 shrink-0 rounded-full transition-colors duration-200 ${checked ? "bg-orange-500" : "bg-zinc-300"}`}>
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </span>
    </button>
  );
}

export function DraftBanner({ savedAt, onDiscard }: { savedAt: number; onDiscard: () => void }) {
  const mins = Math.max(0, Math.round((Date.now() - savedAt) / 60000));
  const when = mins === 0 ? "just now" : mins < 60 ? `${mins} min ago` : mins < 1440 ? `${Math.round(mins / 60)} h ago` : `${Math.round(mins / 1440)} d ago`;
  return (
    <div className="flex items-center gap-3 p-2.5 pl-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900 animate-fade-in" role="status">
      <RotateCcw size={14} className="shrink-0 text-amber-600" />
      <span className="flex-1 min-w-0">
        Picked up where you left off, draft saved {when}.
      </span>
      <button type="button" onClick={onDiscard} className="btn-press shrink-0 px-2.5 py-1 rounded-lg font-medium text-amber-800 hover:bg-amber-100">
        Start fresh
      </button>
    </div>
  );
}
