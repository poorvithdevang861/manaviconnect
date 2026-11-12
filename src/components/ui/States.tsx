import React from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { errorText } from "@/lib/useApi";
import { btnSecondary } from "./styles";

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-xs text-zinc-500" role="status">
      <Loader2 size={15} className="animate-spin text-zinc-400" />
      {label}
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
    <div className="bg-white border border-dashed border-zinc-300 rounded-xl px-6 py-12 text-center space-y-2">
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
    <div className={`p-3 border rounded-lg text-xs flex items-start gap-2 ${styles}`} role={tone === "error" ? "alert" : "status"}>
      <Icon size={14} className="shrink-0 mt-px" />
      <span>{children}</span>
    </div>
  );
}
