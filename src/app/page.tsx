"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, ArrowRight, Plus, MapPin, ShieldCheck, Compass, Calendar, Briefcase, Clock } from "lucide-react";
import { 
  CURRENT_USER, 
  MOCK_STORIES, 
  MOCK_EVENTS, 
  MOCK_JOBS, 
  MOCK_MEMBERS 
} from "@/lib/mockData";
import { Card } from "@/components/ui/Card";
import { Badge, StoryCategoryBadge, JobTypeBadge, HouseBadge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/layout/PageHeader";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = MOCK_MEMBERS.filter(m => 
    searchQuery.trim() !== "" && (
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.batch.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      
      {/* Standardized Header */}
      <PageHeader
        title="MANAVI Alumni"
        description="Updates, reunions, and opportunities across our verified network."
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/people"
              className="btn-press px-3.5 py-1.5 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 rounded-lg border border-zinc-200 shadow-xs"
            >
              Directory
            </Link>
            <Link
              href="/stories/new"
              className="btn-press inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs"
            >
              <Plus size={14} />
              Share Story
            </Link>
          </div>
        }
      />

      {/* Collegiate Campus Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link
          href="/people"
          className="group p-4 bg-white border border-zinc-200/80 rounded-xl hover:border-zinc-300 transition-all hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Verified Alumni</span>
            <ShieldCheck size={16} className="text-emerald-600 transition-transform duration-200 group-hover:scale-110" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 font-mono">84</div>
          <div className="mt-0.5 text-[11px] text-zinc-400 font-mono">Across 12 passing batches</div>
        </Link>
        <Link
          href="/people"
          className="group p-4 bg-white border border-zinc-200/80 rounded-xl hover:border-zinc-300 transition-all hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Campus Houses</span>
            <Compass size={16} className="text-orange-600 transition-transform duration-200 group-hover:scale-110" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 font-mono">4</div>
          <div className="mt-0.5 text-[11px] text-zinc-400 font-mono">Aravali • Nilgiri • Shivalik • Udaygiri</div>
        </Link>
        <Link
          href="/events"
          className="group p-4 bg-white border border-zinc-200/80 rounded-xl hover:border-zinc-300 transition-all hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Upcoming Meets</span>
            <Calendar size={16} className="text-blue-600 transition-transform duration-200 group-hover:scale-110" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 font-mono">{MOCK_EVENTS.length}</div>
          <div className="mt-0.5 text-[11px] text-zinc-400 font-mono">Winter reunions & city meetups</div>
        </Link>
        <Link
          href="/jobs"
          className="group p-4 bg-white border border-zinc-200/80 rounded-xl hover:border-zinc-300 transition-all hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Open Opportunities</span>
            <Briefcase size={16} className="text-amber-600 transition-transform duration-200 group-hover:scale-110" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 font-mono">{MOCK_JOBS.length}</div>
          <div className="mt-0.5 text-[11px] text-zinc-400 font-mono">Internal referrals & active roles</div>
        </Link>
      </div>

      {/* Global Search Bar */}
      <div className="bg-white border border-zinc-200/80 rounded-xl p-3 shadow-xs relative transition-shadow duration-150 focus-within:shadow-sm focus-within:border-zinc-300">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alumni by name, batch, city, or company..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50/60 hover:bg-white focus:bg-white border border-zinc-200 focus:border-orange-500 rounded-lg outline-none transition-all placeholder:text-zinc-400"
          />
        </div>

        {searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-zinc-200/80 rounded-xl shadow-dropdown p-2 z-20 max-h-72 overflow-y-auto animate-fade-in">
            {filteredMembers.length === 0 ? (
              <div className="p-3 text-xs text-zinc-400 text-center">
                No batchmates match "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-1">
                {filteredMembers.map((m) => (
                  <Link
                    key={m.id}
                    href={`/people/${m.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center text-xs font-semibold font-mono transition-transform group-hover:scale-105">
                        {m.initials}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-900 group-hover:text-orange-600 transition-colors">{m.name}</div>
                        <div className="text-xs text-zinc-500">{m.role} • {m.organisation}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {m.house && <HouseBadge house={m.house} size="sm" />}
                      <Badge variant="brand" size="sm">{m.batch}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Grid: 8 Cols (Left) / 4 Cols (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Column (8 cols): Recent Stories & News */}
        <section className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900">Recent Stories</h2>
            <Link
              href="/stories"
              className="text-xs font-medium text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 group transition-colors"
            >
              All stories
              <ArrowRight size={13} className="transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {MOCK_STORIES.map((story) => (
              <Card key={story.id} hoverable className="p-5 sm:p-6 space-y-2.5 bg-white group">
                <div className="flex items-center gap-2 text-xs">
                  <StoryCategoryBadge type={story.type} size="sm" />
                  <span className="text-zinc-400 font-mono">{story.publishedAt}</span>
                  <span className="text-zinc-300">•</span>
                  <span className="text-zinc-400 flex items-center gap-1 font-mono text-[11px]">
                    <Clock size={11} className="text-zinc-400" />
                    {story.readTime}
                  </span>
                </div>

                <Link href="/stories" className="block">
                  <h3 className="text-base font-semibold text-zinc-900 group-hover:text-orange-600 transition-colors leading-snug">
                    {story.title}
                  </h3>
                </Link>

                <p className="text-sm text-zinc-600 line-clamp-2 leading-relaxed">
                  {story.excerpt}
                </p>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                  <span>
                    By <strong className="font-semibold text-zinc-900">{story.author.name}</strong> ({story.author.batch})
                  </span>
                  <span className="text-orange-600 font-medium inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
                    Read article
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Right Column (4 cols): Events & Jobs */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Upcoming Events */}
          <Card className="p-5 space-y-4 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
                <Calendar size={14} className="text-orange-600" />
                Reunions & Meets
              </h3>
              <Link href="/events" className="text-xs text-orange-600 hover:underline font-medium transition-colors">
                View all
              </Link>
            </div>

            <div className="space-y-3.5 divide-y divide-zinc-100">
              {MOCK_EVENTS.map((event, idx) => (
                <div key={event.id} className={idx > 0 ? "pt-3.5" : ""}>
                  <div className="text-[11px] font-mono text-orange-700 font-medium">
                    {event.date}
                  </div>
                  <Link href={`/events/${event.id}`}>
                    <h4 className="text-sm font-semibold text-zinc-900 hover:text-orange-600 transition-colors mt-0.5 leading-snug">
                      {event.title}
                    </h4>
                  </Link>
                  <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                    <MapPin size={12} className="text-zinc-400 shrink-0" />
                    <span>{event.venue}</span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-mono text-[11px]">{event.goingCount} attending</span>
                    <Link
                      href={`/events/${event.id}`}
                      className="btn-press px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors"
                    >
                      RSVP
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Jobs Board */}
          <Card className="p-5 space-y-4 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
                <Briefcase size={14} className="text-orange-600" />
                Alumni Job Board
              </h3>
              <Link href="/jobs" className="text-xs text-orange-600 hover:underline font-medium transition-colors">
                View all
              </Link>
            </div>

            <div className="space-y-3 divide-y divide-zinc-100">
              {MOCK_JOBS.map((job, idx) => (
                <div key={job.id} className={idx > 0 ? "pt-3" : ""}>
                  <div className="flex items-center justify-between gap-2">
                    <Link href="/jobs" className="text-sm font-medium text-zinc-900 hover:text-orange-600 transition-colors truncate">
                      {job.title}
                    </Link>
                    <JobTypeBadge type={job.type} size="sm" />
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {job.company} • {job.city}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                href="/jobs/new"
                className="btn-press w-full py-2 text-xs font-medium text-center text-zinc-700 bg-zinc-50 hover:bg-zinc-100 rounded-lg block border border-zinc-200"
              >
                Post an Opportunity
              </Link>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
