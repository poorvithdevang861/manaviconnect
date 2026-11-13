import {
  Briefcase,
  Calendar,
  Car,
  History,
  Home,
  Images,
  Newspaper,
  Store,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Other path prefixes that belong to this section (detail and editor pages). */
  match?: string[];
}

export const PRIMARY_NAV: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Updates", href: "/updates", icon: Newspaper, match: ["/news", "/stories"] },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Career", href: "/career", icon: Briefcase, match: ["/jobs"] },
];

export const MORE_NAV: NavItem[] = [
  { label: "Timeline", href: "/timeline", icon: History },
  { label: "Gallery", href: "/gallery", icon: Images },
  { label: "Marketplace", href: "/marketplace", icon: Store },
  { label: "Transit", href: "/transit", icon: Car },
];

export const AUTH_ROUTES = ["/sign-in", "/join", "/forgot-password", "/reset-password"];

const under = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

export const isActive = (pathname: string, item: Pick<NavItem, "href" | "match">) =>
  item.href === "/" ? pathname === "/" : [item.href, ...(item.match ?? [])].some((p) => under(pathname, p));
