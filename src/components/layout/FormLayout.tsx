"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ErrorBox, Loading } from "@/components/ui/States";
import { btnPrimary, btnSecondary, pageCls } from "@/components/ui/styles";
import { useApi } from "@/lib/useApi";
import { PageHeader } from "./PageHeader";

export function FormLayout({
  tag,
  title,
  description,
  backHref,
  backLabel = "Back",
  aside,
  prefill,
  children,
}: {
  tag: string;
  title: string;
  description?: string;
  backHref: string;
  backLabel?: string;
  aside?: React.ReactNode;
  /** Templates and shortcuts: shown above the form on mobile, beside it on desktop. */
  prefill?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={pageCls}>
      <PageHeader
        tag={tag}
        title={title}
        description={description}
        action={
          <Link href={backHref} className={btnSecondary}>
            <ArrowLeft size={14} className="text-zinc-500" />
            {backLabel}
          </Link>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <Card className="order-2 lg:order-none lg:col-span-8 lg:row-start-1 p-5 sm:p-7">{children}</Card>
        {(prefill || aside) && (
          <div className="contents lg:block lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:sticky lg:top-36 lg:space-y-6">
            {prefill && <div className="order-1">{prefill}</div>}
            {aside && <aside className="order-3 space-y-4">{aside}</aside>}
          </div>
        )}
      </div>
    </div>
  );
}

/** Loads the record being edited (when `id` is set) before rendering the form. */
export function EditLoader<T>({
  id,
  load,
  children,
}: {
  id: number | null;
  load: (id: number) => Promise<T>;
  children: (initial: T | null) => React.ReactNode;
}) {
  return id === null ? <>{children(null)}</> : <EditLoaderInner id={id} load={load}>{children}</EditLoaderInner>;
}

function EditLoaderInner<T>({
  id,
  load,
  children,
}: {
  id: number;
  load: (id: number) => Promise<T>;
  children: (initial: T | null) => React.ReactNode;
}) {
  const { data, error, loading, reload } = useApi(() => load(id), [id]);
  if (loading)
    return (
      <div className={pageCls}>
        <Loading variant="lines" />
      </div>
    );
  if (error) return <div className={pageCls}><ErrorBox error={error} onRetry={reload} /></div>;
  return <>{children(data ?? null)}</>;
}

export function FormActions({
  cancelHref,
  busy,
  label,
  draftSavedAt,
}: {
  cancelHref: string;
  busy: boolean;
  label: string;
  draftSavedAt?: number | null;
}) {
  const [mod, setMod] = useState("Ctrl");
  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setMod("⌘");
  }, []);
  return (
    <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
      <span className="mr-auto flex items-center gap-3 text-[11px] text-zinc-400 min-w-0">
        {draftSavedAt ? (
          <span key={draftSavedAt} className="inline-flex items-center gap-1 text-zinc-500 animate-fade-in">
            <Check size={12} className="text-emerald-500" />
            Draft saved
          </span>
        ) : null}
        <span className="hidden md:inline-flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded-md border border-zinc-200 bg-zinc-50 font-mono text-[10px] text-zinc-500">{mod}</kbd>
          <kbd className="px-1.5 py-0.5 rounded-md border border-zinc-200 bg-zinc-50 font-mono text-[10px] text-zinc-500">Enter</kbd>
          to save
        </span>
      </span>
      <Link href={cancelHref} className="btn-press px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100">
        Cancel
      </Link>
      <button type="submit" disabled={busy} className={btnPrimary}>
        {busy && <Loader2 size={13} className="animate-spin" />}
        {busy ? "Saving…" : label}
      </button>
    </div>
  );
}

export function AsideNote({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5 space-y-2 text-xs text-zinc-600">
      <h3 className="font-semibold text-zinc-900 text-sm">{title}</h3>
      <div className="leading-relaxed space-y-1.5">{children}</div>
    </Card>
  );
}
