"use client";

import Link from "next/link";
import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { canManage, useAuth } from "@/lib/auth";
import { imageOr } from "@/lib/placeholder";
import { useApi } from "@/lib/useApi";
import { formatDate } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Tags } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LikeButton } from "@/components/ui/LikeButton";
import { OwnerActions } from "@/components/ui/OwnerActions";
import { ErrorBox, Loading } from "@/components/ui/States";
import { btnSecondary, pageCls } from "@/components/ui/styles";

export default function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number(use(params).id);
  const router = useRouter();
  const { user } = useAuth();
  const { data: story, error, loading, reload } = useApi(() => api.stories.get(id), [id, user?.id]);

  return (
    <div className={pageCls}>
      <div className="flex items-center justify-between gap-3">
        <Link href="/stories" className={btnSecondary}>
          <ArrowLeft size={14} />
          All stories
        </Link>
        {story && canManage(user, story.created_by) && (
          <OwnerActions
            noun="story"
            editHref={`/stories/new?id=${story.id}`}
            onDelete={async () => {
              await api.stories.remove(story.id);
              router.push("/stories");
            }}
          />
        )}
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox error={error} onRetry={reload} />
      ) : (
        story && (
          <Card className="max-w-3xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageOr(story.image_url, `story-${story.id}`)} alt="" className="block w-full aspect-[2/1] object-cover bg-zinc-100" />
            <article className="p-6 sm:p-8 space-y-5">
              <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight leading-tight">{story.title}</h1>
              <div className="flex items-center justify-between gap-3 pb-5 border-b border-zinc-100">
                <span className="flex items-center gap-2.5 text-xs text-zinc-500 min-w-0">
                  <Avatar name={story.author.name} src={story.author.avatar_url} size="md" />
                  <span className="min-w-0">
                    <strong className="block text-sm text-zinc-900">{story.author.name}</strong>
                    {[story.author.batch && `Batch of ${story.author.batch}`, formatDate(story.created_at)].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <LikeButton size="md" liked={story.is_liked} count={story.like_count} onToggle={() => api.stories.like(story.id)} />
              </div>
              <div className="text-[15px] text-zinc-800 leading-relaxed whitespace-pre-line">{story.content}</div>
              <Tags tags={story.tags} />
            </article>
          </Card>
        )
      )}
    </div>
  );
}
