"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Code2, Handshake, Sprout } from "lucide-react";
import { api, JOB_TYPES, type Job, type JobType } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { editId, errorText } from "@/lib/useApi";
import { useDraft } from "@/lib/useDraft";
import { nullable, titleCase } from "@/lib/format";
import { daysFromNow, toDateInput } from "@/lib/prefill";
import { fieldErrors, jobSchema } from "@/lib/validations";
import { AsideNote, EditLoader, FormActions, FormLayout } from "@/components/layout/FormLayout";
import { DraftBanner, Segmented, Suggestions, TagSuggestions, TemplatePicker, type Template } from "@/components/forms/Prefill";
import { Field, TextArea, TextInput, focusFirstError } from "@/components/ui/Field";
import { RequireAuth } from "@/components/ui/RequireAuth";
import { Notice } from "@/components/ui/States";
import { flashToast } from "@/components/ui/Toast";

export default function JobEditorPage() {
  const id = editId(useSearchParams().get("id"));
  return (
    <RequireAuth reason="Sign in to post a job.">
      {() => <EditLoader id={id} load={api.jobs.get}>{(initial) => <JobForm initial={initial} />}</EditLoader>}
    </RequireAuth>
  );
}

type JobValues = {
  title: string;
  company: string;
  location: string;
  job_type: JobType;
  salary_range: string;
  deadline: string;
  description: string;
  requirements: string;
  tags: string;
  contact_email: string;
};

const TEMPLATES: Template<JobValues>[] = [
  {
    id: "engineer",
    title: "Software engineer",
    description: "Full-time role with a referral",
    icon: Code2,
    values: {
      title: "Software Engineer",
      job_type: "full-time",
      description: "We're hiring an engineer to build and ship product features end to end.\n\nI can refer Navodaya alumni internally. Mention MANAVI in your email subject.",
      requirements: "2+ years of professional experience\nComfortable with one modern web or backend stack",
      tags: "engineering, referral",
    },
  },
  {
    id: "intern",
    title: "Internship",
    description: "Short paid stint for students",
    icon: Sprout,
    tone: "amber",
    values: {
      title: "Summer Intern",
      job_type: "contract",
      salary_range: "Stipend provided",
      description: "A 2–3 month internship working alongside the team on a real project. Good fit for final-year students.",
      requirements: "Currently enrolled in college\nCurious, and comfortable asking questions",
      tags: "internship, students",
    },
  },
  {
    id: "teaching",
    title: "Teaching or academic role",
    description: "Schools, coaching, research",
    icon: BookOpen,
    tone: "peach",
    values: {
      title: "Teacher",
      job_type: "full-time",
      description: "We're looking for a teacher who enjoys working with students from rural backgrounds.",
      requirements: "B.Ed or equivalent\nFluency in the local language",
      tags: "teaching, education",
    },
  },
  {
    id: "freelance",
    title: "Freelance project",
    description: "Fixed scope, flexible hours",
    icon: Handshake,
    tone: "sand",
    values: {
      title: "Freelance ",
      job_type: "freelance",
      location: "Remote",
      description: "A fixed-scope project. Share a short note on similar work you've done and your expected fee.",
      tags: "freelance, remote",
    },
  },
];

const TAGS = ["referral", "remote", "engineering", "design", "sales", "teaching", "internship", "government", "startup"] as const;

function JobForm({ initial }: { initial: Job | null }) {
  const router = useRouter();
  const { user } = useAuth();
  const [start] = useState<JobValues>({
    title: initial?.title ?? "",
    company: initial?.company ?? user?.company ?? "",
    location: initial?.location ?? user?.city ?? "",
    job_type: initial?.job_type ?? "full-time",
    salary_range: initial?.salary_range ?? "",
    deadline: initial?.deadline ?? (initial ? "" : toDateInput(daysFromNow(30))),
    description: initial?.description ?? "",
    requirements: initial?.requirements ?? "",
    tags: initial?.tags ?? "",
    contact_email: initial?.contact_email ?? user?.email ?? "",
  });
  const [form, setForm] = useState(start);
  const draft = useDraft(initial ? null : "job", form, setForm, start);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key: keyof JobValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value });
  const put = (key: keyof JobValues) => (value: string) => setForm({ ...form, [key]: value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = jobSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return focusFirstError();
    }
    setErrors({});
    setFormError("");
    setBusy(true);
    try {
      const body = nullable({ ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean).join(",") });
      const saved = initial ? await api.jobs.update(initial.id, body) : await api.jobs.create(body);
      draft.clear();
      flashToast(initial ? "Job updated" : "Job posted");
      router.push(`/jobs?id=${saved.id}`);
    } catch (err) {
      setFormError(errorText(err));
      setBusy(false);
    }
  };

  const back = initial ? `/jobs?id=${initial.id}` : "/jobs";
  const city = user?.city;

  return (
    <FormLayout
      tag="Jobs"
      title={initial ? "Edit job" : "Post a job"}
      description="Share an opening at your workplace with fellow alumni."
      backHref={back}
      prefill={
        initial ? undefined : (
          <TemplatePicker
            subtitle="Your company, city and email are already filled in from your profile."
            templates={TEMPLATES}
            onPick={(v) => setForm({ ...form, ...v })}
          />
        )
      }
      aside={
        <AsideNote title="What helps">
          <p>Say whether you can refer alumni internally, and how they should mention it.</p>
          <p>Add a deadline so the listing shows as closed once it passes.</p>
          <p>New jobs send a push notification to subscribed members.</p>
        </AsideNote>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        {draft.restoredAt && <DraftBanner savedAt={draft.restoredAt} onDiscard={draft.discard} />}
        {formError && <Notice tone="error">{formError}</Notice>}
        <Field label="Job title" required error={errors.title}>
          <TextInput value={form.title} onChange={set("title")} placeholder="e.g. Frontend Developer" />
        </Field>
        <div>
          <span className="block text-xs font-medium text-zinc-700 mb-1.5">
            Job type <span className="text-orange-600">*</span>
          </span>
          <Segmented label="Job type" options={JOB_TYPES.map((t) => ({ id: t, label: titleCase(t) }))} value={form.job_type} onChange={(job_type) => setForm({ ...form, job_type })} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Company" required error={errors.company}>
            <TextInput value={form.company} onChange={set("company")} autoComplete="organization" />
          </Field>
          <Field
            label="Location"
            suggestions={<Suggestions options={["Remote", "Hybrid", ...(city ? [city, `${city} (Hybrid)`] : [])]} current={form.location} onPick={put("location")} />}
          >
            <TextInput value={form.location} onChange={set("location")} placeholder="e.g. Bengaluru (Hybrid), Remote" />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Salary range" suggestions={<Suggestions options={["₹4–6 LPA", "₹8–12 LPA", "₹15–25 LPA", "Not disclosed"]} current={form.salary_range} onPick={put("salary_range")} />}>
            <TextInput value={form.salary_range} onChange={set("salary_range")} placeholder="e.g. ₹8–12 LPA" />
          </Field>
          <Field
            label="Apply by"
            suggestions={
              <Suggestions
                options={[
                  { label: "1 week", value: toDateInput(daysFromNow(7)) },
                  { label: "2 weeks", value: toDateInput(daysFromNow(14)) },
                  { label: "30 days", value: toDateInput(daysFromNow(30)) },
                  { label: "No deadline", value: "" },
                ]}
                current={form.deadline}
                onPick={put("deadline")}
              />
            }
          >
            <TextInput type="date" value={form.deadline} onChange={set("deadline")} className="font-mono text-xs" />
          </Field>
        </div>
        <Field label="Description" required error={errors.description}>
          <TextArea rows={6} value={form.description} onChange={set("description")} placeholder="What the role involves, the team, and whether you can refer" />
        </Field>
        <Field label="Requirements">
          <TextArea rows={3} value={form.requirements} onChange={set("requirements")} placeholder="Experience, skills, qualifications" />
        </Field>
        <Field label="Contact email" error={errors.contact_email} hint="Applicants will email this address. Prefilled from your account.">
          <TextInput type="email" value={form.contact_email} onChange={set("contact_email")} autoComplete="email" />
        </Field>
        <Field label="Tags" hint="Tap to add, or type your own separated by commas." suggestions={<TagSuggestions tags={TAGS} value={form.tags} onChange={put("tags")} />}>
          <TextInput value={form.tags} onChange={set("tags")} placeholder="react, typescript" />
        </Field>
        <FormActions cancelHref={back} busy={busy} label={initial ? "Save changes" : "Post job"} draftSavedAt={draft.savedAt} />
      </form>
    </FormLayout>
  );
}
