"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, CalendarDays, Hash, Info, Loader2, Megaphone, Newspaper, PenLine, Plus, RefreshCw, X, type LucideIcon } from "lucide-react";
import { api, NEWS_CATEGORIES, type NewsCategory } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/useApi";
import { splitTags, titleCase } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { FeedCard, type FeedEntry } from "@/components/cards";
import { ActionMenu, type ActionMenuItem } from "@/components/ui/ActionMenu";
import { IconTile } from "@/components/ui/IconTile";
import { Empty, ErrorBox, Loading } from "@/components/ui/States";
import { Tabs } from "@/components/ui/Tabs";
import { SearchInput } from "@/components/ui/Toolbar";
import { btnPrimary, btnSecondary, chipCls, listCls, pageCls } from "@/components/ui/styles";

type Section = "stories" | "news";

const STEP = 12;
const TOP_STORY_TAGS = 8;

const CATEGORY_ICONS: Record<NewsCategory, LucideIcon> = {
  announcement: Megaphone,
  update: RefreshCw,
  event: CalendarDays,
  general: Info,
};

const COPY: Record<Section, { description: string; search: string; empty: string }> = {
  stories: {
    description: "First-hand stories from alumni: careers, campus memories and giving back.",
    search: "Search stories",
    empty: "No stories yet",
  },
  news: {
    description: "Official announcements and updates from the association.",
    search: "Search news",
    empty: "No news yet",
  },
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
  const section: Section = isCategory(rawTag) || (!rawTag && params.get("type") === "news") ? "news" : "stories";
  const newsTag = section === "news" && isCategory(rawTag) ? rawTag : undefined;
  const storyTag = section === "stories" && rawTag ? rawTag : undefined;
  const activeTag = newsTag ?? storyTag;

  const go = (next: Section, tag?: string) => {
    const q = new URLSearchParams();
    if (next === "news") q.set("type", "news");
    if (tag) q.set("tag", tag);
    setCount(STEP);
    router.replace(`/updates?${q.toString()}`.replace(/\?$/, ""), { scroll: false });
  };
  const switchTo = (next: Section) => {
    if (next === section) return;
    setSearch("");
    go(next);
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

  const feed = useApi(async (): Promise<{ entries: FeedEntry[]; more: boolean }> => {
    if (section === "news") {
      const res = await api.news.list({ category: newsTag, search, limit: Math.min(100, count) });
      return { entries: res.articles.map((item) => ({ kind: "news", item })), more: res.total > res.articles.length };
    }
    // Stories have no tag filter on the API, so a tag is applied here over the latest 100.
    const res = await api.stories.list({ search, limit: storyTag ? 100 : Math.min(100, count) });
    const matching = res.stories.filter((s) => !storyTag || splitTags(s.tags).some((t) => t.toLowerCase() === storyTag));
    return {
      entries: matching.map((item) => ({ kind: "story", item })),
      more: storyTag ? matching.length > count : res.total > res.stories.length,
    };
  }, [section, newsTag, storyTag, search, count, user?.id]);

  const visible = useMemo(() => (feed.data?.entries ?? []).slice(0, count), [feed.data, count]);
  const filtered = !!activeTag || !!search;
  const tagLabel = newsTag ? titleCase(newsTag) : storyTag ? `#${storyTag}` : "";
  const ov = overview.data;
  const copy = COPY[section];

  const chips =
    section === "news"
      ? NEWS_CATEGORIES.filter((c) => !ov || ov.categories.has(c) || c === newsTag).map((c) => ({
          id: c as string,
          label: titleCase(c),
          count: ov?.categories.get(c),
          icon: CATEGORY_ICONS[c],
        }))
      : (ov?.storyTags ?? []).map(([t, n]) => ({ id: t, label: `#${t}`, count: n as number | undefined, icon: Hash }));

  const shareItems: ActionMenuItem[] = [
    {
      label: "Write a story",
      tag: "Story",
      description: "A memory, a career move or a way you gave back",
      href: "/stories/new",
      icon: BookOpen,
      tone: "amber",
    },
    {
      label: "Post news",
      tag: "News",
      description: "An official announcement or update for everyone",
      href: "/news/new",
      icon: Megaphone,
      lockedReason: user?.is_admin ? undefined : "Only association admins can post news",
    },
  ];
  const ordered = section === "news" ? [...shareItems].reverse() : shareItems;

  const emptyAction =
    section === "stories" ? (
      <Link href="/stories/new" className={btnPrimary}>
        <Plus size={14} />
        Write the first story
      </Link>
    ) : user?.is_admin ? (
      <Link href="/news/new" className={btnPrimary}>
        <PenLine size={14} />
        Post the first update
      </Link>
    ) : null;

  const clearAll = () => {
    setSearch("");
    go(section);
  };

  return (
    <div className={pageCls}>
      <PageHeader align="center" tag="Updates" title="News & stories" description={copy.description} />

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Tabs
          idBase="updates"
          label="Updates section"
          value={section}
          onChange={switchTo}
          tabs={[
            { id: "stories", label: "Stories", icon: BookOpen, count: ov?.storiesTotal },
            { id: "news", label: "News", icon: Newspaper, count: ov?.newsTotal },
          ]}
        />
        <div className="order-last sm:order-none w-full sm:w-56 lg:w-72 p-1 bg-white border border-zinc-200/70 rounded-2xl shadow-card">
          <SearchInput key={section} className="w-full" value={search} onChange={(v) => { setSearch(v); setCount(STEP); }} placeholder={copy.search} />
        </div>
        <ActionMenu label="Share an update" shortLabel="Share" items={ordered} />
      </div>

      {chips.length > 0 && (
        <div className="lg:hidden overflow-x-auto no-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6 py-0.5">
          <div className="flex items-center gap-1.5 w-max mx-auto" role="group" aria-label={section === "news" ? "Filter by category" : "Filter by tag"}>
            <button type="button" onClick={() => go(section)} className={chipCls(!activeTag)} aria-pressed={!activeTag}>
              {section === "news" ? "All categories" : "All tags"}
            </button>
            {chips.map((c) => (
              <button key={c.id} type="button" onClick={() => go(section, c.id)} className={chipCls(activeTag === c.id)} aria-pressed={activeTag === c.id}>
                {c.label}
                {c.count !== undefined && <span className="text-[10px] tabular-nums opacity-60">{c.count}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <section id="updates-panel" role="tabpanel" aria-labelledby={`updates-tab-${section}`} className="lg:col-span-8 space-y-4 min-w-0">
          {filtered && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 animate-fade-in" role="status">
              <span>Showing</span>
              {tagLabel && (
                <button type="button" onClick={() => go(section)} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-orange-100 text-orange-800 font-medium hover:bg-orange-200/70" aria-label={`Remove ${tagLabel}`}>
                  {tagLabel}
                  <X size={12} />
                </button>
              )}
              {search && <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 font-medium">“{search}”</span>}
              <button type="button" onClick={clearAll} className="ml-1 font-medium text-orange-600 hover:text-orange-700">
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
              title={filtered ? "Nothing matches these filters" : copy.empty}
              action={
                filtered ? (
                  <button type="button" onClick={clearAll} className={btnSecondary}>
                    Clear filters
                  </button>
                ) : (
                  emptyAction
                )
              }
            >
              {filtered ? "Try another tag, or search for something else." : undefined}
            </Empty>
          ) : (
            <>
              <div className={`space-y-3.5 stagger transition-opacity ${feed.loading ? "opacity-60" : ""}`} aria-busy={feed.loading}>
                {visible.map((e) => (
                  <FeedCard key={`${e.kind}-${e.item.id}`} entry={e} showKind={false} />
                ))}
              </div>
              {feed.data!.more && (
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

        <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-36 space-y-2" aria-label={section === "news" ? "Categories" : "Tags"}>
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-zinc-900">{section === "news" ? "Categories" : "Popular tags"}</h2>
            {activeTag && (
              <button type="button" onClick={() => go(section)} className="text-xs font-medium text-orange-600 hover:text-orange-700">
                Clear
              </button>
            )}
          </div>
          {chips.length > 0 ? (
            <ul className={listCls}>
              {chips.map((c) => (
                <TagRow
                  key={c.id}
                  icon={c.icon}
                  tone={section === "news" ? "orange" : "amber"}
                  label={c.label}
                  count={c.count}
                  active={activeTag === c.id}
                  onClick={() => go(section, activeTag === c.id ? undefined : c.id)}
                />
              ))}
            </ul>
          ) : (
            !overview.loading && <p className="px-1 text-xs text-zinc-500">Tags show up here once stories use them.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function TagRow({
  icon,
  label,
  count,
  active,
  onClick,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  tone: "orange" | "amber";
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
