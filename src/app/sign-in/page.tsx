"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/layout/AuthShell";
import { Field, TextInput } from "@/components/ui/Field";
import { Notice } from "@/components/ui/States";
import { btnPrimary } from "@/components/ui/styles";
import { USE_MOCK } from "@/lib/api";
import { MOCK_ADMIN_EMAIL, MOCK_PASSWORD } from "@/lib/api/demo";
import { safeNext, useAuth } from "@/lib/auth";
import { errorText } from "@/lib/useApi";
import { fieldErrors, loginSchema } from "@/lib/validations";

export default function SignInPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setFormError("");
    setBusy(true);
    try {
      await login(parsed.data.email, parsed.data.password);
      router.replace(safeNext(params.get("next")));
    } catch (err) {
      setFormError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Use the email and password for your alumni account."
      footer={
        <>
          New here?{" "}
          <Link href="/join" className="text-orange-600 font-medium hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {params.get("reset") === "1" && <Notice>Password updated. Sign in with your new password.</Notice>}
      {formError && <Notice tone="error">{formError}</Notice>}

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email" error={errors.email}>
          <TextInput
            type="email"
            autoComplete="email"
            autoFocus
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password" error={errors.password}>
          <TextInput
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>
        <div className="flex justify-end -mt-1">
          <Link href="/forgot-password" className="text-xs text-orange-600 hover:underline font-medium">
            Forgot password?
          </Link>
        </div>
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full py-2.5`}>
          {busy ? "Signing in…" : "Sign in"}
          {!busy && <ArrowRight size={13} />}
        </button>
      </form>

      {USE_MOCK && (
        <p className="text-[11px] text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 leading-relaxed">
          Demo mode (no backend configured). Sign in as <span className="font-mono text-zinc-800">{MOCK_ADMIN_EMAIL}</span> with{" "}
          <span className="font-mono text-zinc-800">{MOCK_PASSWORD}</span> for an admin account, or create a new one.
        </p>
      )}
    </AuthShell>
  );
}
