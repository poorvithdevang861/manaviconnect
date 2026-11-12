"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { FileText, MessageCircle, Paperclip, Plus } from "lucide-react";
import { api, mediaUrl, type TimelineEntry } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { errorText, useApi } from "@/lib/useApi";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Comments } from "@/components/timeline/Comments";
import { Card } from "@/components/ui/Card";
import { LikeButton } from "@/components/ui/LikeButton";
import { OwnerActions } from "@/components/ui/OwnerActions";
import { Empty, ErrorBox, Loading } from "@/components/ui/States";
import { btnPrimary, btnSecondary, chipCls, pageCls } from "@/components/ui/styles";

const isPdf = (url: string) => url.startsWith("data:application/pdf") || /\.pdf($|\?)/i.test(url);

export default function TimelinePage() {
  const { user } = useAuth();
  const [year, setYear] = useState<number | null>(null);
  const [years, setYears] = useState<number[]>([]);
  const { data, error, loading, reload, setData } = useApi(async () => {
    const res = await api.timeline.list(year ? { year } : {});
    if (!year) setYears([...new Set(res.entries.map((e) => Number(e.entry_date.slice(0, 4))))].sort((a, b) => b - a));
    return res;
  }, [year, user?.id]);

  const replace = (entry: TimelineEntry) =>
    setData((prev) => prev && { ...prev, entries: prev.entries.map((e) => (e.id === entry.id ? entry : e)) });

  const remove = (id: number) => setData((prev) => prev && { total: prev.total - 1, entries: prev.entries.filter((e) => e.id !== id) });

  return (
    <div className={pageCls}>
      <PageHeader
        tag="Timeline"
        title="Our history"
        description="Milestones from the school's founding to today. Add photos or documents you have."
        action={
          <Link href="/timeline/new" className={btnPrimary}>
            <Plus size={14} />
            Add a milestone
          </Link>
        }
      />

      {years.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Filter by year">
          <button type="button" className={chipCls(year === null)} onClick={() => setYear(null)}>
            All years
          </button>
          {years.map((y) => (
            <button key={y} type="button" className={chipCls(year === y)} onClick={() => setYear(y)}>
              {y}
            </button>
          ))}
        </div>
      )}

      <div className="max-w-3xl">
        {loading && !data ? (
          <Loading />
        ) : error ? (
          <ErrorBox error={error} onRetry={reload} />
        ) : data!.entries.length === 0 ? (
          <Empty title="No milestones yet" action={<Link href="/timeline/new" className={btnPrimary}>Add the first one</Link>} />
        ) : (
          <ol className="relative border-l-2 border-orange-200 ml-3 space-y-6">
            {data!.entries.map((entry) => (
              <TimelineItem key={entry.id} entry={entry} onChange={replace} onDeleted={() => remove(entry.id)} />
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function TimelineItem({ entry, onChange, onDeleted }: { entry: TimelineEntry; onChange: (e: TimelineEntry) => void; onDeleted: () => void }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(entry.comment_count);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const attach = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      onChange(await api.timeline.addPhotos(entry.id, [...files]));
    } catch (err) {
      window.alert(errorText(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <li className="pl-6 relative">
      <span className="absolute -left-[7px] top-5 w-3 h-3 rounded-full bg-orange-600 ring-4 ring-[#fafafa]" aria-hidden />
      <Card className="p-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <div className="min-w-0 flex-1 basis-48">
            <time className="text-xs font-mono font-medium text-orange-700">{formatDate(entry.entry_date)}</time>
            <h2 className="text-base font-semibold text-zinc-900 leading-snug mt-0.5">{entry.title}</h2>
          </div>
          {user?.is_admin && (
            <OwnerActions
              noun="milestone"
              editHref={`/timeline/new?id=${entry.id}`}
              onDelete={async () => {
                await api.timeline.remove(entry.id);
                onDeleted();
              }}
            />
          )}
        </div>
        <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">{entry.content}</p>

        {entry.photos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {entry.photos.map((p, i) => {
              const url = mediaUrl(p)!;
              return isPdf(url) ? (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-lg border border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center gap-1 text-[11px] text-zinc-600 hover:border-orange-300">
                  <FileText size={20} className="text-zinc-400" />
                  PDF
                </a>
              ) : (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" loading="lazy" className="block w-full aspect-square rounded-lg object-cover border border-zinc-200 bg-zinc-100 hover:opacity-90" />
                </a>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <LikeButton liked={entry.is_liked} count={entry.like_count} onToggle={() => api.timeline.like(entry.id)} />
          <button type="button" onClick={() => setShowComments((s) => !s)} aria-expanded={showComments} className={btnSecondary}>
            <MessageCircle size={12} />
            {commentCount} {commentCount === 1 ? "comment" : "comments"}
          </button>
          {user && (
            <>
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className={btnSecondary}>
                <Paperclip size={12} />
                {uploading ? "Uploading…" : "Add photos or PDFs"}
              </button>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => {
                  attach(e.target.files);
                  e.target.value = "";
                }}
              />
            </>
          )}
          <span className="sm:ml-auto basis-full sm:basis-auto text-[11px] text-zinc-400">Added by {entry.author.name}</span>
        </div>

        {showComments && <Comments entryId={entry.id} onCountChange={(d) => setCommentCount((c) => c + d)} />}
      </Card>
    </li>
  );
}
