"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, type Story } from "@/lib/api";
import { editId, errorText } from "@/lib/useApi";
import { fieldErrors, storySchema } from "@/lib/validations";
import { AsideNote, EditLoader, FormActions, FormLayout } from "@/components/layout/FormLayout";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { ImagePicker } from "@/components/ui/ImagePicker";
import { RequireAuth } from "@/components/ui/RequireAuth";
import { Notice } from "@/components/ui/States";

export default function StoryEditorPage() {
  const id = editId(useSearchParams().get("id"));
  return (
    <RequireAuth reason="Sign in to share a story.">
      {() => <EditLoader id={id} load={api.stories.get}>{(initial) => <StoryForm initial={initial} />}</EditLoader>}
    </RequireAuth>
  );
}

function StoryForm({ initial }: { initial: Story | null }) {
  const router = useRouter();
  const [form, setForm] = useState({ title: initial?.title ?? "", content: initial?.content ?? "", tags: initial?.tags ?? "" });
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = storySchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setFormError("");
    setBusy(true);
    try {
      const tags = (parsed.data.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean).join(",");
      const body = { title: parsed.data.title, content: parsed.data.content, tags: tags || null };
      const saved = initial ? await api.stories.update(initial.id, body) : await api.stories.create(body);
      if (image) await api.stories.uploadImage(saved.id, image);
      router.push(`/stories/${saved.id}`);
    } catch (err) {
      setFormError(errorText(err));
      setBusy(false);
    }
  };

  const back = initial ? `/stories/${initial.id}` : "/stories";

  return (
    <FormLayout
      tag="Stories"
      title={initial ? "Edit story" : "Write a story"}
      description="A memory from school, a career journey, or something worth celebrating."
      backHref={back}
      aside={
        <AsideNote title="Tips">
          <p>Mention your batch year and the people involved so batchmates recognise the story.</p>
          <p>Tags help others find related stories, for example: memoir, hostel, startup.</p>
        </AsideNote>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {formError && <Notice tone="error">{formError}</Notice>}
        <Field label="Title" required error={errors.title}>
          <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="Story" required error={errors.content}>
          <TextArea rows={12} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </Field>
        <Field label="Tags" hint="Comma separated, e.g. memoir, hostel">
          <TextInput value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        </Field>
        <div>
          <span className="block text-xs font-medium text-zinc-700 mb-1.5">Image</span>
          <ImagePicker file={image} onChange={setImage} currentUrl={initial?.image_url} />
        </div>
        <FormActions cancelHref={back} busy={busy} label={initial ? "Save changes" : "Publish story"} />
      </form>
    </FormLayout>
  );
}
