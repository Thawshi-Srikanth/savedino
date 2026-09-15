"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Gamepad2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-background text-foreground font-sans relative">
      {/* Clean Public Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-[#f8fafc]/90 dark:bg-[#121315]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Logo href="/" size="md" showEarlyAccess />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleTheme}
              className="h-9 w-9 rounded-xl cursor-pointer border-border hover:bg-muted shadow-arcade-sm active:translate-y-0.5"
              title="Toggle Day / Night Mode"
            >
              <Sun className="size-4 text-amber-400 dark:block hidden" />
              <Moon className="size-4 text-[#8b5cf6] dark:hidden block" />
            </Button>

            <Link href="/" prefetch={false}>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs font-bold gap-1.5 rounded-xl border-border shadow-arcade-sm active:translate-y-0.5"
              >
                <Gamepad2 className="size-3.5 text-amber-500" />
                <span>Arcade</span>
              </Button>
            </Link>

            {session?.user ? (
              <Link href="/campaigns" prefetch={false}>
                <Button
                  size="sm"
                  className="h-9 px-3.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground shadow-arcade-primary active:translate-y-0.5"
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login" prefetch={false}>
                <Button
                  size="sm"
                  className="h-9 px-3.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground shadow-arcade-primary active:translate-y-0.5"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Content Body */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
        <div className="flex-1">{children}</div>
      </main>

      {/* Clean Public Footer */}
      <footer className="w-full border-t border-border/40 py-6 bg-card/20 select-text">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-muted-foreground text-center sm:text-left">
          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
            <span className="font-bold text-foreground">SaveDino</span>
            <span className="opacity-40">&bull;</span>
            <a
              href="https://www.sedssl.org"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-80 hover:opacity-100 hover:text-foreground transition-opacity underline-offset-2 hover:underline inline-flex items-center"
            >
              SEDS Sri Lanka
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-2.5 gap-y-1">
            <Link
              href="/credits"
              prefetch={false}
              className={`hover:text-foreground transition-colors underline-offset-2 hover:underline ${
                pathname === "/credits" ? "text-foreground font-semibold" : ""
              }`}
            >
              Credits
            </Link>
            <span className="opacity-40 hidden sm:inline">|</span>
            <Link
              href="/privacy"
              prefetch={false}
              className={`hover:text-foreground transition-colors underline-offset-2 hover:underline ${
                pathname === "/privacy" ? "text-foreground font-semibold" : ""
              }`}
            >
              Privacy
            </Link>
            <span className="opacity-40 hidden sm:inline">|</span>
            <Link
              href="/cookies"
              prefetch={false}
              className={`hover:text-foreground transition-colors underline-offset-2 hover:underline ${
                pathname === "/cookies" ? "text-foreground font-semibold" : ""
              }`}
            >
              Cookies
            </Link>
            <span className="opacity-40 hidden sm:inline">|</span>
            <Link
              href="/terms"
              prefetch={false}
              className={`hover:text-foreground transition-colors underline-offset-2 hover:underline ${
                pathname === "/terms" ? "text-foreground font-semibold" : ""
              }`}
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
