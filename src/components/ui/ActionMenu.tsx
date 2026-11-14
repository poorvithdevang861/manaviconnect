"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { IconChevronDown, IconLock, IconPlus } from "@tabler/icons-react";
import { IconTile, type TileTone, type IconComponent } from "./IconTile";
import { btnPrimary } from "./styles";

export interface ActionMenuItem {
  label: string;
  description: string;
  href: string;
  icon: IconComponent;
  tone?: TileTone;
  /** Short type tag shown next to the label, e.g. "Story" or "News". */
  tag: string;
  /** Shown instead of a link when the user can't use this item. */
  lockedReason?: string;
}

const MENU_WIDTH = 304;

/** Primary "create" button that offers a choice of post types. */
export function ActionMenu({ label, shortLabel, items }: { label: string; shortLabel?: string; items: ActionMenuItem[] }) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [open, setOpen] = useState(false);
  const [alignStart, setAlignStart] = useState(false);

  const enabled = items.map((it, i) => (it.lockedReason ? -1 : i)).filter((i) => i >= 0);

  const show = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) setAlignStart(rect.right - MENU_WIDTH < 16);
    setOpen(true);
  };
  const hide = (refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    itemRefs.current[enabled[0] ?? 0]?.focus();
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open, enabled]);

  const onMenuKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      hide(true);
      return;
    }
    const idx = itemRefs.current.findIndex((el) => el === document.activeElement);
    if (idx < 0) return;
    const pos = enabled.indexOf(idx);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = enabled[(pos + 1) % enabled.length];
      if (next !== undefined) itemRefs.current[next]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = enabled[(pos - 1 + enabled.length) % enabled.length];
      if (prev !== undefined) itemRefs.current[prev]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      const first = enabled[0];
      if (first !== undefined) itemRefs.current[first]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      const last = enabled[enabled.length - 1];
      if (last !== undefined) itemRefs.current[last]?.focus();
    }
  };

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? hide(false) : show())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            show();
          }
        }}
        className={`${btnPrimary} !py-2.5 !px-4`}
      >
        <IconPlus size={16} stroke={1.6} />
        {shortLabel ? (
          <>
            <span className="sm:hidden">{shortLabel}</span>
            <span className="hidden sm:inline">{label}</span>
          </>
        ) : (
          label
        )}
        <IconChevronDown size={15} stroke={1.6} className={`-mr-1 opacity-80 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKey}
          style={{ width: `min(${MENU_WIDTH}px, calc(100vw - 2rem))` }}
          className={`absolute z-40 top-full mt-2 ${alignStart ? "left-0 origin-top-left" : "right-0 origin-top-right"} bg-white border border-zinc-200/80 rounded-2xl shadow-dropdown p-1.5 animate-pop-in`}
        >
          {items.map((it, i) => {
            const body = (
              <>
                <IconTile icon={it.icon} tone={it.lockedReason ? "sand" : it.tone} size="md" />
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-900">{it.label}</span>
                    <span className="px-1.5 py-px rounded-full bg-zinc-100 text-zinc-500 text-[10px] font-semibold">{it.tag}</span>
                  </span>
                  <span className="block text-xs text-zinc-500 mt-0.5 leading-snug">{it.lockedReason ?? it.description}</span>
                </span>
              </>
            );
            return it.lockedReason ? (
              <div
                key={it.label}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                role="menuitem"
                aria-disabled="true"
                className="flex items-start gap-3 p-2.5 rounded-xl opacity-70 cursor-not-allowed"
              >
                {body}
                <IconLock size={14} stroke={1.6} className="mt-1 shrink-0 text-zinc-400" />
              </div>
            ) : (
              <Link
                key={it.label}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                href={it.href}
                role="menuitem"
                onClick={() => hide(false)}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-zinc-50 transition-colors group"
              >
                {body}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
