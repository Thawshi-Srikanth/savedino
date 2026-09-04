"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sun, Moon, LogOut, User, Menu, Gamepad2, Telescope, Users, ShieldAlert } from "lucide-react";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Unified Next-Themes Theme State
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync night-mode class for backwards-compatibility
  useEffect(() => {
    if (resolvedTheme === "dark") {
      document.documentElement.classList.add("night-mode");
    } else {
      document.documentElement.classList.remove("night-mode");
    }
  }, [resolvedTheme]);

  const isNight = mounted ? resolvedTheme === "dark" : false;

  const handleToggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  // Dedicated Full-Screen Layout for Login, Register & Verify (No Navbar)
  if (pathname === "/login" || pathname === "/register" || pathname === "/verify") {
    return (
      <div className="min-h-screen w-full flex flex-col justify-between bg-background text-foreground font-sans select-none">
        {children}
      </div>
    );
  }

  // Navigation Items
  const navItems = [
    { title: "Campaigns", url: "/campaigns", icon: Telescope, active: pathname === "/campaigns" },
    { title: "Teams", url: "/teams", icon: Users, active: pathname === "/teams" || pathname.startsWith("/team/") },
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
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground font-sans relative">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-[#f8fafc]/90 dark:bg-[#121315]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* PostHog Style Slate & Violet Branding Logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
              {/* Slanted 3-Color Badge */}
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-6 bg-[#8b5cf6] rounded-xs transform -skew-x-12" />
                <div className="w-2.5 h-6 bg-[#10b981] rounded-xs transform -skew-x-12" />
                <div className="w-2.5 h-6 bg-[#38bdf8] rounded-xs transform -skew-x-12" />
              </div>
              <span className="font-pixel text-[11px] tracking-wider uppercase text-foreground">
                SaveDino
              </span>
            </Link>

            {/* Desktop Navigation Pills with Uniform 3D Button Styling */}
            <nav className="hidden md:flex items-center gap-2 ml-4">
              {navItems.map((item) => (
                <Link key={item.title} href={item.url}>
                  <Button
                    size="sm"
                    variant={item.active ? "default" : "outline"}
                    className="h-9 px-3.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <item.icon className="size-3.5" />
                    <span>{item.title}</span>
                  </Button>
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop Right Controls: Uniform Height (h-9) Controls & Session */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme Switcher 3D Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleTheme}
              className="h-9 w-9 rounded-md cursor-pointer"
              title={isNight ? "Switch to Day Mode" : "Switch to Night Mode"}
            >
              {isNight ? (
                <Sun className="size-4 text-amber-400" />
              ) : (
                <Moon className="size-4 text-[#8b5cf6]" />
              )}
            </Button>

            {session?.user ? (
              <div className="flex items-center gap-2">
                {/* Logged-In User Badge with 3D PostHog Shadow & Uniform h-9 Height */}
                <div className="h-9 flex items-center gap-1.5 px-3.5 border border-border rounded-md text-xs font-medium bg-card shadow-[0_3px_0_0_rgba(0,0,0,0.15)] dark:shadow-[0_3px_0_0_rgba(255,255,255,0.08)]">
                  <User className="size-3.5 text-[#8b5cf6]" />
                  <span className="font-bold">{session.user.name}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/") } })}
                  className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="size-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <Link href="/login">
                  <Button size="sm" variant="outline" className="h-9 px-3.5 text-xs font-bold">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" variant="default" className="h-9 px-3.5 text-xs font-bold">Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleTheme}
              className="h-9 w-9 rounded-md cursor-pointer"
              title={isNight ? "Switch to Day Mode" : "Switch to Night Mode"}
            >
              {isNight ? (
                <Sun className="size-4 text-amber-400" />
              ) : (
                <Moon className="size-4 text-[#8b5cf6]" />
              )}
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Menu className="size-4" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 flex flex-col justify-between bg-card text-card-foreground border-r border-border">
                <div>
                  <SheetHeader className="p-4 border-b border-border text-left">
                    <SheetTitle className="flex items-center gap-2 font-pixel text-xs tracking-tight text-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-5 bg-[#8b5cf6] rounded-xs transform -skew-x-12" />
                        <div className="w-2 h-5 bg-[#10b981] rounded-xs transform -skew-x-12" />
                        <div className="w-2 h-5 bg-[#38bdf8] rounded-xs transform -skew-x-12" />
                      </div>
                      <span>SaveDino</span>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="p-4 space-y-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      NAVIGATION
                    </div>
                    <nav className="space-y-2">
                      {navItems.map((item) => (
                        <Link
                          key={item.title}
                          href={item.url}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-2 text-xs px-3.5 py-2 rounded-md font-semibold transition-all ${
                            item.active
                              ? "bg-[#8b5cf6] text-white font-bold"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      ))}
                    </nav>
                  </div>
                </div>

                <div className="p-4 border-t border-border space-y-3">
                  {/* Mobile Theme Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleTheme}
                    className="w-full justify-between text-xs font-bold"
                  >
                    <span className="flex items-center gap-2">
                      {isNight ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-[#8b5cf6]" />}
                      <span>{isNight ? "Day Mode" : "Night Mode"}</span>
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{isNight ? "Dark" : "Light"}</span>
                  </Button>

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
                        <Button variant="outline" size="sm" className="w-full text-xs font-bold">Sign In</Button>
                      </Link>
                      <Link href="/register" onClick={() => setMobileOpen(false)}>
                        <Button size="sm" className="w-full text-xs font-bold">Register</Button>
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

      {/* Global Floating Arcade Game Square Icon Button (PostHog Yellow-Orange) */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="/">
          <Button
            size="icon"
            className="w-12 h-12 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-[#0f172a] border border-[#b45309] shadow-[0_3.5px_0_0_#b45309] active:translate-y-[2px] active:shadow-none flex items-center justify-center cursor-pointer transition-all"
            title="Play SaveDino Arcade Game"
          >
            <Gamepad2 className="size-6 text-[#0f172a]" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
