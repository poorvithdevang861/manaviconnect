"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconUser, IconUserFilled } from "@tabler/icons-react";
import { AUTH_ROUTES, PRIMARY_NAV, isActive, type NavItem } from "./nav";

const TABS: NavItem[] = [
  ...PRIMARY_NAV,
  { label: "Me", href: "/me", icon: IconUser, iconFilled: IconUserFilled },
];

export function MobileTabBar() {
  const pathname = usePathname();
  if (AUTH_ROUTES.includes(pathname)) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] flex items-center justify-around" aria-label="Tabs">
      {TABS.map((tab) => {
        const IconOutline = tab.icon;
        const IconFilled = tab.iconFilled;
        const active = isActive(pathname, tab);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`group flex-1 flex flex-col items-center justify-center gap-0.5 py-0.5 rounded-lg text-[11px] transition-all duration-500 ease-out active:scale-95 ${
              active ? "text-orange-700 font-semibold" : "text-zinc-400 hover:text-zinc-700"
            }`}
          >
            <span
              className={`relative inline-flex items-center justify-center w-12 h-7 rounded-full transition-all duration-500 ease-out ${
                active ? "bg-gradient-to-b from-orange-100 to-orange-50 shadow-xs" : "bg-transparent group-active:bg-orange-50/60"
              }`}
            >
              <IconOutline
                size={19}
                stroke={1.6}
                className={`absolute transition-all duration-500 ease-out ${
                  active ? "opacity-0 scale-75" : "opacity-100 scale-100 group-active:opacity-0 group-active:scale-75"
                }`}
              />
              <IconFilled
                size={19}
                className={`absolute text-orange-600 transition-all duration-500 ease-out ${
                  active ? "opacity-100 scale-100" : "opacity-0 scale-75 group-active:opacity-100 group-active:scale-100"
                }`}
              />
            </span>
            <span className="transition-colors duration-500 ease-out">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
