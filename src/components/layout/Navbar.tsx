"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  Home, 
  Users, 
  BookOpen, 
  Calendar, 
  Briefcase, 
  MessageSquare, 
  Menu, 
  X,
  Compass
} from "lucide-react";
import { CURRENT_USER } from "@/lib/mockData";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Directory", href: "/people", icon: Users },
  { label: "Dispatches", href: "/stories", icon: BookOpen },
  { label: "Reunions", href: "/events", icon: Calendar },
  { label: "Careers", href: "/jobs", icon: Briefcase },
  { label: "Connect", href: "/messages", icon: MessageSquare },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide on auth screens
  if (pathname === "/sign-in" || pathname === "/join") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between relative">
        
        {/* Left: Brand */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-semibold text-lg tracking-tight text-zinc-900 group-hover:text-orange-600 transition-colors">
              MANAVI
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
            <span className="hidden sm:inline text-[11px] text-zinc-400 font-mono tracking-wide uppercase">
              Alumni
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links with Modern Typography & Icons */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 active:scale-95 ${
                  isActive
                    ? "text-orange-700 bg-orange-50 font-semibold border border-orange-200/70 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 hover:-translate-y-0.5"
                }`}
              >
                <Icon size={13} className="shrink-0 opacity-80" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: User Pill with House Metaphor & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href="/me"
            className={`btn-press flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs ${
              pathname === "/me"
                ? "bg-orange-50 border-orange-200/80 text-orange-700 font-medium"
                : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700 shadow-xs"
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center text-[10px] font-mono font-semibold">
              {CURRENT_USER.initials}
            </div>
            <span className="font-medium hidden sm:inline text-zinc-800">{CURRENT_USER.name}</span>
            <span className="text-[11px] text-zinc-400 font-mono hidden md:inline">
              ({CURRENT_USER.house} &apos;{CURRENT_USER.batchYear.toString().slice(-2)})
            </span>
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-zinc-200/80 px-4 pt-2 pb-4 space-y-1 animate-fade-in">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "text-orange-700 font-semibold bg-orange-50 border border-orange-200/60"
                    : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <Icon size={16} className="shrink-0 text-zinc-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-zinc-100 mt-2">
            <Link
              href="/me"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-sm text-zinc-900 font-medium"
            >
              <div className="flex items-center gap-2">
                <Compass size={15} className="text-zinc-400" />
                <span>Profile & Privacy</span>
              </div>
              <span className="text-xs font-mono text-zinc-400">Class of {CURRENT_USER.batchYear}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
