"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Clock, Phone, Plus, Users } from "lucide-react";
import { api, TRANSIT_TYPES, type TransitType } from "@/lib/api";
import { canManage, useAuth } from "@/lib/auth";
import { useApi } from "@/lib/useApi";
import { timeAgo, titleCase } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { OwnerActions } from "@/components/ui/OwnerActions";
import { Pagination } from "@/components/ui/Pagination";
import { Empty, ErrorBox, Loading } from "@/components/ui/States";
import { FilterChips, SearchInput, Toolbar } from "@/components/ui/Toolbar";
import { btnPrimary, pageCls } from "@/components/ui/styles";

const TYPE_OPTIONS = [{ id: "all", label: "All" }, ...TRANSIT_TYPES.map((t) => ({ id: t, label: titleCase(t) }))] as const;

export default function TransitPage() {
  const { user } = useAuth();
  const [type, setType] = useState<TransitType | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, error, loading, reload, setData } = useApi(
    () => api.transit.list({ transit_type: type === "all" ? undefined : type, search, page, limit: 10 }),
    [type, search, page],
  );

  return (
    <div className={pageCls}>
      <PageHeader
        tag="Transit"
        title="Carpools & rides"
        description="Share a ride to work, to a reunion or back to campus."
        action={
          <Link href="/transit/new" className={btnPrimary}>
            <Plus size={14} />
            Offer a ride
          </Link>
        }
      />

      <Toolbar>
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search title, from or to" />
        <FilterChips options={TYPE_OPTIONS} value={type} onChange={(v) => { setType(v); setPage(1); }} />
      </Toolbar>

      <div className="max-w-4xl space-y-3">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorBox error={error} onRetry={reload} />
        ) : data!.listings.length === 0 ? (
          <Empty title="No rides listed" action={<Link href="/transit/new" className={btnPrimary}>Offer one</Link>} />
        ) : (
          <>
            {data!.listings.map((t) => (
              <Card key={t.id} className="p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="brand" size="sm">{titleCase(t.transit_type)}</Badge>
                      <span className="text-[11px] text-zinc-400 font-mono">{timeAgo(t.created_at)}</span>
                    </div>
                    <h2 className="text-base font-semibold text-zinc-900 leading-snug">{t.title}</h2>
                  </div>
                  {canManage(user, t.created_by) && (
                    <OwnerActions
                      noun="ride"
                      editHref={`/transit/new?id=${t.id}`}
                      onDelete={async () => {
                        await api.transit.remove(t.id);
                        setData((prev) => prev && { ...prev, total: prev.total - 1, listings: prev.listings.filter((x) => x.id !== t.id) });
                      }}
                    />
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                  <span>{t.from_location}</span>
                  <ArrowRight size={14} className="text-orange-600 shrink-0" />
                  <span>{t.to_location}</span>
                </div>

                {t.description && <p className="text-sm text-zinc-600 leading-relaxed">{t.description}</p>}

                <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-zinc-600">
                  {t.schedule && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={13} className="text-zinc-400" />
                      {t.schedule}
                    </span>
                  )}
                  {t.available_seats !== null && (
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={13} className="text-zinc-400" />
                      {t.available_seats} {t.available_seats === 1 ? "seat" : "seats"} free
                    </span>
                  )}
                  {(t.contact_name || t.contact_info) && (
                    <span className="inline-flex items-center gap-1.5 font-medium text-zinc-900">
                      <Phone size={13} className="text-orange-600" />
                      {[t.contact_name, t.contact_info].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </div>
              </Card>
            ))}
            <Pagination page={data!.page} limit={data!.limit} total={data!.total} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
