"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
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
  Filter,
  Users,
  Telescope,
  UserPlus,
  RefreshCw,
  X,
  Check,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Zap,
  Globe,
  Crown,
  Compass,
  SlidersHorizontal,
  Flame
} from "lucide-react";

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

export default function TeamsPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Data State
  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<CampaignEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEventId, setSelectedEventId] = useState<string>("ALL");
  const [recruitmentFilter, setRecruitmentFilter] = useState<string>("ALL"); // ALL, RECRUITING, CLOSED
  const [statusFilter, setStatusFilter] = useState<string>("ALL"); // ALL, FORMING, READY, FULL

  // Join Request Modal State
  const [requestTeam, setRequestTeam] = useState<Team | null>(null);
  const [requestMsg, setRequestMsg] = useState<string>("");
  const [requestLoading, setRequestLoading] = useState<boolean>(false);
  const [requestFeedback, setRequestFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Join by Invite Code
  const [joinCodeInput, setJoinCodeInput] = useState<string>("");
  const [joinCodeLoading, setJoinCodeLoading] = useState<boolean>(false);
  const [joinCodeError, setJoinCodeError] = useState<string | null>(null);

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

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTeams();
  };

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
    setRequestFeedback(null);

    try {
      const res = await fetch(`/api/teams/${requestTeam.id}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: requestMsg.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setRequestFeedback({
          type: "success",
          text: "Join request submitted successfully! The squad leader will review your application.",
        });
        setTimeout(() => {
          setRequestTeam(null);
          setRequestFeedback(null);
          fetchTeams();
        }, 2000);
      } else {
        setRequestFeedback({
          type: "error",
          text: data.error || "Failed to send join request.",
        });
      }
    } catch (err: any) {
      setRequestFeedback({
        type: "error",
        text: err.message || "An unexpected error occurred.",
      });
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
    setJoinCodeError(null);

    try {
      const code = joinCodeInput.trim().toUpperCase();
      router.push(`/join/${code}`);
    } catch (err: any) {
      setJoinCodeError(err.message || "Invalid invite code.");
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
      
      {/* 1. CYBER COMMAND HERO BANNER */}
      <Card className="relative overflow-hidden border-l-4 border-l-[#8b5cf6] bg-gradient-to-r from-[#8b5cf6]/10 via-background to-[#10b981]/10 p-6 sm:p-7 shadow-sm">
        {/* Subtle Background Glow Spheres */}
        <div className="absolute -top-12 -right-12 size-40 bg-[#8b5cf6]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 size-40 bg-[#10b981]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            {/* Top Slanted Badge & Category */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-4 bg-[#8b5cf6] rounded-xs transform -skew-x-12" />
                <div className="w-2 h-4 bg-[#10b981] rounded-xs transform -skew-x-12" />
                <div className="w-2 h-4 bg-[#38bdf8] rounded-xs transform -skew-x-12" />
              </div>
              <span className="text-[11px] font-tech font-bold uppercase tracking-widest text-[#8b5cf6]">
                IASC ASTEROID SEARCH PLATFORM
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-foreground">
              Teams Tactical Directory
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Discover and enlist in active asteroid analysis squads across global IASC research campaigns. Filter by campaign or status, find open teams, or enter an invite code to join directly.
            </p>

            {/* Live Command Center Stats */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-background/80 border border-border px-3 py-1 rounded-full font-tech font-bold shadow-xs">
                <Users className="size-3.5 text-[#8b5cf6]" />
                <span className="text-foreground">{teams.length} Squads Enrolled</span>
              </div>

              <div className="flex items-center gap-1.5 bg-background/80 border border-border px-3 py-1 rounded-full font-tech font-bold shadow-xs">
                <Zap className="size-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">{recruitingCount} Open for Enlistment</span>
              </div>

              <div className="flex items-center gap-1.5 bg-background/80 border border-border px-3 py-1 rounded-full font-tech font-bold shadow-xs">
                <Globe className="size-3.5 text-sky-500" />
                <span className="text-foreground">{totalScientists} Scientists Participating</span>
              </div>
            </div>
          </div>

          {/* Join With Invite Code Control Box */}
          <form
            onSubmit={handleJoinByCode}
            className="w-full lg:w-auto flex flex-col gap-2.5 bg-card/90 backdrop-blur-md p-4 rounded-xl border border-border shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-heading font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-amber-500" />
                <span>Enlist With Invite Code</span>
              </span>
              <span className="text-[10px] font-tech text-muted-foreground uppercase">DIRECT JOIN</span>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="AST-XXXX"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                className="w-36 uppercase text-xs h-9 font-tech font-bold tracking-wider"
              />
              <Button
                type="submit"
                disabled={joinCodeLoading || !joinCodeInput.trim()}
                size="sm"
                variant="default"
                className="h-9 px-4 text-xs font-bold gap-1 cursor-pointer bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-xs"
              >
                {joinCodeLoading ? "..." : "Join Squad"}
              </Button>
            </div>
            {joinCodeError && <span className="text-xs text-destructive font-medium">{joinCodeError}</span>}
          </form>
        </div>
      </Card>

      {/* 2. HIGH-TECH CONTROL MATRIX PANEL (SEARCH & FILTERS) */}
      <Card className="p-4 sm:p-5 space-y-4 border border-border shadow-xs bg-card/90 backdrop-blur-md relative overflow-hidden">
        {/* Top Slanted Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#8b5cf6] via-[#10b981] to-[#38bdf8]" />

        {/* Matrix Header & Interactive Quick-Filter Chips Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-primary" />
            <h2 className="font-heading font-bold text-xs uppercase tracking-wider text-primary">
              Tactical Filter Matrix
            </h2>
          </div>

          {/* Quick-Filter Preset Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setRecruitmentFilter("ALL");
                setStatusFilter("ALL");
              }}
              className={`text-[11px] font-sans font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${
                recruitmentFilter === "ALL" && statusFilter === "ALL"
                  ? "bg-primary text-primary-foreground shadow-xs scale-[1.02]"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              All Squads
            </button>

            <button
              type="button"
              onClick={() => {
                setRecruitmentFilter("RECRUITING");
                setStatusFilter("ALL");
              }}
              className={`text-[11px] font-sans font-bold px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                recruitmentFilter === "RECRUITING"
                  ? "bg-emerald-600 text-white shadow-xs scale-[1.02]"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
              }`}
            >
              <Zap className="size-3" />
              <span>Open Recruitment</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter("FORMING");
                setRecruitmentFilter("ALL");
              }}
              className={`text-[11px] font-sans font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${
                statusFilter === "FORMING"
                  ? "bg-amber-600 text-white shadow-xs scale-[1.02]"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
              }`}
            >
              Forming (&lt; 2)
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter("READY");
                setRecruitmentFilter("ALL");
              }}
              className={`text-[11px] font-sans font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${
                statusFilter === "READY"
                  ? "bg-[#38bdf8] text-slate-950 font-bold shadow-xs scale-[1.02]"
                  : "bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20"
              }`}
            >
              Ready (2-5)
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter("FULL");
                setRecruitmentFilter("ALL");
              }}
              className={`text-[11px] font-sans font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${
                statusFilter === "FULL"
                  ? "bg-muted-foreground text-background font-bold shadow-xs scale-[1.02]"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              Full (6/6)
            </button>
          </div>
        </div>

        {/* Command Form (Inputs & Dropdowns) */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by squad name, scientist, or campaign code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 text-xs h-9 font-sans"
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
              <SelectTrigger className="h-9 text-xs font-sans">
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
          <div className="w-full lg:w-44">
            <Select value={recruitmentFilter} onValueChange={setRecruitmentFilter}>
              <SelectTrigger className="h-9 text-xs font-sans">
                <SelectValue placeholder="Recruitment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Recruitment</SelectItem>
                <SelectItem value="RECRUITING">Recruiting Only</SelectItem>
                <SelectItem value="CLOSED">Recruitment Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Team Status Filter */}
          <div className="w-full lg:w-40">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-xs font-sans">
                <SelectValue placeholder="Team Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="FORMING">Forming (&lt; 2)</SelectItem>
                <SelectItem value="READY">Ready (2-5)</SelectItem>
                <SelectItem value="FULL">Full (6/6)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Action Buttons */}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" variant="default" className="h-9 px-4 text-xs font-bold gap-1.5 cursor-pointer">
              <Search className="size-3.5" />
              <span>Search</span>
            </Button>

            {hasActiveFilters && (
              <Button
                type="button"
                onClick={handleResetFilters}
                size="sm"
                variant="outline"
                className="h-9 px-3 text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                title="Reset all search filters"
              >
                <RefreshCw className="size-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </form>

        {/* Active Filter Matrix Badges & Results Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-2 border-t border-border/50">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-muted-foreground font-medium text-[11px]">
              Found <strong className="text-foreground font-bold">{teams.length}</strong> {teams.length === 1 ? "squad" : "squads"}
            </span>

            {searchQuery.trim() && (
              <Badge variant="secondary" className="gap-1 text-[10px] py-0.5 px-2 font-sans font-semibold border border-primary/20">
                <span>Search: "{searchQuery.trim()}"</span>
                <X className="size-3 cursor-pointer hover:text-foreground" onClick={() => setSearchQuery("")} />
              </Badge>
            )}

            {selectedEventId !== "ALL" && (
              <Badge variant="secondary" className="gap-1 text-[10px] py-0.5 px-2 font-sans font-semibold border border-primary/20">
                <span>Event: {events.find((e) => e.id === selectedEventId)?.code || selectedEventId}</span>
                <X className="size-3 cursor-pointer hover:text-foreground" onClick={() => setSelectedEventId("ALL")} />
              </Badge>
            )}

            {recruitmentFilter !== "ALL" && (
              <Badge variant="secondary" className="gap-1 text-[10px] py-0.5 px-2 font-sans font-semibold border border-primary/20">
                <span>Recruiting: {recruitmentFilter === "RECRUITING" ? "Open" : "Closed"}</span>
                <X className="size-3 cursor-pointer hover:text-foreground" onClick={() => setRecruitmentFilter("ALL")} />
              </Badge>
            )}

            {statusFilter !== "ALL" && (
              <Badge variant="secondary" className="gap-1 text-[10px] py-0.5 px-2 font-sans font-semibold border border-primary/20">
                <span>Status: {statusFilter}</span>
                <X className="size-3 cursor-pointer hover:text-foreground" onClick={() => setStatusFilter("ALL")} />
              </Badge>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-primary hover:underline font-bold cursor-pointer self-end sm:self-auto"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </Card>

      {/* 3. TEAMS GRID (HIGH-TECH CARD ARCHITECTURE) */}
      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground animate-pulse flex flex-col items-center gap-3">
          <RefreshCw className="size-6 animate-spin text-[#8b5cf6]" />
          <span className="font-heading font-bold text-xs uppercase tracking-wider text-primary">
            Querying Tactical Squad Database...
          </span>
        </div>
      ) : teams.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground space-y-3 border-dashed">
          <Compass className="size-12 mx-auto text-muted-foreground/40" />
          <div className="font-heading font-bold text-foreground text-lg">No Matching Squads Found</div>
          <p className="max-w-md mx-auto text-xs leading-relaxed">
            No active squads match your current filter parameters. Try expanding your search query or resetting active filters.
          </p>
          {hasActiveFilters && (
            <Button onClick={handleResetFilters} variant="outline" size="sm" className="mt-2 text-xs font-bold">
              Clear All Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                className="group relative flex flex-col justify-between p-5 transition-all duration-300 hover:border-primary/60 hover:shadow-md hover:scale-[1.01]"
              >
                {/* Top Accent Strip */}
                <div className="absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r from-[#8b5cf6]/40 via-[#10b981]/40 to-transparent group-hover:from-[#8b5cf6] group-hover:via-[#10b981] transition-all" />

                <div className="space-y-3.5">
                  {/* Top Badges & Campaign Code */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-3.5 bg-[#8b5cf6] rounded-xs" />
                      <span className="text-xs font-tech font-bold text-primary uppercase">
                        {team.event?.code || "CAMPAIGN"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-sans font-bold px-2 py-0.5 ${
                          team.status === "FORMING"
                            ? "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                            : team.status === "READY"
                            ? "border-sky-500/40 text-sky-600 dark:text-sky-400 bg-sky-500/10"
                            : "border-muted text-muted-foreground bg-secondary"
                        }`}
                      >
                        {team.status}
                      </Badge>

                      {team.isRecruiting && !isFull ? (
                        <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px]">
                          ⚡ Open
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-[10px]">
                          Closed
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Team Name */}
                  <h3 className="font-heading font-extrabold text-lg text-foreground leading-snug group-hover:text-primary transition-colors">
                    {team.name}
                  </h3>

                  {/* Member Capacity Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-tech">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="font-bold text-foreground">{memberCount}/6 Scientists</span>
                    </div>
                    <Progress value={capacityPercent} className="h-1.5 bg-secondary" />
                  </div>

                  {/* Pitch / Notes */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 min-h-[36px]">
                    {team.recruitmentNotes || "Active asteroid search squad analyzing FITS telescope image sets."}
                  </p>

                  {/* Members Pill List */}
                  <div className="pt-2 border-t border-border/50 space-y-2">
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
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-secondary/80 text-secondary-foreground font-sans font-semibold"
                        >
                          <span>{m.user.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="pt-4 mt-4 border-t border-border/50">
                  {isUserMember ? (
                    <Link href={`/team/${team.id}`}>
                      <Button variant="default" size="sm" className="w-full text-xs font-bold gap-1.5 cursor-pointer bg-[#8b5cf6] hover:bg-[#7c3aed] text-white">
                        <span>Go to Workspace</span>
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
                        setRequestFeedback(null);
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-bold gap-1.5 text-primary border-primary/40 hover:bg-primary/10 cursor-pointer"
                    >
                      <UserPlus className="size-3.5 text-emerald-500" />
                      <span>Request to Join</span>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled className="w-full text-xs opacity-60">
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold">
              Enlistment Application for {requestTeam?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Send a join application to the squad leader for campaign <strong className="text-foreground">{requestTeam?.event?.code}</strong>.
            </DialogDescription>
          </DialogHeader>

          {requestFeedback ? (
            <div
              className={`p-3 rounded-md text-xs font-medium ${
                requestFeedback.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  : "bg-destructive/10 text-destructive border border-destructive/30"
              }`}
            >
              {requestFeedback.text}
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <label className="text-xs font-semibold text-foreground">
                Pitch / Introduction to Squad Leader (Optional)
              </label>
              <Textarea
                placeholder="Hi! I am active daily and ready to analyze FITS image sets with your squad."
                value={requestMsg}
                onChange={(e) => setRequestMsg(e.target.value)}
                rows={3}
                className="text-xs font-sans"
              />
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setRequestTeam(null)} disabled={requestLoading}>
              Cancel
            </Button>
            {!requestFeedback && (
              <Button size="sm" onClick={handleSendJoinRequest} disabled={requestLoading} variant="default" className="bg-[#8b5cf6] text-white">
                {requestLoading ? "Sending..." : "Submit Enlistment"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
