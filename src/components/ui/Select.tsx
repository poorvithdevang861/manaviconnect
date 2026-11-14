"use client";

import { useEffect, useId, useRef, useState } from "react";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import type { IconComponent } from "./IconTile";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  icon?: IconComponent;
  badge?: string;
  disabled?: boolean;
}

export function Select<T extends string>({
  id,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  className = "",
}: {
  id?: string;
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<SelectOption<T>> | SelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const autoId = useId();
  const selectId = id || autoId;

  const currentOption = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        id={selectId}
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 text-left text-sm bg-white border rounded-xl text-zinc-900 transition-colors shadow-xs ${
          open ? "border-orange-500 ring-2 ring-orange-500/10" : "border-zinc-200 hover:border-zinc-300"
        } ${disabled ? "opacity-60 cursor-not-allowed bg-zinc-50" : "cursor-pointer"}`}
      >
        <span className="flex items-center gap-2 min-w-0">
          {currentOption?.icon && (
            <currentOption.icon size={16} stroke={1.6} className="text-orange-600 shrink-0" />
          )}
          <span className="truncate font-medium">
            {currentOption ? currentOption.label : <span className="text-zinc-400 font-normal">{placeholder}</span>}
          </span>
          {currentOption?.badge && (
            <span className="px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-semibold shrink-0">
              {currentOption.badge}
            </span>
          )}
        </span>
        <IconChevronDown
          size={16}
          stroke={1.6}
          className={`text-zinc-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-zinc-700" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-labelledby={selectId}
          className="absolute z-50 top-full mt-1.5 left-0 right-0 max-h-64 overflow-y-auto bg-white border border-zinc-200/90 rounded-xl shadow-dropdown p-1 animate-pop-in text-left divide-y divide-zinc-50"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={opt.disabled}
                onClick={() => {
                  if (opt.disabled) return;
                  onChange(opt.value);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                  isSelected
                    ? "bg-orange-50/80 text-orange-950 font-medium"
                    : "text-zinc-800 hover:bg-zinc-50"
                } ${opt.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {Icon && (
                  <Icon
                    size={16}
                    stroke={1.6}
                    className={`shrink-0 mt-0.5 ${isSelected ? "text-orange-600" : "text-zinc-400"}`}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate">{opt.label}</span>
                    {opt.badge && (
                      <span className="px-1.5 py-px rounded-full bg-zinc-100 text-zinc-500 text-[10px] font-semibold">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  {opt.description && (
                    <p
                      className={`text-[11px] mt-0.5 leading-snug line-clamp-2 ${
                        isSelected ? "text-orange-700/80" : "text-zinc-500"
                      }`}
                    >
                      {opt.description}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <IconCheck size={14} stroke={2.2} className="text-orange-600 shrink-0 mt-0.5 ml-1" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

