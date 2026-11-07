import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

export const metadata: Metadata = {
  title: "MANAVI • Verified Navodaya Alumni Network",
  description:
    "A private, verified alumni network for Jawahar Navodaya Vidyalaya graduates to find batchmates, share news, post jobs and host reunions.",
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
      <body className="min-h-screen bg-[#fafafa] text-zinc-900 selection:bg-orange-100 selection:text-orange-900 pb-16 md:pb-0">
        <Navbar />
        <main>{children}</main>
        <MobileTabBar />
      </body>
    </html>
  );
}
