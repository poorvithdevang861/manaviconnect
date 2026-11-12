"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, JOB_TYPES, type Job, type JobType } from "@/lib/api";
import { editId, errorText } from "@/lib/useApi";
import { nullable, titleCase } from "@/lib/format";
import { fieldErrors, jobSchema } from "@/lib/validations";
import { AsideNote, EditLoader, FormActions, FormLayout } from "@/components/layout/FormLayout";
import { Field, Select, TextArea, TextInput } from "@/components/ui/Field";
import { RequireAuth } from "@/components/ui/RequireAuth";
import { Notice } from "@/components/ui/States";

export default function JobEditorPage() {
  const id = editId(useSearchParams().get("id"));
  return (
    <RequireAuth reason="Sign in to post a job.">
      {() => <EditLoader id={id} load={api.jobs.get}>{(initial) => <JobForm initial={initial} />}</EditLoader>}
    </RequireAuth>
  );
}

function JobForm({ initial }: { initial: Job | null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    company: initial?.company ?? "",
    location: initial?.location ?? "",
    job_type: (initial?.job_type ?? "full-time") as JobType,
    salary_range: initial?.salary_range ?? "",
    deadline: initial?.deadline ?? "",
    description: initial?.description ?? "",
    requirements: initial?.requirements ?? "",
    tags: initial?.tags ?? "",
    contact_email: initial?.contact_email ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = jobSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setFormError("");
    setBusy(true);
    try {
      const body = nullable({ ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean).join(",") });
      const saved = initial ? await api.jobs.update(initial.id, body) : await api.jobs.create(body);
      router.push(`/jobs?id=${saved.id}`);
    } catch (err) {
      setFormError(errorText(err));
      setBusy(false);
    }
  };

  const back = initial ? `/jobs?id=${initial.id}` : "/jobs";

  return (
    <FormLayout
      tag="Jobs"
      title={initial ? "Edit job" : "Post a job"}
      description="Share an opening at your workplace with fellow alumni."
      backHref={back}
      aside={
        <AsideNote title="What helps">
          <p>Say whether you can refer alumni internally, and how they should mention it.</p>
          <p>Add a deadline so the listing shows as closed once it passes.</p>
          <p>New jobs send a push notification to subscribed members.</p>
        </AsideNote>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {formError && <Notice tone="error">{formError}</Notice>}
        <Field label="Job title" required error={errors.title}>
          <TextInput value={form.title} onChange={set("title")} placeholder="e.g. Frontend Developer" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Company" required error={errors.company}>
            <TextInput value={form.company} onChange={set("company")} />
          </Field>
          <Field label="Location">
            <TextInput value={form.location} onChange={set("location")} placeholder="e.g. Bengaluru (Hybrid), Remote" />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Job type" required error={errors.job_type}>
            <Select value={form.job_type} onChange={set("job_type")}>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {titleCase(t)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Salary range">
            <TextInput value={form.salary_range} onChange={set("salary_range")} placeholder="e.g. ₹8–12 LPA" />
          </Field>
          <Field label="Apply by">
            <TextInput type="date" value={form.deadline} onChange={set("deadline")} className="font-mono text-xs" />
          </Field>
        </div>
        <Field label="Description" required error={errors.description}>
          <TextArea rows={6} value={form.description} onChange={set("description")} />
        </Field>
        <Field label="Requirements">
          <TextArea rows={3} value={form.requirements} onChange={set("requirements")} placeholder="Experience, skills, qualifications" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Contact email" error={errors.contact_email} hint="Applicants will email this address.">
            <TextInput type="email" value={form.contact_email} onChange={set("contact_email")} />
          </Field>
          <Field label="Tags" hint="Comma separated, e.g. react, typescript">
            <TextInput value={form.tags} onChange={set("tags")} />
          </Field>
        </div>
        <FormActions cancelHref={back} busy={busy} label={initial ? "Save changes" : "Post job"} />
      </form>
    </FormLayout>
  );
}
