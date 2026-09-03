"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LogOut, User, Menu } from "lucide-react";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Navigation Items
  const navItems = [
    { title: "CAMPAIGNS", url: "/campaigns", active: pathname === "/campaigns" },
    { title: "TEAM WORKSPACE", url: "/campaigns", active: pathname.startsWith("/team/") },
  ];

  // @ts-ignore
  if (session?.user?.role === "admin") {
    navItems.push({
      title: "ADMIN CONSOLE",
      url: "/admin",
      active: pathname === "/admin",
    });
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f4f4f4] dark:bg-[#121212] text-[#535353] dark:text-[#e8eaed] font-sans">
      {/* Top Navbar Matching Homepage Style Exactly */}
      <header className="sticky top-0 z-40 w-full border-b border-[#535353]/20 dark:border-[#80868b]/30 bg-[#f4f4f4]/95 dark:bg-[#121212]/95 backdrop-blur-md transition-colors duration-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Branding - Matching Homepage Header */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <svg
                className="w-4 h-4 fill-current text-[#535353] dark:text-[#e8eaed] transition-transform group-hover:scale-110"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8 2 4 7 4 13c0 5 3.5 9 8 9s8-4 8-9c0-6-4-11-8-11zm0 18c-3.3 0-6-3.1-6-7 0-4.2 2.7-8.7 6-8.9 3.3.2 6 4.7 6 8.9 0 3.9-2.7 7-6 7z" />
              </svg>
              <span className="font-sans font-bold text-xs tracking-wider uppercase text-[#535353] dark:text-[#e8eaed]">
                SAVE DINO
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-wide px-2 py-0.5 border border-[#535353]/60 dark:border-[#80868b] rounded-full font-mono text-[#535353] dark:text-[#e8eaed]">
                IASC PORTAL
              </span>
            </Link>

            {/* Desktop Navigation Pills */}
            <nav className="hidden md:flex items-center gap-2 ml-4">
              {navItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  className={`text-[10px] uppercase tracking-wide px-3 py-1 border rounded-full font-mono transition-all cursor-pointer ${
                    item.active
                      ? "bg-[#0284c7] text-white border-[#0284c7] font-bold shadow-xs"
                      : "border-[#535353]/40 dark:border-[#80868b]/60 text-[#535353] dark:text-[#e8eaed] hover:bg-[#0284c7] hover:text-white hover:border-[#0284c7]"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop Right Controls: Play Dino Game & User Session */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/"
              className="text-[10px] uppercase tracking-wide px-3 py-1 border border-amber-500/60 rounded-full font-mono text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
            >
              PLAY DINO GAME &gt;
            </Link>

            {session?.user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 border border-[#535353]/30 dark:border-[#80868b]/30 rounded-full text-xs font-mono">
                  <User className="size-3 text-[#535353] dark:text-[#e8eaed]" />
                  <span className="font-semibold">{session.user.name}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/") } })}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  title="Sign Out"
                >
                  <LogOut className="size-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 font-mono text-xs">
                <Link href="/login">
                  <Button size="sm" variant="outline" className="h-8 text-xs font-mono">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" variant="default" className="h-8 text-xs font-mono bg-[#0284c7] hover:bg-[#0284c7]/90 text-white">Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Menu className="size-4" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 flex flex-col justify-between bg-[#f4f4f4] dark:bg-[#121212]">
                <div>
                  <SheetHeader className="p-4 border-b border-[#535353]/20 dark:border-[#80868b]/30 text-left">
                    <SheetTitle className="flex items-center gap-2 font-sans font-bold text-xs uppercase tracking-wider text-[#535353] dark:text-[#e8eaed]">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C8 2 4 7 4 13c0 5 3.5 9 8 9s8-4 8-9c0-6-4-11-8-11zm0 18c-3.3 0-6-3.1-6-7 0-4.2 2.7-8.7 6-8.9 3.3.2 6 4.7 6 8.9 0 3.9-2.7 7-6 7z" />
                      </svg>
                      <span>SAVE DINO</span>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="p-4 space-y-4">
                    <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                      NAVIGATION
                    </div>
                    <nav className="space-y-2">
                      {navItems.map((item) => (
                        <Link
                          key={item.title}
                          href={item.url}
                          onClick={() => setMobileOpen(false)}
                          className={`block text-[11px] uppercase tracking-wide px-3 py-2 border rounded-full font-mono transition-all ${
                            item.active
                              ? "bg-[#0284c7] text-white border-[#0284c7] font-bold"
                              : "border-[#535353]/30 text-[#535353] dark:text-[#e8eaed]"
                          }`}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </nav>
                  </div>
                </div>

                <div className="p-4 border-t border-[#535353]/20 dark:border-[#80868b]/30 space-y-3 font-mono">
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="block text-center text-[10px] uppercase tracking-wide px-3 py-2 border border-amber-500 rounded-full text-amber-600 dark:text-amber-400 font-bold"
                  >
                    PLAY DINO GAME &gt;
                  </Link>

                  {session?.user ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMobileOpen(false);
                        signOut({ fetchOptions: { onSuccess: () => router.push("/") } });
                      }}
                      className="w-full justify-start text-xs text-destructive hover:text-destructive font-mono"
                    >
                      <LogOut className="size-4 mr-2" />
                      Sign Out ({session.user.name})
                    </Button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        <Button variant="outline" size="sm" className="w-full text-xs font-mono">Sign In</Button>
                      </Link>
                      <Link href="/register" onClick={() => setMobileOpen(false)}>
                        <Button size="sm" className="w-full text-xs font-mono bg-[#0284c7] text-white">Register</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
