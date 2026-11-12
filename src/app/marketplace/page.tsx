"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { api, MARKET_CATEGORIES, type MarketCategory } from "@/lib/api";
import { imageOr } from "@/lib/placeholder";
import { useApi } from "@/lib/useApi";
import { formatPrice, timeAgo, titleCase } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { Empty, ErrorBox, Loading } from "@/components/ui/States";
import { FilterChips, SearchInput, Toolbar } from "@/components/ui/Toolbar";
import { btnPrimary, pageCls } from "@/components/ui/styles";

const CATEGORY_OPTIONS = [{ id: "all", label: "All" }, ...MARKET_CATEGORIES.map((c) => ({ id: c, label: titleCase(c) }))] as const;

export default function MarketplacePage() {
  const [category, setCategory] = useState<MarketCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useApi(
    () => api.marketplace.list({ category: category === "all" ? undefined : category, search, page, limit: 12 }),
    [category, search, page],
  );

  return (
    <div className={pageCls}>
      <PageHeader
        tag="Marketplace"
        title="Marketplace"
        description="Buy from and sell to fellow alumni: farm produce, goods and services."
        action={
          <Link href="/marketplace/new" className={btnPrimary}>
            <Plus size={14} />
            List something
          </Link>
        }
      />

      <Toolbar>
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search title, description or tags" />
        <FilterChips options={CATEGORY_OPTIONS} value={category} onChange={(v) => { setCategory(v); setPage(1); }} />
      </Toolbar>

      {loading ? (
        <Loading variant="grid" />
      ) : error ? (
        <ErrorBox error={error} onRetry={reload} />
      ) : data!.listings.length === 0 ? (
        <Empty title="Nothing listed here yet" action={<Link href="/marketplace/new" className={btnPrimary}>Create a listing</Link>} />
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
            {data!.listings.map((item) => (
              <li key={item.id}>
                <Link href={`/marketplace/${item.id}`} className="block group h-full">
                  <Card hoverable className="overflow-hidden h-full flex flex-col">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageOr(item.image_url, `market-${item.id}`)} alt="" loading="lazy" className="block w-full aspect-[4/3] object-cover bg-zinc-100" />
                    <div className="p-4 space-y-1.5 flex-1 flex flex-col">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-base font-semibold text-zinc-900 font-mono">{formatPrice(item.price)}</span>
                        <Badge size="sm">{titleCase(item.category)}</Badge>
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-orange-600 leading-snug">{item.title}</h3>
                      <p className="text-xs text-zinc-600 line-clamp-2">{item.description}</p>
                      <div className="mt-auto pt-2 flex items-center justify-between gap-2 text-[11px] text-zinc-400">
                        <span className="inline-flex items-center gap-1 min-w-0">
                          {item.location && (
                            <>
                              <MapPin size={11} className="shrink-0" />
                              <span className="truncate">{item.location}</span>
                            </>
                          )}
                        </span>
                        <span className="shrink-0">{timeAgo(item.created_at)}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
          <Pagination page={data!.page} limit={data!.limit} total={data!.total} onChange={setPage} />
        </>
      )}
    </div>
  );
}
