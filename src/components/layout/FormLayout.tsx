"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ErrorBox, Loading } from "@/components/ui/States";
import { btnSecondary, pageCls } from "@/components/ui/styles";
import { useApi } from "@/lib/useApi";
import { PageHeader } from "./PageHeader";

export function FormLayout({
  tag,
  title,
  description,
  backHref,
  backLabel = "Back",
  aside,
  children,
}: {
  tag: string;
  title: string;
  description?: string;
  backHref: string;
  backLabel?: string;
  aside?: React.ReactNode;
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
        <Card className="lg:col-span-8 p-6 sm:p-7">{children}</Card>
        {aside && <aside className="lg:col-span-4 space-y-4">{aside}</aside>}
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
  if (loading) return <Loading />;
  if (error) return <div className={pageCls}><ErrorBox error={error} onRetry={reload} /></div>;
  return <>{children(data ?? null)}</>;
}

export function FormActions({ cancelHref, busy, label }: { cancelHref: string; busy: boolean; label: string }) {
  return (
    <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
      <Link href={cancelHref} className="btn-press px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900">
        Cancel
      </Link>
      <button
        type="submit"
        disabled={busy}
        className="btn-press px-5 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs disabled:opacity-60"
      >
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
