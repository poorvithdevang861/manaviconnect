import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-4">
      <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">404 • Not found</div>
      <h1 className="text-2xl font-semibold text-zinc-900">This page doesn&apos;t exist</h1>
      <p className="text-sm text-zinc-600 max-w-md mx-auto">The link may be wrong, or the item was removed.</p>
      <div className="pt-4">
        <Link
          href="/"
          className="btn-press inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>
      </div>
    </div>
  );
}
