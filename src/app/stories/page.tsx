"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Plus, 
  ArrowRight, 
  Layers, 
  Newspaper, 
  Trophy, 
  BookOpen, 
  FileText 
} from "lucide-react";
import { MOCK_STORIES } from "@/lib/mockData";
import { Card } from "@/components/ui/Card";
import { StoryCategoryBadge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/layout/PageHeader";

const STORY_FILTER_TABS = [
  { id: "all", label: "All Stories", icon: Layers },
  { id: "news", label: "News", icon: Newspaper },
  { id: "achievement", label: "Achievements", icon: Trophy },
  { id: "memoir", label: "Memoirs", icon: BookOpen },
  { id: "general", label: "General", icon: FileText },
] as const;

export default function StoriesPage() {
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredStories = MOCK_STORIES.filter(
    (s) => selectedType === "all" || s.type === selectedType
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      
      {/* Standardized Page Header */}
      <PageHeader
        tag="Dispatches"
        meta="Archive"
        title="Alumni Stories & News"
        description="Campus memories, achievements, and batch dispatches."
        action={
          <Link
            href="/stories/new"
            className="btn-press inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs shrink-0"
          >
            <Plus size={14} />
            Write Story
          </Link>
        }
      />

      {/* Filter Tabs with Icons */}
      <div className="flex items-center gap-1.5 border-b border-zinc-200/80 pb-2.5 overflow-x-auto">
        {STORY_FILTER_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`chip-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                isActive
                  ? "bg-orange-50 text-orange-700 border border-orange-200/70 shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 border border-transparent"
              }`}
            >
              <Icon size={13} className="shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Column (8 cols): Stories */}
        <div className="lg:col-span-8 space-y-3.5">
          {filteredStories.map((story) => (
            <Card key={story.id} className="p-5 sm:p-6 space-y-2.5 bg-white group" hoverable>
              <div className="flex items-center gap-2 text-xs">
                <StoryCategoryBadge type={story.type} size="sm" />
                <span className="text-zinc-400 font-mono">{story.publishedAt}</span>
                <span className="text-zinc-300">•</span>
                <span className="text-zinc-400">{story.readTime}</span>
              </div>

              <Link href="/stories" className="block">
                <h2 className="text-base sm:text-lg font-semibold text-zinc-900 group-hover:text-orange-600 transition-colors leading-snug">
                  {story.title}
                </h2>
              </Link>

              <p className="text-sm text-zinc-600 leading-relaxed">
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

        {/* Right Column (4 cols): Guidelines */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 space-y-3 bg-white">
            <h3 className="text-sm font-semibold text-zinc-900">About Dispatches</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Stories and dispatches chronicle achievements, alumni memoirs, and campus reunions.
            </p>
            <div className="pt-2 border-t border-zinc-100 text-xs space-y-2 text-zinc-600">
              <div>
                <strong className="text-zinc-900 block">Achievements</strong>
                <span className="text-[11px]">Milestones, awards, publications, and enterprise launches.</span>
              </div>
              <div>
                <strong className="text-zinc-900 block">Campus Memoirs</strong>
                <span className="text-[11px]">House memories, sports meets, and life in the dormitories.</span>
              </div>
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}
