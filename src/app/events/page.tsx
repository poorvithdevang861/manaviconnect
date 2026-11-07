"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, MapPin, Clock, Calendar, Users, Globe, ShieldCheck } from "lucide-react";
import { MOCK_EVENTS, EventItem } from "@/lib/mockData";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/layout/PageHeader";

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>(MOCK_EVENTS);

  const handleRsvp = (eventId: string, answer: "going" | "maybe" | "not_going") => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        const prevAnswer = ev.userRsvp;
        let newGoing = ev.goingCount;
        let newMaybe = ev.maybeCount;

        if (prevAnswer === "going") newGoing--;
        if (prevAnswer === "maybe") newMaybe--;

        if (answer === "going") newGoing++;
        if (answer === "maybe") newMaybe++;

        return {
          ...ev,
          userRsvp: answer,
          goingCount: newGoing,
          maybeCount: newMaybe,
        };
      })
    );
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      
      {/* Standardized Page Header */}
      <PageHeader
        tag="Events"
        meta="Alumni Meets"
        title="Upcoming Events"
        description="Campus annual days, regional chapter gatherings, and batch milestones."
        action={
          <Link
            href="/events/new"
            className="btn-press inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs shrink-0"
          >
            <Plus size={14} />
            Host Event
          </Link>
        }
      />

      {/* 2-Column Split: 8 cols (Left) / 4 cols (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Column (8 cols): Events Timeline */}
        <div className="lg:col-span-8 space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="p-6 bg-white group" hoverable>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                
                {/* Event Content */}
                <div className="space-y-2.5 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-medium text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200/60 inline-flex items-center gap-1">
                      <Calendar size={11} className="shrink-0" />
                      {event.date}
                    </span>
                    <span className="text-zinc-500 font-mono flex items-center gap-1">
                      <Clock size={12} className="shrink-0" />
                      {event.time}
                    </span>
                    <Badge variant="neutral" size="sm">
                      {event.audience === "batch" ? (
                        <>
                          <Users size={11} className="shrink-0" />
                          Batch Only
                        </>
                      ) : (
                        <>
                          <Globe size={11} className="shrink-0" />
                          All Alumni
                        </>
                      )}
                    </Badge>
                  </div>

                  <Link href={`/events/${event.id}`}>
                    <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-orange-600 transition-colors leading-snug">
                      {event.title}
                    </h2>
                  </Link>

                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <MapPin size={13} className="text-zinc-400 shrink-0" />
                    <span>{event.venue} • {event.city}</span>
                  </div>

                  <p className="text-sm text-zinc-600 leading-relaxed pt-1">
                    {event.description}
                  </p>

                  <div className="text-xs text-zinc-400 font-mono pt-1">
                    Hosted by {event.host.name} ({event.host.batch})
                  </div>
                </div>

                {/* RSVP Action Box */}
                <div className="p-4 bg-zinc-50/70 rounded-xl border border-zinc-200/80 shrink-0 min-w-[200px] text-center space-y-3">
                  <div className="text-xs">
                    <span className="font-mono text-base font-semibold text-zinc-900">
                      {event.goingCount}
                    </span>
                    <span className="text-zinc-500 ml-1">attending</span>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleRsvp(event.id, "going")}
                      className={`btn-press px-3.5 py-1.5 rounded-lg text-xs font-medium ${
                        event.userRsvp === "going"
                          ? "bg-orange-600 text-white shadow-xs"
                          : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      Going
                    </button>
                    <button
                      onClick={() => handleRsvp(event.id, "maybe")}
                      className={`btn-press px-3.5 py-1.5 rounded-lg text-xs font-medium ${
                        event.userRsvp === "maybe"
                          ? "bg-zinc-800 text-white"
                          : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      Maybe
                    </button>
                  </div>

                  <Link
                    href={`/events/${event.id}`}
                    className="text-[11px] text-orange-600 hover:text-orange-700 font-medium block pt-1 transition-colors"
                  >
                    View details & Q&A
                  </Link>
                </div>

              </div>
            </Card>
          ))}
        </div>

        {/* Right Column (4 cols): Chapter Info & Guidelines */}
        <div className="lg:col-span-4 space-y-4">
          
          <Card className="p-5 space-y-3 bg-white">
            <h3 className="text-sm font-semibold text-zinc-900">Hosting a Gathering</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Any verified member can host a batch meetup or local city chapter connect.
            </p>
            <div className="pt-2 border-t border-zinc-100 text-xs space-y-2 text-zinc-600">
              <div>
                <strong className="text-zinc-900 block">1. Campus Permissions</strong>
                <span className="text-[11px]">For gatherings on school grounds, contact batch admin for dormitory & guest house clearance.</span>
              </div>
              <div>
                <strong className="text-zinc-900 block">2. RSVP Tracking</strong>
                <span className="text-[11px]">Attendee lists update in real time to coordinate catering and transport.</span>
              </div>
            </div>
            <Link
              href="/events/new"
              className="btn-press mt-3 w-full py-2 text-xs font-medium text-center text-orange-700 bg-orange-50 hover:bg-orange-100/70 rounded-lg block border border-orange-200/80"
            >
              Schedule New Meet
            </Link>
          </Card>

          <div className="p-4 bg-white border border-zinc-200/80 rounded-xl text-xs text-zinc-600 flex items-start gap-2.5 shadow-xs">
            <ShieldCheck size={16} className="text-orange-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-900">Private Alumni Events</span>
              <p className="text-zinc-600 mt-0.5 leading-relaxed text-[11px]">
                Reunion locations and discussion threads are accessible only to verified alumni of MANAVI.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
