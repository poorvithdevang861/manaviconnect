import Link from "next/link";
import { AlertTriangle, ArrowRight, BookOpen, Calendar, MapPin, Newspaper, Users } from "lucide-react";
import { api, type EventItem, type NewsArticle, type Story } from "@/lib/api";
import { formatDate, formatDateTime, isPast, splitTags, titleCase } from "@/lib/format";
import { imageOr } from "@/lib/placeholder";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, Tags } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LikeButton } from "@/components/ui/LikeButton";

function Cover({ src, seed, className = "" }: { src: string | null; seed: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={imageOr(src, seed)} alt="" loading="lazy" className={`block w-full object-cover bg-zinc-100 ${className}`} />;
}

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <Link href={`/news/${article.id}`} className="block group">
      <Card hoverable className="overflow-hidden">
        <Cover src={article.image_url} seed={`news-${article.id}`} className="aspect-[16/9]" />
        <div className="p-5 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {article.severity === "critical" && (
              <Badge variant="danger" size="sm">
                <AlertTriangle size={11} />
                Important
              </Badge>
            )}
            <Badge size="sm">{titleCase(article.category)}</Badge>
            <span className="text-zinc-400 font-mono">{formatDate(article.created_at)}</span>
            {!article.is_published && <Badge variant="dark" size="sm">Draft</Badge>}
          </div>
          <h3 className="text-base font-semibold text-zinc-900 group-hover:text-orange-600 transition-colors leading-snug">{article.title}</h3>
          {(article.summary || article.content) && (
            <p className="text-sm text-zinc-600 line-clamp-2 leading-relaxed">{article.summary || article.content}</p>
          )}
        </div>
      </Card>
    </Link>
  );
}

export function StoryCard({ story }: { story: Story }) {
  return (
    <Link href={`/stories/${story.id}`} className="block group">
      <Card hoverable className="overflow-hidden">
        <Cover src={story.image_url} seed={`story-${story.id}`} className="aspect-[16/9]" />
        <div className="p-5 space-y-2.5">
          <h3 className="text-base font-semibold text-zinc-900 group-hover:text-orange-600 transition-colors leading-snug">{story.title}</h3>
          <p className="text-sm text-zinc-600 line-clamp-3 leading-relaxed whitespace-pre-line">{story.content}</p>
          <Tags tags={story.tags} />
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-2 min-w-0">
              <Avatar name={story.author.name} src={story.author.avatar_url} size="xs" />
              <span className="truncate">
                <strong className="font-semibold text-zinc-900">{story.author.name}</strong>
                {story.author.batch && <span className="font-mono"> &apos;{story.author.batch.slice(-2)}</span>}
                <span className="text-zinc-400"> · {formatDate(story.created_at)}</span>
              </span>
            </span>
            <LikeButton liked={story.is_liked} count={story.like_count} onToggle={() => api.stories.like(story.id)} />
          </div>
        </div>
      </Card>
    </Link>
  );
}

export type FeedEntry = { kind: "news"; item: NewsArticle } | { kind: "story"; item: Story };

/** One row in the combined news + stories feed; the kind tag keeps the two apart at a glance. */
export function FeedCard({ entry }: { entry: FeedEntry }) {
  const isNews = entry.kind === "news";
  const { item } = entry;
  const href = isNews ? `/news/${item.id}` : `/stories/${item.id}`;
  const excerpt = isNews ? entry.item.summary || entry.item.content : entry.item.content;
  const image = item.image_url;
  const tags = isNews ? [titleCase(entry.item.category)] : splitTags(entry.item.tags).slice(0, 2);

  return (
    <Link href={href} className="block group">
      <Card hoverable className="overflow-hidden sm:flex">
        <Cover src={image} seed={`${isNews ? "news" : "story"}-${item.id}`} className="aspect-[16/9] sm:aspect-auto sm:w-52 md:w-60 shrink-0" />
        <div className="p-4 sm:p-5 flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span
              className={`inline-flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-full text-[11px] font-semibold ${
                isNews ? "bg-orange-100 text-orange-800" : "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200/70"
              }`}
            >
              {isNews ? <Newspaper size={11} /> : <BookOpen size={11} />}
              {isNews ? "News" : "Story"}
            </span>
            {isNews && entry.item.severity === "critical" && (
              <Badge variant="danger" size="sm">
                <AlertTriangle size={11} />
                Important
              </Badge>
            )}
            {tags.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[11px]">
                {isNews ? t : `#${t}`}
              </span>
            ))}
            <span className="text-zinc-400 font-mono text-[11px] ml-auto">{formatDate(item.created_at)}</span>
          </div>
          <h3 className="text-base font-semibold text-zinc-900 group-hover:text-orange-600 transition-colors leading-snug">{item.title}</h3>
          {excerpt && <p className="text-sm text-zinc-600 line-clamp-2 leading-relaxed whitespace-pre-line">{excerpt}</p>}
          <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center justify-between gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-2 min-w-0">
              <Avatar name={item.author.name} src={item.author.avatar_url} size="xs" />
              <span className="truncate">
                <strong className="font-semibold text-zinc-900">{item.author.name}</strong>
                {item.author.batch && <span className="font-mono"> &apos;{item.author.batch.slice(-2)}</span>}
              </span>
            </span>
            {entry.kind === "story" ? (
              <LikeButton liked={entry.item.is_liked} count={entry.item.like_count} onToggle={() => api.stories.like(entry.item.id)} />
            ) : (
              <span className="inline-flex items-center gap-1 font-medium text-orange-600 shrink-0">
                Read
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function EventCard({ event }: { event: EventItem }) {
  const past = isPast(event.datetime);
  return (
    <Link href={`/events/${event.id}`} className="block group">
      <Card hoverable className="overflow-hidden sm:flex">
        <Cover src={event.banner_url} seed={`event-${event.id}`} className="aspect-[16/9] sm:aspect-auto sm:w-56 shrink-0" />
        <div className="p-5 space-y-2 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono font-medium text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200/60 inline-flex items-center gap-1">
              <Calendar size={11} />
              {formatDateTime(event.datetime)}
            </span>
            {past && <Badge size="sm">Past</Badge>}
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-orange-600 transition-colors leading-snug">{event.title}</h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1">
              <MapPin size={13} className="text-zinc-400" />
              {event.location}
            </span>
            {event.max_participants && (
              <span className="inline-flex items-center gap-1">
                <Users size={13} className="text-zinc-400" />
                Up to {event.max_participants}
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-600 line-clamp-2 leading-relaxed">{event.description}</p>
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-3 text-xs text-zinc-500">
            <span className="min-w-0 truncate">
              Organised by <strong className="font-semibold text-zinc-900">{event.organizer.name}</strong>
            </span>
            <LikeButton liked={event.is_liked} count={event.like_count} onToggle={() => api.events.like(event.id)} />
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function SectionHeading({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
      {href && (
        <Link href={href} className="text-xs font-medium text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 group">
          {linkLabel ?? "See all"}
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
