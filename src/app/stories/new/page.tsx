"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BedDouble, Briefcase, HeartHandshake, Trophy } from "lucide-react";
import { api, type Story } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { editId, errorText } from "@/lib/useApi";
import { useDraft } from "@/lib/useDraft";
import { fieldErrors, storySchema } from "@/lib/validations";
import { AsideNote, EditLoader, FormActions, FormLayout } from "@/components/layout/FormLayout";
import { DraftBanner, TagSuggestions, TemplatePicker, type Template } from "@/components/forms/Prefill";
import { Field, TextArea, TextInput, focusFirstError } from "@/components/ui/Field";
import { ImagePicker } from "@/components/ui/ImagePicker";
import { RequireAuth } from "@/components/ui/RequireAuth";
import { Notice } from "@/components/ui/States";
import { flashToast } from "@/components/ui/Toast";

export default function StoryEditorPage() {
  const id = editId(useSearchParams().get("id"));
  return (
    <RequireAuth reason="Sign in to share a story.">
      {() => <EditLoader id={id} load={api.stories.get}>{(initial) => <StoryForm initial={initial} />}</EditLoader>}
    </RequireAuth>
  );
}

type StoryValues = { title: string; content: string; tags: string };

const TAGS = ["memoir", "hostel", "teachers", "career", "startup", "sports", "gratitude", "milestone", "campus"] as const;

function templates(batch: string): Template<StoryValues>[] {
  const from = batch ? ` (batch of ${batch})` : "";
  return [
    {
      id: "hostel",
      title: "A hostel memory",
      description: "Late nights, mess food, dorm friendships",
      icon: BedDouble,
      values: {
        title: "That night in the hostel when…",
        content: `Where and when it happened${from}:\n\nWho was there:\n\nWhat happened:\n\nWhy I still think about it:`,
        tags: "memoir, hostel",
      },
    },
    {
      id: "career",
      title: "My career journey",
      description: "From the school gate to where you are now",
      icon: Briefcase,
      tone: "amber",
      values: {
        title: "From Navodaya to ",
        content: "Where I started:\n\nThe turning point:\n\nWhat I do today:\n\nOne piece of advice for current students:",
        tags: "career",
      },
    },
    {
      id: "teacher",
      title: "A teacher who shaped me",
      description: "Say thank you, publicly",
      icon: HeartHandshake,
      tone: "peach",
      values: {
        title: "Thank you, ",
        content: "The subject they taught and the years:\n\nA moment I remember:\n\nWhat they taught me beyond the syllabus:",
        tags: "teachers, gratitude",
      },
    },
    {
      id: "milestone",
      title: "Celebrating a milestone",
      description: "A launch, an award, a new chapter",
      icon: Trophy,
      tone: "sand",
      values: {
        title: "",
        content: "The milestone:\n\nThe people who helped along the way:\n\nWhat comes next:",
        tags: "milestone",
      },
    },
  ];
}

function StoryForm({ initial }: { initial: Story | null }) {
  const router = useRouter();
  const { user } = useAuth();
  const [start] = useState<StoryValues>({ title: initial?.title ?? "", content: initial?.content ?? "", tags: initial?.tags ?? "" });
  const [form, setForm] = useState(start);
  const draft = useDraft(initial ? null : "story", form, setForm, start);
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = storySchema.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return focusFirstError();
    }
    setErrors({});
    setFormError("");
    setBusy(true);
    try {
      const tags = (parsed.data.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean).join(",");
      const body = { title: parsed.data.title, content: parsed.data.content, tags: tags || null };
      const saved = initial ? await api.stories.update(initial.id, body) : await api.stories.create(body);
      if (image) await api.stories.uploadImage(saved.id, image);
      draft.clear();
      flashToast(initial ? "Story updated" : "Story published");
      router.push(`/stories/${saved.id}`);
    } catch (err) {
      setFormError(errorText(err));
      setBusy(false);
    }
  };

  const back = initial ? `/stories/${initial.id}` : "/updates?type=stories";
  const words = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;

  return (
    <FormLayout
      tag="Stories"
      title={initial ? "Edit story" : "Write a story"}
      description="A memory from school, a career journey, or something worth celebrating."
      backHref={back}
      prefill={
        initial ? undefined : (
          <TemplatePicker
            title="Need a starting point?"
            subtitle="Each prompt gives you a title and a few questions to answer."
            templates={templates(user?.batch ?? "")}
            onPick={(v) => setForm({ ...form, ...v })}
          />
        )
      }
      aside={
        <AsideNote title="Tips">
          <p>Mention your batch year and the people involved so batchmates recognise the story.</p>
          <p>Tags help others find related stories, for example: memoir, hostel, startup.</p>
        </AsideNote>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        {draft.restoredAt && <DraftBanner savedAt={draft.restoredAt} onDiscard={draft.discard} />}
        {formError && <Notice tone="error">{formError}</Notice>}
        <Field label="Title" required error={errors.title}>
          <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Give it a headline" />
        </Field>
        <Field label="Story" required error={errors.content} hint={words ? `${words} words · about ${Math.max(1, Math.round(words / 200))} min read` : undefined}>
          <TextArea rows={12} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Start with where and when it happened…" />
        </Field>
        <Field label="Tags" hint="Tap to add, or type your own separated by commas." suggestions={<TagSuggestions tags={TAGS} value={form.tags} onChange={(tags) => setForm({ ...form, tags })} />}>
          <TextInput value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="memoir, hostel" />
        </Field>
        <div>
          <span className="block text-xs font-medium text-zinc-700 mb-1.5">Image</span>
          <ImagePicker file={image} onChange={setImage} currentUrl={initial?.image_url} />
        </div>
        <FormActions cancelHref={back} busy={busy} label={initial ? "Save changes" : "Publish story"} draftSavedAt={draft.savedAt} />
      </form>
    </FormLayout>
  );
}
