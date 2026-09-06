"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function JoinTeamPage({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}) {
  const { inviteCode } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!session) {
      router.push(`/login?redirectTo=/join/${inviteCode}`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.error || "Failed to join team.");
      } else {
        toast.success("Successfully joined the team!");
        router.push(`/team/${data.teamId}`);
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground select-none">
      <Link
        href="/teams"
        className="flex items-center gap-1.5 mb-6 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        <span>Back to Teams Directory</span>
      </Link>

      <Card className="w-full max-w-md bg-[#8b5cf6] text-white border border-[#7c3aed] shadow-[0_6px_0_0_#6d28d9] dark:shadow-[0_6px_0_0_#5b21b6] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="size-11 rounded-full bg-white/15 text-white flex items-center justify-center mx-auto mb-1">
            <Sparkles className="size-5 text-amber-300" />
          </div>
          <h1 className="text-2xl font-sans font-bold tracking-tight text-white">
            Join Team
          </h1>
          <p className="text-xs text-white/85 leading-relaxed">
            You were invited to join an asteroid research team.
          </p>
        </div>

        <div className="p-4 bg-slate-950/30 border border-white/15 rounded-xl text-center space-y-1">
          <span className="block text-[10px] font-mono text-white/70 uppercase tracking-wider font-semibold">
            Invitation Code
          </span>
          <span className="text-xl font-mono font-bold tracking-widest text-white">
            {inviteCode.toUpperCase()}
          </span>
        </div>

        <Button
          onClick={handleJoin}
          disabled={loading}
          className="w-full h-11 font-sans text-xs uppercase tracking-wider font-bold gap-2 cursor-pointer bg-slate-950 text-white hover:bg-slate-900 border-0 shadow-[0_3px_0_0_#020617] active:translate-y-0.5 transition-transform"
        >
          {loading ? (
            <>
              <RefreshCw className="size-4 animate-spin" />
              <span>Joining Team...</span>
            </>
          ) : (
            <>
              <span>Confirm &amp; Join Team</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </Card>
    </div>
  );
}
