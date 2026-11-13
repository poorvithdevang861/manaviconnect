"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, CalendarDays, Hash, Info, Layers, Loader2, Megaphone, Newspaper, PenLine, Plus, RefreshCw, X, type LucideIcon } from "lucide-react";
import { api, NEWS_CATEGORIES, type NewsCategory } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/useApi";
import { splitTags, titleCase } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { FeedCard, type FeedEntry } from "@/components/cards";
import { IconTile } from "@/components/ui/IconTile";
import { Empty, ErrorBox, Loading } from "@/components/ui/States";
import { Tabs } from "@/components/ui/Tabs";
import { SearchInput } from "@/components/ui/Toolbar";
import { btnPrimary, btnSecondary, chipCls, listCls, pageCls } from "@/components/ui/styles";

type FeedType = "all" | "news" | "stories";

const STEP = 12;
const TOP_STORY_TAGS = 8;

const CATEGORY_ICONS: Record<NewsCategory, LucideIcon> = {
  announcement: Megaphone,
  update: RefreshCw,
  event: CalendarDays,
  general: Info,
};

const isCategory = (t: string): t is NewsCategory => (NEWS_CATEGORIES as readonly string[]).includes(t);

function tally(values: string[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export default function UpdatesPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [count, setCount] = useState(STEP);

  const rawTag = (params.get("tag") ?? "").trim().toLowerCase();
  const newsTag = isCategory(rawTag) ? rawTag : undefined;
  const storyTag = rawTag && !newsTag ? rawTag : undefined;
  const requested = params.get("type");
  const type: FeedType = newsTag ? "news" : storyTag ? "stories" : requested === "news" || requested === "stories" ? requested : "all";

  const go = (next: { type?: FeedType; tag?: string }) => {
    const q = new URLSearchParams();
    if (next.type && next.type !== "all") q.set("type", next.type);
    if (next.tag) q.set("tag", next.tag);
    setCount(STEP);
    const qs = q.toString();
    router.replace(qs ? `/updates?${qs}` : "/updates", { scroll: false });
  };

  // Totals and tag counts for the whole community, independent of the current filter.
  const overview = useApi(async () => {
    const [news, stories] = await Promise.all([api.news.list({ limit: 100 }), api.stories.list({ limit: 100 })]);
    return {
      newsTotal: news.total,
      storiesTotal: stories.total,
      categories: new Map(tally(news.articles.map((a) => a.category))),
      storyTags: tally(stories.stories.flatMap((s) => splitTags(s.tags).map((t) => t.toLowerCase()))).slice(0, TOP_STORY_TAGS),
    };
  }, [user?.id]);

  const showNews = type !== "stories";
  const showStories = type !== "news";
  const feed = useApi(async () => {
    const [news, stories] = await Promise.all([
      showNews ? api.news.list({ category: newsTag, search, limit: Math.min(100, count) }) : null,
      showStories ? api.stories.list({ search, limit: storyTag ? 100 : Math.min(100, Math.max(count, 40)) }) : null,
    ]);
    return { news, stories };
  }, [showNews, showStories, newsTag, storyTag, search, count, user?.id]);

  const entries = useMemo(() => {
    if (!feed.data) return [];
    const { news, stories } = feed.data;
    const list: FeedEntry[] = [
      ...(news?.articles ?? []).map((item) => ({ kind: "news" as const, item })),
      ...(stories?.stories ?? [])
        .filter((s) => !storyTag || splitTags(s.tags).some((t) => t.toLowerCase() === storyTag))
        .map((item) => ({ kind: "story" as const, item })),
    ];
    return list.sort((a, b) => b.item.created_at.localeCompare(a.item.created_at));
  }, [feed.data, storyTag]);

  const visible = entries.slice(0, count);
  const hasMore =
    entries.length > count ||
    (!!feed.data?.news && feed.data.news.total > feed.data.news.articles.length) ||
    (!!feed.data?.stories && !storyTag && feed.data.stories.total > feed.data.stories.stories.length && feed.data.stories.stories.length < 100);

  const filtered = !!rawTag || !!search;
  const tagLabel = newsTag ? titleCase(newsTag) : storyTag ? `#${storyTag}` : "";
  const ov = overview.data;

  const newsChips = NEWS_CATEGORIES.filter((c) => !ov || ov.categories.has(c) || c === newsTag).map((c) => ({
    id: c,
    label: titleCase(c),
    count: ov?.categories.get(c),
  }));
  const storyChips = (ov?.storyTags ?? []).map(([t, n]) => ({ id: t, label: `#${t}`, count: n }));

  return (
    <div className={pageCls}>
      <PageHeader
        tag="Updates"
        title="News & stories"
        description="Official announcements from the association and stories written by alumni, in one place."
        action={
          <>
            {user?.is_admin && (
              <Link href="/news/new" className={btnSecondary}>
                <PenLine size={14} />
                Write article
              </Link>
            )}
            <Link href="/stories/new" className={btnPrimary}>
              <Plus size={14} />
              Share a story
            </Link>
          </>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Tabs
          idBase="updates"
          label="Show"
          value={type}
          onChange={(t) => go({ type: t })}
          tabs={[
            { id: "all", label: "All", icon: Layers, count: ov ? ov.newsTotal + ov.storiesTotal : undefined },
            { id: "news", label: "News", icon: Newspaper, count: ov?.newsTotal },
            { id: "stories", label: "Stories", icon: BookOpen, count: ov?.storiesTotal },
          ]}
        />
        <div className="flex-1 min-w-0 flex p-1 bg-white border border-zinc-200/70 rounded-2xl shadow-card">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setCount(STEP); }} placeholder="Search news and stories" />
        </div>
      </div>

      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6 py-0.5" role="group" aria-label="Filter by tag">
        <button type="button" onClick={() => go({ type })} className={chipCls(!rawTag)} aria-pressed={!rawTag}>
          All tags
        </button>
        {type !== "stories" &&
          newsChips.map((c) => (
            <button key={c.id} type="button" onClick={() => go({ tag: c.id })} className={chipCls(newsTag === c.id)} aria-pressed={newsTag === c.id}>
              {c.label}
              {c.count !== undefined && <span className="text-[10px] tabular-nums opacity-60">{c.count}</span>}
            </button>
          ))}
        {type === "all" && storyChips.length > 0 && <span className="shrink-0 w-px h-5 bg-zinc-200 mx-1" aria-hidden />}
        {type !== "news" &&
          storyChips.map((c) => (
            <button key={c.id} type="button" onClick={() => go({ tag: c.id })} className={chipCls(storyTag === c.id)} aria-pressed={storyTag === c.id}>
              {c.label}
              <span className="text-[10px] tabular-nums opacity-60">{c.count}</span>
            </button>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <section id="updates-panel" role="tabpanel" aria-labelledby={`updates-tab-${type}`} className="lg:col-span-8 space-y-4 min-w-0">
          {filtered && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 animate-fade-in" role="status">
              <span>Showing</span>
              {tagLabel && (
                <button type="button" onClick={() => go({ type })} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-orange-100 text-orange-800 font-medium hover:bg-orange-200/70" aria-label={`Remove tag ${tagLabel}`}>
                  {tagLabel}
                  <X size={12} />
                </button>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 pl-2.5 pr-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 font-medium">“{search}”</span>
              )}
              <button type="button" onClick={() => { setSearch(""); go({ type }); }} className="ml-1 font-medium text-orange-600 hover:text-orange-700">
                Clear filters
              </button>
            </div>
          )}

          {feed.loading && !feed.data ? (
            <Loading />
          ) : feed.error ? (
            <ErrorBox error={feed.error} onRetry={feed.reload} />
          ) : visible.length === 0 ? (
            <Empty
              title={filtered ? "Nothing matches these filters" : "Nothing posted yet"}
              action={
                filtered ? (
                  <button type="button" onClick={() => { setSearch(""); go({}); }} className={btnSecondary}>
                    Clear filters
                  </button>
                ) : (
                  <Link href="/stories/new" className={btnPrimary}>
                    Share the first story
                  </Link>
                )
              }
            >
              {filtered ? "Try another tag, or search for something else." : undefined}
            </Empty>
          ) : (
            <>
              <div className={`space-y-3.5 stagger transition-opacity ${feed.loading ? "opacity-60" : ""}`} aria-busy={feed.loading}>
                {visible.map((e) => (
                  <FeedCard key={`${e.kind}-${e.item.id}`} entry={e} />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center pt-1">
                  <button type="button" onClick={() => setCount((c) => c + STEP)} disabled={feed.loading} className={btnSecondary}>
                    {feed.loading && <Loader2 size={13} className="animate-spin" />}
                    {feed.loading ? "Loading…" : "Show more"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-36 space-y-5" aria-label="Browse by tag">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-zinc-900">Browse by tag</h2>
            {rawTag && (
              <button type="button" onClick={() => go({ type })} className="text-xs font-medium text-orange-600 hover:text-orange-700">
                Clear
              </button>
            )}
          </div>
          {type !== "stories" && (
            <TagGroup title="News">
              {newsChips.map((c) => (
                <TagRow key={c.id} icon={CATEGORY_ICONS[c.id]} label={c.label} count={c.count} active={newsTag === c.id} onClick={() => go({ tag: newsTag === c.id ? undefined : c.id, type: newsTag === c.id ? type : undefined })} />
              ))}
            </TagGroup>
          )}
          {type !== "news" && storyChips.length > 0 && (
            <TagGroup title="Stories">
              {storyChips.map((c) => (
                <TagRow key={c.id} icon={Hash} tone="amber" label={c.label} count={c.count} active={storyTag === c.id} onClick={() => go({ tag: storyTag === c.id ? undefined : c.id, type: storyTag === c.id ? type : undefined })} />
              ))}
            </TagGroup>
          )}
        </aside>
      </div>
    </div>
  );
}

function TagGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="px-1 text-xs font-medium text-zinc-500">{title}</h3>
      <ul className={listCls}>{children}</ul>
    </div>
  );
}

function TagRow({
  icon,
  label,
  count,
  active,
  onClick,
  tone = "orange",
}: {
  icon: LucideIcon;
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  tone?: "orange" | "amber";
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${active ? "bg-orange-50/70" : "hover:bg-zinc-50"}`}
      >
        <IconTile icon={icon} size="sm" tone={active ? "orange" : tone === "amber" ? "amber" : "sand"} />
        <span className={`flex-1 min-w-0 truncate text-sm ${active ? "font-semibold text-orange-800" : "font-medium text-zinc-800"}`}>{label}</span>
        {count !== undefined && (
          <span className={`min-w-[22px] h-[22px] px-1.5 inline-flex items-center justify-center rounded-full text-[11px] font-semibold tabular-nums ${active ? "bg-orange-500 text-white" : "bg-zinc-100 text-zinc-500"}`}>
            {count}
          </span>
        )}
      </button>
    </li>
  );
}
