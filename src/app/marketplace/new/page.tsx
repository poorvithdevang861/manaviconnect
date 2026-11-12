"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, MARKET_CATEGORIES, type MarketCategory, type MarketListing } from "@/lib/api";
import { editId, errorText } from "@/lib/useApi";
import { nullable, titleCase } from "@/lib/format";
import { fieldErrors, marketSchema } from "@/lib/validations";
import { AsideNote, EditLoader, FormActions, FormLayout } from "@/components/layout/FormLayout";
import { Field, Select, TextArea, TextInput } from "@/components/ui/Field";
import { ImagePicker } from "@/components/ui/ImagePicker";
import { RequireAuth } from "@/components/ui/RequireAuth";
import { Notice } from "@/components/ui/States";

export default function MarketEditorPage() {
  const id = editId(useSearchParams().get("id"));
  return (
    <RequireAuth reason="Sign in to list something.">
      {() => <EditLoader id={id} load={api.marketplace.get}>{(initial) => <MarketForm initial={initial} />}</EditLoader>}
    </RequireAuth>
  );
}

function MarketForm({ initial }: { initial: MarketListing | null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    category: (initial?.category ?? "produce") as MarketCategory,
    price: initial?.price ? String(Number(initial.price)) : "",
    is_negotiable: initial?.is_negotiable ?? false,
    location: initial?.location ?? "",
    contact_info: initial?.contact_info ?? "",
    tags: initial?.tags ?? "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = marketSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setFormError("");
    setBusy(true);
    try {
      const body = {
        ...nullable({ title: form.title, description: form.description, location: form.location, contact_info: form.contact_info }),
        category: form.category,
        is_negotiable: form.is_negotiable,
        price: form.price === "" ? null : Number(form.price),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean).join(",") || null,
      };
      const saved = initial ? await api.marketplace.update(initial.id, body) : await api.marketplace.create(body);
      if (image) await api.marketplace.uploadImage(saved.id, image);
      router.push(`/marketplace/${saved.id}`);
    } catch (err) {
      setFormError(errorText(err));
      setBusy(false);
    }
  };

  const back = initial ? `/marketplace/${initial.id}` : "/marketplace";

  return (
    <FormLayout
      tag="Marketplace"
      title={initial ? "Edit listing" : "List something"}
      description="Sell produce, goods or services to the alumni community."
      backHref={back}
      aside={
        <AsideNote title="Before you list">
          <p>Your contact details are shown to anyone who opens the listing, so use a number or email you're happy to share.</p>
          <p>Leave the price empty if buyers should ask.</p>
        </AsideNote>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {formError && <Notice tone="error">{formError}</Notice>}
        <Field label="Title" required error={errors.title}>
          <TextInput value={form.title} onChange={set("title")} placeholder="e.g. Organic turmeric, 50 kg" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Category" required error={errors.category}>
            <Select value={form.category} onChange={set("category")}>
              {MARKET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {titleCase(c)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Price (₹)" error={errors.price}>
            <TextInput type="number" min={0} step="0.01" value={form.price} onChange={set("price")} />
          </Field>
          <label className="flex items-center gap-2 text-xs text-zinc-700 sm:pt-7">
            <input
              type="checkbox"
              checked={form.is_negotiable}
              onChange={(e) => setForm({ ...form, is_negotiable: e.target.checked })}
              className="w-4 h-4 accent-orange-600"
            />
            Price is negotiable
          </label>
        </div>
        <Field label="Description" required error={errors.description}>
          <TextArea rows={5} value={form.description} onChange={set("description")} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Location">
            <TextInput value={form.location} onChange={set("location")} />
          </Field>
          <Field label="Contact (phone or email)">
            <TextInput value={form.contact_info} onChange={set("contact_info")} />
          </Field>
        </div>
        <Field label="Tags" hint="Comma separated, e.g. organic, coffee">
          <TextInput value={form.tags} onChange={set("tags")} />
        </Field>
        <div>
          <span className="block text-xs font-medium text-zinc-700 mb-1.5">Photo</span>
          <ImagePicker file={image} onChange={setImage} currentUrl={initial?.image_url} />
        </div>
        <FormActions cancelHref={back} busy={busy} label={initial ? "Save changes" : "Create listing"} />
      </form>
    </FormLayout>
  );
}
