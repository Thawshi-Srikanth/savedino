"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

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
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
      }

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
      setJoinError(err.message || "An error occurred.");
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
      setCreateError(err.message || "An error occurred.");
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
        setRequestFeedback(data.error || "Failed to send request.");
      } else {
        setRequestFeedback("Join request sent successfully.");
        setTimeout(() => {
          setRequestTeam(null);
          setRequestMsg("");
          setRequestFeedback(null);
        }, 1500);
      }
    } catch (err: any) {
      setRequestFeedback(err.message || "An error occurred.");
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Overview Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Asteroid Search Campaigns
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">
              International Astronomical Search Collaboration platform. Form a team or join an open team to analyze telescope image sets.
            </p>
          </div>

          {/* Join With Code */}
          <form onSubmit={handleJoinTeamByCode} className="w-full md:w-auto flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Have an invite code?
            </span>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="AST-XXXX"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-32 uppercase text-xs h-9"
              />
              <Button
                type="submit"
                disabled={joinLoading || !joinCode}
                size="sm"
                variant="default"
              >
                {joinLoading ? "..." : "Join"}
              </Button>
            </div>
            {joinError && <span className="text-xs text-destructive">{joinError}</span>}
          </form>
        </div>
      </Card>

      {/* RECRUITING TEAMS */}
      <div className="pt-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight">
            Teams Looking for Members ({recruitingTeams.length})
          </h2>
        </div>

        {recruitingTeams.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            No teams are currently looking for members. You can form your own team below.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recruitingTeams.map((team) => (
              <Card key={team.id} className="p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-primary">{team.event.code}</span>
                    <Badge variant={team.members.length < 2 ? "secondary" : "default"}>
                      {team.members.length}/6 Members
                    </Badge>
                  </div>

                  <h3 className="font-bold text-sm mb-1">{team.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-normal">
                    {team.recruitmentNotes || "Looking for active members to analyze FITS image sets."}
                  </p>

                  <div className="text-xs text-muted-foreground mb-4">
                    Members: {team.members.map((m) => m.user.name).join(", ")}
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
                  Request to Join
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CAMPAIGNS LIST */}
      <div className="pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight">
            Campaigns
          </h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">
            Loading campaigns...
          </div>
        ) : events.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No active campaigns found.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((ev) => (
              <Card key={ev.id} className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-primary uppercase">
                      {ev.code}
                    </span>
                    <Badge variant={ev.status === "ACTIVE" ? "default" : "outline"}>
                      {ev.status}
                    </Badge>
                  </div>

                  <CardTitle>{ev.title}</CardTitle>
                  <CardDescription>
                    {ev.description || "International Asteroid Search Collaboration campaign."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Schedule */}
                  <div className="text-xs space-y-1.5 p-3 rounded-md border border-border bg-accent/40">
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Registration:</span>
                      <span>{ev.regStart ? new Date(ev.regStart).toLocaleDateString() : new Date(ev.startDate).toLocaleDateString()} - {ev.regEnd ? new Date(ev.regEnd).toLocaleDateString() : new Date(ev.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-muted-foreground">Team Formation:</span>
                      <span>{ev.teamFormationStart ? new Date(ev.teamFormationStart).toLocaleDateString() : new Date(ev.startDate).toLocaleDateString()} - {ev.teamFormationEnd ? new Date(ev.teamFormationEnd).toLocaleDateString() : new Date(ev.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1">
                      <span className="text-primary font-semibold">Observation:</span>
                      <span className="font-semibold text-primary">{new Date(ev.startDate).toLocaleDateString()} - {new Date(ev.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-muted-foreground">Report Submission:</span>
                      <span>{ev.submissionStart ? new Date(ev.submissionStart).toLocaleDateString() : new Date(ev.startDate).toLocaleDateString()} - {ev.submissionEnd ? new Date(ev.submissionEnd).toLocaleDateString() : new Date(ev.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Teams: <strong className="text-foreground">{ev._count?.teams || 0} Active</strong></span>
                    <span>Team Limit: <strong className="text-foreground">2 to 6 Members</strong></span>
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
                    variant="default"
                    className="w-full"
                  >
                    Form Team for Event
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
            <DialogTitle>Request to Join Team</DialogTitle>
            <DialogDescription>
              Team: <strong>{requestTeam?.name}</strong> ({requestTeam?.event.code})
            </DialogDescription>
          </DialogHeader>

          {requestFeedback && (
            <div className="p-2.5 rounded-md border border-border bg-accent text-xs mb-3">
              {requestFeedback}
            </div>
          )}

          <form onSubmit={handleSendJoinRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1">
                Note to Team Leader (Optional)
              </label>
              <Textarea
                rows={3}
                placeholder="Introduce yourself or mention any relevant experience..."
                value={requestMsg}
                onChange={(e) => setRequestMsg(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setRequestTeam(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="default" disabled={requestLoading}>
                {requestLoading ? "Sending..." : "Submit Request"}
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
            <div className="p-2.5 rounded-md border border-destructive/50 bg-destructive/10 text-destructive text-xs mb-3">
              {createError}
            </div>
          )}

          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1">Team Name</label>
              <Input
                type="text"
                required
                placeholder="Enter team name..."
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>

            <div className="text-xs text-muted-foreground p-3 rounded-md border border-border bg-accent/30 space-y-1">
              <div>- You will be assigned as Team Leader.</div>
              <div>- An invite code will be created to invite teammates.</div>
              <div>- Teams require a minimum of 2 members (maximum 6).</div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setSelectedEventForTeam(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="default" disabled={createLoading || !teamName}>
                {createLoading ? "Creating..." : "Create Team"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
