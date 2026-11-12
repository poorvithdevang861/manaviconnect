"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PREFIX = "community_hub_draft:";
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

interface Stored<T> {
  savedAt: number;
  values: Partial<T>;
}

/**
 * Autosaves a form to localStorage while it differs from its starting values,
 * and restores it on the next visit. Pass `key = null` (editing an existing
 * record) to skip drafts and only warn before closing the tab with changes.
 */
export function useDraft<T extends object>(key: string | null, form: T, setForm: (next: T) => void, initial: T) {
  const storageKey = key ? PREFIX + key : null;
  const initialRef = useRef(initial);
  const ready = useRef(false);
  const stopped = useRef(false);
  const [restoredAt, setRestoredAt] = useState<number | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const dirty = !same(form, initialRef.current);

  useEffect(() => {
    if (storageKey) {
      try {
        const raw = localStorage.getItem(storageKey);
        const stored = raw ? (JSON.parse(raw) as Stored<T>) : null;
        if (stored?.values) {
          const merged = { ...initialRef.current, ...stored.values };
          if (!same(merged, initialRef.current)) {
            setForm(merged);
            setRestoredAt(stored.savedAt);
          }
        }
      } catch {}
    }
    ready.current = true;
    // restore once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || !ready.current) return;
    const t = setTimeout(() => {
      if (stopped.current) return;
      try {
        if (same(form, initialRef.current)) {
          localStorage.removeItem(storageKey);
          setSavedAt(null);
        } else {
          const now = Date.now();
          localStorage.setItem(storageKey, JSON.stringify({ savedAt: now, values: form } satisfies Stored<T>));
          setSavedAt(now);
        }
      } catch {}
    }, 600);
    return () => clearTimeout(t);
  }, [form, storageKey]);

  useEffect(() => {
    if (storageKey || !dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [storageKey, dirty]);

  /** Call after a successful save. */
  const clear = useCallback(() => {
    stopped.current = true;
    if (storageKey) localStorage.removeItem(storageKey);
    setRestoredAt(null);
    setSavedAt(null);
  }, [storageKey]);

  const discard = useCallback(() => {
    if (storageKey) localStorage.removeItem(storageKey);
    setRestoredAt(null);
    setSavedAt(null);
    setForm(initialRef.current);
  }, [storageKey, setForm]);

  return { restoredAt, savedAt, dirty, clear, discard };
}
