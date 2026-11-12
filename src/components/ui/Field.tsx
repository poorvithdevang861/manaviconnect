import React from "react";
import { inputCls, labelCls } from "./styles";

export function Field({
  label,
  error,
  hint,
  required,
  suggestions,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  /** Rendered under the input, outside the label so chip clicks don't refocus it. */
  suggestions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-error={error ? "" : undefined}
      className={`${className} ${error ? "[&_input]:border-red-300 [&_textarea]:border-red-300 [&_select]:border-red-300" : ""}`}
    >
      <label className="block">
        <span className={labelCls}>
          {label}
          {required && <span className="text-orange-600"> *</span>}
        </span>
        {children}
      </label>
      {suggestions && <div className="mt-2">{suggestions}</div>}
      {hint && !error && <span className="block text-[11px] text-zinc-500 mt-1.5">{hint}</span>}
      {error && (
        <span className="block text-xs text-red-600 mt-1.5 animate-fade-in" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

/** Scrolls to and focuses the first field showing an error. Call after setting errors. */
export function focusFirstError() {
  setTimeout(() => {
    const el = document.querySelector<HTMLElement>("[data-error] input, [data-error] textarea, [data-error] select");
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.focus({ preventScroll: true });
  }, 0);
}

export const TextInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function TextInput({ className = "", ...props }, ref) {
    return <input ref={ref} className={`${inputCls} ${className}`} {...props} />;
  },
);

export function TextArea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputCls} leading-relaxed ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${inputCls} ${className}`} {...props} />;
}
