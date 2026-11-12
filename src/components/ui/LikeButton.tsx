"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import type { LikeResult } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function LikeButton({
  liked,
  count,
  onToggle,
  size = "sm",
}: {
  liked: boolean;
  count: number;
  onToggle: () => Promise<LikeResult>;
  size?: "sm" | "md";
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState({ liked, count });
  const [busy, setBusy] = useState(false);

  const handle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (busy) return;
    setBusy(true);
    const prev = state;
    setState({ liked: !prev.liked, count: prev.count + (prev.liked ? -1 : 1) });
    try {
      const res = await onToggle();
      setState({ liked: res.liked, count: res.like_count });
    } catch {
      setState(prev);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handle}
      aria-pressed={state.liked}
      aria-label={state.liked ? "Unlike" : "Like"}
      className={`chip-press inline-flex items-center gap-1.5 rounded-lg border font-medium ${
        size === "md" ? "px-3 py-1.5 text-xs" : "px-2 py-1 text-[11px]"
      } ${
        state.liked
          ? "bg-orange-50 border-orange-200/80 text-orange-700"
          : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
      }`}
    >
      <Heart size={size === "md" ? 14 : 12} fill={state.liked ? "currentColor" : "none"} />
      <span className="font-mono tabular-nums">{state.count}</span>
    </button>
  );
}
