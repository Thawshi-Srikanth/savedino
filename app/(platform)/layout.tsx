"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut, updateCachedUser } from "@/lib/auth-client";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon, LogOut, User, Gamepad2, Telescope, Users, ShieldAlert } from "lucide-react";
import { Logo } from "@/components/Logo";

import { PixelAvatar } from "@/components/pixel-avatar";
import { ProfileOnboardingDialog } from "@/components/profile-onboarding-dialog";
import { PlatformTourGuide, PlatformTourTriggerButton } from "@/components/platform-tour-guide";
import { DinoLoading } from "@/components/dino-loading";
import { FloatingDiscordWidget } from "@/components/floating-discord-widget";
import { getUserProfile } from "@/lib/user-profile";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Unified Next-Themes Theme State
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);

    // Sync active database profile and avatar seed to session cache without duplicate network requests
    if (session?.user?.id) {
      getUserProfile();
    }
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      window.location.href = "/";
    } catch (error) {
      window.location.href = "/";
    }
  };

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

  // Full-screen loading when signing out
  if (isSigningOut) {
    return <DinoLoading size="lg" text="Signing out..." fullScreen />;
  }

  // Navigation Items (Disabled in Demo Mode)
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const navItems = isDemo
    ? []
    : [
        {
          title: "Campaigns",
          url: "/campaigns",
          icon: Telescope,
          active: pathname === "/campaigns",
        },
        {
          title: "Teams",
          url: "/teams",
          icon: Users,
          active: pathname === "/teams" || pathname.startsWith("/team/"),
        },
      ];

  // @ts-ignore
  const userRole = session?.user?.role;
  if (!isDemo && (userRole === "admin" || userRole === "staff")) {
    navItems.push({
      title: "Admin Console",
      url: "/admin",
      icon: ShieldAlert,
      active: pathname === "/admin" || pathname.startsWith("/admin/"),
    });
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground font-sans relative">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-[#f8fafc]/90 dark:bg-[#121315]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          {/* SaveDino Branding Logo with floating Early Access badge */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="block sm:hidden">
              <Logo href="/" size="sm" showEarlyAccess />
            </div>
            <div className="hidden sm:block">
              <Logo href="/" size="md" showEarlyAccess />
            </div>

            {/* Desktop Navigation Pills with Uniform 3D Button Styling */}
            <nav className="hidden md:flex items-center gap-2 ml-4">
              {navItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  prefetch={false}
                  id={
                    item.url === "/campaigns"
                      ? "tour-desktop-campaigns"
                      : item.url === "/teams"
                        ? "tour-desktop-teams"
                        : undefined
                  }
                >
                  <Button
                    size="sm"
                    variant={item.active ? "default" : "outline"}
                    className="h-9 px-3.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-arcade-sm active:translate-y-0.5 rounded-xl"
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
            {/* Platform Tour Guide Button */}
            {!isDemo && <PlatformTourTriggerButton />}

            {/* Theme Switcher 3D Button */}
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

            {session?.user ? (
              <div className="flex items-center gap-2">
                {/* Logged-In User Profile Link with Seed Pixel Avatar */}
                <Link href="/profile" prefetch={false} id="tour-desktop-profile">
                  <Button
                    size="sm"
                    variant={pathname === "/profile" ? "default" : "outline"}
                    className="h-9 px-3 rounded-xl border-border flex items-center gap-2 font-bold text-xs shadow-arcade-sm active:translate-y-0.5"
                  >
                    <PixelAvatar
                      seed={session.user.image || session.user.name || session.user.id}
                      size={20}
                      showBorder={false}
                    />
                    <span className="max-w-[100px] truncate">{session.user.name}</span>
                  </Button>
                </Link>

                {/* Sign Out Button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSignOut}
                  className="h-9 w-9 rounded-xl cursor-pointer text-muted-foreground hover:text-destructive border-border hover:bg-muted shadow-arcade-sm active:translate-y-0.5"
                  title="Sign out"
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" prefetch={false}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3.5 rounded-xl border-border font-bold text-xs shadow-arcade-sm active:translate-y-0.5"
                  >
                    Sign in
                  </Button>
                </Link>
                <Link href="/register" prefetch={false}>
                  <Button
                    size="sm"
                    className="h-9 px-3.5 rounded-xl font-bold text-xs shadow-arcade-primary active:translate-y-0.5 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Controls: Theme, Avatar/Sign In, Menu */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Theme Switcher */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleTheme}
              className="h-9 w-9 rounded-xl cursor-pointer border-border hover:bg-muted shadow-arcade-sm active:translate-y-0.5"
              title="Toggle Day / Night Mode"
              aria-label="Toggle theme"
            >
              <Sun className="size-4 text-amber-400 dark:block hidden" />
              <Moon className="size-4 text-[#8b5cf6] dark:hidden block" />
            </Button>

            {session?.user ? (
              <div className="flex items-center gap-1.5">
                <Link href="/profile" prefetch={false}>
                  <Button
                    variant={pathname === "/profile" ? "default" : "outline"}
                    size="sm"
                    className="h-9 px-2 rounded-xl text-xs font-bold border-border shadow-arcade-sm active:translate-y-0.5 flex items-center gap-1.5"
                    title="Profile"
                  >
                    <PixelAvatar
                      seed={session.user.image || session.user.name || session.user.id}
                      size={20}
                      showBorder={false}
                    />
                    <span className="max-w-[70px] truncate">
                      {session.user.name?.split(" ")[0]}
                    </span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSignOut}
                  className="h-9 w-9 p-0 rounded-xl text-xs font-bold text-muted-foreground hover:text-destructive border-border shadow-arcade-sm active:translate-y-0.5"
                  title="Sign Out"
                >
                  <LogOut className="size-3.5" />
                </Button>
              </div>
            ) : isDemo ? (
              <div className="flex items-center gap-1.5">
                <Link href="/" prefetch={false}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-2.5 rounded-xl text-xs font-bold border-border shadow-arcade-sm active:translate-y-0.5"
                  >
                    Arcade
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link href="/login" prefetch={false}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-2.5 rounded-xl text-xs font-bold border-border shadow-arcade-sm active:translate-y-0.5"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" prefetch={false}>
                  <Button
                    size="sm"
                    variant="default"
                    className="h-9 px-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-arcade-primary active:translate-y-0.5"
                  >
                    Join
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main
        className={`flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between ${
          isDemo ? "pb-8" : "pb-24 md:pb-8"
        }`}
      >
        <div className="flex-1">{children}</div>

        {/* Platform Bottom Footer Note */}
        <footer className="w-full pt-8 mt-12 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-muted-foreground pb-4 md:pb-0 text-center sm:text-left select-text">
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
              className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
            >
              Credits
            </Link>
            <span className="opacity-40 hidden sm:inline">|</span>
            <Link
              href="/privacy"
              prefetch={false}
              className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
            >
              Privacy
            </Link>
            <span className="opacity-40 hidden sm:inline">|</span>
            <Link
              href="/cookies"
              prefetch={false}
              className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
            >
              Cookies
            </Link>
            <span className="opacity-40 hidden sm:inline">|</span>
            <Link
              href="/terms"
              prefetch={false}
              className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
            >
              Terms
            </Link>
          </div>
        </footer>
      </main>

      {/* Profile Onboarding Modal for Incomplete Profiles */}
      <ProfileOnboardingDialog />

      {/* Interactive Platform Tour Guide */}
      {!isDemo && <PlatformTourGuide />}

      {/* Floating Discord Server & Community Menu Widget */}
      {!isDemo && <FloatingDiscordWidget />}

      {/* Desktop Floating Arcade Game Button (Hidden on mobile or in demo mode) */}
      {!isDemo && (
        <div className="hidden md:block fixed bottom-6 right-6 z-50">
          <Link href="/" prefetch={false}>
            <Button
              id="tour-desktop-arcade"
              size="icon"
              className="w-12 h-12 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-[#0f172a] border border-[#b45309] shadow-arcade-amber-lg active:translate-y-[2px] active:shadow-none flex items-center justify-center cursor-pointer transition-all"
              title="Play SaveDino Arcade Game"
            >
              <Gamepad2 className="size-6 text-[#0f172a]" />
            </Button>
          </Link>
        </div>
      )}

      {/* App-Style Mobile Full-Width Bottom Navigation Bar (Hidden in Demo Mode) */}
      {!isDemo && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 dark:bg-[#121315]/95 backdrop-blur-md border-t border-border px-3 py-2 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
          <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
            {/* 1. Arcade / Game (First) */}
            <Link
              href="/"
              prefetch={false}
              id="tour-mobile-arcade"
              className={`flex items-center justify-center gap-1.5 h-10 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                pathname === "/"
                  ? "flex-1 bg-[#facc15] text-slate-950 border border-[#ca8a04] shadow-arcade-amber-lg active:translate-y-0.5"
                  : "size-10 bg-muted/70 text-foreground border border-border shadow-arcade-sm hover:bg-muted active:translate-y-0.5 shrink-0"
              }`}
              title="Play Retro Arcade Game"
              aria-label="Arcade Game"
            >
              <Gamepad2 className="size-4.5 shrink-0" />
              {pathname === "/" && <span>Arcade</span>}
            </Link>

            {/* 2. Campaigns (Second) */}
            <Link
              href="/campaigns"
              prefetch={false}
              id="tour-mobile-campaigns"
              className={`flex items-center justify-center gap-1.5 h-10 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                pathname === "/campaigns"
                  ? "flex-1 bg-primary text-primary-foreground border border-primary/80 shadow-arcade-primary-lg active:translate-y-0.5"
                  : "size-10 bg-muted/70 text-foreground border border-border shadow-arcade-sm hover:bg-muted active:translate-y-0.5 shrink-0"
              }`}
              title="Observation Campaigns"
              aria-label="Campaigns"
            >
              <Telescope className="size-4.5 shrink-0" />
              {pathname === "/campaigns" && <span>Campaigns</span>}
            </Link>

            {/* 3. Teams (Third) */}
            <Link
              href="/teams"
              prefetch={false}
              id="tour-mobile-teams"
              className={`flex items-center justify-center gap-1.5 h-10 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                pathname === "/teams" || pathname.startsWith("/team/")
                  ? "flex-1 bg-primary text-primary-foreground border border-primary/80 shadow-arcade-primary-lg active:translate-y-0.5"
                  : "size-10 bg-muted/70 text-foreground border border-border shadow-arcade-sm hover:bg-muted active:translate-y-0.5 shrink-0"
              }`}
              title="Discovery Squads"
              aria-label="Teams"
            >
              <Users className="size-4.5 shrink-0" />
              {(pathname === "/teams" || pathname.startsWith("/team/")) && <span>Squads</span>}
            </Link>

            {/* 4. Profile / Studio (Fourth) */}
            {session?.user && (
              <Link
                href="/profile"
                prefetch={false}
                id="tour-mobile-profile"
                className={`flex items-center justify-center gap-1.5 h-10 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  pathname === "/profile"
                    ? "flex-1 bg-primary text-primary-foreground border border-primary/80 shadow-arcade-primary-lg active:translate-y-0.5"
                    : "size-10 bg-muted/70 text-foreground border border-border shadow-arcade-sm hover:bg-muted active:translate-y-0.5 shrink-0"
                }`}
                title="Profile Studio"
                aria-label="Profile"
              >
                <User className="size-4.5 shrink-0" />
                {pathname === "/profile" && <span>Profile</span>}
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
