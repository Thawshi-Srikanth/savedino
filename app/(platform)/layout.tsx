"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Telescope, Users, ShieldAlert, Gamepad2, LogOut, User, Sparkles, Menu } from "lucide-react";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Navigation Items
  const navItems = [
    { title: "Campaigns", url: "/campaigns", icon: Telescope, active: pathname === "/campaigns" },
    { title: "Team Workspace", url: "/campaigns", icon: Users, active: pathname.startsWith("/team/") },
  ];

  // @ts-ignore
  if (session?.user?.role === "admin") {
    navItems.push({
      title: "Admin Console",
      url: "/admin",
      icon: ShieldAlert,
      active: pathname === "/admin",
    });
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground font-sans">
      {/* Top Navbar for Desktop & Mobile */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Arcade Branding */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-sm text-primary tracking-tight group">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
                <Sparkles className="size-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-pixel text-xs tracking-wider text-primary">SAVE DINO</span>
                <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest -mt-0.5">IASC PORTAL</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    item.active
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <item.icon className="size-4" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop Right Actions & Arcade Launcher */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
            >
              <Gamepad2 className="size-4" />
              <span>Play Arcade Game</span>
            </Link>

            {session?.user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-full bg-accent/50 text-xs">
                  <User className="size-3.5 text-primary" />
                  <span className="font-medium">{session.user.name}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/") } })}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  title="Sign Out"
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button size="sm" variant="outline">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" variant="default">Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Navigation Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Menu className="size-4" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 flex flex-col justify-between">
                <div>
                  <SheetHeader className="p-4 border-b border-border text-left">
                    <SheetTitle className="flex items-center gap-2 font-pixel text-xs text-primary">
                      <Sparkles className="size-4 text-primary" />
                      <span>SAVE DINO HQ</span>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="p-4 space-y-4">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                      Navigation
                    </div>
                    <nav className="space-y-1">
                      {navItems.map((item) => (
                        <Link
                          key={item.title}
                          href={item.url}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                            item.active
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          }`}
                        >
                          <item.icon className="size-4 shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      ))}
                    </nav>
                  </div>
                </div>

                <div className="p-4 border-t border-border space-y-3">
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30"
                  >
                    <Gamepad2 className="size-4" />
                    <span>Play Dino Game</span>
                  </Link>

                  {session?.user ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMobileOpen(false);
                        signOut({ fetchOptions: { onSuccess: () => router.push("/") } });
                      }}
                      className="w-full justify-start text-xs text-destructive hover:text-destructive"
                    >
                      <LogOut className="size-4 mr-2" />
                      Sign Out ({session.user.name})
                    </Button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        <Button variant="outline" size="sm" className="w-full text-xs">Sign In</Button>
                      </Link>
                      <Link href="/register" onClick={() => setMobileOpen(false)}>
                        <Button variant="default" size="sm" className="w-full text-xs">Register</Button>
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
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
