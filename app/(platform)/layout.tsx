"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
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
import { LogOut, User } from "lucide-react";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

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
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 bg-card">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb className="text-xs">
              <BreadcrumbList>
                <BreadcrumbItem className="hidden sm:block">
                  <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground">
                    Dino HQ
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold text-foreground">
                    {getBreadcrumbName()}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

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

        <div className="flex flex-1 flex-col gap-4 p-6 bg-background">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
