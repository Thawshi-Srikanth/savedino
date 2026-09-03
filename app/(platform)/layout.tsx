"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Telescope, Users, ShieldAlert, Gamepad2, LogOut, User, Sparkles } from "lucide-react";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  // Navigation Items
  const navItems = [
    { title: "Campaigns Hub", url: "/campaigns", icon: Telescope, active: pathname === "/campaigns" },
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

  // Get Breadcrumb Page Name
  const getBreadcrumbName = () => {
    if (pathname === "/campaigns") return "Campaigns Hub";
    if (pathname === "/admin") return "Admin Command Console";
    if (pathname.startsWith("/team/")) return "Team Workspace";
    if (pathname === "/login") return "Sign In";
    if (pathname === "/register") return "Student Registration";
    return "IASC Platform";
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground font-sans">
      {/* Fixed Dedicated Width Left Navigation Sidebar (w-64 / 256px) */}
      <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col justify-between min-h-screen">
        <div>
          {/* Header */}
          <div className="h-16 px-6 flex items-center border-b border-border">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-sm text-primary tracking-tight">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </div>
              <span className="font-bold">SAVE DINO HQ</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-6">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                IASC Operations
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.url}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
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
        </div>

        {/* Footer Arcade Link */}
        <div className="p-4 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
          >
            <Gamepad2 className="size-4 shrink-0" />
            <span>Play Dino Game</span>
          </Link>
        </div>
      </aside>

      {/* Right Main Content Area (occupies remaining width cleanly) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Bar Header */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium">Dino HQ</span>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-xs font-semibold text-foreground">{getBreadcrumbName()}</span>
          </div>

          {/* Session Controls */}
          <div className="flex items-center gap-3">
            {session?.user ? (
              <div className="flex items-center gap-2.5 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-full bg-accent/50">
                  <User className="size-3.5 text-primary" />
                  <span className="font-medium text-xs">{session.user.name}</span>
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
        </header>

        {/* Main Body */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto bg-background/50">
          {children}
        </main>
      </div>
    </div>
  );
}
