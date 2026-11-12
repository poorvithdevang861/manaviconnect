"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, type EventItem } from "@/lib/api";
import { editId, errorText } from "@/lib/useApi";
import { fromLocalInput, toLocalInput } from "@/lib/format";
import { eventSchema, fieldErrors } from "@/lib/validations";
import { AsideNote, EditLoader, FormActions, FormLayout } from "@/components/layout/FormLayout";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { ImagePicker } from "@/components/ui/ImagePicker";
import { RequireAuth } from "@/components/ui/RequireAuth";
import { Notice } from "@/components/ui/States";

export default function EventEditorPage() {
  const id = editId(useSearchParams().get("id"));
  return (
    <RequireAuth reason="Sign in to host an event.">
      {() => <EditLoader id={id} load={api.events.get}>{(initial) => <EventForm initial={initial} />}</EditLoader>}
    </RequireAuth>
  );
}

function EventForm({ initial }: { initial: EventItem | null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    location: initial?.location ?? "",
    datetime: toLocalInput(initial?.datetime),
    max_participants: initial?.max_participants?.toString() ?? "",
  });
  const [banner, setBanner] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = eventSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setFormError("");
    setBusy(true);
    try {
      const body = {
        title: parsed.data.title,
        description: parsed.data.description,
        location: parsed.data.location,
        datetime: fromLocalInput(parsed.data.datetime),
        max_participants: parsed.data.max_participants === "" || parsed.data.max_participants === undefined ? null : parsed.data.max_participants,
      };
      const saved = initial ? await api.events.update(initial.id, body) : await api.events.create(body);
      if (banner) await api.events.uploadBanner(saved.id, banner);
      router.push(`/events/${saved.id}`);
    } catch (err) {
      setFormError(errorText(err));
      setBusy(false);
    }
  };

  const back = initial ? `/events/${initial.id}` : "/events";

  return (
    <FormLayout
      tag="Events"
      title={initial ? "Edit event" : "Host an event"}
      description="Batch reunions, city chapter meetups or campus visits."
      backHref={back}
      aside={
        <AsideNote title="Before you publish">
          <p>New events send a push notification to everyone who has turned notifications on.</p>
          <p>Add the full address and a contact number in the description so outstation alumni can plan travel.</p>
        </AsideNote>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {formError && <Notice tone="error">{formError}</Notice>}
        <Field label="Title" required error={errors.title}>
          <TextInput value={form.title} onChange={set("title")} placeholder="e.g. 2012 batch decennial reunion" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Date and time" required error={errors.datetime}>
            <TextInput type="datetime-local" value={form.datetime} onChange={set("datetime")} className="font-mono text-xs" />
          </Field>
          <Field label="Max participants" error={errors.max_participants} hint="Leave empty for no limit.">
            <TextInput type="number" min={1} value={form.max_participants} onChange={set("max_participants")} />
          </Field>
        </div>
        <Field label="Location" required error={errors.location}>
          <TextInput value={form.location} onChange={set("location")} placeholder="e.g. School auditorium, or a full address" />
        </Field>
        <Field label="Details" required error={errors.description}>
          <TextArea rows={6} value={form.description} onChange={set("description")} placeholder="Schedule, food, stay arrangements, who to contact…" />
        </Field>
        <div>
          <span className="block text-xs font-medium text-zinc-700 mb-1.5">Banner image</span>
          <ImagePicker file={banner} onChange={setBanner} currentUrl={initial?.banner_url} />
        </div>
        <FormActions cancelHref={back} busy={busy} label={initial ? "Save changes" : "Publish event"} />
      </form>
    </FormLayout>
  );
}
