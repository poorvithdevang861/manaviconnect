"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Award, CalendarCheck, Megaphone, Siren } from "lucide-react";
import { api, NEWS_CATEGORIES, type NewsArticle, type NewsCategory, type NewsSeverity } from "@/lib/api";
import { editId, errorText } from "@/lib/useApi";
import { useDraft } from "@/lib/useDraft";
import { titleCase } from "@/lib/format";
import { fieldErrors, newsSchema } from "@/lib/validations";
import { AsideNote, EditLoader, FormActions, FormLayout } from "@/components/layout/FormLayout";
import { DraftBanner, Segmented, Suggestions, TemplatePicker, Toggle, type Template } from "@/components/forms/Prefill";
import { Field, TextArea, TextInput, focusFirstError } from "@/components/ui/Field";
import { ImagePicker } from "@/components/ui/ImagePicker";
import { RequireAuth } from "@/components/ui/RequireAuth";
import { Notice } from "@/components/ui/States";
import { flashToast } from "@/components/ui/Toast";

export default function NewsEditorPage() {
  const id = editId(useSearchParams().get("id"));
  return (
    <RequireAuth admin reason="Only admins can publish news.">
      {() => <EditLoader id={id} load={api.news.get}>{(initial) => <NewsForm initial={initial} />}</EditLoader>}
    </RequireAuth>
  );
}

type NewsValues = { title: string; summary: string; content: string; category: NewsCategory; severity: NewsSeverity; is_published: boolean };

const TEMPLATES: Template<NewsValues>[] = [
  {
    id: "urgent",
    title: "Urgent notice",
    description: "Red banner on the home page",
    icon: Siren,
    values: {
      title: "Action needed: ",
      category: "announcement",
      severity: "critical",
      summary: "",
      content: "What's happening:\n\nWho it affects:\n\nWhat to do, and by when:\n\nWho to contact:",
    },
  },
  {
    id: "recap",
    title: "Event recap",
    description: "Highlights and thank-yous after an event",
    icon: CalendarCheck,
    tone: "amber",
    values: {
      title: " recap: ",
      category: "event",
      severity: "normal",
      content: "Turnout and highlights:\n\nThank you to:\n\nPhotos are in the gallery. Next event:",
    },
  },
  {
    id: "update",
    title: "Community update",
    description: "Admissions, scholarships, school news",
    icon: Megaphone,
    tone: "peach",
    values: { title: "", category: "update", severity: "normal", content: "The update:\n\nWhy it matters:\n\nWhat happens next:" },
  },
  {
    id: "achievement",
    title: "Alumni achievement",
    description: "Celebrate someone from the community",
    icon: Award,
    tone: "sand",
    values: { title: "Congratulations to ", category: "general", severity: "normal", content: "Who and which batch:\n\nThe achievement:\n\nIn their words:" },
  },
];

function firstSentence(text: string): string {
  const line = text.split("\n").find((l) => l.trim() && !l.trim().endsWith(":"))?.trim() ?? "";
  const m = line.match(/^.{20,240}?[.!?](\s|$)/);
  return (m ? m[0] : line).trim().slice(0, 500);
}

function NewsForm({ initial }: { initial: NewsArticle | null }) {
  const router = useRouter();
  const [start] = useState<NewsValues>({
    title: initial?.title ?? "",
    summary: initial?.summary ?? "",
    content: initial?.content ?? "",
    category: initial?.category ?? "general",
    severity: initial?.severity ?? "normal",
    is_published: initial?.is_published ?? true,
  });
  const [form, setForm] = useState(start);
  const draft = useDraft(initial ? null : "news", form, setForm, start);
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = newsSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return focusFirstError();
    }
    setErrors({});
    setFormError("");
    setBusy(true);
    try {
      const body = { ...parsed.data, summary: parsed.data.summary || null };
      const saved = initial ? await api.news.update(initial.id, body) : await api.news.create(body);
      if (image) await api.news.uploadImage(saved.id, image);
      draft.clear();
      flashToast(form.is_published ? (initial ? "Article updated" : "Article published") : "Saved as draft");
      router.push(`/news/${saved.id}`);
    } catch (err) {
      setFormError(errorText(err));
      setBusy(false);
    }
  };

  const suggestedSummary = firstSentence(form.content);

  return (
    <FormLayout
      tag="News"
      title={initial ? "Edit article" : "Write an article"}
      description="Published articles appear on the news page and send a push notification."
      backHref={initial ? `/news/${initial.id}` : "/updates?type=news"}
      prefill={initial ? undefined : <TemplatePicker templates={TEMPLATES} onPick={(v) => setForm({ ...form, ...v })} />}
      aside={
        <AsideNote title="Severity">
          <p>
            <strong className="text-zinc-900">Critical</strong> articles show as a red banner at the top of the home page. Use it for deadlines and
            urgent notices only.
          </p>
          <p>Unpublished articles are drafts. Only admins can see them, from the Admin page.</p>
        </AsideNote>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        {draft.restoredAt && <DraftBanner savedAt={draft.restoredAt} onDiscard={draft.discard} />}
        {formError && <Notice tone="error">{formError}</Notice>}
        <Field label="Title" required error={errors.title}>
          <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={255} />
        </Field>
        <Field label="Article" required error={errors.content}>
          <TextArea rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </Field>
        <Field
          label="Summary"
          error={errors.summary}
          hint={`One or two sentences shown in lists. ${form.summary.length}/500`}
          suggestions={
            suggestedSummary && suggestedSummary !== form.summary ? (
              <Suggestions label="Suggested summary" options={[{ label: "Use the first sentence of the article", value: suggestedSummary }]} onPick={(summary) => setForm({ ...form, summary })} />
            ) : undefined
          }
        >
          <TextArea rows={2} maxLength={500} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        </Field>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-5">
          <div>
            <span className="block text-xs font-medium text-zinc-700 mb-1.5">Category</span>
            <Segmented label="Category" options={NEWS_CATEGORIES.map((c) => ({ id: c, label: titleCase(c) }))} value={form.category} onChange={(category) => setForm({ ...form, category })} />
          </div>
          <div>
            <span className="block text-xs font-medium text-zinc-700 mb-1.5">Severity</span>
            <Segmented
              label="Severity"
              options={[
                { id: "normal" as const, label: "Normal" },
                { id: "critical" as const, label: "Critical", icon: AlertTriangle },
              ]}
              value={form.severity}
              onChange={(severity) => setForm({ ...form, severity })}
            />
          </div>
        </div>
        <Toggle
          checked={form.is_published}
          onChange={(is_published) => setForm({ ...form, is_published })}
          label="Publish now"
          description={form.is_published ? "Goes live and notifies subscribed members." : "Saved as a draft that only admins can see."}
        />
        <div>
          <span className="block text-xs font-medium text-zinc-700 mb-1.5">Cover image</span>
          <ImagePicker file={image} onChange={setImage} currentUrl={initial?.image_url} />
        </div>
        <FormActions
          cancelHref={initial ? `/news/${initial.id}` : "/updates?type=news"}
          busy={busy}
          label={initial ? "Save changes" : form.is_published ? "Publish" : "Save draft"}
          draftSavedAt={draft.savedAt}
        />
      </form>
    </FormLayout>
  );
}
