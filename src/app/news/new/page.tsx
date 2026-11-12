"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, NEWS_CATEGORIES, type NewsArticle, type NewsCategory, type NewsSeverity } from "@/lib/api";
import { editId, errorText } from "@/lib/useApi";
import { titleCase } from "@/lib/format";
import { fieldErrors, newsSchema } from "@/lib/validations";
import { AsideNote, EditLoader, FormActions, FormLayout } from "@/components/layout/FormLayout";
import { Field, Select, TextArea, TextInput } from "@/components/ui/Field";
import { ImagePicker } from "@/components/ui/ImagePicker";
import { RequireAuth } from "@/components/ui/RequireAuth";
import { Notice } from "@/components/ui/States";

export default function NewsEditorPage() {
  const id = editId(useSearchParams().get("id"));
  return (
    <RequireAuth admin reason="Only admins can publish news.">
      {() => <EditLoader id={id} load={api.news.get}>{(initial) => <NewsForm initial={initial} />}</EditLoader>}
    </RequireAuth>
  );
}

function NewsForm({ initial }: { initial: NewsArticle | null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    summary: initial?.summary ?? "",
    content: initial?.content ?? "",
    category: (initial?.category ?? "general") as NewsCategory,
    severity: (initial?.severity ?? "normal") as NewsSeverity,
    is_published: initial?.is_published ?? true,
  });
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = newsSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setFormError("");
    setBusy(true);
    try {
      const body = { ...parsed.data, summary: parsed.data.summary || null };
      const saved = initial ? await api.news.update(initial.id, body) : await api.news.create(body);
      if (image) await api.news.uploadImage(saved.id, image);
      router.push(`/news/${saved.id}`);
    } catch (err) {
      setFormError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <FormLayout
      tag="News"
      title={initial ? "Edit article" : "Write an article"}
      description="Published articles appear on the news page and send a push notification."
      backHref={initial ? `/news/${initial.id}` : "/news"}
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
      <form onSubmit={submit} className="space-y-4" noValidate>
        {formError && <Notice tone="error">{formError}</Notice>}
        <Field label="Title" required error={errors.title}>
          <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={255} />
        </Field>
        <Field label="Summary" error={errors.summary} hint="One or two sentences shown in lists. Up to 500 characters.">
          <TextArea rows={2} maxLength={500} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        </Field>
        <Field label="Article" required error={errors.content}>
          <TextArea rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Category">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as NewsCategory })}>
              {NEWS_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {titleCase(c)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Severity">
            <Select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as NewsSeverity })}>
              <option value="normal">Normal</option>
              <option value="critical">Critical</option>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.is_published ? "1" : "0"} onChange={(e) => setForm({ ...form, is_published: e.target.value === "1" })}>
              <option value="1">Published</option>
              <option value="0">Draft</option>
            </Select>
          </Field>
        </div>
        <div>
          <span className="block text-xs font-medium text-zinc-700 mb-1.5">Cover image</span>
          <ImagePicker file={image} onChange={setImage} currentUrl={initial?.image_url} />
        </div>
        <FormActions cancelHref={initial ? `/news/${initial.id}` : "/news"} busy={busy} label={initial ? "Save changes" : form.is_published ? "Publish" : "Save draft"} />
      </form>
    </FormLayout>
  );
}
