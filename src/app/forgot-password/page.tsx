"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/components/layout/AuthShell";
import { Field, TextInput } from "@/components/ui/Field";
import { Notice } from "@/components/ui/States";
import { btnPrimary } from "@/components/ui/styles";
import { api, USE_MOCK } from "@/lib/api";
import { errorText } from "@/lib/useApi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address");
    setError("");
    setBusy(true);
    try {
      const res = await api.auth.forgotPassword(email.trim());
      setSent(res.message);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a link to set a new password. The link works for 1 hour."
      footer={
        <Link href="/sign-in" className="text-orange-600 font-medium hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="space-y-2">
          <Notice>{sent}</Notice>
          {USE_MOCK && <p className="text-[11px] text-zinc-500">Demo mode: the reset link is printed in the browser console.</p>}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Email" error={error}>
            <TextInput type="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <button type="submit" disabled={busy} className={`${btnPrimary} w-full py-2.5`}>
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
