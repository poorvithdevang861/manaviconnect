"use client";

import Link from "next/link";
import { AlertTriangle, Briefcase, Calendar, Car, History, Images, MapPin, Plus, Store } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/useApi";
import { formatDay, formatTime, timeAgo } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Spotlight } from "@/components/home/Spotlight";
import { NewsCard, SectionHeading, StoryCard } from "@/components/cards";
import { Card } from "@/components/ui/Card";
import { JobTypeBadge } from "@/components/ui/Badge";
import { Empty, ErrorBox, Loading } from "@/components/ui/States";
import { btnPrimary, btnSecondary, pageCls } from "@/components/ui/styles";

const EXPLORE = [
  { label: "Timeline", href: "/timeline", icon: History, text: "The school's history, year by year" },
  { label: "Gallery", href: "/gallery", icon: Images, text: "Photos shared by alumni" },
  { label: "Marketplace", href: "/marketplace", icon: Store, text: "Produce, goods and services" },
  { label: "Transit", href: "/transit", icon: Car, text: "Carpools and rides" },
];

export default function HomePage() {
  const { user } = useAuth();
  const slides = useApi(() => api.spotlight.list(), []);
  const critical = useApi(() => api.news.list({ severity: "critical", limit: 2 }), []);
  const news = useApi(() => api.news.list({ limit: 3 }), []);
  const stories = useApi(() => api.stories.list({ limit: 3 }), [user?.id]);
  const events = useApi(() => api.events.list({ type: "upcoming", limit: 3 }), [user?.id]);
  const jobs = useApi(() => api.jobs.list({ limit: 4 }), []);

  return (
    <div className={pageCls}>
      <PageHeader
        title={user ? `Welcome back, ${user.name.split(" ")[0]}` : "MANAVI Alumni Community"}
        description="News, events, stories and opportunities from across our alumni."
        action={
          <>
            <Link href="/events/new" className={btnSecondary}>
              Host an event
            </Link>
            <Link href="/stories/new" className={btnPrimary}>
              <Plus size={14} />
              Share a story
            </Link>
          </>
        }
      />

      {slides.data && <Spotlight slides={slides.data} />}

      {critical.data?.articles.map((a) => (
        <Link
          key={a.id}
          href={`/news/${a.id}`}
          className="flex items-start gap-3 p-3.5 bg-red-50/70 border border-red-200 rounded-xl text-sm text-red-900 hover:bg-red-50 transition-colors"
        >
          <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-600" />
          <span>
            <strong className="font-semibold">{a.title}.</strong> {a.summary}
          </span>
        </Link>
      ))}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <section className="space-y-3.5">
            <SectionHeading title="Latest news" href="/news" />
            {news.loading ? (
              <Loading />
            ) : news.error ? (
              <ErrorBox error={news.error} onRetry={news.reload} />
            ) : news.data!.articles.length === 0 ? (
              <Empty title="No news yet" />
            ) : (
              <div className="grid gap-3.5 sm:grid-cols-2">
                {news.data!.articles.map((a, i) => (
                  <div key={a.id} className={i === 0 ? "sm:col-span-2" : ""}>
                    <NewsCard article={a} />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3.5">
            <SectionHeading title="Recent stories" href="/stories" />
            {stories.loading ? (
              <Loading />
            ) : stories.error ? (
              <ErrorBox error={stories.error} onRetry={stories.reload} />
            ) : stories.data!.stories.length === 0 ? (
              <Empty title="No stories yet" action={<Link href="/stories/new" className={btnPrimary}>Write the first one</Link>} />
            ) : (
              <div className="space-y-3.5">
                {stories.data!.stories.map((s) => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-4">
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-orange-600" />
                Upcoming events
              </span>
              <Link href="/events" className="text-xs text-orange-600 hover:underline font-medium">
                View all
              </Link>
            </h3>
            {events.loading ? (
              <Loading />
            ) : events.error ? (
              <ErrorBox error={events.error} onRetry={events.reload} />
            ) : events.data!.events.length === 0 ? (
              <p className="text-xs text-zinc-500">Nothing scheduled yet.</p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {events.data!.events.map((ev) => (
                  <li key={ev.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="text-[11px] font-mono text-orange-700 font-medium">
                      {formatDay(ev.datetime)} · {formatTime(ev.datetime)}
                    </div>
                    <Link href={`/events/${ev.id}`} className="block text-sm font-semibold text-zinc-900 hover:text-orange-600 mt-0.5 leading-snug">
                      {ev.title}
                    </Link>
                    <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                      <MapPin size={12} className="text-zinc-400 shrink-0" />
                      {ev.location}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Briefcase size={14} className="text-orange-600" />
                New jobs
              </span>
              <Link href="/jobs" className="text-xs text-orange-600 hover:underline font-medium">
                View all
              </Link>
            </h3>
            {jobs.loading ? (
              <Loading />
            ) : jobs.error ? (
              <ErrorBox error={jobs.error} onRetry={jobs.reload} />
            ) : jobs.data!.listings.length === 0 ? (
              <p className="text-xs text-zinc-500">No openings posted yet.</p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {jobs.data!.listings.map((job) => (
                  <li key={job.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/jobs?id=${job.id}`} className="text-sm font-medium text-zinc-900 hover:text-orange-600 leading-snug">
                        {job.title}
                      </Link>
                      <JobTypeBadge type={job.job_type} />
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {job.company}
                      {job.location && ` · ${job.location}`} · {timeAgo(job.created_at)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/jobs/new" className={`${btnSecondary} w-full py-2`}>
              Post a job
            </Link>
          </Card>

          <Card className="p-2">
            <h3 className="px-3 pt-3 pb-1 text-sm font-semibold text-zinc-900">Explore</h3>
            <ul>
              {EXPLORE.map(({ label, href, icon: Icon, text }) => (
                <li key={href}>
                  <Link href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-50 group">
                    <Icon size={16} className="text-zinc-400 group-hover:text-orange-600 shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-zinc-900">{label}</span>
                      <span className="block text-xs text-zinc-500">{text}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}
