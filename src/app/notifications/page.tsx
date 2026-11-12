"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, BellOff, BookOpen, Briefcase, Calendar, Newspaper, Store } from "lucide-react";
import { api } from "@/lib/api";
import { errorText, useApi } from "@/lib/useApi";
import { timeAgo } from "@/lib/format";
import { currentSubscription, disablePush, enablePush, pushSupported } from "@/lib/push";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { Empty, ErrorBox, Loading, Notice } from "@/components/ui/States";
import { btnPrimary, btnSecondary, pageCls } from "@/components/ui/styles";

const ICONS: Record<string, typeof Bell> = { event: Calendar, story: BookOpen, news: Newspaper, job: Briefcase, marketplace: Store };

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useApi(() => api.notifications.list({ page, limit: 20 }), [page]);

  return (
    <div className={pageCls}>
      <PageHeader tag="Notifications" title="What's new" description="Every new event, story, news article, job and marketplace listing." />

      <div className="max-w-3xl space-y-4">
        <PushToggle />

        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorBox error={error} onRetry={reload} />
        ) : data!.notifications.length === 0 ? (
          <Empty title="Nothing yet" />
        ) : (
          <>
            <Card className="divide-y divide-zinc-100">
              {data!.notifications.map((n) => {
                const Icon = ICONS[n.type] ?? Bell;
                const body = (
                  <div className="flex items-start gap-3 p-4">
                    <span className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/70 text-orange-700 flex items-center justify-center shrink-0">
                      <Icon size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900">{n.title}</p>
                      {n.body && <p className="text-xs text-zinc-500 mt-0.5">{n.body}</p>}
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono shrink-0">{timeAgo(n.created_at)}</span>
                  </div>
                );
                return n.url ? (
                  <Link key={n.id} href={n.url} className="block hover:bg-zinc-50 first:rounded-t-xl last:rounded-b-xl">
                    {body}
                  </Link>
                ) : (
                  <div key={n.id}>{body}</div>
                );
              })}
            </Card>
            <Pagination page={data!.page} limit={data!.limit} total={data!.total} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}

function PushToggle() {
  const [state, setState] = useState<"unknown" | "unsupported" | "on" | "off">("unknown");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pushSupported()) return setState("unsupported");
    currentSubscription()
      .then((sub) => setState(sub ? "on" : "off"))
      .catch(() => setState("off"));
  }, []);

  if (state === "unknown" || state === "unsupported") return null;

  const toggle = async () => {
    setBusy(true);
    setError("");
    try {
      if (state === "on") {
        await disablePush();
        setState("off");
      } else {
        await enablePush();
        setState("on");
      }
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm">
          <p className="font-medium text-zinc-900">Push notifications {state === "on" ? "are on" : "are off"}</p>
          <p className="text-xs text-zinc-500">Get an alert on this device when something new is posted.</p>
        </div>
        <button type="button" onClick={toggle} disabled={busy} className={state === "on" ? btnSecondary : btnPrimary}>
          {state === "on" ? <BellOff size={13} /> : <Bell size={13} />}
          {busy ? "Working…" : state === "on" ? "Turn off" : "Turn on"}
        </button>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
    </Card>
  );
}
