"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/8bit/card";
import { Button } from "@/components/ui/8bit/button";
import { Input } from "@/components/ui/8bit/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (res.error) {
        setErrorMsg(res.error.message || "Failed to sign in. Please check your credentials.");
      } else {
        router.push("/campaigns");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-12">
      <Card className="p-6">
        <CardHeader className="p-0 border-none mb-4">
          <CardTitle>Observatory Cadet Access</CardTitle>
          <CardDescription>Enter your student or admin credentials to log into IASC Platform.</CardDescription>
        </CardHeader>

        {errorMsg && (
          <div className="mb-4 p-2.5 border border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 text-xs font-mono">
            ! {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-pixel uppercase mb-1">Email Address</label>
            <Input
              type="email"
              required
              placeholder="cadet@observatory.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-pixel uppercase mb-1">Password</label>
            <Input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
            {loading ? "AUTHENTICATING..." : "SIGN IN >"}
          </Button>

          <div className="pt-4 text-center border-t border-[#535353]/20 dark:border-[#80868b]/20 text-xs font-mono">
            New Cadet?{" "}
            <Link href="/register" className="text-[#0284c7] dark:text-[#38bdf8] hover:underline font-bold">
              Register Student Account
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
