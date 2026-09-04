"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Users,
  UserPlus,
  RefreshCw,
  X,
  ArrowRight,
  Sparkles,
  Globe,
  Crown,
  Compass,
  SlidersHorizontal,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    institution?: string | null;
    country?: string | null;
  };
}

interface TeamEvent {
  id: string;
  title: string;
  code: string;
  status: string;
}

interface Team {
  id: string;
  name: string;
  inviteCode: string;
  status: "FORMING" | "READY" | "FULL";
  isRecruiting: boolean;
  recruitmentNotes?: string | null;
  createdAt: string;
  event: TeamEvent;
  members: TeamMember[];
  _count?: {
    members: number;
    joinRequests: number;
  };
}

interface CampaignEvent {
  id: string;
  title: string;
  code: string;
  status: string;
}

function TeamsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlEventId = searchParams.get("eventId") || searchParams.get("event");
  const { data: session } = useSession();

  // Data State
  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<CampaignEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEventId, setSelectedEventId] = useState<string>(urlEventId || "ALL");
  const [recruitmentFilter, setRecruitmentFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    if (urlEventId) {
      setSelectedEventId(urlEventId);
    }
  }, [urlEventId]);

  // Join Request Modal State
  const [requestTeam, setRequestTeam] = useState<Team | null>(null);
  const [requestMsg, setRequestMsg] = useState<string>("");
  const [requestLoading, setRequestLoading] = useState<boolean>(false);

  // Join by Invite Code
  const [joinCodeInput, setJoinCodeInput] = useState<string>("");
  const [joinCodeLoading, setJoinCodeLoading] = useState<boolean>(false);

  // Fetch campaign events for filter dropdown
  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error("Failed to load campaign events:", err);
    }
  }, []);

  // Fetch teams with search and filters
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (selectedEventId !== "ALL") params.set("eventId", selectedEventId);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (recruitmentFilter === "RECRUITING") params.set("isRecruiting", "true");
      if (recruitmentFilter === "CLOSED") params.set("isRecruiting", "false");

      const res = await fetch(`/api/teams?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTeams(data.teams || []);
      }
    } catch (err) {
      console.error("Failed to fetch teams:", err);
      toast.error("Failed to load teams. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedEventId, recruitmentFilter, statusFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Derived Stats
  const recruitingCount = useMemo(() => {
    return teams.filter((t) => t.isRecruiting && (t.members?.length || 0) < 6).length;
  }, [teams]);

  const totalScientists = useMemo(() => {
    return teams.reduce((acc, t) => acc + (t.members?.length || 0), 0);
  }, [teams]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedEventId("ALL");
    setRecruitmentFilter("ALL");
    setStatusFilter("ALL");
  };

  // Submit Join Request
  const handleSendJoinRequest = async () => {
    if (!requestTeam || !session) return;
    setRequestLoading(true);

    try {
      const res = await fetch(`/api/teams/${requestTeam.id}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: requestMsg.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Join request sent! The team leader will review your request.");
        setRequestTeam(null);
        setRequestMsg("");
        fetchTeams();
      } else {
        toast.error(data.error || "Failed to send join request.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setRequestLoading(false);
    }
  };

  // Join via direct Invite Code
  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    if (!session) {
      router.push("/login");
      return;
    }

    setJoinCodeLoading(true);

    try {
      const code = joinCodeInput.trim().toUpperCase();
      router.push(`/join/${code}`);
    } catch (err: any) {
      toast.error(err.message || "Invalid invite code.");
      setJoinCodeLoading(false);
    }
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedEventId !== "ALL" ||
    recruitmentFilter !== "ALL" ||
    statusFilter !== "ALL";

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* 1. TOP HEADER & METRIC STATS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Header Info Card */}
        <Card className="lg:col-span-2 p-5 sm:p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-muted-foreground">// teams directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-foreground">
              Teams &amp; Research Squads
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
              Join active asteroid analysis teams across global research campaigns or use an invite code to join directly.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 mt-4 border-t border-border/60">
            <div>
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">Total Teams</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-foreground">{teams.length}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">Open for Join</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-[#10b981]">{recruitingCount}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">Active Members</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-foreground">{totalScientists}</span>
            </div>
          </div>
        </Card>

        {/* Join With Invite Code Box - Purple Theme Card with 3D Bottom Shadow */}
        <Card className="p-5 sm:p-6 bg-[#8b5cf6] text-white border-[#7c3aed] shadow-[0_4px_0_0_#6d28d9] dark:shadow-[0_4px_0_0_#5b21b6] flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Sparkles className="size-3.5 text-amber-300" />
              <span>Join with Invite Code</span>
            </div>
            <p className="text-xs text-white/85 leading-relaxed">
              Have an invite code from a squad leader? Enter it here to join directly.
            </p>
          </div>

          <form onSubmit={handleJoinByCode} className="space-y-2.5">
            <Input
              type="text"
              placeholder="AST-XXXX"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              className="w-full uppercase text-xs h-9 font-mono font-bold tracking-wider bg-white text-slate-950 placeholder:text-slate-400 border-none shadow-inner"
            />
            <Button
              type="submit"
              disabled={joinCodeLoading || !joinCodeInput.trim()}
              size="sm"
              className="w-full h-9 text-xs font-bold gap-1.5 cursor-pointer bg-[#facc15] text-slate-950 hover:bg-[#eab308] shadow-[0_3px_0_0_#ca8a04] active:translate-y-0.5 transition-transform uppercase tracking-wider"
            >
              {joinCodeLoading ? "Joining..." : "Join Team"}
              <ArrowRight className="size-3.5" />
            </Button>
          </form>
        </Card>
      </div>

      {/* 2. FILTER & CONTROLS TOOLBAR */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by team name, member name, or campaign..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 text-xs h-9 font-sans bg-background"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Campaign Select Filter */}
          <div className="w-full lg:w-48">
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="h-9 text-xs font-sans bg-background">
                <SelectValue placeholder="All Campaigns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Campaigns</SelectItem>
                {events.map((ev) => (
                  <SelectItem key={ev.id} value={ev.id}>
                    {ev.code} ({ev.title})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recruitment Status Filter */}
          <div className="w-full lg:w-40">
            <Select value={recruitmentFilter} onValueChange={setRecruitmentFilter}>
              <SelectTrigger className="h-9 text-xs font-sans bg-background">
                <SelectValue placeholder="Recruitment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="RECRUITING">Open to Join</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Team Capacity Filter */}
          <div className="w-full lg:w-36">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-xs font-sans bg-background">
                <SelectValue placeholder="Capacity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Capacity</SelectItem>
                <SelectItem value="FORMING">Forming (&lt; 2)</SelectItem>
                <SelectItem value="READY">Ready (2-5)</SelectItem>
                <SelectItem value="FULL">Full (6/6)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              type="button"
              onClick={handleResetFilters}
              size="sm"
              variant="outline"
              className="h-9 px-3 text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
            >
              <RefreshCw className="size-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>

        {/* Results summary / active filters */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-border text-muted-foreground">
            <span>
              Showing <strong className="text-foreground">{teams.length}</strong> matching {teams.length === 1 ? "team" : "teams"}
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-primary hover:underline font-semibold cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
      </Card>

      {/* 3. TEAMS RESPONSIVE GRID */}
      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
          <RefreshCw className="size-6 animate-spin text-primary" />
          <span className="font-sans text-xs text-muted-foreground">
            Loading teams...
          </span>
        </div>
      ) : teams.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground space-y-3 border-dashed">
          <Compass className="size-10 mx-auto text-muted-foreground/50" />
          <div className="font-sans font-bold text-foreground text-base">No Matching Teams Found</div>
          <p className="max-w-md mx-auto text-xs leading-relaxed">
            No teams match your active search or filter criteria. Try adjusting your query.
          </p>
          {hasActiveFilters && (
            <Button onClick={handleResetFilters} variant="outline" size="sm" className="mt-2 text-xs">
              Clear All Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => {
            const memberCount = team.members?.length || 0;
            const isFull = memberCount >= 6;
            const capacityPercent = Math.min(100, Math.round((memberCount / 6) * 100));

            const isUserMember = session?.user?.id
              ? team.members?.some((m) => m.user?.id === session.user.id)
              : false;

            const leaderMember = team.members?.find((m) => m.role === "LEADER") || team.members?.[0];

            return (
              <Card
                key={team.id}
                className="hover:border-primary/50 hover:shadow-[0_6px_0_0_#8b5cf6]/30 hover:-translate-y-0.5 transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar: Campaign Code & Status Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-primary">
                      {team.event?.code || "CAMPAIGN"}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-sans font-medium px-2 py-0.5"
                      >
                        {team.status === "FORMING"
                          ? "Forming"
                          : team.status === "READY"
                          ? "Ready"
                          : "Full"}
                      </Badge>

                      {team.isRecruiting && !isFull ? (
                        <span className="text-[10px] font-sans font-semibold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-full">
                          Open
                        </span>
                      ) : (
                        <span className="text-[10px] font-sans text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          Closed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Team Name */}
                  <h3 className="font-sans font-bold text-base text-foreground leading-snug">
                    {team.name}
                  </h3>

                  {/* Member Capacity Progress */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-muted-foreground">Members</span>
                      <span className="font-bold text-foreground">{memberCount}/6</span>
                    </div>
                    <Progress value={capacityPercent} className="h-1.5" />
                  </div>

                  {/* Recruitment Note */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 min-h-[32px]">
                    {team.recruitmentNotes || "Active asteroid search team analyzing telescope image sets."}
                  </p>

                  {/* Members & Leader Info */}
                  <div className="pt-2 border-t border-border/60 space-y-2">
                    {leaderMember && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Crown className="size-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">
                          Leader: <strong className="text-foreground">{leaderMember.user.name}</strong>
                          {leaderMember.user.country && (
                            <span className="text-muted-foreground font-normal ml-1">({leaderMember.user.country})</span>
                          )}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {team.members.map((m) => (
                        <span
                          key={m.id}
                          className="inline-flex items-center text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-sans"
                        >
                          {m.user.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Bottom Action Button */}
                <div className="pt-3 border-t border-border/60">
                  {isUserMember ? (
                    <Link href={`/team/${team.id}`}>
                      <Button variant="default" size="sm" className="w-full text-xs font-bold gap-1.5 cursor-pointer bg-[#8b5cf6] hover:bg-[#7c3aed] text-white">
                        <span>Open Workspace</span>
                        <ArrowRight className="size-3.5" />
                      </Button>
                    </Link>
                  ) : team.isRecruiting && !isFull ? (
                    <Button
                      onClick={() => {
                        if (!session) {
                          router.push("/login");
                          return;
                        }
                        setRequestTeam(team);
                        setRequestMsg("");
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-bold gap-1.5 text-foreground hover:bg-accent cursor-pointer"
                    >
                      <UserPlus className="size-3.5 text-[#10b981]" />
                      <span>Request to Join</span>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled className="w-full text-xs opacity-50">
                      Recruitment Closed
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 4. JOIN REQUEST DIALOG */}
      <Dialog open={!!requestTeam} onOpenChange={(open) => !open && setRequestTeam(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-sans text-lg font-bold">
              Join Request for {requestTeam?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Send a request to the team leader for campaign <strong className="text-foreground">{requestTeam?.event?.code}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="text-xs font-semibold text-foreground">
              Message to Team Leader (Optional)
            </label>
            <Textarea
              placeholder="Hi! I am active daily and ready to analyze image sets with your team."
              value={requestMsg}
              onChange={(e) => setRequestMsg(e.target.value)}
              rows={3}
              className="text-xs font-sans bg-background"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setRequestTeam(null)} disabled={requestLoading}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSendJoinRequest} disabled={requestLoading} variant="default" className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold">
              {requestLoading ? "Sending..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TeamsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-mono text-muted-foreground">
          Loading teams...
        </div>
      }
    >
      <TeamsContent />
    </Suspense>
  );
}
