"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, MapPin, PartyPopper, Video } from "lucide-react";
import { api, type EventItem } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { editId, errorText } from "@/lib/useApi";
import { useDraft } from "@/lib/useDraft";
import { fromLocalInput, toLocalInput } from "@/lib/format";
import { localInputAt, nextWeekday } from "@/lib/prefill";
import { eventSchema, fieldErrors } from "@/lib/validations";
import { AsideNote, EditLoader, FormActions, FormLayout } from "@/components/layout/FormLayout";
import { DraftBanner, Suggestions, TemplatePicker, type Template } from "@/components/forms/Prefill";
import { Field, TextArea, TextInput, focusFirstError } from "@/components/ui/Field";
import { ImagePicker } from "@/components/ui/ImagePicker";
import { RequireAuth } from "@/components/ui/RequireAuth";
import { Notice } from "@/components/ui/States";
import { flashToast } from "@/components/ui/Toast";

export default function EventEditorPage() {
  const id = editId(useSearchParams().get("id"));
  return (
    <RequireAuth reason="Sign in to host an event.">
      {() => <EditLoader id={id} load={api.events.get}>{(initial) => <EventForm initial={initial} />}</EditLoader>}
    </RequireAuth>
  );
}

type EventFormValues = { title: string; description: string; location: string; datetime: string; max_participants: string };

function templates(batch: string, city: string): Template<EventFormValues>[] {
  return [
    {
      id: "reunion",
      title: "Batch reunion",
      description: "A day on campus with your batch",
      icon: PartyPopper,
      values: () => ({
        title: batch ? `${batch} batch reunion` : "Batch reunion",
        location: "School campus",
        datetime: localInputAt(nextWeekday(6, 10, 3)),
        max_participants: "120",
        description:
          "Schedule\n10:00  Welcome and campus walk\n12:30  Lunch in the mess\n15:00  Photos and open session\n\nStay: hostel rooms available on request.\nContact: ",
      }),
    },
    {
      id: "chapter",
      title: "City chapter meetup",
      description: "Evening catch-up with alumni nearby",
      icon: MapPin,
      tone: "amber",
      values: () => ({
        title: city ? `${city} chapter meetup` : "City chapter meetup",
        location: city ? `${city}, venue to be confirmed` : "",
        datetime: localInputAt(nextWeekday(6, 18)),
        max_participants: "30",
        description: "An informal evening to meet alumni living in the city. Snacks on the house, everyone pays for their own dinner.\n\nRSVP so we can book the right size table.",
      }),
    },
    {
      id: "career",
      title: "Career talk on campus",
      description: "Guide current students on what comes next",
      icon: GraduationCap,
      tone: "peach",
      values: () => ({
        title: "Career talk for Class 11 and 12",
        location: "School auditorium",
        datetime: localInputAt(nextWeekday(6, 11, 1)),
        max_participants: "",
        description: "A one-hour session for senior students on choosing streams, entrance exams and life after school, followed by Q&A.\n\nAlumni volunteers welcome to join the panel.",
      }),
    },
    {
      id: "online",
      title: "Online session",
      description: "AMA or workshop over a video call",
      icon: Video,
      tone: "sand",
      values: () => ({
        title: "Online AMA: ",
        location: "Online, link shared after RSVP",
        datetime: localInputAt(nextWeekday(0, 19)),
        max_participants: "100",
        description: "45 minutes of conversation and 15 minutes of open questions.\n\nThe meeting link goes out by email an hour before we start.",
      }),
    },
  ];
}

const DATE_PICKS = () => [
  { label: "This Sat, 10 AM", value: localInputAt(nextWeekday(6, 10)) },
  { label: "This Sun, 10 AM", value: localInputAt(nextWeekday(0, 10)) },
  { label: "Sat evening, 6 PM", value: localInputAt(nextWeekday(6, 18)) },
  { label: "In 2 weeks", value: localInputAt(nextWeekday(6, 10, 1)) },
  { label: "In a month", value: localInputAt(nextWeekday(6, 10, 3)) },
];

function EventForm({ initial }: { initial: EventItem | null }) {
  const router = useRouter();
  const { user } = useAuth();
  const [start] = useState<EventFormValues>(() => ({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    location: initial?.location ?? "",
    datetime: initial ? toLocalInput(initial.datetime) : localInputAt(nextWeekday(6, 10)),
    max_participants: initial?.max_participants?.toString() ?? "",
  }));
  const [form, setForm] = useState(start);
  const draft = useDraft(initial ? null : "event", form, setForm, start);
  const [datePicks] = useState(DATE_PICKS);
  const [banner, setBanner] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key: keyof EventFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });
  const put = (key: keyof EventFormValues) => (value: string) => setForm({ ...form, [key]: value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = eventSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return focusFirstError();
    }
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
      draft.clear();
      flashToast(initial ? "Event updated" : "Event published");
      router.push(`/events/${saved.id}`);
    } catch (err) {
      setFormError(errorText(err));
      setBusy(false);
    }
  };

  const back = initial ? `/events/${initial.id}` : "/events";
  const city = user?.city ?? "";

  return (
    <FormLayout
      tag="Events"
      title={initial ? "Edit event" : "Host an event"}
      description="Batch reunions, city chapter meetups or campus visits."
      backHref={back}
      prefill={initial ? undefined : <TemplatePicker templates={templates(user?.batch ?? "", city)} onPick={(v) => setForm({ ...form, ...v })} />}
      aside={
        <AsideNote title="Before you publish">
          <p>New events send a push notification to everyone who has turned notifications on.</p>
          <p>Add the full address and a contact number in the description so outstation alumni can plan travel.</p>
        </AsideNote>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        {draft.restoredAt && <DraftBanner savedAt={draft.restoredAt} onDiscard={draft.discard} />}
        {formError && <Notice tone="error">{formError}</Notice>}
        <Field label="Title" required error={errors.title}>
          <TextInput value={form.title} onChange={set("title")} placeholder="e.g. 2012 batch decennial reunion" />
        </Field>
        <Field label="Date and time" required error={errors.datetime} suggestions={<Suggestions options={datePicks} current={form.datetime} onPick={put("datetime")} />}>
          <TextInput type="datetime-local" value={form.datetime} onChange={set("datetime")} className="font-mono text-xs sm:max-w-xs" />
        </Field>
        <Field
          label="Location"
          required
          error={errors.location}
          suggestions={
            <Suggestions
              options={["School campus", "School auditorium", "Online, link shared after RSVP", ...(city ? [`${city}, venue to be confirmed`] : [])]}
              current={form.location}
              onPick={put("location")}
            />
          }
        >
          <TextInput value={form.location} onChange={set("location")} placeholder="e.g. School auditorium, or a full address" />
        </Field>
        <Field
          label="Max participants"
          error={errors.max_participants}
          hint="Leave empty for no limit."
          suggestions={
            <Suggestions
              options={[
                { label: "No limit", value: "" },
                { label: "20", value: "20" },
                { label: "50", value: "50" },
                { label: "100", value: "100" },
                { label: "200", value: "200" },
              ]}
              current={form.max_participants}
              onPick={put("max_participants")}
            />
          }
        >
          <TextInput type="number" min={1} inputMode="numeric" value={form.max_participants} onChange={set("max_participants")} className="sm:max-w-[10rem]" />
        </Field>
        <Field label="Details" required error={errors.description}>
          <TextArea rows={7} value={form.description} onChange={set("description")} placeholder="Schedule, food, stay arrangements, who to contact…" />
        </Field>
        <div>
          <span className="block text-xs font-medium text-zinc-700 mb-1.5">Banner image</span>
          <ImagePicker file={banner} onChange={setBanner} currentUrl={initial?.banner_url} />
        </div>
        <FormActions cancelHref={back} busy={busy} label={initial ? "Save changes" : "Publish event"} draftSavedAt={draft.savedAt} />
      </form>
    </FormLayout>
  );
}
