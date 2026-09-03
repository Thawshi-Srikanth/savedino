"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function JoinTeamPage({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}) {
  const { inviteCode } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!session) {
      router.push(`/login?redirect=/join/${inviteCode}`);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.error || "Failed to join team.");
      } else {
        router.push(`/team/${data.teamId}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 bg-[#f4f4f4] dark:bg-[#202124] text-[#535353] dark:text-[#e8eaed] transition-colors duration-700 select-none">
      <Link
        href="/campaigns"
        className="flex items-center gap-2 mb-6 text-xs font-pixel uppercase tracking-widest hover:underline opacity-80"
      >
        &lt; Back to Campaigns Hub
      </Link>

      <div className="w-full max-w-md bg-white dark:bg-[#2b2c2f] border-2 border-[#535353] dark:border-[#80868b] shadow-[6px_6px_0px_#000] p-6 sm:p-8">
        <div className="border-b border-[#535353]/30 dark:border-[#80868b]/30 pb-3 mb-5">
          <span className="text-[10px] font-mono text-[#0284c7] dark:text-[#38bdf8] uppercase tracking-widest font-bold">
            TEAM INVITATION
          </span>
          <h1 className="text-base font-pixel font-bold uppercase mt-1">
            Join Campaign Squad
          </h1>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-[#202124] border border-[#535353]/40 dark:border-[#80868b]/40 mb-6 text-center">
          <span className="block text-[10px] font-pixel text-gray-400 uppercase">
            INVITATION CODE
          </span>
          <span className="text-lg font-pixel font-bold tracking-wider text-[#0284c7] dark:text-[#38bdf8]">
            {inviteCode.toUpperCase()}
          </span>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 border border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 text-xs font-mono">
            ! {errorMsg}
          </div>
        )}

        <button
          onClick={handleJoin}
          disabled={loading}
          className="w-full py-3 px-4 border-2 border-[#535353] dark:border-[#80868b] bg-[#535353] text-white dark:bg-[#38bdf8] dark:text-[#202124] text-xs font-pixel uppercase tracking-widest shadow-[3px_3px_0px_#000] active:translate-y-0.5 cursor-pointer disabled:opacity-50"
        >
          {loading ? "ENROLLING..." : "CONFIRM & JOIN TEAM >"}
        </button>
      </div>
    </div>
  );
}
