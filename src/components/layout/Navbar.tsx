"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, Menu, Settings, Shield, User as UserIcon, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Avatar } from "@/components/ui/Avatar";
import { IconTile } from "@/components/ui/IconTile";
import { AUTH_ROUTES, MORE_NAV, PRIMARY_NAV, isActive } from "./nav";

const linkCls = (active: boolean) =>
  `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-[background-color,color,transform] duration-150 active:scale-95 ${
    active
      ? "text-orange-800 bg-gradient-to-r from-orange-100 to-amber-50 font-semibold border border-orange-200/70 shadow-xs"
      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-transparent"
  }`;

function useOutsideClose(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const moreRef = useOutsideClose(moreOpen, () => setMoreOpen(false));
  const userRef = useOutsideClose(userOpen, () => setUserOpen(false));

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
    setUserOpen(false);
  }, [pathname]);

  if (AUTH_ROUTES.includes(pathname)) return null;

  const moreActive = MORE_NAV.some((i) => isActive(pathname, i));
  const signOut = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 lg:h-[72px] grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex items-center min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="lg:hidden p-1.5 -ml-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <Link href="/" className="block" aria-label="MANAVI home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/manavi-wordmark.png" alt="MANAVI" width={787} height={180} className="h-6 sm:h-8 lg:h-10 w-auto" />
          </Link>

          <div className="flex items-center justify-end gap-2 min-w-0">
            <Link
              href="/notifications"
              className={`${user ? "inline-flex" : "hidden sm:inline-flex"} p-1.5 rounded-lg ${pathname === "/notifications" ? "text-orange-700 bg-orange-50" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"}`}
              aria-label="Notifications"
            >
              <Bell size={16} />
            </Link>

            {loading ? (
              <span className="w-9 sm:w-24 h-7 rounded-lg bg-zinc-100 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={userRef}>
                <button
                  type="button"
                  onClick={() => setUserOpen((o) => !o)}
                  aria-expanded={userOpen}
                  aria-haspopup="menu"
                  aria-label="Account menu"
                  className="btn-press flex items-center gap-2 p-1 sm:pr-2 rounded-lg border bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700 shadow-xs text-xs"
                >
                  <Avatar name={user.name} src={user.avatar_url} size="xs" />
                  <span className="font-medium hidden md:inline text-zinc-800 max-w-[140px] truncate">{user.name}</span>
                  <ChevronDown size={12} className="text-zinc-400 hidden sm:block" />
                </button>
                {userOpen && (
                  <div role="menu" className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-zinc-200/70 rounded-2xl shadow-dropdown p-1.5 animate-pop-in text-xs">
                    <div className="px-2.5 py-2 border-b border-zinc-100 mb-1">
                      <div className="font-semibold text-zinc-900 truncate">{user.name}</div>
                      <div className="text-zinc-500 truncate">{user.email}</div>
                    </div>
                    <Link href="/me" role="menuitem" className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-zinc-700 hover:bg-zinc-50">
                      <UserIcon size={14} className="text-zinc-400" />
                      My profile
                    </Link>
                    <Link href="/me#invite" role="menuitem" className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-zinc-700 hover:bg-zinc-50">
                      <Settings size={14} className="text-zinc-400" />
                      Invite a friend
                    </Link>
                    {user.is_admin && (
                      <Link href="/admin" role="menuitem" className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-zinc-700 hover:bg-zinc-50">
                        <Shield size={14} className="text-zinc-400" />
                        Admin
                      </Link>
                    )}
                    <button type="button" role="menuitem" onClick={signOut} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-red-600 hover:bg-red-50">
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={`/sign-in?next=${encodeURIComponent(pathname)}`}
                className="btn-press px-3 py-1.5 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs whitespace-nowrap"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>

        <nav className="hidden lg:flex items-center justify-center gap-1 h-12 border-t border-zinc-100" aria-label="Main">
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={linkCls(active)}>
                <Icon size={13} className="shrink-0 opacity-80" />
                {item.label}
              </Link>
            );
          })}
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              className={linkCls(moreActive)}
            >
              More
              <ChevronDown size={13} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            {moreOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-52 origin-top-right bg-white border border-zinc-200/70 rounded-2xl shadow-dropdown p-1.5 animate-pop-in">
                {MORE_NAV.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(pathname, item);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      className={`flex items-center gap-2.5 p-1.5 rounded-xl text-xs font-medium ${
                        active ? "bg-orange-50 text-orange-800" : "text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      <IconTile icon={Icon} size="sm" tone={active ? "orange" : "sand"} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden max-h-[calc(100dvh-4rem)] border-t border-zinc-100 overflow-y-auto bg-white border-b border-zinc-200/80 px-4 sm:px-6 pt-3 pb-4 grid grid-cols-2 sm:grid-cols-3 gap-1.5 stagger" aria-label="Main">
          {[...PRIMARY_NAV, ...MORE_NAV].map((item) => {
            const active = isActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 p-2 rounded-xl text-sm font-medium transition-colors ${
                  active ? "text-orange-800 font-semibold bg-orange-50" : "text-zinc-700 hover:bg-zinc-100 active:bg-zinc-100"
                }`}
              >
                <IconTile icon={item.icon} size="sm" tone={active ? "orange" : "sand"} />
                {item.label}
              </Link>
            );
          })}
          {user?.is_admin && (
            <Link href="/admin" className="flex items-center gap-2.5 p-2 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-100">
              <IconTile icon={Shield} size="sm" tone="sand" />
              Admin
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
