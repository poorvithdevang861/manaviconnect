import React from "react";
import {
  IconArticle,
  IconArticleFilled,
  IconBriefcase,
  IconBriefcaseFilled,
  IconCalendar,
  IconCalendarFilled,
  IconCar,
  IconCarFilled,
  IconClockFilled,
  IconHistory,
  IconHome,
  IconHomeFilled,
  IconPhoto,
  IconPhotoFilled,
  IconBuildingStore,
  type Icon as TablerIcon,
} from "@tabler/icons-react";

export type NavIcon =
  | TablerIcon
  | React.ComponentType<{ size?: number | string; stroke?: number | string; strokeWidth?: number | string; className?: string; color?: string }>;

export function IconBuildingStoreFilled({
  size = 24,
  className = "",
  color = "currentColor",
  ...props
}: {
  size?: number | string;
  className?: string;
  color?: string;
  [key: string]: unknown;
}) {
  return React.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: color,
      stroke: "none",
      className: `tabler-icon tabler-icon-building-store-filled ${className}`,
      ...props,
    },
    React.createElement("path", {
      d: "M3 7l2-4h14l2 4v1a3 3 0 0 1-6 0v-1a3 3 0 0 1-6 0v-1a3 3 0 0 1-6 0V7z",
    }),
    React.createElement("path", {
      d: "M5 11.5h14v8.5a1 1 0 0 1-1 1h-3v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4H6a1 1 0 0 1-1-1v-8.5z",
    })
  );
}

export interface NavItem {
  label: string;
  href: string;
  icon: NavIcon;
  iconFilled: NavIcon;
  /** Other path prefixes that belong to this section (detail and editor pages). */
  match?: string[];
}

export const PRIMARY_NAV: NavItem[] = [
  { label: "Home", href: "/", icon: IconHome, iconFilled: IconHomeFilled },
  { label: "Updates", href: "/updates", icon: IconArticle, iconFilled: IconArticleFilled, match: ["/news", "/stories"] },
  { label: "Events", href: "/events", icon: IconCalendar, iconFilled: IconCalendarFilled },
  { label: "Career", href: "/career", icon: IconBriefcase, iconFilled: IconBriefcaseFilled, match: ["/jobs"] },
];

export const MORE_NAV: NavItem[] = [
  { label: "Timeline", href: "/timeline", icon: IconHistory, iconFilled: IconClockFilled },
  { label: "Gallery", href: "/gallery", icon: IconPhoto, iconFilled: IconPhotoFilled },
  { label: "Marketplace", href: "/marketplace", icon: IconBuildingStore, iconFilled: IconBuildingStoreFilled },
  { label: "Transit", href: "/transit", icon: IconCar, iconFilled: IconCarFilled },
];

export const AUTH_ROUTES = ["/sign-in", "/join", "/forgot-password", "/reset-password"];

const under = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

export const isActive = (pathname: string, item: Pick<NavItem, "href" | "match">) =>
  item.href === "/" ? pathname === "/" : [item.href, ...(item.match ?? [])].some((p) => under(pathname, p));
