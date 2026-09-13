import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
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
  title: "AI Engineer / Pre-research",
  description: "Finished pre-research briefs for AI Engineer conference videos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <ThemeProvider>
          <QueryProvider>
            <header className="border-b border-border">
              <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-3">
                <Link
                  href="/"
                  className="font-mono text-[13px] font-medium uppercase tracking-[0.16em]"
                >
                  AI Engineer / Pre-research
                </Link>
                <nav className="flex items-center gap-2">
                  <Link
                    href="/"
                    className="font-mono text-[13px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
                  >
                    Talks
                  </Link>
                  <ThemeSwitcher />
                </nav>
              </div>
            </header>
            <Suspense>
              <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children}</main>
            </Suspense>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
