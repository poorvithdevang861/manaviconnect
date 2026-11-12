"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/useApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { EventCard } from "@/components/cards";
import { Pagination } from "@/components/ui/Pagination";
import { Empty, ErrorBox, Loading } from "@/components/ui/States";
import { FilterChips, SearchInput, Toolbar } from "@/components/ui/Toolbar";
import { btnPrimary, pageCls } from "@/components/ui/styles";

const WHEN = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
] as const;

export default function EventsPage() {
  const { user } = useAuth();
  const [when, setWhen] = useState<"upcoming" | "past">("upcoming");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, error, loading, reload } = useApi(
    () => api.events.list({ type: when, search, page, limit: 10 }),
    [when, search, page, user?.id],
  );

  return (
    <div className={pageCls}>
      <PageHeader
        tag="Events"
        title="Events"
        description="Reunions, chapter meetups and campus days."
        action={
          <Link href="/events/new" className={btnPrimary}>
            <Plus size={14} />
            Host an event
          </Link>
        }
      />

      <Toolbar>
        <FilterChips options={WHEN} value={when} onChange={(v) => { setWhen(v); setPage(1); }} />
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search events by title" />
      </Toolbar>

      <div className="max-w-4xl space-y-3.5 stagger">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorBox error={error} onRetry={reload} />
        ) : data!.events.length === 0 ? (
          <Empty
            title={when === "upcoming" ? "No upcoming events" : "No past events"}
            action={when === "upcoming" && <Link href="/events/new" className={btnPrimary}>Host one</Link>}
          >
            {search ? "Nothing matches that search." : undefined}
          </Empty>
        ) : (
          <>
            {data!.events.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
            <Pagination page={data!.page} limit={data!.limit} total={data!.total} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
