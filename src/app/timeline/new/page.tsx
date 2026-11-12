"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { api, type TimelineEntry } from "@/lib/api";
import { editId, errorText } from "@/lib/useApi";
import { fieldErrors, timelineSchema } from "@/lib/validations";
import { AsideNote, EditLoader, FormActions, FormLayout } from "@/components/layout/FormLayout";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { RequireAuth } from "@/components/ui/RequireAuth";
import { Notice } from "@/components/ui/States";

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export default function TimelineEditorPage() {
  const id = editId(useSearchParams().get("id"));
  return (
    <RequireAuth admin={id !== null} reason="Sign in to add a milestone.">
      {() => <EditLoader id={id} load={api.timeline.get}>{(initial) => <TimelineForm initial={initial} />}</EditLoader>}
    </RequireAuth>
  );
}

function TimelineForm({ initial }: { initial: TimelineEntry | null }) {
  const router = useRouter();
  const [form, setForm] = useState({ title: initial?.title ?? "", content: initial?.content ?? "", entry_date: initial?.entry_date ?? "" });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const addFiles = (list: FileList | null) => {
    const picked = [...(list ?? [])];
    const bad = picked.find((f) => !ACCEPT.includes(f.type) || f.size > (f.type === "application/pdf" ? 10 : 5) * 1024 * 1024);
    if (bad) return setErrors({ ...errors, files: `${bad.name}: use JPEG, PNG, WebP (max 5 MB) or PDF (max 10 MB)` });
    setErrors({ ...errors, files: "" });
    setFiles((prev) => [...prev, ...picked]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = timelineSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setFormError("");
    setBusy(true);
    try {
      const saved = initial ? await api.timeline.update(initial.id, parsed.data) : await api.timeline.create(parsed.data);
      if (files.length) await api.timeline.addPhotos(saved.id, files);
      router.push("/timeline");
    } catch (err) {
      setFormError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <FormLayout
      tag="Timeline"
      title={initial ? "Edit milestone" : "Add a milestone"}
      description="Record a moment in the school's history."
      backHref="/timeline"
      aside={
        <AsideNote title="Good milestones">
          <p>Firsts, foundings, results, visits and big batch events all belong here.</p>
          <p>Scanned certificates and newspaper clippings can be uploaded as PDFs.</p>
          <p>Only admins can edit or delete a milestone after it is added.</p>
        </AsideNote>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {formError && <Notice tone="error">{formError}</Notice>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Title" required error={errors.title} className="sm:col-span-2">
            <TextInput value={form.title} maxLength={255} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Date" required error={errors.entry_date}>
            <TextInput type="date" value={form.entry_date} onChange={(e) => setForm({ ...form, entry_date: e.target.value })} className="font-mono text-xs" />
          </Field>
        </div>
        <Field label="What happened" required error={errors.content}>
          <TextArea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </Field>
        <div>
          <span className="block text-xs font-medium text-zinc-700 mb-1.5">Photos and documents</span>
          <input
            type="file"
            multiple
            accept={ACCEPT.join(",")}
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
            className="block text-xs text-zinc-600 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border file:border-zinc-200 file:bg-white file:text-xs file:font-medium file:text-zinc-700 hover:file:bg-zinc-50"
          />
          {errors.files ? (
            <p className="text-xs text-red-600 mt-1">{errors.files}</p>
          ) : (
            <p className="text-[11px] text-zinc-500 mt-1">JPEG, PNG or WebP up to 5 MB, PDF up to 10 MB. Added in the order you pick them.</p>
          )}
          {files.length > 0 && (
            <ul className="mt-2 space-y-1">
              {files.map((f, i) => (
                <li key={i} className="flex items-center justify-between text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5">
                  <span className="truncate">{f.name}</span>
                  <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-zinc-400 hover:text-zinc-700" aria-label={`Remove ${f.name}`}>
                    <X size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <FormActions cancelHref="/timeline" busy={busy} label={initial ? "Save changes" : "Add milestone"} />
      </form>
    </FormLayout>
  );
}
