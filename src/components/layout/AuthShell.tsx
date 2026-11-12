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
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#fafafa] animate-fade-in">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">M</div>
          <span className="font-semibold text-2xl tracking-tight text-zinc-900">MANAVI</span>
        </Link>
        <p className="text-xs text-zinc-500 mt-1 font-mono">Navodaya Alumni Community</p>
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
