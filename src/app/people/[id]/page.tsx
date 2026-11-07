"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  MapPin, 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  MessageSquare, 
  Calendar, 
  GraduationCap, 
  BookOpen, 
  Compass, 
  Shield
} from "lucide-react";
import { MOCK_MEMBERS, CURRENT_USER, MOCK_STORIES } from "@/lib/mockData";
import { Card } from "@/components/ui/Card";
import { Badge, StoryCategoryBadge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/layout/PageHeader";

export default function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const member = MOCK_MEMBERS.find((m) => m.id === resolvedParams.id);

  if (!member) {
    notFound();
  }

  const isSelf = member.id === CURRENT_USER.id;
  const isBatchmate = member.batchYear === CURRENT_USER.batchYear;

  // Evaluate contact privacy based on Section 8 & member_privacy table
  const canSeePhone =
    isSelf ||
    member.phoneVisibility === "all" ||
    member.phoneVisibility === "school" ||
    (member.phoneVisibility === "batch" && isBatchmate);

  const canSeeEmail =
    isSelf ||
    member.emailVisibility === "all" ||
    member.emailVisibility === "school" ||
    (member.emailVisibility === "batch" && isBatchmate);

  const memberStories = MOCK_STORIES.filter((s) => s.author.id === member.id);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      
      {/* Standardized Page Header with Breadcrumb Back Link */}
      <PageHeader
        tag="Directory"
        meta="Alumni Profile"
        title={member.name}
        description={`${member.role} • ${member.organisation} (${member.city})`}
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/people"
              className="btn-press inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 rounded-lg border border-zinc-200"
            >
              <ArrowLeft size={14} className="text-zinc-500" />
              Directory
            </Link>
            {!isSelf && (
              <Link
                href="/messages"
                className="btn-press inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs"
              >
                <MessageSquare size={14} />
                Message
              </Link>
            )}
          </div>
        }
      />

      {/* 2-Column Desktop Grid: 4 cols (Left) / 8 cols (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Column (4 cols): Identity & Verified Credential */}
        <div className="lg:col-span-4 space-y-5">
          
          <Card className="p-6 space-y-5 bg-white">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 flex items-center justify-center font-mono text-2xl font-semibold mb-3 shadow-xs">
                {member.initials}
              </div>
              <h2 className="text-lg font-semibold text-zinc-900 leading-snug">
                {member.name}
              </h2>
              <div className="text-xs font-medium text-zinc-600 mt-0.5">{member.role}</div>
              <div className="text-xs text-zinc-400">{member.organisation}</div>

              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                <Badge variant="verified" size="sm">
                  <ShieldCheck size={12} className="inline mr-1" />
                  Verified Alumni
                </Badge>
                {member.isAdmin && (
                  <Badge variant="brand" size="sm">
                    Batch Admin
                  </Badge>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-mono uppercase text-[11px]">School</span>
                <span className="font-medium text-zinc-800">{member.school}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-mono uppercase text-[11px]">Batch</span>
                <span className="font-medium text-zinc-800">{member.batch}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-mono uppercase text-[11px]">House</span>
                <span className="font-medium text-zinc-800">{member.house || "—"} House</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-mono uppercase text-[11px]">Location</span>
                <span className="font-medium text-zinc-800">{member.city}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100">
              {isSelf ? (
                <Link
                  href="/me"
                  className="btn-press w-full py-2 text-xs font-medium bg-zinc-50 hover:bg-zinc-100 text-zinc-800 rounded-lg border border-zinc-200 block text-center"
                >
                  Edit My Profile
                </Link>
              ) : (
                <Link
                  href="/messages"
                  className="btn-press w-full py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs flex items-center justify-center gap-1.5"
                >
                  <MessageSquare size={14} />
                  Send Direct Message
                </Link>
              )}
            </div>
          </Card>

          {/* Privacy-Governed Contact Card */}
          <Card className="p-5 space-y-3 bg-white">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Contact Privacy
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 bg-zinc-50/70 rounded-lg border border-zinc-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Mail size={15} className="text-zinc-400 shrink-0" />
                  <div>
                    <div className="text-[10px] font-mono text-zinc-400">Email</div>
                    <div className="text-xs font-medium text-zinc-800 truncate max-w-[190px]">
                      {canSeeEmail ? member.email : "Visible to school members only"}
                    </div>
                  </div>
                </div>
                {!canSeeEmail && <Lock size={13} className="text-zinc-400" />}
              </div>

              <div className="p-3 bg-zinc-50/70 rounded-lg border border-zinc-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Phone size={15} className="text-zinc-400 shrink-0" />
                  <div>
                    <div className="text-[10px] font-mono text-zinc-400">Phone</div>
                    <div className="text-xs font-medium text-zinc-800">
                      {canSeePhone && member.phone ? member.phone : "Visible to batch only"}
                    </div>
                  </div>
                </div>
                {!canSeePhone && <Lock size={13} className="text-zinc-400" />}
              </div>
            </div>
          </Card>

        </div>

        {/* Right Column (8 cols): Biography & Authored Stories */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* About Section */}
          <Card className="p-6 sm:p-7 space-y-3 bg-white">
            <h2 className="text-sm font-semibold text-zinc-900">About {member.name}</h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              {member.bio || "No biography provided yet."}
            </p>
          </Card>

          {/* Authored Stories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                <BookOpen size={16} />
                Stories by {member.name}
              </h3>
              <span className="text-xs text-zinc-400 font-mono">{memberStories.length} published</span>
            </div>

            {memberStories.length === 0 ? (
              <Card className="p-8 text-center text-xs text-zinc-500 bg-white">
                {member.name} has not authored any stories yet.
              </Card>
            ) : (
              <div className="space-y-3">
                {memberStories.map((story) => (
                  <Card key={story.id} className="p-5 sm:p-6 bg-white" hoverable>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono mb-1">
                      <StoryCategoryBadge type={story.type} size="sm" />
                      <span>{story.publishedAt}</span>
                    </div>
                    <Link href="/stories">
                      <h4 className="text-sm sm:text-base font-semibold text-zinc-900 hover:text-orange-600 transition-colors">
                        {story.title}
                      </h4>
                    </Link>
                    <p className="text-xs sm:text-sm text-zinc-600 mt-1.5 line-clamp-2 leading-relaxed">
                      {story.excerpt}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
