"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AuthShell } from "@/components/layout/AuthShell";
import { Field, TextInput } from "@/components/ui/Field";
import { Notice } from "@/components/ui/States";
import { btnPrimary } from "@/components/ui/styles";
import { api, type InviteValidation } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { errorText } from "@/lib/useApi";
import { fieldErrors, signupSchema } from "@/lib/validations";

export default function JoinPage() {
  const router = useRouter();
  const params = useSearchParams();
  const inviteToken = params.get("invite");
  const { signup, loginWithGoogle } = useAuth();

  const [invite, setInvite] = useState<InviteValidation | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm_password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!inviteToken) return;
    api.invites
      .validate(inviteToken)
      .then((res) => {
        setInvite(res);
        if (res.valid && res.email) setForm((f) => ({ ...f, email: res.email! }));
      })
      .catch(() => setInvite({ valid: false, email: null, message: "We couldn't check this invite link." }));
  }, [inviteToken]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setFormError("");
    setBusy(true);
    try {
      await signup(parsed.data);
      await finish();
    } catch (err) {
      setFormError(errorText(err));
      setBusy(false);
    }
  };

  const finish = async () => {
    if (inviteToken && invite?.valid) await api.invites.accept(inviteToken).catch(() => undefined);
    router.replace("/me?welcome=1");
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });

  return (
    <AuthShell
      title="Create your account"
      subtitle="After signing up you can add your batch, city and work to your profile."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="text-orange-600 font-medium hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {invite?.valid && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-start gap-2">
          <MailCheck size={14} className="shrink-0 mt-px" />
          <span>You were invited as {invite.email}. Finish signing up to join.</span>
        </div>
      )}
      {invite && !invite.valid && <Notice tone="error">{invite.message} You can still sign up below.</Notice>}
      {formError && <Notice tone="error">{formError}</Notice>}

      <GoogleButton
        mode="signup"
        onCredential={async (idToken) => {
          await loginWithGoogle(idToken);
          await finish();
        }}
      />

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Full name" error={errors.name}>
          <TextInput autoComplete="name" value={form.name} onChange={set("name")} />
        </Field>
        <Field label="Email" error={errors.email}>
          <TextInput type="email" autoComplete="email" value={form.email} onChange={set("email")} disabled={!!invite?.valid} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Password" error={errors.password} hint="8+ characters, one uppercase letter and one digit.">
            <TextInput type="password" autoComplete="new-password" value={form.password} onChange={set("password")} />
          </Field>
          <Field label="Confirm password" error={errors.confirm_password}>
            <TextInput type="password" autoComplete="new-password" value={form.confirm_password} onChange={set("confirm_password")} />
          </Field>
        </div>
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full py-2.5`}>
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
