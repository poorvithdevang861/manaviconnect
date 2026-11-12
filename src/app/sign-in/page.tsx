"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AuthShell } from "@/components/layout/AuthShell";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Field, TextInput } from "@/components/ui/Field";
import { Notice } from "@/components/ui/States";
import { btnPrimary } from "@/components/ui/styles";
import { USE_MOCK } from "@/lib/api";
import { DEMO_ACCOUNTS, MOCK_PASSWORD } from "@/lib/api/demo";
import { safeNext, useAuth } from "@/lib/auth";
import { errorText } from "@/lib/useApi";
import { fieldErrors, loginSchema } from "@/lib/validations";

export default function SignInPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, loginWithGoogle } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const done = () => router.replace(safeNext(params.get("next")));

  const signIn = async (email: string, password: string, key: string) => {
    setFormError("");
    setBusy(key);
    try {
      await login(email, password);
      done();
    } catch (err) {
      setFormError(errorText(err));
      setBusy(null);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    signIn(parsed.data.email, parsed.data.password, "form");
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back to the alumni community."
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

      <GoogleButton
        mode="signin"
        onCredential={async (idToken) => {
          await loginWithGoogle(idToken);
          done();
        }}
      />

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email" error={errors.email}>
          <TextInput
            type="email"
            autoComplete="email"
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
        <button type="submit" disabled={busy !== null} className={`${btnPrimary} w-full py-2.5`}>
          {busy === "form" ? "Signing in…" : "Sign in"}
          {busy !== "form" && <ArrowRight size={13} />}
        </button>
      </form>

      {USE_MOCK && (
        <section className="pt-5 border-t border-zinc-100 space-y-3" aria-labelledby="demo-profiles">
          <div>
            <h2 id="demo-profiles" className="text-xs font-semibold text-zinc-900">
              Try a demo profile
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">No backend is connected, so these sample accounts run on data saved in this browser.</p>
          </div>
          <div className="grid gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                disabled={busy !== null}
                onClick={() => signIn(account.email, MOCK_PASSWORD, account.email)}
                className="btn-press w-full flex items-center gap-3 p-3 text-left bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-orange-300 rounded-lg disabled:opacity-60"
              >
                <Avatar name={account.name} src={account.avatar} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-sm font-medium text-zinc-900">{account.name}</span>
                    <Badge variant={account.role === "Admin" ? "brand" : "neutral"} size="sm">
                      {account.role}
                    </Badge>
                  </span>
                  <span className="block text-[11px] text-zinc-500 leading-snug mt-0.5">{account.detail}</span>
                </span>
                <span className="text-xs font-medium text-orange-600 shrink-0">
                  {busy === account.email ? "…" : <ArrowRight size={14} />}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </AuthShell>
  );
}
