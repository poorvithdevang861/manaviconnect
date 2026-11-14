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
  group = false,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  /** Rendered under the input, outside the label so chip clicks don't refocus it. */
  suggestions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** For composite controls (e.g. a popover picker): a <label> would re-click the control on every inner click. */
  group?: boolean;
}) {
  const labelId = React.useId();
  const caption = (
    <span id={labelId} className={labelCls}>
      {label}
      {required && <span className="text-orange-600"> *</span>}
    </span>
  );
  return (
    <div
      data-error={error ? "" : undefined}
      className={`${className} ${error ? "[&_input]:border-red-300 [&_textarea]:border-red-300 [&_select]:border-red-300 [&_[data-field-control]]:border-red-300" : ""}`}
    >
      {group ? (
        <div role="group" aria-labelledby={labelId}>
          {caption}
          {children}
        </div>
      ) : (
        <label className="block">
          {caption}
          {children}
        </label>
      )}
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
    const el = document.querySelector<HTMLElement>("[data-error] input, [data-error] textarea, [data-error] select, [data-error] [data-field-control]");
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
