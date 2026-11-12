"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/useApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { StoryCard } from "@/components/cards";
import { Pagination } from "@/components/ui/Pagination";
import { Empty, ErrorBox, Loading } from "@/components/ui/States";
import { SearchInput, Toolbar } from "@/components/ui/Toolbar";
import { btnPrimary, pageCls } from "@/components/ui/styles";

export default function StoriesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useApi(() => api.stories.list({ search, page, limit: 10 }), [search, page, user?.id]);

  return (
    <div className={pageCls}>
      <PageHeader
        tag="Stories"
        title="Alumni stories"
        description="Memories from school, career journeys and milestones, written by alumni."
        action={
          <Link href="/stories/new" className={btnPrimary}>
            <Plus size={14} />
            Write a story
          </Link>
        }
      />

      <Toolbar>
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search stories by title" />
      </Toolbar>

      <div className="max-w-4xl space-y-3.5">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorBox error={error} onRetry={reload} />
        ) : data!.stories.length === 0 ? (
          <Empty title={search ? "No stories match that search" : "No stories yet"} action={<Link href="/stories/new" className={btnPrimary}>Write one</Link>} />
        ) : (
          <>
            {data!.stories.map((s) => (
              <StoryCard key={s.id} story={s} />
            ))}
            <Pagination page={data!.page} limit={data!.limit} total={data!.total} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
