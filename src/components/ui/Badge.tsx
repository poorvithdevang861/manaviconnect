import React from "react";
import { Briefcase, Clock, FileCheck, Laptop, Tag } from "lucide-react";
import { splitTags, titleCase } from "@/lib/format";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "brand" | "dark" | "verified" | "danger";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "neutral", size = "md", className = "" }: BadgeProps) {
  const variantStyles = {
    neutral: "bg-zinc-100 text-zinc-700 border border-zinc-200/80",
    brand: "bg-orange-50 text-orange-700 border border-orange-200/70 font-medium",
    dark: "bg-zinc-900 text-white font-medium",
    verified: "bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-medium",
    danger: "bg-red-50 text-red-700 border border-red-200/70 font-medium",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-0.5 text-xs",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md font-mono ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}

const JOB_TYPE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  "full-time": Briefcase,
  "part-time": Clock,
  contract: FileCheck,
  freelance: Laptop,
};

export function JobTypeBadge({ type, size = "sm" }: { type: string; size?: "sm" | "md" }) {
  const Icon = JOB_TYPE_ICONS[type] ?? Briefcase;
  return (
    <Badge variant={type === "full-time" ? "brand" : "neutral"} size={size}>
      <Icon size={size === "sm" ? 11 : 13} className="shrink-0" />
      {titleCase(type)}
    </Badge>
  );
}

export function Tags({ tags }: { tags: string | null | undefined }) {
  const list = splitTags(tags);
  if (list.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {list.map((t) => (
        <Badge key={t} size="sm">
          <Tag size={10} className="shrink-0 text-zinc-400" />
          {t}
        </Badge>
      ))}
    </div>
  );
}
