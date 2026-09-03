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
import { RetroModeSwitcher } from "@/components/ui/retro-mode-switcher";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/8bit/button";
import { Telescope, Users, ShieldAlert, Gamepad2, LogOut, User } from "lucide-react";
import "@/components/ui/8bit/styles/retro.css";

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
      <div className="flex min-h-[100dvh] w-full bg-[#f4f4f4] dark:bg-[#202124] text-[#535353] dark:text-[#e8eaed] transition-colors duration-700 font-sans select-none">
        {/* 8bitcn Retro Sidebar */}
        <Sidebar className="retro border-r-3 border-[#535353] dark:border-[#80868b] bg-white dark:bg-[#2b2c2f]">
          <SidebarHeader className="p-4 border-b-2 border-[#535353]/20 dark:border-[#80868b]/20">
            <Link href="/" className="flex items-center gap-2 font-pixel text-xs font-bold uppercase tracking-wider text-[#0284c7] dark:text-[#38bdf8]">
              <span className="w-3 h-3 bg-[#0284c7] inline-block"></span>
              <span>SAVE DINO HQ</span>
            </Link>
          </SidebarHeader>

          <SidebarContent className="p-2 space-y-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-[9px] font-pixel text-gray-400 uppercase tracking-widest px-2 mb-2">
                IASC Operations
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.active}
                        className={`font-pixel text-[11px] uppercase tracking-wider p-2.5 rounded-none border-2 ${
                          item.active
                            ? "bg-[#535353] text-white dark:bg-[#38bdf8] dark:text-[#202124] border-[#202124] dark:border-[#80868b] shadow-[2px_2px_0px_#000]"
                            : "border-transparent hover:bg-gray-100 dark:hover:bg-[#3c4043]"
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
              <SidebarGroupLabel className="text-[9px] font-pixel text-gray-400 uppercase tracking-widest px-2 mb-2">
                Arcade Switch
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="font-pixel text-[11px] uppercase tracking-wider p-2.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
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
          <header className="h-14 border-b-2 border-[#535353] dark:border-[#80868b] bg-white dark:bg-[#2b2c2f] px-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="p-1 text-[#535353] dark:text-[#e8eaed] hover:bg-gray-100 dark:hover:bg-zinc-800 rounded" />
              <div className="h-4 w-px bg-[#535353]/30 dark:bg-[#80868b]/30"></div>

              {/* 8bitcn Breadcrumb */}
              <Breadcrumb className="font-pixel text-[10px] uppercase">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/" className="text-gray-400 hover:text-current">
                      Dino HQ
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-gray-400">&gt;</BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-bold text-[#0284c7] dark:text-[#38bdf8]">
                      {getBreadcrumbName()}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Controls & Session Info */}
            <div className="flex items-center gap-3">
              {/* 8bitcn Retro Mode Switcher */}
              <RetroModeSwitcher />

              {session?.user ? (
                <div className="flex items-center gap-2.5 text-xs font-mono">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 border border-[#535353] dark:border-[#80868b] rounded-full bg-gray-50 dark:bg-[#202124]">
                    <User className="size-3.5 text-[#0284c7] dark:text-[#38bdf8]" />
                    <span className="font-bold text-[11px]">{session.user.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/") } })}
                    className="p-1 hover:text-red-500"
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
                    <Button size="sm" variant="primary">Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
