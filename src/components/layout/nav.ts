import {
  IconBriefcase,
  IconCalendar,
  IconCar,
  IconHistory,
  IconHome,
  IconNews,
  IconPhoto,
  IconBuildingStore,
  type Icon as TablerIcon,
} from "@tabler/icons-react";

export type NavIcon = TablerIcon | React.ComponentType<{ size?: number | string; stroke?: number | string; strokeWidth?: number | string; className?: string }>;

export interface NavItem {
  label: string;
  href: string;
  icon: NavIcon;
  /** Other path prefixes that belong to this section (detail and editor pages). */
  match?: string[];
}

export const PRIMARY_NAV: NavItem[] = [
  { label: "Home", href: "/", icon: IconHome },
  { label: "Updates", href: "/updates", icon: IconNews, match: ["/news", "/stories"] },
  { label: "Events", href: "/events", icon: IconCalendar },
  { label: "Career", href: "/career", icon: IconBriefcase, match: ["/jobs"] },
];

export const MORE_NAV: NavItem[] = [
  { label: "Timeline", href: "/timeline", icon: IconHistory },
  { label: "Gallery", href: "/gallery", icon: IconPhoto },
  { label: "Marketplace", href: "/marketplace", icon: IconBuildingStore },
  { label: "Transit", href: "/transit", icon: IconCar },
];

export const AUTH_ROUTES = ["/sign-in", "/join", "/forgot-password", "/reset-password"];

const under = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

export const isActive = (pathname: string, item: Pick<NavItem, "href" | "match">) =>
  item.href === "/" ? pathname === "/" : [item.href, ...(item.match ?? [])].some((p) => under(pathname, p));
