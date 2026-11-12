"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftRight, Briefcase, Bus, Car, Home, Plane, School, Users } from "lucide-react";
import { api, TRANSIT_TYPES, type TransitListing, type TransitType } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { editId, errorText } from "@/lib/useApi";
import { useDraft } from "@/lib/useDraft";
import { nullable, titleCase } from "@/lib/format";
import { fieldErrors, transitSchema } from "@/lib/validations";
import { AsideNote, EditLoader, FormActions, FormLayout } from "@/components/layout/FormLayout";
import { DraftBanner, Segmented, Suggestions, TemplatePicker, type Template } from "@/components/forms/Prefill";
import { Field, TextArea, TextInput, focusFirstError } from "@/components/ui/Field";
import { RequireAuth } from "@/components/ui/RequireAuth";
import { Notice } from "@/components/ui/States";
import { flashToast } from "@/components/ui/Toast";
import { btnIcon } from "@/components/ui/styles";

export default function TransitEditorPage() {
  const id = editId(useSearchParams().get("id"));
  return (
    <RequireAuth reason="Sign in to offer a ride.">
      {() => <EditLoader id={id} load={api.transit.get}>{(initial) => <TransitForm initial={initial} />}</EditLoader>}
    </RequireAuth>
  );
}

type TransitValues = {
  title: string;
  transit_type: TransitType;
  from_location: string;
  to_location: string;
  schedule: string;
  available_seats: string;
  description: string;
  contact_name: string;
  contact_info: string;
};

const TYPE_ICONS = { carpool: Car, rideshare: Users, bus: Bus, other: ArrowLeftRight } as const;

const TEMPLATES: Template<TransitValues>[] = [
  {
    id: "office",
    title: "Daily office carpool",
    description: "Same route every weekday",
    icon: Briefcase,
    values: { transit_type: "carpool", schedule: "Mon–Fri, 8:30 AM", available_seats: "3", description: "Fuel cost shared equally. Happy to pick up along the way." },
  },
  {
    id: "home",
    title: "Weekend trip home",
    description: "Heading to your hometown",
    icon: Home,
    tone: "amber",
    values: { transit_type: "rideshare", schedule: "Friday evening, back Sunday", available_seats: "2", description: "Leaving after work. One bag per person please." },
  },
  {
    id: "campus",
    title: "Ride to the reunion",
    description: "Pool a car to the school campus",
    icon: School,
    tone: "peach",
    values: { transit_type: "carpool", to_location: "School campus", schedule: "One-time, morning", available_seats: "3", description: "Let's travel together to the reunion and split the cost." },
  },
  {
    id: "airport",
    title: "Airport or station drop",
    description: "One-time drop with room to spare",
    icon: Plane,
    tone: "sand",
    values: { transit_type: "rideshare", to_location: "Airport", schedule: "One-time", available_seats: "2", description: "Space for two medium bags." },
  },
];

function TransitForm({ initial }: { initial: TransitListing | null }) {
  const router = useRouter();
  const { user } = useAuth();
  const [start] = useState<TransitValues>({
    title: initial?.title ?? "",
    transit_type: initial?.transit_type ?? "carpool",
    from_location: initial?.from_location ?? user?.city ?? "",
    to_location: initial?.to_location ?? "",
    schedule: initial?.schedule ?? "",
    available_seats: initial?.available_seats?.toString() ?? (initial ? "" : "3"),
    description: initial?.description ?? "",
    contact_name: initial?.contact_name ?? user?.name.split(" ")[0] ?? "",
    contact_info: initial?.contact_info ?? user?.phone ?? user?.email ?? "",
  });
  const [form, setForm] = useState(start);
  const draft = useDraft(initial ? null : "ride", form, setForm, start);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key: keyof TransitValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value });
  const put = (key: keyof TransitValues) => (value: string) => setForm({ ...form, [key]: value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = transitSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return focusFirstError();
    }
    setErrors({});
    setFormError("");
    setBusy(true);
    try {
      const { available_seats, ...rest } = form;
      const body = { ...nullable(rest), transit_type: form.transit_type, available_seats: available_seats === "" ? null : Number(available_seats) };
      if (initial) await api.transit.update(initial.id, body);
      else await api.transit.create(body);
      draft.clear();
      flashToast(initial ? "Ride updated" : "Ride posted");
      router.push("/transit");
    } catch (err) {
      setFormError(errorText(err));
      setBusy(false);
    }
  };

  const from = form.from_location.trim();
  const to = form.to_location.trim();
  const titleIdeas = from && to ? [`${titleCase(form.transit_type)}: ${from} to ${to}`, `${from} → ${to}, ${form.schedule || "seats free"}`] : [];

  return (
    <FormLayout
      tag="Transit"
      title={initial ? "Edit ride" : "Offer a ride"}
      description="Carpools, rideshares and bus information."
      backHref="/transit"
      prefill={initial ? undefined : <TemplatePicker title="What kind of trip?" subtitle="Your city and contact are already filled in." templates={TEMPLATES} onPick={(v) => setForm({ ...form, ...v })} />}
      aside={
        <AsideNote title="Keep it current">
          <p>Update the free seats as they fill, and delete the listing once the trip is done.</p>
        </AsideNote>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        {draft.restoredAt && <DraftBanner savedAt={draft.restoredAt} onDiscard={draft.discard} />}
        {formError && <Notice tone="error">{formError}</Notice>}
        <div>
          <span className="block text-xs font-medium text-zinc-700 mb-1.5">
            Type <span className="text-orange-600">*</span>
          </span>
          <Segmented
            label="Type"
            options={TRANSIT_TYPES.map((t) => ({ id: t, label: titleCase(t), icon: TYPE_ICONS[t] }))}
            value={form.transit_type}
            onChange={(transit_type) => setForm({ ...form, transit_type })}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-x-2 gap-y-3 sm:items-start">
          <Field label="From" required error={errors.from_location}>
            <TextInput value={form.from_location} onChange={set("from_location")} placeholder="Starting point" />
          </Field>
          <button
            type="button"
            onClick={() => setForm({ ...form, from_location: form.to_location, to_location: form.from_location })}
            className={`${btnIcon} justify-self-center sm:mt-[26px] rotate-90 sm:rotate-0`}
            aria-label="Swap from and to"
            data-tip="Swap"
          >
            <ArrowLeftRight size={14} />
          </button>
          <Field label="To" required error={errors.to_location} suggestions={<Suggestions options={["School campus", "Airport", "Railway station", "Bus stand"]} current={form.to_location} onPick={put("to_location")} />}>
            <TextInput value={form.to_location} onChange={set("to_location")} placeholder="Destination" />
          </Field>
        </div>
        <Field label="Title" required error={errors.title} suggestions={titleIdeas.length ? <Suggestions label="Suggested titles" options={titleIdeas} current={form.title} onPick={put("title")} /> : undefined}>
          <TextInput value={form.title} onChange={set("title")} placeholder="e.g. Daily carpool to Electronic City" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Field
            label="Schedule"
            className="sm:col-span-2"
            suggestions={<Suggestions options={["Mon–Fri, 8:30 AM", "Weekends", "Friday evening", "One-time"]} current={form.schedule} onPick={put("schedule")} />}
          >
            <TextInput value={form.schedule} onChange={set("schedule")} placeholder="e.g. Mon–Fri, 8:15 AM" />
          </Field>
          <Field label="Free seats" error={errors.available_seats} suggestions={<Suggestions options={["1", "2", "3", "4"]} current={form.available_seats} onPick={put("available_seats")} />}>
            <TextInput type="number" min={0} inputMode="numeric" value={form.available_seats} onChange={set("available_seats")} />
          </Field>
        </div>
        <Field label="Details">
          <TextArea rows={3} value={form.description} onChange={set("description")} placeholder="Pickup points, cost sharing, luggage space…" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Contact name">
            <TextInput value={form.contact_name} onChange={set("contact_name")} autoComplete="given-name" />
          </Field>
          <Field label="Contact phone or email">
            <TextInput value={form.contact_info} onChange={set("contact_info")} />
          </Field>
        </div>
        <FormActions cancelHref="/transit" busy={busy} label={initial ? "Save changes" : "Post ride"} draftSavedAt={draft.savedAt} />
      </form>
    </FormLayout>
  );
}
