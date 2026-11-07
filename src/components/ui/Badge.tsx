import React from "react";
import { 
  Trophy, 
  Newspaper, 
  BookOpen, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Globe, 
  FileCheck,
  ShieldCheck,
  Award
} from "lucide-react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "orange" | "brand" | "dark" | "verified";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  className = "",
}: BadgeProps) {
  const variantStyles = {
    neutral: "bg-zinc-100 text-zinc-700 border border-zinc-200/80",
    orange: "bg-orange-50 text-orange-700 border border-orange-200/70 font-medium",
    brand: "bg-orange-50 text-orange-700 border border-orange-200/70 font-medium",
    dark: "bg-zinc-900 text-white font-medium",
    verified: "bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-medium",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-0.5 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-mono transition-transform duration-100 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StoryCategoryBadge({
  type,
  size = "sm",
  className = "",
}: {
  type: "news" | "achievement" | "memoir" | "general" | string;
  size?: "sm" | "md";
  className?: string;
}) {
  const configs: Record<string, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; variant: "brand" | "neutral" }> = {
    news: { label: "News", icon: Newspaper, variant: "neutral" },
    achievement: { label: "Achievement", icon: Trophy, variant: "brand" },
    memoir: { label: "Memoir", icon: BookOpen, variant: "neutral" },
    general: { label: "General", icon: FileText, variant: "neutral" },
  };

  const config = configs[type.toLowerCase()] || { label: type, icon: FileText, variant: "neutral" };
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} size={size} className={className}>
      <Icon size={size === "sm" ? 11 : 13} className="shrink-0" />
      <span>{config.label}</span>
    </Badge>
  );
}

export function JobTypeBadge({
  type,
  size = "sm",
  className = "",
}: {
  type: "Full-time" | "Internship" | "Remote" | "Contract" | string;
  size?: "sm" | "md";
  className?: string;
}) {
  const configs: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; variant: "brand" | "neutral" }> = {
    "full-time": { icon: Briefcase, variant: "brand" },
    "internship": { icon: GraduationCap, variant: "neutral" },
    "remote": { icon: Globe, variant: "brand" },
    "contract": { icon: FileCheck, variant: "neutral" },
  };

  const config = configs[type.toLowerCase()] || { icon: Briefcase, variant: "neutral" };
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} size={size} className={className}>
      <Icon size={size === "sm" ? 11 : 13} className="shrink-0" />
      <span>{type}</span>
    </Badge>
  );
}
