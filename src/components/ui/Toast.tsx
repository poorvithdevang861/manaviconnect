"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

type Tone = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
  action?: { label: string; onClick: () => void };
}

type ToastInput = string | { message: string; tone?: Tone; action?: ToastItem["action"] };

interface ToastApi {
  show: (t: ToastInput) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);
const LIFETIME = 4000;
/** How long an undoable action waits before it is committed; matches the toast with an action. */
export const UNDO_WINDOW = LIFETIME * 1.5;
const FLASH_KEY = "community_hub_flash";

/** Queue a toast that survives a client-side navigation (shown by the provider on the next page). */
export function flashToast(message: string) {
  try {
    sessionStorage.setItem(FLASH_KEY, message);
  } catch {}
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (t: ToastInput) => {
      const item: ToastItem = typeof t === "string" ? { id: 0, message: t, tone: "success" } : { id: 0, tone: "success", ...t };
      item.id = nextId.current++;
      setItems((list) => [...list.slice(-2), item]);
      window.setTimeout(() => dismiss(item.id), item.action ? UNDO_WINDOW : LIFETIME);
    },
    [dismiss]
  );

  const api = useRef<ToastApi>({ show, success: (m) => show({ message: m, tone: "success" }), error: (m) => show({ message: m, tone: "error" }) });

  useEffect(() => {
    try {
      const msg = sessionStorage.getItem(FLASH_KEY);
      if (msg) {
        sessionStorage.removeItem(FLASH_KEY);
        show(msg);
      }
    } catch {}
  }, [pathname, show]);

  return (
    <ToastContext.Provider value={api.current}>
      {children}
      <div
        aria-live="polite"
        className="fixed z-[70] inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-6 flex flex-col items-center gap-2 px-4 pointer-events-none"
      >
        {items.map((t) => {
          const Icon = t.tone === "error" ? AlertCircle : t.tone === "info" ? Info : CheckCircle2;
          return (
            <div
              key={t.id}
              role={t.tone === "error" ? "alert" : "status"}
              className="pointer-events-auto animate-toast-in flex items-center gap-2.5 max-w-[calc(100vw-2rem)] sm:max-w-md pl-3 pr-1.5 py-1.5 rounded-full bg-zinc-900 text-white text-xs shadow-dropdown"
            >
              <Icon size={15} className={`shrink-0 ${t.tone === "error" ? "text-red-400" : t.tone === "info" ? "text-zinc-300" : "text-emerald-400"}`} />
              <span className="min-w-0 truncate font-medium">{t.message}</span>
              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action?.onClick();
                    dismiss(t.id);
                  }}
                  className="shrink-0 px-2 py-1 rounded-full text-orange-300 hover:text-orange-200 hover:bg-white/10 font-semibold"
                >
                  {t.action.label}
                </button>
              )}
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="shrink-0 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10">
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
