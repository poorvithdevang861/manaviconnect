"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, CookingPot, GraduationCap, Package, Sprout, Tag, Wheat, Wrench, type LucideIcon } from "lucide-react";
import { api, MARKET_CATEGORIES, type MarketCategory, type MarketListing } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { editId, errorText } from "@/lib/useApi";
import { useDraft } from "@/lib/useDraft";
import { nullable, titleCase } from "@/lib/format";
import { fieldErrors, marketSchema } from "@/lib/validations";
import { AsideNote, EditLoader, FormActions, FormLayout } from "@/components/layout/FormLayout";
import { DraftBanner, Segmented, Suggestions, TagSuggestions, TemplatePicker, Toggle, type Template } from "@/components/forms/Prefill";
import { Field, TextArea, TextInput, focusFirstError } from "@/components/ui/Field";
import { ImagePicker } from "@/components/ui/ImagePicker";
import { RequireAuth } from "@/components/ui/RequireAuth";
import { Notice } from "@/components/ui/States";
import { flashToast } from "@/components/ui/Toast";

export default function MarketEditorPage() {
  const id = editId(useSearchParams().get("id"));
  return (
    <RequireAuth reason="Sign in to list something.">
      {() => <EditLoader id={id} load={api.marketplace.get}>{(initial) => <MarketForm initial={initial} />}</EditLoader>}
    </RequireAuth>
  );
}

type MarketValues = {
  title: string;
  description: string;
  category: MarketCategory;
  price: string;
  is_negotiable: boolean;
  location: string;
  contact_info: string;
  tags: string;
};

const CATEGORY_ICONS: Record<MarketCategory, LucideIcon> = {
  crops: Wheat,
  produce: Sprout,
  business: Briefcase,
  services: Wrench,
  goods: Package,
  other: Tag,
};

const TEMPLATES: Template<MarketValues>[] = [
  {
    id: "produce",
    title: "Farm produce",
    description: "Fresh from your fields, by the kilo",
    icon: Sprout,
    values: {
      title: "Organic , 10 kg",
      category: "produce",
      description: "Grown without chemical fertilisers. Harvested this week.\n\nMinimum order: 5 kg. Delivery within the district, or pick up from the farm.",
      tags: "organic, farm-fresh",
    },
  },
  {
    id: "homemade",
    title: "Home-made food",
    description: "Pickles, sweets, spice mixes",
    icon: CookingPot,
    tone: "amber",
    values: {
      title: "Home-made ",
      category: "goods",
      description: "Made in small batches at home with no preservatives.\n\nShelf life: 3 months. Ships anywhere in India.",
      tags: "homemade",
    },
  },
  {
    id: "tutoring",
    title: "Tutoring or coaching",
    description: "Offer lessons to students",
    icon: GraduationCap,
    tone: "peach",
    values: {
      title: " tuition for Class 10–12",
      category: "services",
      description: "One-on-one or small group sessions, online or in person.\n\nFirst session free so the student can see if it's a good fit.",
      tags: "tutoring, students",
    },
  },
  {
    id: "preowned",
    title: "Pre-owned item",
    description: "Books, electronics, furniture",
    icon: Package,
    tone: "sand",
    values: {
      title: "",
      category: "goods",
      description: "Condition:\nAge:\nReason for selling:",
      is_negotiable: true,
      tags: "pre-owned",
    },
  },
];

const TAGS = ["organic", "homemade", "bulk", "pre-owned", "delivery", "farm-fresh", "handmade"] as const;

function MarketForm({ initial }: { initial: MarketListing | null }) {
  const router = useRouter();
  const { user } = useAuth();
  const [start] = useState<MarketValues>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "produce",
    price: initial?.price ? String(Number(initial.price)) : "",
    is_negotiable: initial?.is_negotiable ?? true,
    location: initial?.location ?? (user ? [user.city, user.district].filter(Boolean).join(", ") : ""),
    contact_info: initial?.contact_info ?? user?.phone ?? user?.email ?? "",
    tags: initial?.tags ?? "",
  });
  const [form, setForm] = useState(start);
  const draft = useDraft(initial ? null : "listing", form, setForm, start);
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key: keyof MarketValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value });
  const put = (key: keyof MarketValues) => (value: string) => setForm({ ...form, [key]: value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = marketSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return focusFirstError();
    }
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
      draft.clear();
      flashToast(initial ? "Listing updated" : "Listing is live");
      router.push(`/marketplace/${saved.id}`);
    } catch (err) {
      setFormError(errorText(err));
      setBusy(false);
    }
  };

  const back = initial ? `/marketplace/${initial.id}` : "/marketplace";
  const contactOptions = [user?.phone, user?.email].filter((v): v is string => !!v);

  return (
    <FormLayout
      tag="Marketplace"
      title={initial ? "Edit listing" : "List something"}
      description="Sell produce, goods or services to the alumni community."
      backHref={back}
      prefill={
        initial ? undefined : (
          <TemplatePicker subtitle="Your location and contact are already filled in from your profile." templates={TEMPLATES} onPick={(v) => setForm({ ...form, ...v })} />
        )
      }
      aside={
        <AsideNote title="Before you list">
          <p>Your contact details are shown to anyone who opens the listing, so use a number or email you're happy to share.</p>
          <p>Leave the price empty if buyers should ask.</p>
        </AsideNote>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        {draft.restoredAt && <DraftBanner savedAt={draft.restoredAt} onDiscard={draft.discard} />}
        {formError && <Notice tone="error">{formError}</Notice>}
        <Field label="Title" required error={errors.title}>
          <TextInput value={form.title} onChange={set("title")} placeholder="e.g. Organic turmeric, 50 kg" />
        </Field>
        <div>
          <span className="block text-xs font-medium text-zinc-700 mb-1.5">
            Category <span className="text-orange-600">*</span>
          </span>
          <Segmented
            label="Category"
            options={MARKET_CATEGORIES.map((c) => ({ id: c, label: titleCase(c), icon: CATEGORY_ICONS[c] }))}
            value={form.category}
            onChange={(category) => setForm({ ...form, category })}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
          <Field label="Price (₹)" error={errors.price} hint="Leave empty if buyers should ask.">
            <TextInput type="number" min={0} step="0.01" inputMode="decimal" value={form.price} onChange={set("price")} placeholder="Ask for price" />
          </Field>
          <div className="sm:pt-6">
            <Toggle checked={form.is_negotiable} onChange={(is_negotiable) => setForm({ ...form, is_negotiable })} label="Open to offers" description="Shows a Negotiable badge on the listing." />
          </div>
        </div>
        <Field label="Description" required error={errors.description}>
          <TextArea rows={5} value={form.description} onChange={set("description")} placeholder="Quantity, condition, delivery or pickup" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Location" hint="Prefilled from your profile.">
            <TextInput value={form.location} onChange={set("location")} />
          </Field>
          <Field
            label="Contact (phone or email)"
            suggestions={contactOptions.length > 1 ? <Suggestions options={contactOptions} current={form.contact_info} onPick={put("contact_info")} /> : undefined}
          >
            <TextInput value={form.contact_info} onChange={set("contact_info")} />
          </Field>
        </div>
        <Field label="Tags" hint="Tap to add, or type your own separated by commas." suggestions={<TagSuggestions tags={TAGS} value={form.tags} onChange={put("tags")} />}>
          <TextInput value={form.tags} onChange={set("tags")} placeholder="organic, coffee" />
        </Field>
        <div>
          <span className="block text-xs font-medium text-zinc-700 mb-1.5">Photo</span>
          <ImagePicker file={image} onChange={setImage} currentUrl={initial?.image_url} />
        </div>
        <FormActions cancelHref={back} busy={busy} label={initial ? "Save changes" : "Create listing"} draftSavedAt={draft.savedAt} />
      </form>
    </FormLayout>
  );
}
