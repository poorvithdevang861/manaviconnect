import React from "react";
import type { Icon as TablerIcon } from "@tabler/icons-react";

const TONES = {
  orange: "from-orange-100 to-orange-200/90 text-orange-600",
  amber: "from-amber-50 to-amber-200/80 text-amber-700",
  peach: "from-orange-50 to-rose-100 text-orange-700",
  sand: "from-stone-50 to-stone-200/80 text-stone-600",
} as const;

const SIZES = { sm: "w-8 h-8 rounded-[10px]", md: "w-10 h-10 rounded-xl", lg: "w-12 h-12 rounded-[14px]" } as const;
const ICON = { sm: 16, md: 19, lg: 22 } as const;

export type TileTone = keyof typeof TONES;

export type IconComponent = TablerIcon | React.ComponentType<{ size?: number | string; stroke?: number | string; strokeWidth?: number | string; className?: string }>;

/** Smooth modern app-icon style tile with subtle brand gradient. */
export function IconTile({ icon: Icon, tone = "orange", size = "md" }: { icon: IconComponent; tone?: TileTone; size?: keyof typeof SIZES }) {
  return (
    <span
      aria-hidden
      className={`${SIZES[size]} shrink-0 inline-flex items-center justify-center bg-gradient-to-br shadow-tile ring-1 ring-inset ring-white/60 ${TONES[tone]}`}
    >
      <Icon size={ICON[size]} stroke={1.6} />
    </span>
  );
}
