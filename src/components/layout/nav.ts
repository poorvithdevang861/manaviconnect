import {
  BookOpen,
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
}

export const PRIMARY_NAV: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "News", href: "/news", icon: Newspaper },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Stories", href: "/stories", icon: BookOpen },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
];

export const MORE_NAV: NavItem[] = [
  { label: "Timeline", href: "/timeline", icon: History },
  { label: "Gallery", href: "/gallery", icon: Images },
  { label: "Marketplace", href: "/marketplace", icon: Store },
  { label: "Transit", href: "/transit", icon: Car },
];

export const AUTH_ROUTES = ["/sign-in", "/join", "/forgot-password", "/reset-password"];

export const isActive = (pathname: string, href: string) =>
  pathname === href || (href !== "/" && pathname.startsWith(href));
