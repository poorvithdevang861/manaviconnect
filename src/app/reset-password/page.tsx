"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/layout/AuthShell";
import { Field, TextInput } from "@/components/ui/Field";
import { Notice } from "@/components/ui/States";
import { btnPrimary } from "@/components/ui/styles";
import { api } from "@/lib/api";
import { errorText } from "@/lib/useApi";
import { fieldErrors, resetPasswordSchema } from "@/lib/validations";

export default function ResetPasswordPage() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [form, setForm] = useState({ new_password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = resetPasswordSchema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setFormError("");
    setBusy(true);
    try {
      await api.auth.resetPassword(token, parsed.data.new_password);
      router.replace("/sign-in?reset=1");
    } catch (err) {
      setFormError(errorText(err));
      setBusy(false);
    }
  };

  const footer = (
    <Link href="/forgot-password" className="text-orange-600 font-medium hover:underline">
      Request a new link
    </Link>
  );

  if (!token) {
    return (
      <AuthShell title="Reset link missing" footer={footer}>
        <Notice tone="error">This page needs the link from your reset email.</Notice>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" footer={footer}>
      {formError && <Notice tone="error">{formError}</Notice>}
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="New password" error={errors.new_password} hint="8+ characters, one uppercase letter and one digit.">
          <TextInput type="password" autoComplete="new-password" autoFocus value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} />
        </Field>
        <Field label="Confirm new password" error={errors.confirm}>
          <TextInput type="password" autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        </Field>
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full py-2.5`}>
          {busy ? "Saving…" : "Set new password"}
        </button>
      </form>
    </AuthShell>
  );
}
