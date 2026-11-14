"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle, ArrowRight, ChevronRight, Handshake, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/useApi";
import { formatTime, splitTags } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Spotlight } from "@/components/home/Spotlight";
import { FeedCard, SectionHeading, type FeedEntry } from "@/components/cards";
import { JobTypeBadge } from "@/components/ui/Badge";
import { Empty, ErrorBox, Loading } from "@/components/ui/States";
import { btnPrimary, listCls, pageCls } from "@/components/ui/styles";

const FEED_SIZE = 4;
const monthFmt = new Intl.DateTimeFormat("en-IN", { month: "short" });

export default function HomePage() {
  const { user } = useAuth();
  const slides = useApi(() => api.spotlight.list(), []);
  const alert = useApi(() => api.news.list({ severity: "critical", limit: 1 }), []);
  const feed = useApi(async () => {
    const [news, stories] = await Promise.all([api.news.list({ limit: FEED_SIZE + 1 }), api.stories.list({ limit: FEED_SIZE })]);
    return [
      ...news.articles.map((item): FeedEntry => ({ kind: "news", item })),
      ...stories.stories.map((item): FeedEntry => ({ kind: "story", item })),
    ].sort((a, b) => b.item.created_at.localeCompare(a.item.created_at));
  }, [user?.id]);
  const events = useApi(() => api.events.list({ type: "upcoming", limit: 3 }), [user?.id]);
  const jobs = useApi(() => api.jobs.list({ limit: 3 }), []);

  const pinned = alert.data?.articles[0];
  const entries = useMemo(
    () => (feed.data ?? []).filter((e) => !(e.kind === "news" && e.item.id === pinned?.id)).slice(0, FEED_SIZE),
    [feed.data, pinned?.id],
  );

  return (
    <div className={pageCls}>
      <PageHeader
        title={user ? `Welcome back, ${user.name.split(" ")[0]}` : "MANAVI Alumni Community"}
        description="What's new across the community this week."
        action={
          <Link href="/stories/new" className={btnPrimary}>
            <Plus size={14} />
            Share a story
          </Link>
        }
      />

      {pinned && (
        <Link
          href={`/news/${pinned.id}`}
          className="flex items-center gap-3 px-4 py-3 bg-red-50/70 border border-red-200 rounded-xl text-sm text-red-900 hover:bg-red-50 transition-colors group animate-fade-in"
        >
          <AlertTriangle size={16} className="shrink-0 text-red-600" />
          <span className="min-w-0 flex-1 truncate">
            <strong className="font-semibold">{pinned.title}</strong>
            {pinned.summary && <span className="hidden sm:inline text-red-800/80"> · {pinned.summary}</span>}
          </span>
          <ArrowRight size={14} className="shrink-0 text-red-600 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}

      {slides.data && <Spotlight slides={slides.data} />}

      {/* Events sit above the feed on phones (time-sensitive), and in the right column from lg. */}
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-[auto_1fr] gap-6 lg:gap-x-8 items-start">
        <section className="lg:col-span-4 lg:col-start-9 lg:row-start-1 space-y-3 min-w-0">
          <SectionHeading title="Coming up" href="/events" />
          {events.loading && !events.data ? (
            <Loading variant="lines" />
          ) : events.error ? (
            <ErrorBox error={events.error} onRetry={events.reload} />
          ) : events.data!.events.length === 0 ? (
            <p className={`${listCls} p-4 text-sm text-zinc-500`}>
              Nothing scheduled yet.{" "}
              <Link href="/events/new" className="font-medium text-orange-600 hover:underline">
                Host an event
              </Link>
            </p>
          ) : (
            <ul className={`${listCls} stagger`}>
              {events.data!.events.map((ev) => {
                const date = new Date(ev.datetime);
                return (
                  <li key={ev.id}>
                    <Link href={`/events/${ev.id}`} className="flex items-center gap-3.5 p-3.5 hover:bg-orange-50/40 transition-colors group">
                      <span className="w-11 shrink-0 rounded-[10px] bg-orange-50 ring-1 ring-inset ring-orange-200/70 py-1.5 text-center leading-none">
                        <span className="block text-[10px] font-semibold text-orange-700">{monthFmt.format(date)}</span>
                        <span className="block text-lg font-semibold text-zinc-900 mt-0.5 tabular-nums">{date.getDate()}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-zinc-900 group-hover:text-orange-600 truncate">{ev.title}</span>
                        <span className="block text-xs text-zinc-500 truncate mt-0.5">
                          {formatTime(ev.datetime)} · {ev.location}
                        </span>
                      </span>
                      <ChevronRight size={15} className="shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-orange-500" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="lg:col-span-8 lg:col-start-1 lg:row-start-1 lg:row-span-2 space-y-3 min-w-0">
          <SectionHeading title="Latest updates" href="/updates" />
          {feed.loading && !feed.data ? (
            <Loading />
          ) : feed.error ? (
            <ErrorBox error={feed.error} onRetry={feed.reload} />
          ) : entries.length === 0 ? (
            <Empty
              title="Nothing posted yet"
              action={
                <Link href="/stories/new" className={btnPrimary}>
                  Write the first story
                </Link>
              }
            />
          ) : (
            <div className="space-y-3.5 stagger">
              {entries.map((entry) => (
                <FeedCard key={`${entry.kind}-${entry.item.id}`} entry={entry} />
              ))}
            </div>
          )}
        </section>

        <section className="lg:col-span-4 lg:col-start-9 lg:row-start-2 space-y-3 min-w-0">
          <SectionHeading title="New in Career" href="/career" />
          {jobs.loading && !jobs.data ? (
            <Loading variant="lines" />
          ) : jobs.error ? (
            <ErrorBox error={jobs.error} onRetry={jobs.reload} />
          ) : jobs.data!.listings.length === 0 ? (
            <p className={`${listCls} p-4 text-sm text-zinc-500`}>
              No openings yet.{" "}
              <Link href="/career/new" className="font-medium text-orange-600 hover:underline">
                Post a job
              </Link>
            </p>
          ) : (
            <ul className={`${listCls} stagger`}>
              {jobs.data!.listings.map((job) => {
                const referral = splitTags(job.tags).some((t) => t.toLowerCase() === "referral");
                return (
                  <li key={job.id}>
                    <Link href={`/career?id=${job.id}`} className="block p-3.5 hover:bg-orange-50/40 transition-colors group">
                      <span className="flex items-start justify-between gap-2">
                        <span className="min-w-0 text-sm font-semibold text-zinc-900 group-hover:text-orange-600 leading-snug">{job.title}</span>
                        <JobTypeBadge type={job.job_type} />
                      </span>
                      <span className="mt-1 flex items-center gap-2 text-xs text-zinc-500 min-w-0">
                        <span className="truncate">
                          {job.company}
                          {job.location && ` · ${job.location}`}
                        </span>
                        {referral && (
                          <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-semibold">
                            <Handshake size={11} />
                            Can refer
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
