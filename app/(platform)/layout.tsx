"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sun, Moon, LogOut, User, Menu, Gamepad2, Telescope, Users, ShieldAlert } from "lucide-react";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Theme Switcher State
  const [isNight, setIsNight] = useState<boolean>(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("savedino_theme");
    const isDark =
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches) ||
      document.documentElement.classList.contains("dark") ||
      document.documentElement.classList.contains("night-mode");

    if (isDark) {
      setIsNight(true);
      document.documentElement.classList.add("dark");
      document.documentElement.classList.add("night-mode");
    } else {
      setIsNight(false);
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.remove("night-mode");
    }
  }, []);

  const handleToggleTheme = () => {
    setIsNight((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.add("night-mode");
        localStorage.setItem("savedino_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.remove("night-mode");
        localStorage.setItem("savedino_theme", "light");
      }
      return next;
    });
  };

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
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground font-sans transition-colors duration-700">
      {/* Top Navbar Matching PostHog Sample Exactly */}
      <header className="sticky top-0 z-40 w-full border-b border-[#111111]/15 dark:border-white/15 bg-[#e2e7dc]/90 dark:bg-[#121315]/90 backdrop-blur-md transition-colors duration-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* PostHog Style Logo & Branding */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
              {/* PostHog Hedge / Dino Icon Badge */}
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-6 bg-[#f54e00] rounded-xs transform -skew-x-12" />
                <div className="w-2.5 h-6 bg-[#f59e0b] rounded-xs transform -skew-x-12" />
                <div className="w-2.5 h-6 bg-[#bd10e0] rounded-xs transform -skew-x-12" />
              </div>
              <span className="font-sans font-bold text-sm tracking-tight text-foreground">
                SaveDino
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 border border-[#111111]/20 dark:border-white/20 rounded-md bg-white/50 dark:bg-white/10 text-foreground">
                IASC PORTAL
              </span>
            </Link>

            {/* Desktop Navigation Pills */}
            <nav className="hidden md:flex items-center gap-2 ml-4">
              {navItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  className={`text-xs px-3.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    item.active
                      ? "bg-[#bd10e0] text-white font-bold shadow-xs"
                      : "text-foreground hover:bg-white/60 dark:hover:bg-white/10"
                  }`}
                >
                  <item.icon className="size-3.5" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop Right Controls: Play Dino Game, Sun/Moon Switcher & Session */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Switcher Button */}
            <button
              onClick={handleToggleTheme}
              className="w-8 h-8 rounded-md border border-[#111111]/20 dark:border-white/20 bg-white/60 dark:bg-white/10 flex items-center justify-center transition-colors focus:outline-hidden cursor-pointer hover:bg-white dark:hover:bg-white/20 text-foreground"
              title={isNight ? "Switch to Day Mode" : "Switch to Night Mode"}
            >
              {isNight ? (
                <Sun className="size-4 text-amber-400" />
              ) : (
                <Moon className="size-4 text-[#bd10e0]" />
              )}
            </button>

            <Link href="/">
              <Button size="sm" variant="default" className="text-xs font-bold flex items-center gap-1.5">
                <Gamepad2 className="size-3.5" />
                <span>Play Arcade &gt;</span>
              </Button>
            </Link>

            {session?.user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 border border-[#111111]/20 dark:border-white/20 rounded-md text-xs font-medium bg-white/50 dark:bg-white/10">
                  <User className="size-3 text-[#bd10e0]" />
                  <span className="font-bold">{session.user.name}</span>
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
              <div className="flex items-center gap-2 text-xs">
                <Link href="/login">
                  <Button size="sm" variant="outline" className="h-8 text-xs font-bold">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" variant="default" className="h-8 text-xs font-bold">Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={handleToggleTheme}
              className="w-8 h-8 rounded-md border border-[#111111]/20 dark:border-white/20 bg-white/60 dark:bg-white/10 flex items-center justify-center transition-colors focus:outline-hidden cursor-pointer text-foreground"
              title={isNight ? "Switch to Day Mode" : "Switch to Night Mode"}
            >
              {isNight ? (
                <Sun className="size-4 text-amber-400" />
              ) : (
                <Moon className="size-4 text-[#bd10e0]" />
              )}
            </button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Menu className="size-4" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 flex flex-col justify-between bg-card text-card-foreground border-r border-border">
                <div>
                  <SheetHeader className="p-4 border-b border-border text-left">
                    <SheetTitle className="flex items-center gap-2 font-sans font-bold text-sm tracking-tight text-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-5 bg-[#f54e00] rounded-xs transform -skew-x-12" />
                        <div className="w-2 h-5 bg-[#f59e0b] rounded-xs transform -skew-x-12" />
                        <div className="w-2 h-5 bg-[#bd10e0] rounded-xs transform -skew-x-12" />
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
                              ? "bg-[#bd10e0] text-white font-bold"
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
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="block"
                  >
                    <Button variant="default" className="w-full text-xs font-bold flex items-center justify-center gap-2">
                      <Gamepad2 className="size-4" />
                      <span>Play Arcade &gt;</span>
                    </Button>
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
    </div>
  );
}
