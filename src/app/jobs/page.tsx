"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarClock, Mail, MapPin, Plus, Wallet } from "lucide-react";
import { api, JOB_TYPES, type Job, type JobType } from "@/lib/api";
import { canManage, useAuth } from "@/lib/auth";
import { editId, useApi } from "@/lib/useApi";
import { formatDate, isPast, timeAgo, titleCase } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, JobTypeBadge, Tags } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { OwnerActions } from "@/components/ui/OwnerActions";
import { Pagination } from "@/components/ui/Pagination";
import { Empty, ErrorBox, Loading } from "@/components/ui/States";
import { FilterChips, SearchInput, Toolbar } from "@/components/ui/Toolbar";
import { btnPrimary, pageCls } from "@/components/ui/styles";

const TYPE_OPTIONS = [{ id: "all", label: "All types" }, ...JOB_TYPES.map((t) => ({ id: t, label: titleCase(t) }))] as const;

export default function JobsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const selectedId = editId(params.get("id"));
  const [jobType, setJobType] = useState<JobType | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, error, loading, reload, setData } = useApi(
    () => api.jobs.list({ job_type: jobType === "all" ? undefined : jobType, search, page, limit: 10 }),
    [jobType, search, page],
  );

  const listed = data?.listings.find((j) => j.id === selectedId);
  const fetched = useApi(() => api.jobs.get(selectedId!), [selectedId], selectedId !== null && !listed);
  const selected = listed ?? (selectedId !== null ? fetched.data : undefined) ?? data?.listings[0];

  const select = (id: number) => router.replace(`/jobs?id=${id}`, { scroll: false });

  useEffect(() => {
    if (selectedId !== null && fetched.error?.status === 404) router.replace("/jobs");
  }, [selectedId, fetched.error, router]);

  return (
    <div className={pageCls}>
      <PageHeader
        tag="Jobs"
        title="Jobs & referrals"
        description="Openings shared by alumni at their own workplaces."
        action={
          <Link href="/jobs/new" className={btnPrimary}>
            <Plus size={14} />
            Post a job
          </Link>
        }
      />

      <Toolbar>
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search title, company, location or tags" />
        <FilterChips options={TYPE_OPTIONS} value={jobType} onChange={(v) => { setJobType(v); setPage(1); }} />
      </Toolbar>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-7 space-y-3">
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorBox error={error} onRetry={reload} />
          ) : data!.listings.length === 0 ? (
            <Empty title="No jobs found" action={<Link href="/jobs/new" className={btnPrimary}>Post one</Link>}>
              {search || jobType !== "all" ? "Try a different search or job type." : undefined}
            </Empty>
          ) : (
            <>
              {data!.listings.map((job) => {
                const active = selected?.id === job.id;
                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => select(job.id)}
                    aria-pressed={active}
                    className={`w-full text-left p-5 rounded-xl border bg-white transition-all group ${
                      active ? "border-orange-500 ring-1 ring-orange-500/20 shadow-xs" : "border-zinc-200/80 hover:border-zinc-300 hover:shadow-xs"
                    }`}
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
                      <span>Shared by {job.poster.name}</span>
                      <span>{timeAgo(job.created_at)}</span>
                    </div>
                  </button>
                );
              })}
              <Pagination page={data!.page} limit={data!.limit} total={data!.total} onChange={setPage} />
            </>
          )}
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-20">
          {selected ? (
            <JobDetail
              job={selected}
              onDeleted={() => {
                setData((prev) => prev && { ...prev, total: prev.total - 1, listings: prev.listings.filter((j) => j.id !== selected.id) });
                router.replace("/jobs");
              }}
            />
          ) : (
            !loading && <Card className="p-8 text-center text-xs text-zinc-500">Select a job to see the details.</Card>
          )}
        </div>
      </div>
    </div>
  );
}

function JobDetail({ job, onDeleted }: { job: Job; onDeleted: () => void }) {
  const { user } = useAuth();
  const closed = job.deadline ? isPast(`${job.deadline}T23:59:59`) : false;

  return (
    <Card className="p-6 space-y-5">
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

      <div className="space-y-1.5">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">About the role</h3>
        <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">{job.description}</p>
      </div>

      {job.requirements && (
        <div className="space-y-1.5">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">Requirements</h3>
          <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">{job.requirements}</p>
        </div>
      )}

      <Tags tags={job.tags} />

      <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-lg flex items-center gap-2.5 text-xs">
        <Avatar name={job.poster.name} src={job.poster.avatar_url} size="sm" />
        <span>
          Shared by <strong className="text-zinc-900">{job.poster.name}</strong>
          {job.poster.batch && <span className="text-zinc-500 font-mono"> · Batch of {job.poster.batch}</span>}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-100">
        {job.contact_email ? (
          <a href={`mailto:${job.contact_email}?subject=${encodeURIComponent(`Application: ${job.title}`)}`} className={btnPrimary}>
            <Mail size={13} />
            Apply by email
          </a>
        ) : (
          <span className="text-xs text-zinc-500">No contact email given.</span>
        )}
        {canManage(user, job.created_by) && (
          <OwnerActions
            noun="job"
            editHref={`/jobs/new?id=${job.id}`}
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
