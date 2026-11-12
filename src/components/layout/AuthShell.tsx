import Link from "next/link";
import { Card } from "@/components/ui/Card";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#f4f4f5] animate-fade-in">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block" aria-label="MANAVI home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/manavi-wordmark.png" alt="MANAVI" width={787} height={180} className="h-10 sm:h-12 w-auto" />
        </Link>
        <p className="text-xs text-zinc-500 mt-2 font-mono">Navodaya Alumni Community</p>
      </div>

      <Card className={`w-full ${wide ? "max-w-lg" : "max-w-md"} p-6 sm:p-8 space-y-5`}>
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">{title}</h1>
          {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
        {children}
        {footer && <div className="pt-4 border-t border-zinc-100 text-center text-xs text-zinc-500">{footer}</div>}
      </Card>
    </div>
  );
}
