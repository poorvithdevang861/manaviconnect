"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, TRANSIT_TYPES, type TransitListing, type TransitType } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { editId, errorText } from "@/lib/useApi";
import { nullable, titleCase } from "@/lib/format";
import { fieldErrors, transitSchema } from "@/lib/validations";
import { AsideNote, EditLoader, FormActions, FormLayout } from "@/components/layout/FormLayout";
import { Field, Select, TextArea, TextInput } from "@/components/ui/Field";
import { RequireAuth } from "@/components/ui/RequireAuth";
import { Notice } from "@/components/ui/States";

export default function TransitEditorPage() {
  const id = editId(useSearchParams().get("id"));
  return (
    <RequireAuth reason="Sign in to offer a ride.">
      {() => <EditLoader id={id} load={api.transit.get}>{(initial) => <TransitForm initial={initial} />}</EditLoader>}
    </RequireAuth>
  );
}

function TransitForm({ initial }: { initial: TransitListing | null }) {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    transit_type: (initial?.transit_type ?? "carpool") as TransitType,
    from_location: initial?.from_location ?? "",
    to_location: initial?.to_location ?? "",
    schedule: initial?.schedule ?? "",
    available_seats: initial?.available_seats?.toString() ?? "",
    description: initial?.description ?? "",
    contact_name: initial?.contact_name ?? user?.name.split(" ")[0] ?? "",
    contact_info: initial?.contact_info ?? user?.phone ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = transitSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setFormError("");
    setBusy(true);
    try {
      const { available_seats, ...rest } = form;
      const body = { ...nullable(rest), transit_type: form.transit_type, available_seats: available_seats === "" ? null : Number(available_seats) };
      if (initial) await api.transit.update(initial.id, body);
      else await api.transit.create(body);
      router.push("/transit");
    } catch (err) {
      setFormError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <FormLayout
      tag="Transit"
      title={initial ? "Edit ride" : "Offer a ride"}
      description="Carpools, rideshares and bus information."
      backHref="/transit"
      aside={
        <AsideNote title="Keep it current">
          <p>Update the free seats as they fill, and delete the listing once the trip is done.</p>
        </AsideNote>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {formError && <Notice tone="error">{formError}</Notice>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Title" required error={errors.title} className="sm:col-span-2">
            <TextInput value={form.title} onChange={set("title")} placeholder="e.g. Daily carpool to Electronic City" />
          </Field>
          <Field label="Type" required>
            <Select value={form.transit_type} onChange={set("transit_type")}>
              {TRANSIT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {titleCase(t)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="From" required error={errors.from_location}>
            <TextInput value={form.from_location} onChange={set("from_location")} />
          </Field>
          <Field label="To" required error={errors.to_location}>
            <TextInput value={form.to_location} onChange={set("to_location")} />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Schedule" className="sm:col-span-2" hint="e.g. Mon–Fri, 8:15 AM">
            <TextInput value={form.schedule} onChange={set("schedule")} />
          </Field>
          <Field label="Free seats" error={errors.available_seats}>
            <TextInput type="number" min={0} value={form.available_seats} onChange={set("available_seats")} />
          </Field>
        </div>
        <Field label="Details">
          <TextArea rows={3} value={form.description} onChange={set("description")} placeholder="Pickup points, cost sharing, luggage space…" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Contact name">
            <TextInput value={form.contact_name} onChange={set("contact_name")} />
          </Field>
          <Field label="Contact phone or email">
            <TextInput value={form.contact_info} onChange={set("contact_info")} />
          </Field>
        </div>
        <FormActions cancelHref="/transit" busy={busy} label={initial ? "Save changes" : "Post ride"} />
      </form>
    </FormLayout>
  );
}
