"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookMarked,
  BookOpen,
  Briefcase,
  CalendarClock,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Handshake,
  Landmark,
  Laptop,
  Mail,
  MapPin,
  Plus,
  Search,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { api, JOB_TYPES, type Job, type JobType } from "@/lib/api";
import { canManage, useAuth } from "@/lib/auth";
import { editId, useApi } from "@/lib/useApi";
import { formatDate, isPast, splitTags, timeAgo, titleCase } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, JobTypeBadge, Tags } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { IconTile, type TileTone } from "@/components/ui/IconTile";
import { OwnerActions } from "@/components/ui/OwnerActions";
import { Pagination } from "@/components/ui/Pagination";
import { Empty, ErrorBox, Loading } from "@/components/ui/States";
import { Tabs } from "@/components/ui/Tabs";
import { FilterChips, SearchInput, Toolbar } from "@/components/ui/Toolbar";
import { btnPrimary, btnSecondary, chipCls, listCls, pageCls } from "@/components/ui/styles";

type CareerTab = "jobs" | "references";

const TYPE_OPTIONS = [{ id: "all", label: "All types" }, ...JOB_TYPES.map((t) => ({ id: t, label: titleCase(t) }))] as const;

export default function CareerPage() {
  const router = useRouter();
  const params = useSearchParams();
  const tab: CareerTab = params.get("tab") === "references" ? "references" : "jobs";
  const totals = useApi(() => api.jobs.list({ limit: 1 }).then((r) => ({ jobs: r.total })), []);

  return (
    <div className={pageCls}>
      <PageHeader
        tag="Career"
        title="Career"
        description="Openings and referrals shared by alumni, plus references to help you plan what comes next."
        action={
          <Link href="/career/new" className={btnPrimary}>
            <Plus size={14} />
            Post a job
          </Link>
        }
      />

      <Tabs
        idBase="career"
        label="Career sections"
        value={tab}
        onChange={(t) => router.replace(t === "jobs" ? "/career" : "/career?tab=references", { scroll: false })}
        tabs={[
          { id: "jobs", label: "Jobs", icon: Briefcase, count: totals.data?.jobs },
          { id: "references", label: "References", icon: BookMarked },
        ]}
      />

      <div id="career-panel" role="tabpanel" aria-labelledby={`career-tab-${tab}`} className="space-y-6">
        {tab === "jobs" ? <JobsPanel /> : <ReferencesPanel />}
      </div>
    </div>
  );
}

function JobsPanel() {
  const router = useRouter();
  const params = useSearchParams();
  const selectedId = editId(params.get("id"));
  const [jobType, setJobType] = useState<JobType | "all">("all");
  const [referralsOnly, setReferralsOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, error, loading, reload, setData } = useApi(
    () => api.jobs.list({ job_type: jobType === "all" ? undefined : jobType, tag: referralsOnly ? "referral" : undefined, search, page, limit: 10 }),
    [jobType, referralsOnly, search, page],
  );

  const listed = data?.listings.find((j) => j.id === selectedId);
  const fetched = useApi(() => api.jobs.get(selectedId!), [selectedId], selectedId !== null && !listed);
  const selected = listed ?? (selectedId !== null ? fetched.data : undefined) ?? data?.listings[0];

  const detailRef = useRef<HTMLDivElement>(null);
  const select = (id: number) => {
    router.replace(`/career?id=${id}`, { scroll: false });
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" }), 0);
  };

  useEffect(() => {
    if (selectedId !== null && fetched.error?.status === 404) router.replace("/career");
  }, [selectedId, fetched.error, router]);

  const filtered = !!search || jobType !== "all" || referralsOnly;

  return (
    <>
      <Toolbar>
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search title, company, location or tags" />
        <div className="flex items-center gap-1.5 min-w-0 max-w-full">
          <button
            type="button"
            onClick={() => { setReferralsOnly((r) => !r); setPage(1); }}
            aria-pressed={referralsOnly}
            className={chipCls(referralsOnly)}
          >
            <Handshake size={13} />
            Referrals
          </button>
          <span className="shrink-0 w-px h-5 bg-zinc-200" aria-hidden />
          <FilterChips options={TYPE_OPTIONS} value={jobType} onChange={(v) => { setJobType(v); setPage(1); }} label="Job type" />
        </div>
      </Toolbar>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-7 space-y-3 stagger min-w-0">
          {loading && !data ? (
            <Loading />
          ) : error ? (
            <ErrorBox error={error} onRetry={reload} />
          ) : data!.listings.length === 0 ? (
            <Empty
              title={filtered ? "No jobs match these filters" : "No jobs yet"}
              action={
                filtered ? (
                  <button type="button" onClick={() => { setSearch(""); setJobType("all"); setReferralsOnly(false); setPage(1); }} className={btnSecondary}>
                    Clear filters
                  </button>
                ) : (
                  <Link href="/career/new" className={btnPrimary}>
                    Post one
                  </Link>
                )
              }
            >
              {filtered ? "Try a different search, job type or turn off Referrals." : undefined}
            </Empty>
          ) : (
            <>
              {data!.listings.map((job) => {
                const active = selected?.id === job.id;
                const referral = splitTags(job.tags).some((t) => t.toLowerCase() === "referral");
                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => select(job.id)}
                    aria-pressed={active}
                    className={`w-full text-left p-5 rounded-xl border bg-white transition-[border-color,box-shadow,transform] duration-200 active:scale-[0.995] group ${
                      active ? "border-orange-400 shadow-focus" : "border-zinc-200/70 shadow-card hover:border-zinc-300 hover:shadow-lift"
                    } ${loading ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-zinc-900 text-base leading-snug group-hover:text-orange-600">{job.title}</h3>
                        <div className="text-xs font-medium text-zinc-500 mt-0.5">
                          {job.company}
                          {job.location && ` · ${job.location}`}
                        </div>
                      </div>
                      <JobTypeBadge type={job.job_type} />
                    </div>
                    <p className="text-xs text-zinc-600 line-clamp-2 mt-2 leading-relaxed">{job.description}</p>
                    <div className="mt-3 pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400 font-mono">
                      <span className="inline-flex items-center gap-2">
                        Shared by {job.poster.name}
                        {referral && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-sans font-semibold">
                            <Handshake size={11} />
                            Can refer
                          </span>
                        )}
                      </span>
                      <span>{timeAgo(job.created_at)}</span>
                    </div>
                  </button>
                );
              })}
              <Pagination page={data!.page} limit={data!.limit} total={data!.total} onChange={setPage} />
            </>
          )}
        </div>

        <div ref={detailRef} className="lg:col-span-5 lg:sticky lg:top-36 min-w-0 scroll-mt-24">
          {selected ? (
            <JobDetail
              job={selected}
              onDeleted={() => {
                setData((prev) => prev && { ...prev, total: prev.total - 1, listings: prev.listings.filter((j) => j.id !== selected.id) });
                router.replace("/career");
              }}
            />
          ) : (
            !loading && <Card className="p-8 text-center text-xs text-zinc-500">Select a job to see the details.</Card>
          )}
        </div>
      </div>
    </>
  );
}

function JobDetail({ job, onDeleted }: { job: Job; onDeleted: () => void }) {
  const { user } = useAuth();
  const closed = job.deadline ? isPast(`${job.deadline}T23:59:59`) : false;
  const referral = splitTags(job.tags).some((t) => t.toLowerCase() === "referral");

  return (
    <Card className="p-6 space-y-5 animate-fade-in" key={job.id}>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-900 leading-snug">{job.title}</h2>
          <JobTypeBadge type={job.job_type} size="md" />
        </div>
        <div className="text-sm text-zinc-600">{job.company}</div>
        <ul className="text-xs text-zinc-600 space-y-1.5 pt-1">
          {job.location && (
            <li className="flex items-center gap-2">
              <MapPin size={13} className="text-zinc-400" />
              {job.location}
            </li>
          )}
          {job.salary_range && (
            <li className="flex items-center gap-2">
              <Wallet size={13} className="text-zinc-400" />
              {job.salary_range}
            </li>
          )}
          {job.deadline && (
            <li className="flex items-center gap-2">
              <CalendarClock size={13} className="text-zinc-400" />
              Apply by {formatDate(job.deadline)}
              {closed && <Badge variant="danger" size="sm">Closed</Badge>}
            </li>
          )}
        </ul>
      </div>

      {referral && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50/70 border border-orange-200/60 text-xs text-orange-900">
          <Handshake size={15} className="shrink-0 mt-px text-orange-600" />
          <span>{job.poster.name.split(" ")[0]} can refer alumni for this role. Mention MANAVI and your batch when you write in.</span>
        </div>
      )}

      <div className="space-y-1.5">
        <h3 className="text-xs font-medium text-zinc-500">About the role</h3>
        <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">{job.description}</p>
      </div>

      {job.requirements && (
        <div className="space-y-1.5">
          <h3 className="text-xs font-medium text-zinc-500">Requirements</h3>
          <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">{job.requirements}</p>
        </div>
      )}

      <Tags tags={job.tags} />

      <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-lg flex items-center gap-2.5 text-xs">
        <Avatar name={job.poster.name} src={job.poster.avatar_url} size="sm" />
        <span className="min-w-0">
          Shared by <strong className="text-zinc-900">{job.poster.name}</strong>
          {job.poster.batch && <span className="text-zinc-500 font-mono"> · Batch of {job.poster.batch}</span>}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-100">
        {job.contact_email ? (
          <a
            href={`mailto:${job.contact_email}?subject=${encodeURIComponent(`${referral ? "Referral request" : "Application"}: ${job.title}`)}`}
            className={btnPrimary}
          >
            <Mail size={13} />
            {referral ? "Ask for a referral" : "Apply by email"}
          </a>
        ) : (
          <span className="text-xs text-zinc-500">No contact email given.</span>
        )}
        {canManage(user, job.created_by) && (
          <OwnerActions
            noun="job"
            editHref={`/career/new?id=${job.id}`}
            onDelete={async () => {
              await api.jobs.remove(job.id);
              onDeleted();
            }}
          />
        )}
      </div>
    </Card>
  );
}

interface Resource {
  title: string;
  description: string;
  url: string;
  icon: LucideIcon;
  tone?: TileTone;
}

const RESOURCES: { group: string; items: Resource[] }[] = [
  {
    group: "Find jobs and internships",
    items: [
      { title: "National Career Service", description: "Government job portal with listings, counselling and job fairs", url: "https://www.ncs.gov.in", icon: Briefcase },
      { title: "Internshala", description: "Internships and fresher jobs across India", url: "https://internshala.com", icon: Search, tone: "amber" },
      { title: "LinkedIn Jobs", description: "Openings and alumni at the companies you follow", url: "https://www.linkedin.com/jobs", icon: Handshake, tone: "peach" },
    ],
  },
  {
    group: "Exams and scholarships",
    items: [
      { title: "National Scholarship Portal", description: "Central and state scholarships in one application", url: "https://scholarships.gov.in", icon: GraduationCap },
      { title: "National Testing Agency", description: "JEE Main, NEET, CUET and UGC-NET", url: "https://nta.ac.in", icon: BookOpen, tone: "amber" },
      { title: "UPSC", description: "Civil services and other central recruitment exams", url: "https://upsc.gov.in", icon: Landmark, tone: "peach" },
      { title: "Staff Selection Commission", description: "CGL, CHSL and other central government posts", url: "https://ssc.gov.in", icon: Landmark, tone: "sand" },
    ],
  },
  {
    group: "Learn new skills",
    items: [
      { title: "SWAYAM", description: "Free courses from Indian universities, with certificates", url: "https://swayam.gov.in", icon: Laptop },
      { title: "NPTEL", description: "Engineering and science courses from the IITs and IISc", url: "https://nptel.ac.in", icon: BookMarked, tone: "amber" },
      { title: "Skill India Digital", description: "Vocational and industry skill programmes", url: "https://www.skillindiadigital.gov.in", icon: GraduationCap, tone: "peach" },
    ],
  },
];

const host = (url: string) => new URL(url).hostname.replace(/^www\./, "");

function ReferencesPanel() {
  const referrals = useApi(() => api.jobs.list({ tag: "referral", limit: 6 }), []);
  const stories = useApi(() => api.stories.list({ limit: 100 }), []);
  const careerStories = (stories.data?.stories ?? []).filter((s) => splitTags(s.tags).some((t) => t.toLowerCase() === "career")).slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
      <div className="lg:col-span-7 space-y-8 min-w-0">
        <section className="space-y-3" aria-labelledby="ref-referrals">
          <SectionTitle
            id="ref-referrals"
            title="Alumni who can refer you"
            subtitle="Roles where the person who posted can pass your CV to their hiring team."
            action={
              <Link href="/career/new?template=referral" className={btnSecondary}>
                <Handshake size={13} />
                Offer a referral
              </Link>
            }
          />
          {referrals.loading ? (
            <Loading variant="lines" />
          ) : referrals.error ? (
            <ErrorBox error={referrals.error} onRetry={referrals.reload} />
          ) : referrals.data!.listings.length === 0 ? (
            <Empty title="No referral offers yet" action={<Link href="/career/new?template=referral" className={btnPrimary}>Be the first to offer one</Link>}>
              Working somewhere that hires? A referral from an alumnus is often the fastest way in.
            </Empty>
          ) : (
            <ul className={`${listCls} stagger`}>
              {referrals.data!.listings.map((job) => (
                <li key={job.id}>
                  <Link href={`/career?id=${job.id}`} className="group flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors">
                    <IconTile icon={Handshake} />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-zinc-900 truncate group-hover:text-orange-600">{job.title}</span>
                      <span className="block text-xs text-zinc-500 truncate">
                        {job.company}
                        {job.location && ` · ${job.location}`}
                      </span>
                    </span>
                    <span className="hidden sm:flex items-center gap-2 text-xs text-zinc-500 shrink-0 max-w-[40%] min-w-0">
                      <Avatar name={job.poster.name} src={job.poster.avatar_url} size="xs" />
                      <span className="truncate">{job.poster.name.split(" ")[0]}</span>
                    </span>
                    <ChevronRight size={16} className="text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3" aria-labelledby="ref-stories">
          <SectionTitle
            id="ref-stories"
            title="Career stories from alumni"
            subtitle="First-hand accounts of exams, first jobs and career changes."
            action={
              <Link href="/updates?tag=career" className="text-xs font-medium text-orange-600 hover:text-orange-700 inline-flex items-center gap-1">
                See all
                <ChevronRight size={13} />
              </Link>
            }
          />
          {stories.loading ? (
            <Loading variant="lines" />
          ) : stories.error ? (
            <ErrorBox error={stories.error} onRetry={stories.reload} />
          ) : careerStories.length === 0 ? (
            <Empty title="No career stories yet" action={<Link href="/stories/new" className={btnPrimary}>Share yours</Link>}>
              Stories tagged #career appear here.
            </Empty>
          ) : (
            <ul className={`${listCls} stagger`}>
              {careerStories.map((s) => (
                <li key={s.id}>
                  <Link href={`/stories/${s.id}`} className="group flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors">
                    <IconTile icon={BookOpen} tone="amber" />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-zinc-900 line-clamp-2 sm:truncate group-hover:text-orange-600">{s.title}</span>
                      <span className="block text-xs text-zinc-500 truncate">
                        {s.author.name}
                        {s.author.batch && ` · Batch of ${s.author.batch}`}
                      </span>
                    </span>
                    <ChevronRight size={16} className="text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="lg:col-span-5 space-y-6 min-w-0" aria-labelledby="ref-links">
        <SectionTitle id="ref-links" title="Useful references" subtitle="Official portals worth bookmarking. Links open in a new tab." />
        {RESOURCES.map((g) => (
          <div key={g.group} className="space-y-2">
            <h3 className="px-1 text-xs font-medium text-zinc-500">{g.group}</h3>
            <ul className={listCls}>
              {g.items.map((r) => (
                <li key={r.url}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${r.title} (opens in a new tab)`}
                    className="group flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors"
                  >
                    <IconTile icon={r.icon} tone={r.tone} size="sm" />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-zinc-900 truncate group-hover:text-orange-600">{r.title}</span>
                      <span className="block text-xs text-zinc-500 line-clamp-2">{r.description}</span>
                      <span className="block text-[11px] font-mono text-zinc-400 truncate mt-0.5">{host(r.url)}</span>
                    </span>
                    <ExternalLink size={14} className="text-zinc-300 group-hover:text-zinc-500 shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className="px-1 text-xs text-zinc-500 leading-relaxed">
          Know a resource that helped you?{" "}
          <Link href="/stories/new" className="font-medium text-orange-600 hover:text-orange-700">
            Share it as a story
          </Link>{" "}
          tagged #career.
        </p>
      </aside>
    </div>
  );
}

function SectionTitle({ id, title, subtitle, action }: { id: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 px-1">
      <div className="min-w-0">
        <h2 id={id} className="text-base font-semibold text-zinc-900">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
