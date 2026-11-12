export const pageCls = "max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in";

export const inputCls =
  "w-full px-3.5 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors disabled:bg-zinc-50 disabled:text-zinc-500";

export const labelCls = "block text-xs font-medium text-zinc-700 mb-1.5";

export const btnPrimary =
  "btn-press inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs shrink-0 disabled:opacity-60 disabled:pointer-events-none";

export const btnSecondary =
  "btn-press inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 rounded-lg border border-zinc-200 shadow-xs shrink-0 disabled:opacity-60 disabled:pointer-events-none";

export const btnDanger =
  "btn-press inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white hover:bg-red-50 rounded-lg border border-red-200 shrink-0 disabled:opacity-60 disabled:pointer-events-none";

export const chipCls = (active: boolean) =>
  `chip-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 border ${
    active
      ? "bg-orange-50 text-orange-700 border-orange-200/70 shadow-xs"
      : "bg-white text-zinc-600 hover:text-zinc-900 border-zinc-200 hover:bg-zinc-50"
  }`;
