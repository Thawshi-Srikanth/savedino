"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institution, setInstitution] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await authClient.signUp.email({
        email: email.trim(),
        password,
        name: name.trim(),
        // @ts-ignore
        institution: institution.trim(),
        country: country.trim(),
      });

      if (res.error) {
        setErrorMsg(res.error.message || "Failed to create account.");
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
    <div className="w-full max-w-md mx-auto py-8">
      <Card className="p-6">
        <CardHeader className="p-0 border-none mb-4">
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Create an account to participate in campaigns and form teams.</CardDescription>
        </CardHeader>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-md border border-destructive/50 bg-destructive/10 text-destructive text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">Full Name</label>
            <Input
              type="text"
              required
              placeholder="e.g. Ada Lovelace"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Email Address</label>
            <Input
              type="email"
              required
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">School / Institution</label>
            <Input
              type="text"
              placeholder="e.g. Science Academy"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Country</label>
            <Input
              type="text"
              placeholder="e.g. United States"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Password</label>
            <Input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" variant="default" className="w-full mt-2" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          <div className="pt-4 text-center border-t border-border text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
