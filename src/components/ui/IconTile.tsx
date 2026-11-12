import type { LucideIcon } from "lucide-react";

const TONES = {
  orange: "from-orange-100 to-orange-200/90 text-orange-600",
  amber: "from-amber-50 to-amber-200/80 text-amber-700",
  peach: "from-orange-50 to-rose-100 text-orange-700",
  sand: "from-stone-50 to-stone-200/80 text-stone-600",
} as const;

const SIZES = { sm: "w-8 h-8 rounded-[10px]", md: "w-10 h-10 rounded-xl", lg: "w-12 h-12 rounded-[14px]" } as const;
const ICON = { sm: 15, md: 18, lg: 22 } as const;

export type TileTone = keyof typeof TONES;

/** Glossy app-icon style tile, kept within the warm brand palette. */
export function IconTile({ icon: Icon, tone = "orange", size = "md" }: { icon: LucideIcon; tone?: TileTone; size?: keyof typeof SIZES }) {
  return (
    <span
      aria-hidden
      className={`${SIZES[size]} shrink-0 inline-flex items-center justify-center bg-gradient-to-br shadow-tile ring-1 ring-inset ring-white/60 ${TONES[tone]}`}
    >
      <Icon size={ICON[size]} strokeWidth={2} />
    </span>
  );
}
