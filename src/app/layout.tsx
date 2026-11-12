import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { Shortcuts } from "@/components/layout/Shortcuts";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "MANAVI • Navodaya Alumni Community",
  description:
    "The MANAVI alumni community: news, events, stories, jobs, the school timeline and gallery, a marketplace and carpools.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f4f4f5] text-zinc-900 selection:bg-orange-100 selection:text-orange-900 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main>
              <Suspense>{children}</Suspense>
            </main>
            <MobileTabBar />
            <Shortcuts />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
