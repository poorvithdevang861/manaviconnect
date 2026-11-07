import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-4">
      <div className="text-xs font-mono text-warm-muted uppercase tracking-wider">
        404 • Not Found
      </div>
      <h1 className="text-2xl font-semibold text-warm-text">
        Page or Member Record Not Found
      </h1>
      <p className="text-sm text-warm-secondary max-w-md mx-auto">
        The alumni profile, story, or event you requested does not exist or may have been moved.
      </p>
      <div className="pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-navy-900 hover:bg-navy-800 rounded-control transition-colors shadow-subtle"
        >
          <ArrowLeft size={14} />
          Return to Community Home
        </Link>
      </div>
    </div>
  );
}

