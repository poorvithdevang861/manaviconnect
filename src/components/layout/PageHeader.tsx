import React from "react";

interface PageHeaderProps {
  tag?: string;
  meta?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: "start" | "center";
}

export function PageHeader({
  tag,
  meta,
  title,
  description,
  action,
  align = "start",
}: PageHeaderProps) {
  const center = align === "center";
  return (
    <div className={center ? "flex flex-col items-center text-center gap-4" : "flex flex-col sm:flex-row sm:items-center justify-between gap-4"}>
      <div className={`min-w-0 ${center ? "max-w-2xl" : ""}`}>
        {(tag || meta) && (
          <div className={`flex items-center gap-2 mb-1 text-xs font-mono ${center ? "justify-center" : ""}`}>
            {tag && <span className="text-brand-600 font-medium uppercase tracking-wider">{tag}</span>}
            {tag && meta && <span className="text-line">•</span>}
            {meta && <span className="text-ink-400">{meta}</span>}
          </div>
        )}
        <h1 className="text-xl sm:text-2xl font-semibold text-ink-900 tracking-tight">
          {title}
        </h1>
        {description && <p className="text-sm text-ink-500 mt-0.5">{description}</p>}
      </div>

      {action && <div className="flex flex-wrap items-center gap-2.5 sm:shrink-0">{action}</div>}
    </div>
  );
}
