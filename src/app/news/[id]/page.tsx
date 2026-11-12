"use client";

import Link from "next/link";
import { use } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { api, mediaUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/useApi";
import { formatDate, titleCase } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { OwnerActions } from "@/components/ui/OwnerActions";
import { ErrorBox, Loading } from "@/components/ui/States";
import { btnSecondary, pageCls } from "@/components/ui/styles";

export default function NewsArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number(use(params).id);
  const router = useRouter();
  const { user } = useAuth();
  const { data: article, error, loading, reload } = useApi(() => api.news.get(id), [id, user?.id]);

  return (
    <div className={pageCls}>
      <div className="flex items-center justify-between gap-3">
        <Link href="/news" className={btnSecondary}>
          <ArrowLeft size={14} />
          All news
        </Link>
        {article && user?.is_admin && (
          <OwnerActions
            noun="article"
            editHref={`/news/new?id=${article.id}`}
            onDelete={async () => {
              await api.news.remove(article.id);
              router.push("/news");
            }}
          />
        )}
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox error={error} onRetry={reload} />
      ) : (
        article && (
          <Card className="max-w-3xl overflow-hidden">
            {mediaUrl(article.image_url) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(article.image_url)!} alt="" className="w-full max-h-[360px] object-cover" />
            )}
            <article className="p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {article.severity === "critical" && (
                  <Badge variant="danger" size="sm">
                    <AlertTriangle size={11} />
                    Important
                  </Badge>
                )}
                <Badge size="sm">{titleCase(article.category)}</Badge>
                {!article.is_published && <Badge variant="dark" size="sm">Draft</Badge>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight leading-tight">{article.title}</h1>
              {article.summary && <p className="text-base text-zinc-600 leading-relaxed">{article.summary}</p>}
              <div className="flex items-center gap-2 text-xs text-zinc-500 pb-4 border-b border-zinc-100">
                <Avatar name={article.author.name} src={article.author.avatar_url} size="xs" />
                <span>
                  {article.author.name} · {formatDate(article.created_at)}
                  {article.updated_at && ` · updated ${formatDate(article.updated_at)}`}
                </span>
              </div>
              <div className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line">{article.content}</div>
            </article>
          </Card>
        )
      )}
    </div>
  );
}
