"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Calendar, Home, Newspaper, User } from "lucide-react";
import { AUTH_ROUTES, isActive } from "./nav";

const TABS = [
  { label: "Home", href: "/", icon: Home },
  { label: "News", href: "/news", icon: Newspaper },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Me", href: "/me", icon: User },
];

export function MobileTabBar() {
  const pathname = usePathname();
  if (AUTH_ROUTES.includes(pathname)) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] flex items-center justify-around" aria-label="Tabs">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center py-1 rounded-lg text-[11px] transition-all duration-150 active:scale-90 ${
              active ? "text-orange-600 font-semibold" : "text-zinc-400 hover:text-zinc-700"
            }`}
          >
            <Icon size={18} strokeWidth={active ? 2.2 : 1.6} className="mb-0.5" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
