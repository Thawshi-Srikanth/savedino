"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
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
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-[100dvh] w-full bg-background text-foreground font-sans">
        {/* Modern Traditional shadcn Sidebar */}
        <Sidebar className="border-r border-border bg-card">
          <SidebarHeader className="p-4 border-b border-border">
            <Link href="/" className="flex items-center gap-2 font-semibold text-sm text-primary tracking-tight">
              <Sparkles className="size-4 text-primary" />
              <span>SAVE DINO HQ</span>
            </Link>
          </SidebarHeader>

          <SidebarContent className="p-3 space-y-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs text-muted-foreground font-medium px-2 mb-2">
                IASC Operations
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.active}
                        className={`text-xs font-medium p-2.5 rounded-md transition-colors ${
                          item.active
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        <Link href={item.url} className="flex items-center gap-2.5">
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs text-muted-foreground font-medium px-2 mb-2">
                Arcade
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="text-xs font-medium p-2.5 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-md"
                    >
                      <Link href="/" className="flex items-center gap-2.5">
                        <Gamepad2 className="size-4" />
                        <span>Play Dino Game</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar Header */}
          <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="p-1.5 text-muted-foreground hover:text-foreground rounded-md" />
              <div className="h-4 w-px bg-border"></div>

              {/* Traditional shadcn Breadcrumb */}
              <Breadcrumb className="text-xs">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground">
                      Dino HQ
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold text-foreground">
                      {getBreadcrumbName()}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Session Info & Controls */}
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

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-8 overflow-y-auto bg-background/50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
