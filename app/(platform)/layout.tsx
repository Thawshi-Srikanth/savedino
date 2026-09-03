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
  SidebarInset,
  SidebarRail,
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
    <SidebarProvider defaultOpen={true}>
      {/* Official Responsive Collapsible shadcn Sidebar */}
      <Sidebar collapsible="icon" className="border-r border-border bg-card">
        <SidebarHeader className="h-14 flex items-center px-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-sm text-primary tracking-tight">
            <Sparkles className="size-5 text-primary shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden font-bold">SAVE DINO HQ</span>
          </Link>
        </SidebarHeader>

        <SidebarContent className="p-2 space-y-4">
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs text-muted-foreground font-medium px-2 mb-1">
              IASC Operations
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.active}
                      tooltip={item.title}
                      className={
                        item.active
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }
                    >
                      <Link href={item.url} className="flex items-center gap-2.5">
                        <item.icon className="size-4 shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs text-muted-foreground font-medium px-2 mb-1">
              Arcade
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Play Dino Game"
                    className="text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-md"
                  >
                    <Link href="/" className="flex items-center gap-2.5">
                      <Gamepad2 className="size-4 shrink-0" />
                      <span>Play Dino Game</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarRail />
      </Sidebar>

      {/* Main Content Area using SidebarInset */}
      <SidebarInset className="flex flex-col flex-1 min-w-0 bg-background text-foreground font-sans">
        {/* Header */}
        <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" className="h-4" />

            {/* Breadcrumb */}
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
      </SidebarInset>
    </SidebarProvider>
  );
}
