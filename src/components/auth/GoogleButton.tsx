"use client";

import { useEffect, useRef, useState } from "react";
import { USE_MOCK } from "@/lib/api";
import { MOCK_GOOGLE_PROFILE, MOCK_GOOGLE_TOKEN } from "@/lib/api/demo";
import { GOOGLE_CLIENT_ID, loadGoogleIdentity } from "@/lib/google";
import { errorText } from "@/lib/useApi";

type Mode = "signin" | "signup";

/**
 * "Continue with Google" followed by an "or" divider. Renders Google's own button when
 * NEXT_PUBLIC_GOOGLE_CLIENT_ID is set, a simulated one in demo mode, and nothing otherwise.
 */
export function GoogleButton({ mode, onCredential }: { mode: Mode; onCredential: (idToken: string) => Promise<void> }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!GOOGLE_CLIENT_ID && !USE_MOCK) return null;

  const handle = async (idToken: string) => {
    setError("");
    setBusy(true);
    try {
      await onCredential(idToken);
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {GOOGLE_CLIENT_ID ? (
          <GoogleIdentityButton mode={mode} onCredential={handle} onError={setError} />
        ) : (
          <>
            <button
              type="button"
              onClick={() => handle(MOCK_GOOGLE_TOKEN)}
              disabled={busy}
              className="btn-press w-full h-10 inline-flex items-center justify-center gap-2.5 px-4 text-sm font-medium text-zinc-800 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-lg disabled:opacity-60"
            >
              <GoogleLogo />
              {busy ? "Signing in…" : mode === "signup" ? "Sign up with Google" : "Continue with Google"}
            </button>
            <p className="text-[11px] text-zinc-500 text-center">
              Demo: no Google client ID is set, so this uses the sample account {MOCK_GOOGLE_PROFILE.email}.
            </p>
          </>
        )}
        {busy && GOOGLE_CLIENT_ID && <p className="text-xs text-zinc-500 text-center">Signing you in…</p>}
        {error && <p className="text-xs text-red-600 text-center">{error}</p>}
      </div>

      <div className="flex items-center gap-3 text-[11px] text-zinc-400" aria-hidden>
        <span className="h-px flex-1 bg-zinc-200" />
        or with email
        <span className="h-px flex-1 bg-zinc-200" />
      </div>
    </div>
  );
}

function GoogleIdentityButton({
  mode,
  onCredential,
  onError,
}: {
  mode: Mode;
  onCredential: (idToken: string) => void;
  onError: (message: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const callback = useRef(onCredential);
  callback.current = onCredential;

  useEffect(() => {
    let cancelled = false;
    loadGoogleIdentity()
      .then((gis) => {
        const el = ref.current;
        if (cancelled || !el) return;
        gis.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (res) => callback.current(res.credential),
          ux_mode: "popup",
          context: mode,
        });
        // Google accepts widths between 200 and 400 px.
        const width = Math.max(200, Math.min(400, Math.floor(el.clientWidth)));
        gis.renderButton(el, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: mode === "signup" ? "signup_with" : "continue_with",
          logo_alignment: "center",
          width,
        });
      })
      .catch((err) => !cancelled && onError(errorText(err)));
    return () => {
      cancelled = true;
    };
  }, [mode, onError]);

  return <div ref={ref} className="w-full min-h-[40px] flex justify-center" />;
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
