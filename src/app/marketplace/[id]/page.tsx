"use client";

import Link from "next/link";
import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Store } from "lucide-react";
import { api, mediaUrl } from "@/lib/api";
import { canManage, useAuth } from "@/lib/auth";
import { useApi } from "@/lib/useApi";
import { formatDate, formatPrice, titleCase } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, Tags } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { OwnerActions } from "@/components/ui/OwnerActions";
import { ErrorBox, Loading } from "@/components/ui/States";
import { btnSecondary, pageCls } from "@/components/ui/styles";

export default function MarketListingPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number(use(params).id);
  const router = useRouter();
  const { user } = useAuth();
  const { data: item, error, loading, reload } = useApi(() => api.marketplace.get(id), [id]);

  return (
    <div className={pageCls}>
      <div className="flex items-center justify-between gap-3">
        <Link href="/marketplace" className={btnSecondary}>
          <ArrowLeft size={14} />
          Marketplace
        </Link>
        {item && canManage(user, item.created_by) && (
          <OwnerActions
            noun="listing"
            editHref={`/marketplace/new?id=${item.id}`}
            onDelete={async () => {
              await api.marketplace.remove(item.id);
              router.push("/marketplace");
            }}
          />
        )}
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox error={error} onRetry={reload} />
      ) : (
        item && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <Card className="lg:col-span-7 overflow-hidden">
              <div className="aspect-[4/3] bg-zinc-100 flex items-center justify-center">
                {mediaUrl(item.image_url) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(item.image_url)!} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Store size={40} className="text-zinc-300" />
                )}
              </div>
            </Card>

            <Card className="lg:col-span-5 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Badge size="sm">{titleCase(item.category)}</Badge>
                <span className="text-[11px] text-zinc-400 font-mono">Listed {formatDate(item.created_at)}</span>
              </div>
              <h1 className="text-xl font-semibold text-zinc-900 leading-snug">{item.title}</h1>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold font-mono text-zinc-900">{formatPrice(item.price)}</span>
                {item.is_negotiable && <span className="text-xs text-zinc-500">Negotiable</span>}
              </div>
              {item.location && (
                <p className="text-xs text-zinc-600 flex items-center gap-1.5">
                  <MapPin size={13} className="text-zinc-400" />
                  {item.location}
                </p>
              )}
              <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">{item.description}</p>
              <Tags tags={item.tags} />

              <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-lg space-y-3">
                <div className="flex items-center gap-2.5 text-xs">
                  <Avatar name={item.poster.name} src={item.poster.avatar_url} size="sm" />
                  <span>
                    Sold by <strong className="text-zinc-900">{item.poster.name}</strong>
                    {item.poster.batch && <span className="text-zinc-500 font-mono"> · Batch of {item.poster.batch}</span>}
                  </span>
                </div>
                {item.contact_info && (
                  <p className="text-sm font-medium text-zinc-900 flex items-center gap-2">
                    <Phone size={14} className="text-orange-600" />
                    {item.contact_info}
                  </p>
                )}
              </div>
            </Card>
          </div>
        )
      )}
    </div>
  );
}
