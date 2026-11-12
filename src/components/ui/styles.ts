export const pageCls = "max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in";

export const inputCls =
  "w-full min-w-0 px-3.5 py-2.5 text-base sm:text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 shadow-xs transition-[border-color,box-shadow] duration-150 hover:border-zinc-300 focus:outline-none focus:border-orange-400 focus:shadow-focus disabled:bg-zinc-50 disabled:text-zinc-500";

export const labelCls = "block text-xs font-medium text-zinc-700 mb-1.5";

export const btnPrimary =
  "btn-press inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-700 rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_1px_2px_rgba(154,52,18,0.25)] shrink-0 disabled:opacity-60 disabled:pointer-events-none";

export const btnSecondary =
  "btn-press inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 rounded-lg border border-zinc-200 shadow-xs shrink-0 disabled:opacity-60 disabled:pointer-events-none";

export const btnDanger =
  "btn-press inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-red-600 bg-white hover:bg-red-50 rounded-lg border border-red-200 shrink-0 disabled:opacity-60 disabled:pointer-events-none";

/** Round icon-only button, pair with data-tip for a label. */
export const btnIcon =
  "btn-press inline-flex items-center justify-center w-8 h-8 rounded-full text-zinc-500 bg-zinc-100 hover:bg-zinc-200/80 hover:text-zinc-900 shrink-0";

export const chipCls = (active: boolean) =>
  `chip-press inline-flex items-center gap-1.5 pl-3 pr-3.5 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 border ${
    active
      ? "bg-gradient-to-r from-orange-100 to-amber-50 text-orange-800 border-orange-200/80 shadow-xs"
      : "bg-white text-zinc-600 hover:text-zinc-900 border-zinc-200 hover:bg-zinc-50"
  }`;

/** Grouped list container, as in a settings panel: rows separated by hairlines. */
export const listCls = "bg-white border border-zinc-200/70 rounded-xl shadow-card divide-y divide-zinc-100 overflow-hidden";
