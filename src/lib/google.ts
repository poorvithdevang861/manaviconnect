export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

interface GoogleCredentialResponse {
  credential: string;
}

export interface GoogleIdentity {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    ux_mode?: "popup" | "redirect";
    auto_select?: boolean;
    context?: "signin" | "signup" | "use";
  }): void;
  renderButton(parent: HTMLElement, options: Record<string, string | number>): void;
  disableAutoSelect(): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } };
  }
}

let loader: Promise<GoogleIdentity> | null = null;

/** Loads Google Identity Services once per page. */
export function loadGoogleIdentity(): Promise<GoogleIdentity> {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  loader ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      if (window.google?.accounts?.id) resolve(window.google.accounts.id);
      else reject(new Error("Google sign-in failed to load"));
    };
    script.onerror = () => {
      loader = null;
      script.remove();
      reject(new Error("Couldn't reach Google. Check your connection and try again."));
    };
    document.head.appendChild(script);
  });
  return loader;
}
