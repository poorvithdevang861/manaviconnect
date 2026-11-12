"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, Camera, LogOut, Mail, Save } from "lucide-react";
import { api, type User, type UserUpdate } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { errorText, useApi } from "@/lib/useApi";
import { formatDate, formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { RequireAuth } from "@/components/ui/RequireAuth";
import { ErrorBox, Loading, Notice } from "@/components/ui/States";
import { btnDanger, btnPrimary, pageCls } from "@/components/ui/styles";

export default function MePage() {
  return <RequireAuth reason="Sign in to see your profile.">{(user) => <Profile user={user} />}</RequireAuth>;
}

type TextKey = Exclude<keyof UserUpdate, "is_mentor" | "consent_agreed">;

const SECTIONS: Array<{ title: string; fields: Array<{ key: TextKey; label: string; type?: string; placeholder?: string; wide?: boolean }> }> = [
  {
    title: "About you",
    fields: [
      { key: "name", label: "Full name" },
      { key: "batch", label: "Batch (year passed out)", placeholder: "e.g. 2014" },
      { key: "bio", label: "Short bio", wide: true },
    ],
  },
  {
    title: "Work",
    fields: [
      { key: "profession", label: "Profession" },
      { key: "company", label: "Company or organisation" },
      { key: "website", label: "Website", type: "url", wide: true },
    ],
  },
  {
    title: "Contact and address",
    fields: [
      { key: "phone", label: "Phone", type: "tel" },
      { key: "city", label: "City" },
      { key: "address", label: "Address", wide: true },
      { key: "district", label: "District" },
      { key: "state", label: "State" },
      { key: "pincode", label: "PIN code" },
    ],
  },
  {
    title: "Social profiles",
    fields: [
      { key: "linkedin_url", label: "LinkedIn", type: "url" },
      { key: "twitter_url", label: "X / Twitter", type: "url" },
      { key: "instagram_url", label: "Instagram", type: "url" },
      { key: "facebook_url", label: "Facebook", type: "url" },
    ],
  },
];

function Profile({ user }: { user: User }) {
  const router = useRouter();
  const welcome = useSearchParams().get("welcome") === "1";
  const { setUser, logout } = useAuth();
  const [form, setForm] = useState<UserUpdate>(() => {
    const out: UserUpdate = { is_mentor: user.is_mentor, consent_agreed: user.consent_agreed, mentoring_areas: user.mentoring_areas, interests: user.interests };
    for (const s of SECTIONS) for (const f of s.fields) out[f.key] = user[f.key] ?? "";
    return out;
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!String(form.name ?? "").trim()) return setError("Name can't be empty");
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      // The API ignores nulls, so send "" to clear a field.
      setUser(await api.users.updateMe(form));
      setSaved(true);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={pageCls}>
      <PageHeader
        tag="Account"
        title="Your profile"
        description="This is what other members see next to your posts."
        action={
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className={btnDanger}
          >
            <LogOut size={13} />
            Sign out
          </button>
        }
      />

      {welcome && <Notice>Welcome! Add your batch, city and work so batchmates can recognise you.</Notice>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <form onSubmit={submit} className="lg:col-span-8 space-y-4" noValidate>
          {SECTIONS.map((section) => (
            <Card key={section.title} className="p-6 space-y-4">
              <h2 className="text-sm font-semibold text-zinc-900">{section.title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.fields.map((f) => (
                  <Field key={f.key} label={f.label} className={f.wide ? "sm:col-span-2" : ""}>
                    {f.key === "bio" ? (
                      <TextArea rows={3} value={String(form[f.key] ?? "")} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                    ) : (
                      <TextInput
                        type={f.type ?? "text"}
                        placeholder={f.placeholder}
                        value={String(form[f.key] ?? "")}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      />
                    )}
                  </Field>
                ))}
              </div>
            </Card>
          ))}

          <Card className="p-6 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-900">Mentoring and interests</h2>
            <label className="flex items-center gap-2 text-sm text-zinc-800">
              <input type="checkbox" checked={!!form.is_mentor} onChange={(e) => setForm({ ...form, is_mentor: e.target.checked })} className="w-4 h-4 accent-orange-600" />
              I&apos;m happy to mentor students and younger alumni
            </label>
            {form.is_mentor && (
              <Field label="Mentoring areas" hint="e.g. Career guidance, NEET preparation, web development">
                <TextInput value={form.mentoring_areas ?? ""} onChange={(e) => setForm({ ...form, mentoring_areas: e.target.value })} />
              </Field>
            )}
            <Field label="Interests">
              <TextInput value={form.interests ?? ""} onChange={(e) => setForm({ ...form, interests: e.target.value })} placeholder="e.g. Cricket, photography" />
            </Field>
            <label className="flex items-start gap-2 text-xs text-zinc-600">
              <input type="checkbox" checked={!!form.consent_agreed} onChange={(e) => setForm({ ...form, consent_agreed: e.target.checked })} className="w-4 h-4 mt-px accent-orange-600" />
              I agree to my profile details being shown to other members of this community.
            </label>
          </Card>

          <div className="flex items-center justify-end gap-3">
            {saved && <span className="text-xs text-emerald-700">Profile saved.</span>}
            {error && <span className="text-xs text-red-600">{error}</span>}
            <button type="submit" disabled={busy} className={btnPrimary}>
              <Save size={13} />
              {busy ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>

        <aside className="lg:col-span-4 space-y-4">
          <AvatarCard user={user} onUpdated={setUser} />
          <InviteCard />
          <MyContent />
        </aside>
      </div>
    </div>
  );
}

function AvatarCard({ user, onUpdated }: { user: User; onUpdated: (u: User) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onUpdated(await api.users.uploadAvatar(file));
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar name={user.name} src={user.avatar_url} size="lg" />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white border border-zinc-200 shadow-xs text-zinc-600 hover:text-orange-600"
            aria-label="Change photo"
          >
            <Camera size={12} />
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              upload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-zinc-900 truncate">{user.name}</h3>
            {user.is_admin && <Badge variant="dark" size="sm">Admin</Badge>}
          </div>
          <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          <p className="text-[11px] text-zinc-400 font-mono mt-0.5">Member since {formatDate(user.created_at)}</p>
        </div>
      </div>
      {busy && <p className="text-xs text-zinc-500">Uploading…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-[11px] text-zinc-500">JPEG, PNG or WebP up to 5 MB. Your email can&apos;t be changed here.</p>
    </Card>
  );
}

function InviteCard() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setResult({ tone: "error", text: "Enter a valid email address" });
    setBusy(true);
    setResult(null);
    try {
      const invite = await api.invites.send(email.trim());
      setResult({ tone: "success", text: `Invite sent to ${invite.email}. The link works until ${formatDate(invite.expires_at)}.` });
      setEmail("");
    } catch (err) {
      setResult({ tone: "error", text: errorText(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card id="invite" className="p-5 space-y-3 scroll-mt-20 lg:scroll-mt-36">
      <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
        <Mail size={14} className="text-orange-600" />
        Invite a batchmate
      </h3>
      <p className="text-xs text-zinc-600">We&apos;ll email them a sign-up link that lasts 7 days.</p>
      <form onSubmit={send} className="flex gap-2">
        <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="friend@example.com" aria-label="Friend's email" className="text-xs" />
        <button type="submit" disabled={busy} className={btnPrimary}>
          {busy ? "Sending…" : "Send"}
        </button>
      </form>
      {result && <Notice tone={result.tone}>{result.text}</Notice>}
    </Card>
  );
}

function MyContent() {
  const events = useApi(() => api.users.myEvents(), []);
  const stories = useApi(() => api.users.myStories(), []);

  return (
    <Card className="p-5 space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-900">Events you created</h3>
        {events.loading ? (
          <Loading />
        ) : events.error ? (
          <ErrorBox error={events.error} onRetry={events.reload} />
        ) : events.data!.length === 0 ? (
          <p className="text-xs text-zinc-500">None yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {events.data!.map((ev) => (
              <li key={ev.id}>
                <Link href={`/events/${ev.id}`} className="block text-xs hover:text-orange-600">
                  <span className="font-medium text-zinc-900">{ev.title}</span>
                  <span className="block text-zinc-400 font-mono text-[11px] flex items-center gap-1">
                    <Calendar size={10} />
                    {formatDateTime(ev.datetime)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="space-y-2 pt-3 border-t border-zinc-100">
        <h3 className="text-sm font-semibold text-zinc-900">Stories you wrote</h3>
        {stories.loading ? (
          <Loading />
        ) : stories.error ? (
          <ErrorBox error={stories.error} onRetry={stories.reload} />
        ) : stories.data!.length === 0 ? (
          <p className="text-xs text-zinc-500">
            None yet.{" "}
            <Link href="/stories/new" className="text-orange-600 hover:underline">
              Write one
            </Link>
          </p>
        ) : (
          <ul className="space-y-1.5">
            {stories.data!.map((s) => (
              <li key={s.id}>
                <Link href={`/stories/${s.id}`} className="block text-xs font-medium text-zinc-900 hover:text-orange-600">
                  {s.title}
                  <span className="block text-zinc-400 font-mono text-[11px] font-normal">{formatDate(s.created_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
