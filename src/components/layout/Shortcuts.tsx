"use client";

import { useEffect } from "react";

/** Cmd/Ctrl+Enter submits the form being edited. */
export function Shortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        const active = document.activeElement;
        const form = active instanceof HTMLElement ? active.closest("form") : null;
        if (form) {
          e.preventDefault();
          form.requestSubmit();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
