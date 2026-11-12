"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { api, NEWS_CATEGORIES, type NewsCategory } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/useApi";
import { titleCase } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { NewsCard } from "@/components/cards";
import { Pagination } from "@/components/ui/Pagination";
import { Empty, ErrorBox, Loading } from "@/components/ui/States";
import { FilterChips, SearchInput, Toolbar } from "@/components/ui/Toolbar";
import { btnPrimary, btnSecondary, pageCls } from "@/components/ui/styles";

const CATEGORY_OPTIONS = [{ id: "all", label: "All" }, ...NEWS_CATEGORIES.map((c) => ({ id: c, label: titleCase(c) }))] as const;

export default function NewsPage() {
  const { user } = useAuth();
  const [category, setCategory] = useState<NewsCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, error, loading, reload } = useApi(
    () => api.news.list({ category: category === "all" ? undefined : category, search, page, limit: 10 }),
    [category, search, page],
  );

  return (
    <div className={pageCls}>
      <PageHeader
        tag="News"
        title="Announcements & updates"
        description="Official news from the alumni association and the school."
        action={
          user?.is_admin && (
            <>
              <Link href="/admin#drafts" className={btnSecondary}>
                Drafts
              </Link>
              <Link href="/news/new" className={btnPrimary}>
                <Plus size={14} />
                Write article
              </Link>
            </>
          )
        }
      />

      <Toolbar>
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search news by title" />
        <FilterChips options={CATEGORY_OPTIONS} value={category} onChange={(v) => { setCategory(v); setPage(1); }} />
      </Toolbar>

      <div className="max-w-4xl space-y-3.5 stagger">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorBox error={error} onRetry={reload} />
        ) : data!.articles.length === 0 ? (
          <Empty title="No articles found">Try a different category or search.</Empty>
        ) : (
          <>
            {data!.articles.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
            <Pagination page={data!.page} limit={data!.limit} total={data!.total} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
