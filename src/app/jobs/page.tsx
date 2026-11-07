"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Search, 
  MapPin, 
  Bookmark, 
  Plus, 
  ExternalLink,
  Layers,
  Briefcase,
  GraduationCap,
  Globe,
  FileCheck
} from "lucide-react";
import { MOCK_JOBS, Job } from "@/lib/mockData";
import { Card } from "@/components/ui/Card";
import { Badge, JobTypeBadge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/layout/PageHeader";

const TYPE_FILTER_TABS = [
  { id: "All Types", label: "All Types", icon: Layers },
  { id: "Full-time", label: "Full-time", icon: Briefcase },
  { id: "Internship", label: "Internship", icon: GraduationCap },
  { id: "Remote", label: "Remote", icon: Globe },
  { id: "Contract", label: "Contract", icon: FileCheck },
] as const;

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(MOCK_JOBS[0]);

  const toggleSave = (id: string) => {
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredJobs = MOCK_JOBS.filter((j) => {
    const matchesSearch =
      search.trim() === "" ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.city.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      selectedType === "All Types" ||
      (selectedType === "Remote" ? j.city.toLowerCase().includes("remote") || j.type === "Remote" : j.type === selectedType);

    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      
      {/* Standardized Page Header */}
      <PageHeader
        tag="Careers"
        meta="Alumni Opportunities"
        title="Alumni Jobs & Referrals"
        description="Verified roles and internal referrals posted directly by Navodaya alumni."
        action={
          <Link
            href="/jobs/new"
            className="btn-press inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs shrink-0"
          >
            <Plus size={14} />
            Post Opportunity
          </Link>
        }
      />

      {/* Search & Type Filters */}
      <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title, company, or city..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50/60 hover:bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-orange-500 rounded-lg outline-none transition-colors placeholder:text-zinc-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-medium text-zinc-500 mr-1.5">Work Type:</span>
          {TYPE_FILTER_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`chip-press inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-orange-50 text-orange-700 border border-orange-200/80 shadow-xs"
                    : "bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                <Icon size={12} className="shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-Column Split: 8 cols (Left List) / 4 cols (Right Detail Pane) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left List (8 cols) */}
        <div className="lg:col-span-8 space-y-3.5">
          {filteredJobs.length === 0 ? (
            <div className="bg-white border border-zinc-200/80 rounded-xl p-8 text-center text-xs text-zinc-500">
              No opportunities found matching your criteria.
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              const isSaved = savedJobs.includes(job.id);
              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-5 rounded-xl border transition-all duration-200 cursor-pointer bg-white group ${
                    isSelected
                      ? "border-orange-500 ring-1 ring-orange-500/20 shadow-xs"
                      : "border-zinc-200/80 hover:border-zinc-300 hover:shadow-xs hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-zinc-900 text-base leading-snug group-hover:text-orange-600 transition-colors">
                        {job.title}
                      </h3>
                      <div className="text-xs font-medium text-zinc-500 mt-0.5">
                        {job.company} • {job.city}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(job.id);
                      }}
                      className={`p-1.5 rounded-lg text-xs transition-transform duration-150 active:scale-125 ${
                        isSaved ? "text-orange-600 bg-orange-50" : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
                      }`}
                      aria-label="Save job"
                    >
                      <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} className="transition-colors" />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-600 line-clamp-2 mt-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="mt-3.5 pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <JobTypeBadge type={job.type} size="sm" />
                      <Badge variant="neutral" size="sm">{job.experienceLevel}</Badge>
                    </div>

                    <span className="text-[11px] text-zinc-400 font-mono">
                      Shared by {job.postedBy.name} ({job.postedBy.batch}) • {job.postedAt}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Detail Pane (4 cols) */}
        <div className="lg:col-span-4">
          {selectedJob ? (
            <Card className="p-6 space-y-5 sticky top-20 bg-white shadow-xs">
              <div className="space-y-1.5">
                <h2 className="text-base font-semibold text-zinc-900 leading-snug">
                  {selectedJob.title}
                </h2>
                <div className="text-xs font-medium text-zinc-500">
                  {selectedJob.company} • {selectedJob.city}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                  <JobTypeBadge type={selectedJob.type} size="sm" />
                  <Badge variant="neutral" size="sm">{selectedJob.experienceLevel}</Badge>
                </div>
              </div>

              {/* Referrer Box */}
              <div className="p-3.5 bg-orange-50/50 border border-orange-100 rounded-lg space-y-2">
                <div className="text-[11px] font-mono font-medium text-orange-700">Alumni Referrer</div>
                <div className="text-xs font-semibold text-zinc-900">
                  {selectedJob.postedBy.name} • {selectedJob.postedBy.batch}
                </div>
                <div className="text-[11px] text-zinc-600">{selectedJob.postedBy.role}</div>
                <Link
                  href="/messages"
                  className="btn-press w-full py-1.5 text-xs font-medium text-orange-700 bg-white border border-orange-200/80 rounded-lg hover:bg-orange-50 block text-center shadow-xs"
                >
                  Ask for Referral
                </Link>
              </div>

              {/* Role Overview */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  About Role
                </h4>
                <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto pr-1">
                  {selectedJob.description}
                </p>
              </div>

              {/* Application Call to Action */}
              <div className="pt-3 border-t border-zinc-100 space-y-2">
                <div className="text-[11px] text-zinc-500 truncate">
                  Apply via: <span className="font-mono text-zinc-800">{selectedJob.applyMethod}</span>
                </div>
                <a
                  href={`mailto:${selectedJob.applyMethod}`}
                  className="btn-press w-full py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg inline-flex items-center justify-center gap-1.5 shadow-xs"
                >
                  Apply Directly
                  <ExternalLink size={13} />
                </a>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-xs text-zinc-500 bg-white">
              Select an opportunity on the left to read full details.
            </Card>
          )}
        </div>

      </div>

    </div>
  );
}
