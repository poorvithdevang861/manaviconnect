import React from "react";
import { AlertCircle, CheckCircle2, Inbox } from "lucide-react";
import { errorText } from "@/lib/useApi";
import { IconTile } from "./IconTile";
import { btnSecondary } from "./styles";

const Bar = ({ className }: { className: string }) => <div className={`skeleton rounded-md ${className}`} />;

/** Shimmering placeholder shaped like the content that is about to appear. */
export function Loading({ label = "Loading…", variant = "list", rows = 3 }: { label?: string; variant?: "list" | "grid" | "detail" | "lines"; rows?: number }) {
  const sr = <span className="sr-only">{label}</span>;
  if (variant === "lines") {
    return (
      <div role="status" className="space-y-2.5 py-2">
        {sr}
        <Bar className="h-3 w-3/4" />
        <Bar className="h-3 w-full" />
        <Bar className="h-3 w-2/3" />
      </div>
    );
  }
  if (variant === "detail") {
    return (
      <div role="status" className="bg-white border border-zinc-200/70 rounded-xl shadow-card overflow-hidden">
        {sr}
        <div className="skeleton aspect-[2/1]" />
        <div className="p-6 space-y-3">
          <Bar className="h-5 w-2/3" />
          <Bar className="h-3 w-1/3" />
          <div className="pt-3 space-y-2.5">
            <Bar className="h-3 w-full" />
            <Bar className="h-3 w-full" />
            <Bar className="h-3 w-4/5" />
          </div>
        </div>
      </div>
    );
  }
  if (variant === "grid") {
    return (
      <div role="status" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sr}
        {Array.from({ length: rows * 2 }, (_, i) => (
          <div key={i} className="bg-white border border-zinc-200/70 rounded-xl shadow-card overflow-hidden">
            <div className="skeleton aspect-[4/3]" />
            <div className="p-4 space-y-2.5">
              <Bar className="h-4 w-3/4" />
              <Bar className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div role="status" className="space-y-3">
      {sr}
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="bg-white border border-zinc-200/70 rounded-xl shadow-card p-4 flex gap-4">
          <div className="skeleton hidden sm:block w-40 aspect-[16/10] rounded-lg shrink-0" />
          <div className="flex-1 min-w-0 space-y-2.5 py-1">
            <Bar className="h-3 w-20" />
            <Bar className="h-4 w-3/4" />
            <Bar className="h-3 w-full" />
            <Bar className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorBox({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="p-4 bg-red-50/60 border border-red-200 rounded-xl text-xs text-red-800 flex items-start justify-between gap-3" role="alert">
      <div className="flex items-start gap-2">
        <AlertCircle size={15} className="shrink-0 mt-px" />
        <span>{errorText(error)}</span>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className={btnSecondary}>
          Try again
        </button>
      )}
    </div>
  );
}

export function Empty({ title, children, action }: { title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white border border-zinc-200/70 rounded-xl shadow-card px-6 py-12 text-center space-y-2 animate-fade-in">
      <div className="flex justify-center pb-2">
        <IconTile icon={Inbox} tone="sand" size="lg" />
      </div>
      <p className="text-sm font-semibold text-zinc-900">{title}</p>
      {children && <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">{children}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export function Notice({ tone = "success", children }: { tone?: "success" | "error" | "info"; children: React.ReactNode }) {
  const styles = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
    error: "bg-red-50/60 border-red-200 text-red-800",
    info: "bg-zinc-50 border-zinc-200 text-zinc-700",
  }[tone];
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <div className={`p-3 border rounded-lg text-xs flex items-start gap-2 animate-fade-in ${styles}`} role={tone === "error" ? "alert" : "status"}>
      <Icon size={14} className="shrink-0 mt-px" />
      <span>{children}</span>
    </div>
  );
}
