"use client";

import Link from "next/link";
import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, MapPin, Users } from "lucide-react";
import { api } from "@/lib/api";
import { canManage, useAuth } from "@/lib/auth";
import { imageOr } from "@/lib/placeholder";
import { useApi } from "@/lib/useApi";
import { formatDate, formatTime, isPast } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LikeButton } from "@/components/ui/LikeButton";
import { OwnerActions } from "@/components/ui/OwnerActions";
import { ErrorBox, Loading } from "@/components/ui/States";
import { btnSecondary, pageCls } from "@/components/ui/styles";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number(use(params).id);
  const router = useRouter();
  const { user } = useAuth();
  const { data: event, error, loading, reload } = useApi(() => api.events.get(id), [id, user?.id]);

  return (
    <div className={pageCls}>
      <div className="flex items-center justify-between gap-3">
        <Link href="/events" className={btnSecondary}>
          <ArrowLeft size={14} />
          All events
        </Link>
        {event && canManage(user, event.created_by) && (
          <OwnerActions
            noun="event"
            editHref={`/events/new?id=${event.id}`}
            onDelete={async () => {
              await api.events.remove(event.id);
              router.push("/events");
            }}
          />
        )}
      </div>

      {loading ? (
        <Loading variant="detail" />
      ) : error ? (
        <ErrorBox error={error} onRetry={reload} />
      ) : (
        event && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <Card className="lg:col-span-8 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageOr(event.banner_url, `event-${event.id}`)} alt="" className="block w-full aspect-[2/1] object-cover bg-zinc-100" />
              <div className="p-6 sm:p-8 space-y-5">
                <div className="space-y-2">
                  {isPast(event.datetime) && <Badge size="sm">This event has ended</Badge>}
                  <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight leading-tight">{event.title}</h1>
                </div>
                <div className="flex items-center justify-between gap-3 pb-5 border-b border-zinc-100">
                  <span className="flex items-center gap-2 text-xs text-zinc-500 min-w-0">
                    <Avatar name={event.organizer.name} src={event.organizer.avatar_url} size="sm" />
                    <span className="min-w-0">
                      Organised by <strong className="text-zinc-900">{event.organizer.name}</strong>
                      {event.organizer.batch && <span className="font-mono"> ({event.organizer.batch})</span>}
                    </span>
                  </span>
                  <LikeButton size="md" liked={event.is_liked} count={event.like_count} onToggle={() => api.events.like(event.id)} />
                </div>
                <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">{event.description}</p>
              </div>
            </Card>

            <Card className="lg:col-span-4 p-5 space-y-4 text-xs">
              <h2 className="text-sm font-semibold text-zinc-900">Details</h2>
              <Detail icon={Calendar} label="Date" value={formatDate(event.datetime)} />
              <Detail icon={Clock} label="Time" value={formatTime(event.datetime)} />
              <Detail icon={MapPin} label="Venue" value={event.location} />
              {event.max_participants && <Detail icon={Users} label="Capacity" value={`Up to ${event.max_participants} people`} />}
            </Card>
          </div>
        )
      )}
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 pt-3 border-t border-zinc-100 first-of-type:border-0 first-of-type:pt-0">
      <Icon size={15} className="text-zinc-400 shrink-0 mt-0.5" />
      <div>
        <span className="text-zinc-400 font-mono uppercase text-[10px] block">{label}</span>
        <span className="font-semibold text-zinc-900">{value}</span>
      </div>
    </div>
  );
}
