import { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 1. If not authenticated, redirect to login
  if (!session) {
    redirect("/login?redirectTo=/admin");
  }

  // 2. Strictly prohibit anyone who is NOT an admin or staff
  const userRole = (session.user as any)?.role;
  if (userRole !== "admin" && userRole !== "staff") {
    redirect("/campaigns");
  }

  return <>{children}</>;
}
