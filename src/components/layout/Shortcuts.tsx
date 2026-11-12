"use client";

import { useEffect } from "react";

function isTyping(el: Element | null) {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

/** "/" focuses the page search box; Cmd/Ctrl+Enter submits the form being edited. */
export function Shortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !isTyping(document.activeElement)) {
        const search = document.querySelector<HTMLInputElement>("[data-search]");
        if (search) {
          e.preventDefault();
          search.focus();
          search.select();
        }
        return;
      }
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
