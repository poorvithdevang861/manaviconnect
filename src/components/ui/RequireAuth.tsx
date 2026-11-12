"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { User } from "@/lib/api";
import { Loading } from "./States";
import { btnPrimary, btnSecondary } from "./styles";

/** Renders children only for a signed-in user (and an admin when `admin` is set). */
export function RequireAuth({
  children,
  admin = false,
  reason = "Sign in to continue.",
}: {
  children: (user: User) => React.ReactNode;
  admin?: boolean;
  reason?: string;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const search = useSearchParams();

  if (loading) return <Loading />;

  if (!user) {
    const next = encodeURIComponent(pathname + (search.toString() ? `?${search}` : ""));
    return (
      <div className="max-w-md mx-auto my-16 bg-white border border-zinc-200/80 rounded-xl p-8 text-center space-y-3 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center mx-auto">
          <Lock size={17} />
        </div>
        <h1 className="text-base font-semibold text-zinc-900">Members only</h1>
        <p className="text-xs text-zinc-600">{reason}</p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Link href={`/sign-in?next=${next}`} className={btnPrimary}>
            Sign in
          </Link>
          <Link href="/join" className={btnSecondary}>
            Create account
          </Link>
        </div>
      </div>
    );
  }

  if (admin && !user.is_admin) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white border border-zinc-200/80 rounded-xl p-8 text-center space-y-2 shadow-xs">
        <h1 className="text-base font-semibold text-zinc-900">Admins only</h1>
        <p className="text-xs text-zinc-600">Your account doesn&apos;t have admin access.</p>
      </div>
    );
  }

  return <>{children(user)}</>;
}
