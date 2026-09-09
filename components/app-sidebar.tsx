"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Telescope, Users, ShieldAlert, Gamepad2, Sparkles } from "lucide-react";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    {
      title: "Campaigns Hub",
      url: "/campaigns",
      icon: Telescope,
      active: pathname === "/campaigns",
    },
    {
      title: "Team Workspace",
      url: "/campaigns",
      icon: Users,
      active: pathname.startsWith("/team/"),
    },
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
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-16 flex items-center justify-between border-b px-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-sm tracking-tight text-primary"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <span className="truncate group-data-[collapsible=icon]:hidden font-semibold">
            SAVE DINO HQ
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs font-medium text-muted-foreground px-2 mb-2">
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
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="size-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Play Dino Game"
              className="text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            >
              <Link href="/" className="flex items-center gap-3 font-medium">
                <Gamepad2 className="size-4 shrink-0" />
                <span>Play Dino Game</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
