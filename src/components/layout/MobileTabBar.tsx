"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Calendar, User, MessageSquare } from "lucide-react";

export function MobileTabBar() {
  const pathname = usePathname();

  if (pathname === "/sign-in" || pathname === "/join") {
    return null;
  }

  const tabs = [
    { label: "Home", href: "/", icon: Home },
    { label: "People", href: "/people", icon: Users },
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Chat", href: "/messages", icon: MessageSquare },
    { label: "Me", href: "/me", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-line px-2 py-1.5 flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[11px] transition-all duration-150 active:scale-90 ${
              isActive
                ? "text-orange-600 font-semibold"
                : "text-zinc-400 hover:text-zinc-700"
            }`}
          >
            <Icon size={18} strokeWidth={isActive ? 2.2 : 1.6} className="mb-0.5 transition-transform" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
