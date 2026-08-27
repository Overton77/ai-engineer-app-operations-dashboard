import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agents dashboard",
  description: "Research and capability proof surface for the AI Engineer agents.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <QueryProvider>
          <header className="border-b border-border">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4">
              <Link href="/" className="text-sm font-semibold tracking-tight">
                Agents dashboard
              </Link>
              <nav className="flex gap-5 text-sm text-muted-foreground">
                <Link href="/research-capability" className="hover:text-foreground">
                  Research capability
                </Link>
                <Link href="/research-capability/library" className="hover:text-foreground">
                  Library
                </Link>
                <Link href="/research-capability/taxonomy" className="hover:text-foreground">
                  Taxonomy
                </Link>
                <Link href="/research-capability/tables/pipeline-runs" className="hover:text-foreground">
                  Tables
                </Link>
              </nav>
            </div>
          </header>
          <Suspense>
            <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children}</main>
          </Suspense>
        </QueryProvider>
      </body>
    </html>
  );
}
