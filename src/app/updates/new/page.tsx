"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconAlertTriangle, IconBook, IconSpeakerphone } from "@tabler/icons-react";
import { api, NEWS_CATEGORIES, type NewsCategory, type NewsSeverity } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { errorText } from "@/lib/useApi";
import { useDraft } from "@/lib/useDraft";
import { titleCase } from "@/lib/format";
import { AsideNote, FormActions, FormLayout } from "@/components/layout/FormLayout";
import { DraftBanner, TagSuggestions } from "@/components/forms/Prefill";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { ImagePicker } from "@/components/ui/ImagePicker";
import { RequireAuth } from "@/components/ui/RequireAuth";
import { Select } from "@/components/ui/Select";
import { Notice } from "@/components/ui/States";
import { flashToast } from "@/components/ui/Toast";

const STORY_TAGS = ["memoir", "hostel", "teachers", "career", "startup", "sports", "campus"] as const;

export default function NewUpdatePage() {
  return (
    <RequireAuth reason="Sign in to share an update with the alumni community.">
      {() => <UpdateForm />}
    </RequireAuth>
  );
}

type StoryFormValues = {
  title: string;
  content: string;
  tags: string;
};

type NewsFormValues = {
  title: string;
  summary: string;
  content: string;
  category: NewsCategory;
  severity: NewsSeverity;
};

function UpdateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const initialType = searchParams.get("type") === "news" ? "news" : "story";
  const [type, setType] = useState<"story" | "news">(initialType);

  // Story state
  const [storyForm, setStoryForm] = useState<StoryFormValues>({
    title: "",
    content: "",
    tags: "",
  });
  const [storyImage, setStoryImage] = useState<File | null>(null);
  const storyDraft = useDraft("story_update", storyForm, setStoryForm, { title: "", content: "", tags: "" });

  // News state
  const [newsForm, setNewsForm] = useState<NewsFormValues>({
    title: "",
    summary: "",
    content: "",
    category: "general",
    severity: "normal",
  });
  const [newsImage, setNewsImage] = useState<File | null>(null);
  const newsDraft = useDraft("news_update", newsForm, setNewsForm, {
    title: "",
    summary: "",
    content: "",
    category: "general",
    severity: "normal",
  });

  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (type === "story") {
      const title = storyForm.title.trim();
      const content = storyForm.content.trim();
      if (!title) return setFormError("Please enter a title for your story.");
      if (!content) return setFormError("Please write your story content.");

      setBusy(true);
      try {
        const cleanTags = storyForm.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .join(",");
        const saved = await api.stories.create({
          title,
          content,
          tags: cleanTags || null,
        });
        if (storyImage) {
          await api.stories.uploadImage(saved.id, storyImage);
        }
        storyDraft.clear();
        flashToast("Story published");
        router.push(`/stories/${saved.id}`);
      } catch (err) {
        setFormError(errorText(err));
        setBusy(false);
      }
    } else {
      if (!user?.is_admin) {
        return setFormError("Only association administrators can publish official news.");
      }
      const title = newsForm.title.trim();
      const content = newsForm.content.trim();
      if (!title) return setFormError("Please enter an article headline.");
      if (!content) return setFormError("Please enter the announcement content.");

      setBusy(true);
      try {
        const saved = await api.news.create({
          title,
          summary: newsForm.summary.trim() || null,
          content,
          category: newsForm.category,
          severity: newsForm.severity,
          is_published: true,
        });
        if (newsImage) {
          await api.news.uploadImage(saved.id, newsImage);
        }
        newsDraft.clear();
        flashToast("News announcement published");
        router.push(`/news/${saved.id}`);
      } catch (err) {
        setFormError(errorText(err));
        setBusy(false);
      }
    }
  };

  return (
    <FormLayout
      tag="Updates"
      title="Share an update"
      description="Post a member story or publish an official announcement for the community."
      backHref="/updates"
      aside={
        <AsideNote title={type === "story" ? "Writing a good story" : "Publishing news"}>
          {type === "story" ? (
            <>
              <p>Stories can be personal reflections, campus memories, or career milestones.</p>
              <p>Add descriptive tags so alumni with shared interests can discover your post easily.</p>
            </>
          ) : (
            <>
              <p>Official news articles send a notification to subscribed alumni.</p>
              <p>Critical severity articles display as an alert banner across the platform.</p>
            </>
          )}
        </AsideNote>
      }
    >
      <form onSubmit={submit} className="space-y-6" noValidate>
        {type === "story" && storyDraft.restoredAt && (
          <DraftBanner savedAt={storyDraft.restoredAt} onDiscard={storyDraft.discard} />
        )}
        {type === "news" && newsDraft.restoredAt && (
          <DraftBanner savedAt={newsDraft.restoredAt} onDiscard={newsDraft.discard} />
        )}

        {formError && <Notice tone="error">{formError}</Notice>}

        {/* Update Type Selector */}
        <div>
          <span className="block text-xs font-semibold text-zinc-700 mb-2">Update type</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setType("story");
                setFormError("");
              }}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                type === "story"
                  ? "border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/10"
                  : "border-zinc-200 hover:border-zinc-300 bg-white"
              }`}
            >
              <span className={`p-2 rounded-lg shrink-0 ${type === "story" ? "bg-orange-500 text-white" : "bg-zinc-100 text-zinc-600"}`}>
                <IconBook size={18} stroke={1.6} />
              </span>
              <div className="min-w-0">
                <span className="block text-sm font-semibold text-zinc-900">Member Story</span>
                <span className="block text-xs text-zinc-500 mt-0.5">Memoir, career journey, campus reflection</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setType("news");
                setFormError("");
              }}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                type === "news"
                  ? "border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/10"
                  : "border-zinc-200 hover:border-zinc-300 bg-white"
              }`}
            >
              <span className={`p-2 rounded-lg shrink-0 ${type === "news" ? "bg-orange-500 text-white" : "bg-zinc-100 text-zinc-600"}`}>
                <IconSpeakerphone size={18} stroke={1.6} />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="block text-sm font-semibold text-zinc-900">Official News</span>
                  {!user?.is_admin && (
                    <span className="px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500 text-[10px] font-semibold">
                      Admins only
                    </span>
                  )}
                </div>
                <span className="block text-xs text-zinc-500 mt-0.5">Announcements, notices, and press releases</span>
              </div>
            </button>
          </div>
        </div>

        {type === "news" && !user?.is_admin ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-1">
            <p className="font-semibold">Admin permission required</p>
            <p>
              Only association administrators can publish official news. Choose &ldquo;Member Story&rdquo; above to share your journey or reflections with the alumni community.
            </p>
          </div>
        ) : type === "story" ? (
          <>
            <Field label="Story title" required>
              <TextInput
                value={storyForm.title}
                onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                placeholder="e.g. Ten years after school: what stayed and what faded"
              />
            </Field>

            <Field label="Your story" required hint="Where it happened, who was there, and what it meant.">
              <TextArea
                rows={9}
                value={storyForm.content}
                onChange={(e) => setStoryForm({ ...storyForm, content: e.target.value })}
                placeholder="Write your story here…"
              />
            </Field>

            <Field
              label="Tags"
              hint="Tap a suggested tag or add your own separated by commas."
              suggestions={
                <TagSuggestions
                  tags={STORY_TAGS}
                  value={storyForm.tags}
                  onChange={(tags) => setStoryForm({ ...storyForm, tags })}
                />
              }
            >
              <TextInput
                value={storyForm.tags}
                onChange={(e) => setStoryForm({ ...storyForm, tags: e.target.value })}
                placeholder="memoir, hostel, career"
              />
            </Field>

            <div>
              <span className="block text-xs font-medium text-zinc-700 mb-1.5">Cover image</span>
              <ImagePicker file={storyImage} onChange={setStoryImage} />
            </div>

            <FormActions
              cancelHref="/updates"
              busy={busy}
              label="Publish story"
              draftSavedAt={storyDraft.savedAt}
            />
          </>
        ) : (
          <>
            <Field label="Headline" required>
              <TextInput
                value={newsForm.title}
                onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                placeholder="e.g. Annual alumni meet dates finalized for November"
              />
            </Field>

            <Field label="Short summary" hint="One or two sentences shown in lists and alert previews.">
              <TextInput
                value={newsForm.summary}
                onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                placeholder="Quick takeaway for readers"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Category</label>
                <Select
                  value={newsForm.category}
                  onChange={(category) => setNewsForm({ ...newsForm, category: category as NewsCategory })}
                  options={NEWS_CATEGORIES.map((c) => ({
                    value: c,
                    label: titleCase(c),
                  }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Severity</label>
                <Select
                  value={newsForm.severity}
                  onChange={(severity) => setNewsForm({ ...newsForm, severity: severity as NewsSeverity })}
                  options={[
                    { value: "normal", label: "Normal", description: "Standard update in feed" },
                    { value: "critical", label: "Critical", icon: IconAlertTriangle, description: "Red alert banner on home page" },
                  ]}
                />
              </div>
            </div>

            <Field label="Full announcement" required>
              <TextArea
                rows={9}
                value={newsForm.content}
                onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                placeholder="Full details, schedule, requirements or who to contact…"
              />
            </Field>

            <div>
              <span className="block text-xs font-medium text-zinc-700 mb-1.5">Cover image</span>
              <ImagePicker file={newsImage} onChange={setNewsImage} />
            </div>

            <FormActions
              cancelHref="/updates"
              busy={busy}
              label="Publish news"
              draftSavedAt={newsDraft.savedAt}
            />
          </>
        )}
      </form>
    </FormLayout>
  );
}

