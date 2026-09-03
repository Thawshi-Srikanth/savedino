"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/8bit/card";
import { Button } from "@/components/ui/8bit/button";
import { Badge } from "@/components/ui/8bit/badge";
import { Input, Textarea } from "@/components/ui/8bit/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/8bit/dialog";

interface EventItem {
  id: string;
  title: string;
  code: string;
  description: string;
  regStart: string;
  regEnd: string;
  teamFormationStart: string;
  teamFormationEnd: string;
  startDate: string;
  endDate: string;
  submissionStart: string;
  submissionEnd: string;
  status: string;
  _count?: {
    teams: number;
  };
}

interface RecruitingTeam {
  id: string;
  name: string;
  inviteCode: string;
  status: string;
  isRecruiting: boolean;
  recruitmentNotes?: string;
  event: {
    title: string;
    code: string;
  };
  members: Array<{
    user: {
      id: string;
      name: string;
      country?: string;
    };
  }>;
  _count?: {
    members: number;
    joinRequests: number;
  };
}

export default function CampaignsPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [recruitingTeams, setRecruitingTeams] = useState<RecruitingTeam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Join by code state
  const [joinCode, setJoinCode] = useState<string>("");
  const [joinLoading, setJoinLoading] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Create Team modal state
  const [selectedEventForTeam, setSelectedEventForTeam] = useState<EventItem | null>(null);
  const [teamName, setTeamName] = useState<string>("");
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Join Request Modal state
  const [requestTeam, setRequestTeam] = useState<RecruitingTeam | null>(null);
  const [requestMsg, setRequestMsg] = useState<string>("");
  const [requestLoading, setRequestLoading] = useState<boolean>(false);
  const [requestFeedback, setRequestFeedback] = useState<string | null>(null);

  const fetchCampaignData = async () => {
    try {
      // Fetch events
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
      }

      // Fetch recruiting teams
      const recRes = await fetch("/api/teams/recruiting");
      const recData = await recRes.json();
      if (recData.success) {
        setRecruitingTeams(recData.teams || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignData();
  }, []);

  const handleJoinTeamByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push("/login");
      return;
    }

    setJoinLoading(true);
    setJoinError(null);

    try {
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: joinCode.trim() }),
      });
      const data = await res.json();

      if (!data.success) {
        setJoinError(data.error || "Failed to join team.");
      } else {
        router.push(`/team/${data.teamId}`);
      }
    } catch (err: any) {
      setJoinError(err.message || "An unexpected error occurred.");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForTeam || !session) {
      router.push("/login");
      return;
    }

    setCreateLoading(true);
    setCreateError(null);

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventForTeam.id,
          name: teamName.trim(),
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setCreateError(data.error || "Failed to create team.");
      } else {
        router.push(`/team/${data.team.id}`);
      }
    } catch (err: any) {
      setCreateError(err.message || "An unexpected error occurred.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSendJoinRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTeam || !session) {
      router.push("/login");
      return;
    }

    setRequestLoading(true);
    setRequestFeedback(null);

    try {
      const res = await fetch(`/api/teams/${requestTeam.id}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: requestMsg }),
      });
      const data = await res.json();

      if (!data.success) {
        setRequestFeedback(`! ${data.error}`);
      } else {
        setRequestFeedback("✓ Join request submitted to squad leader!");
        setTimeout(() => {
          setRequestTeam(null);
          setRequestMsg("");
          setRequestFeedback(null);
        }, 1500);
      }
    } catch (err: any) {
      setRequestFeedback(`! ${err.message}`);
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Campaign Banner Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="primary">IASC OBSERVATION PORTAL</Badge>
              <Badge variant="outline">2026 CAMPAIGNS</Badge>
            </div>
            <h1 className="text-base sm:text-lg font-pixel font-bold tracking-wide uppercase">
              Asteroid Searching Campaigns
            </h1>
            <p className="text-xs font-mono text-[#535353] dark:text-[#9aa0a6] mt-2 max-w-xl leading-relaxed">
              Official International Astronomical Search Collaboration platform. Form a squad of 2 to 6 members or request to join an active recruiting squad!
            </p>
          </div>

          {/* Quick Join With Code Form */}
          <form onSubmit={handleJoinTeamByCode} className="w-full md:w-auto flex flex-col gap-2">
            <span className="text-[10px] font-pixel uppercase tracking-wider text-[#70757a] dark:text-[#9aa0a6]">
              Have an invite code?
            </span>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="AST-XXXX"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-32 py-1.5 text-xs font-pixel uppercase"
              />
              <Button
                type="submit"
                disabled={joinLoading || !joinCode}
                size="sm"
                variant="default"
              >
                {joinLoading ? "..." : "JOIN"}
              </Button>
            </div>
            {joinError && <span className="text-[10px] font-mono text-red-500">! {joinError}</span>}
          </form>
        </div>
      </Card>

      {/* SECTION 1: RECRUITING SQUADS BOARD */}
      <div className="pt-2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#0284c7] dark:text-[#38bdf8] font-bold uppercase tracking-widest">
              SQUAD MATCHMAKING
            </span>
            <h2 className="text-sm sm:text-base font-pixel font-bold tracking-wide uppercase mt-0.5">
              Recruiting Squads Seeking Cadets ({recruitingTeams.length})
            </h2>
          </div>
          <Badge variant="amber">OPEN FOR REQUESTS</Badge>
        </div>

        {recruitingTeams.length === 0 ? (
          <Card className="p-6 text-center font-mono text-xs text-gray-500">
            No squads currently recruiting. Create your own team below!
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recruitingTeams.map((team) => (
              <Card key={team.id} className="p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-pixel mb-1.5">
                    <span className="text-[#0284c7] dark:text-[#38bdf8]">{team.event.code}</span>
                    <Badge variant={team.members.length < 2 ? "amber" : "emerald"}>
                      {team.members.length}/6 MEMBERS
                    </Badge>
                  </div>

                  <h3 className="font-bold text-sm font-pixel uppercase mb-1">{team.name}</h3>
                  <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400 mb-3">
                    {team.recruitmentNotes || "Seeking active cadets to analyze FITS image sets."}
                  </div>

                  <div className="text-[10px] font-mono mb-4 text-gray-400">
                    Cadets: {team.members.map((m) => m.user.name).join(", ")}
                  </div>
                </div>

                <Button
                  onClick={() => {
                    if (!session) {
                      router.push("/login");
                      return;
                    }
                    setRequestTeam(team);
                    setRequestMsg("");
                    setRequestFeedback(null);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  ✉ Request to Join Squad &gt;
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: ACTIVE CAMPAIGNS */}
      <div className="pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-pixel font-bold tracking-wide uppercase">
            Active &amp; Upcoming Campaigns
          </h2>
          <Badge variant="outline">RULE: 1 Event Per Cadet</Badge>
        </div>

        {loading ? (
          <div className="py-12 text-center font-pixel text-xs animate-pulse">
            LOADING CAMPAIGN MANIFESTS...
          </div>
        ) : events.length === 0 ? (
          <Card className="p-8 text-center font-mono text-xs text-gray-500">
            No active campaigns found. Check back soon.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((ev) => (
              <Card key={ev.id} className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-pixel text-[#0284c7] dark:text-[#38bdf8] uppercase">
                      {ev.code}
                    </span>
                    <Badge variant={ev.status === "ACTIVE" ? "emerald" : "outline"}>
                      {ev.status}
                    </Badge>
                  </div>

                  <CardTitle>{ev.title}</CardTitle>
                  <CardDescription>
                    {ev.description || "International Asteroid Search Collaboration campaign for student teams."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* 4-Phase Schedule Box */}
                  <div className="text-[10px] font-mono space-y-1.5 p-3 border-2 border-[#535353]/20 dark:border-[#80868b]/20 bg-gray-50 dark:bg-[#202124]">
                    <div className="flex justify-between border-b border-dashed border-gray-300 dark:border-gray-700 pb-1">
                      <span className="text-gray-400">1. User Reg:</span>
                      <span>{ev.regStart ? new Date(ev.regStart).toLocaleDateString() : new Date(ev.startDate).toLocaleDateString()} – {ev.regEnd ? new Date(ev.regEnd).toLocaleDateString() : new Date(ev.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-gray-300 dark:border-gray-700 pb-1">
                      <span className="text-gray-400">2. Team Formation:</span>
                      <span>{ev.teamFormationStart ? new Date(ev.teamFormationStart).toLocaleDateString() : new Date(ev.startDate).toLocaleDateString()} – {ev.teamFormationEnd ? new Date(ev.teamFormationEnd).toLocaleDateString() : new Date(ev.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-gray-300 dark:border-gray-700 pb-1">
                      <span className="text-[#0284c7] dark:text-[#38bdf8] font-bold">3. Campaign Search:</span>
                      <span className="font-bold text-[#0284c7] dark:text-[#38bdf8]">{new Date(ev.startDate).toLocaleDateString()} – {new Date(ev.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-gray-400">4. Report Submission:</span>
                      <span>{ev.submissionStart ? new Date(ev.submissionStart).toLocaleDateString() : new Date(ev.startDate).toLocaleDateString()} – {ev.submissionEnd ? new Date(ev.submissionEnd).toLocaleDateString() : new Date(ev.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span>SQUADS: <strong>{ev._count?.teams || 0} ACTIVE</strong></span>
                    <span>LIMIT: <strong>2 TO 6 MEMBERS</strong></span>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => {
                      if (!session) {
                        router.push("/login");
                        return;
                      }
                      setSelectedEventForTeam(ev);
                      setCreateError(null);
                    }}
                    variant="primary"
                    className="w-full"
                  >
                    + Form New Team for Event
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Request to Join Modal */}
      <Dialog open={!!requestTeam} onOpenChange={(open) => !open && setRequestTeam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request to Join Squad</DialogTitle>
            <DialogDescription>
              Sending request to: <strong>{requestTeam?.name}</strong> ({requestTeam?.event.code})
            </DialogDescription>
          </DialogHeader>

          {requestFeedback && (
            <div className="p-2.5 border-2 border-[#535353] dark:border-[#80868b] bg-gray-50 dark:bg-[#202124] text-xs font-mono mb-3">
              {requestFeedback}
            </div>
          )}

          <form onSubmit={handleSendJoinRequest} className="space-y-4">
            <div>
              <label className="block text-[11px] font-pixel uppercase mb-1">
                Cadet Message / Intro Pitch (Optional)
              </label>
              <Textarea
                rows={3}
                placeholder="e.g. Hi! I am a student at Haleakala High with Astrometrica experience looking to analyze image sets."
                value={requestMsg}
                onChange={(e) => setRequestMsg(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setRequestTeam(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={requestLoading}>
                {requestLoading ? "SENDING..." : "SUBMIT JOIN REQUEST >"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Team Modal */}
      <Dialog open={!!selectedEventForTeam} onOpenChange={(open) => !open && setSelectedEventForTeam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Form Team for Event</DialogTitle>
            <DialogDescription>
              Event: <strong>{selectedEventForTeam?.title}</strong> ({selectedEventForTeam?.code})
            </DialogDescription>
          </DialogHeader>

          {createError && (
            <div className="p-2 border border-red-500 bg-red-50 text-red-700 text-xs font-mono mb-3">
              ! {createError}
            </div>
          )}

          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div>
              <label className="block text-[11px] font-pixel uppercase mb-1">Team Name</label>
              <Input
                type="text"
                required
                placeholder="e.g. Haleakala Astro Cadets"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>

            <div className="text-[10px] font-mono text-gray-500 dark:text-gray-400 p-3 border border-dashed border-[#535353]/40 dark:border-[#80868b]/40 space-y-1">
              <div>• You will be designated as Team Leader.</div>
              <div>• An 8-bit invite code will be generated to invite teammates.</div>
              <div>• Minimum 2 members required (max 6).</div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setSelectedEventForTeam(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={createLoading || !teamName}>
                {createLoading ? "CREATING..." : "CREATE TEAM >"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
