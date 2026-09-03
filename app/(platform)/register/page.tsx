"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/8bit/card";
import { Button } from "@/components/ui/8bit/button";
import { Input } from "@/components/ui/8bit/input";

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
          <CardTitle>Register Student Cadet</CardTitle>
          <CardDescription>Create your student account to join IASC campaigns and form 8-bit squads.</CardDescription>
        </CardHeader>

        {errorMsg && (
          <div className="mb-4 p-2.5 border border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 text-xs font-mono">
            ! {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-pixel uppercase mb-1">Full Name</label>
            <Input
              type="text"
              required
              placeholder="e.g. Ada Lovelace"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-pixel uppercase mb-1">Email Address</label>
            <Input
              type="email"
              required
              placeholder="student@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-pixel uppercase mb-1">School / Institution</label>
            <Input
              type="text"
              placeholder="e.g. Haleakala High School"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-pixel uppercase mb-1">Country</label>
            <Input
              type="text"
              placeholder="e.g. United States"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
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
            {loading ? "CREATING CADET..." : "CREATE ACCOUNT >"}
          </Button>

          <div className="pt-4 text-center border-t border-[#535353]/20 dark:border-[#80868b]/20 text-xs font-mono">
            Already registered?{" "}
            <Link href="/login" className="text-[#0284c7] dark:text-[#38bdf8] hover:underline font-bold">
              Sign In Here
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
