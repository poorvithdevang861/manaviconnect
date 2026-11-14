"use client";

import Link from "next/link";
import { useState } from "react";
import { IconCalendarEvent, IconHistory, IconPlus } from "@tabler/icons-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/useApi";
import { EventCard } from "@/components/cards";
import { Pagination } from "@/components/ui/Pagination";
import { Empty, ErrorBox, Loading } from "@/components/ui/States";
import { Tabs } from "@/components/ui/Tabs";
import { SearchInput } from "@/components/ui/Toolbar";
import { btnPrimary, pageMediumCls } from "@/components/ui/styles";

export default function EventsPage() {
  const { user } = useAuth();
  const [when, setWhen] = useState<"upcoming" | "past">("upcoming");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const totals = useApi(async () => {
    const [up, past] = await Promise.all([
      api.events.list({ type: "upcoming", limit: 1 }),
      api.events.list({ type: "past", limit: 1 }),
    ]);
    return { upcoming: up.total, past: past.total };
  }, [user?.id]);

  const { data, error, loading, reload } = useApi(
    () => api.events.list({ type: when, search, page, limit: 10 }),
    [when, search, page, user?.id],
  );

  return (
    <div className={pageMediumCls}>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Tabs
          idBase="events"
          label="Events timeline"
          value={when}
          onChange={(v) => {
            setWhen(v);
            setPage(1);
          }}
          tabs={[
            { id: "upcoming", label: "Upcoming", icon: IconCalendarEvent, count: totals.data?.upcoming },
            { id: "past", label: "Past", icon: IconHistory, count: totals.data?.past },
          ]}
        />

        <div className="flex items-center gap-2.5 ml-auto w-full sm:w-auto">
          <SearchInput
            className="w-full sm:w-56 lg:w-64"
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search events by title"
          />
          <Link href="/events/new" className={`${btnPrimary} shrink-0`}>
            <IconPlus size={15} stroke={1.6} />
            Host an event
          </Link>
        </div>
      </div>

      <div className="space-y-3.5 stagger">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorBox error={error} onRetry={reload} />
        ) : data!.events.length === 0 ? (
          <Empty
            title={when === "upcoming" ? "No upcoming events" : "No past events"}
            action={when === "upcoming" && <Link href="/events/new" className={btnPrimary}>Host one</Link>}
          >
            {search ? "Nothing matches that search." : when === "upcoming" ? "Plan a reunion or chapter meetup for fellow alumni." : undefined}
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
