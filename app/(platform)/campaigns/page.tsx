"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Telescope,
  PlusCircle,
  UserPlus,
  Calendar,
  Users,
  KeyRound,
  Rocket,
  Search,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

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

// Helper to format registration deadline & days remaining
function getRegistrationDeadlineInfo(regEndStr?: string, startDateStr?: string) {
  const targetStr = regEndStr || startDateStr;
  if (!targetStr) {
    return { text: "TBA", isUrgent: false, isClosed: false, daysLeft: null };
  }

  const targetDate = new Date(targetStr);
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const formattedDate = targetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (daysLeft < 0) {
    return {
      text: `Closed (${formattedDate})`,
      formattedDate,
      isUrgent: false,
      isClosed: true,
      daysLeft: 0,
    };
  }

  if (daysLeft === 0) {
    return {
      text: `Closes Today`,
      formattedDate,
      isUrgent: true,
      isClosed: false,
      daysLeft: 0,
    };
  }

  if (daysLeft === 1) {
    return {
      text: `Closes Tomorrow`,
      formattedDate,
      isUrgent: true,
      isClosed: false,
      daysLeft: 1,
    };
  }

  return {
    text: `${formattedDate} (${daysLeft}d left)`,
    formattedDate,
    isUrgent: daysLeft <= 5,
    isClosed: false,
    daysLeft,
  };
}

export default function CampaignsPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter and Search States
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Active Events Carousel State
  const [activeEventIndex, setActiveEventIndex] = useState<number>(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  // Global & Card Join by Code modal state
  const [joinModalOpen, setJoinModalOpen] = useState<boolean>(false);
  const [selectedEventForJoin, setSelectedEventForJoin] = useState<EventItem | null>(null);
  const [joinCode, setJoinCode] = useState<string>("");
  const [joinLoading, setJoinLoading] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Create Team modal state
  const [selectedEventForTeam, setSelectedEventForTeam] = useState<EventItem | null>(null);
  const [teamName, setTeamName] = useState<string>("");
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchCampaignData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load campaigns.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignData();
  }, []);

  // Filtered list based on status and search query
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesSearch =
        !searchQuery.trim() ||
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.code.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedStatusFilter === "ALL") return true;
      if (selectedStatusFilter === "ACTIVE") return ev.status === "ACTIVE";
      if (selectedStatusFilter === "REGISTRATION") {
        const reg = getRegistrationDeadlineInfo(ev.regEnd, ev.startDate);
        return !reg.isClosed || ev.status === "REGISTRATION";
      }
      if (selectedStatusFilter === "UPCOMING") return ev.status === "UPCOMING";

      return true;
    });
  }, [events, selectedStatusFilter, searchQuery]);

  // Active events for the spotlight carousel
  const activeEvents = useMemo(() => {
    const list = events.filter((e) => e.status === "ACTIVE");
    if (list.length === 0 && events.length > 0) {
      return [events[0]];
    }
    return list;
  }, [events]);

  // Touch Swipe Handlers for Spotlight Carousel
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance && activeEvents.length > 1) {
      handleNextActive();
    }
    if (distance < -minSwipeDistance && activeEvents.length > 1) {
      handlePrevActive();
    }
  };

  const handlePrevActive = () => {
    setActiveEventIndex((prev) => (prev > 0 ? prev - 1 : activeEvents.length - 1));
  };

  const handleNextActive = () => {
    setActiveEventIndex((prev) => (prev < activeEvents.length - 1 ? prev + 1 : 0));
  };

  const handleOpenJoinModal = (event?: EventItem) => {
    if (!session) {
      router.push("/login");
      return;
    }
    setSelectedEventForJoin(event || null);
    setJoinCode("");
    setJoinError(null);
    setJoinModalOpen(true);
  };

  const handleOpenCreateModal = (event: EventItem) => {
    if (!session) {
      router.push("/login");
      return;
    }
    setSelectedEventForTeam(event);
    setTeamName("");
    setCreateError(null);
  };

  const handleJoinTeamByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push("/login");
      return;
    }

    if (!joinCode.trim()) {
      setJoinError("Please enter a valid invite code.");
      return;
    }

    setJoinLoading(true);
    setJoinError(null);

    try {
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: joinCode.trim().toUpperCase() }),
      });
      const data = await res.json();

      if (!data.success) {
        setJoinError(data.error || "Failed to join squad.");
      } else {
        toast.success("Joined squad successfully!");
        setJoinModalOpen(false);
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

    if (!teamName.trim()) {
      setCreateError("Please provide a name for your research squad.");
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
        setCreateError(data.error || "Failed to create squad.");
      } else {
        toast.success("Squad formed successfully!");
        setSelectedEventForTeam(null);
        router.push(`/team/${data.team.id}`);
      }
    } catch (err: any) {
      setCreateError(err.message || "An error occurred.");
    } finally {
      setCreateLoading(false);
    }
  };

  const currentActiveEvent = activeEvents[activeEventIndex] || null;
  const currentActiveRegInfo = currentActiveEvent
    ? getRegistrationDeadlineInfo(currentActiveEvent.regEnd, currentActiveEvent.startDate)
    : null;

  // Status Filter counts
  const countAll = events.length;
  const countActive = events.filter((e) => e.status === "ACTIVE").length;
  const countRegistrationOpen = events.filter((e) => {
    const reg = getRegistrationDeadlineInfo(e.regEnd, e.startDate);
    return !reg.isClosed;
  }).length;
  const countUpcoming = events.filter((e) => e.status === "UPCOMING").length;

  return (
    <div className="w-full space-y-6 font-sans">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Telescope className="size-6 text-primary" />
            <span>Search Campaigns</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Discover Near-Earth Asteroids with survey telescope data.
          </p>
        </div>

        {/* Global Join with Invite Code Button */}
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => handleOpenJoinModal()}
            variant="outline"
            className="h-9 px-3.5 text-xs font-bold gap-2 cursor-pointer border-border hover:bg-muted shrink-0"
          >
            <KeyRound className="size-3.5 text-primary" />
            <span>Join with Code</span>
          </Button>
        </div>
      </div>

      {/* 2. MAIN LAYOUT: SIDEBAR FILTER + CAMPAIGN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* === LEFT COLUMN: SIDEBAR FILTERS (THEMED BUTTONS LIKE ADMIN PANEL) === */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-3 bg-card border-border shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#27282d] space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs bg-background"
              />
            </div>

            {/* Status Themed Navigation Buttons */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1 pb-0.5">
                Filter Campaigns
              </div>

              {/* All Campaigns */}
              <Button
                type="button"
                variant={selectedStatusFilter === "ALL" ? "default" : "outline"}
                onClick={() => setSelectedStatusFilter("ALL")}
                className="w-full justify-between h-9 px-3 text-xs font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Layers className="size-3.5" />
                  <span>All Campaigns</span>
                </div>
                <Badge
                  variant={selectedStatusFilter === "ALL" ? "secondary" : "outline"}
                  className="text-[10px] px-1.5 py-0 font-mono"
                >
                  {countAll}
                </Badge>
              </Button>

              {/* Active Now */}
              <Button
                type="button"
                variant={selectedStatusFilter === "ACTIVE" ? "default" : "outline"}
                onClick={() => setSelectedStatusFilter("ACTIVE")}
                className="w-full justify-between h-9 px-3 text-xs font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-[#10b981] animate-pulse" />
                  <span>Active Now</span>
                </div>
                <Badge
                  variant={selectedStatusFilter === "ACTIVE" ? "secondary" : "outline"}
                  className="text-[10px] px-1.5 py-0 font-mono"
                >
                  {countActive}
                </Badge>
              </Button>

              {/* Registration Open */}
              <Button
                type="button"
                variant={selectedStatusFilter === "REGISTRATION" ? "default" : "outline"}
                onClick={() => setSelectedStatusFilter("REGISTRATION")}
                className="w-full justify-between h-9 px-3 text-xs font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5 text-[#38bdf8]" />
                  <span>Registration Open</span>
                </div>
                <Badge
                  variant={selectedStatusFilter === "REGISTRATION" ? "secondary" : "outline"}
                  className="text-[10px] px-1.5 py-0 font-mono"
                >
                  {countRegistrationOpen}
                </Badge>
              </Button>

              {/* Upcoming */}
              <Button
                type="button"
                variant={selectedStatusFilter === "UPCOMING" ? "default" : "outline"}
                onClick={() => setSelectedStatusFilter("UPCOMING")}
                className="w-full justify-between h-9 px-3 text-xs font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="size-3.5" />
                  <span>Upcoming</span>
                </div>
                <Badge
                  variant={selectedStatusFilter === "UPCOMING" ? "secondary" : "outline"}
                  className="text-[10px] px-1.5 py-0 font-mono"
                >
                  {countUpcoming}
                </Badge>
              </Button>
            </div>
          </Card>

          {/* Quick Info Box */}
          <Card className="p-3 bg-muted/20 border-border text-xs text-muted-foreground space-y-1.5">
            <div className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
              <Sparkles className="size-3.5 text-[#8b5cf6]" />
              <span>Squad Guidelines</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Squads have <strong>2 to 6 researchers</strong>. Squad leaders can invite members via private invite code.
            </p>
          </Card>
        </div>

        {/* === RIGHT COLUMN: SPOTLIGHT & CAMPAIGN FEED === */}
        <div className="lg:col-span-3 space-y-6">
          {/* A. ACTIVE SPOTLIGHT CAROUSEL (If filtering ALL or ACTIVE) */}
          {(selectedStatusFilter === "ALL" || selectedStatusFilter === "ACTIVE") && !searchQuery && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-[#10b981] animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Featured Active Campaign
                  </span>
                </div>

                {/* Carousel Controls */}
                {activeEvents.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      <strong className="text-foreground">{activeEventIndex + 1}</strong> of {activeEvents.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePrevActive}
                        className="h-7 w-7 p-0 cursor-pointer"
                        title="Previous Campaign"
                      >
                        <ChevronLeft className="size-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleNextActive}
                        className="h-7 w-7 p-0 cursor-pointer"
                        title="Next Campaign"
                      >
                        <ChevronRight className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-muted-foreground animate-pulse space-y-2">
                  <Rocket className="size-6 mx-auto text-muted-foreground/30 animate-bounce" />
                  <div>Loading campaign spotlight...</div>
                </div>
              ) : !currentActiveEvent ? null : (
                <div
                  className="relative touch-pan-y select-none"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  <Card className="p-5 bg-card border-border shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#27282d] space-y-4">
                    {/* Top Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                            {currentActiveEvent.code}
                          </span>
                          <span className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-full uppercase">
                            Live
                          </span>
                        </div>
                        <Link
                          href={`/campaigns/${currentActiveEvent.id}`}
                          className="hover:text-primary transition-colors block"
                        >
                          <h2 className="text-lg font-bold text-foreground hover:underline">
                            {currentActiveEvent.title}
                          </h2>
                        </Link>
                        <p className="text-xs text-muted-foreground max-w-xl line-clamp-2">
                          {currentActiveEvent.description || "International Astronomical Search Collaboration campaign for astrometric asteroid discovery."}
                        </p>
                      </div>

                      {/* Squad Count */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/40 shrink-0 self-start">
                        <Users className="size-3.5 text-primary" />
                        <span className="text-xs font-mono font-bold text-foreground">
                          {currentActiveEvent._count?.teams || 0}
                        </span>
                        <span className="text-[11px] text-muted-foreground">Squads</span>
                      </div>
                    </div>

                    {/* KEY HIGHLIGHT: REGISTRATION DEADLINE & DATES */}
                    <div className="p-3.5 rounded-xl border border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg shrink-0 ${
                          currentActiveRegInfo?.isUrgent
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20"
                        }`}>
                          <Clock className="size-4" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Registration Deadline
                          </div>
                          <div className="text-xs font-bold text-foreground mt-0.5 font-mono">
                            {currentActiveRegInfo?.text}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs font-mono text-muted-foreground sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-border/50">
                        <div className="text-[10px] font-sans font-semibold uppercase text-muted-foreground">
                          Observation Period
                        </div>
                        <div className="text-foreground font-medium mt-0.5">
                          {new Date(currentActiveEvent.startDate).toLocaleDateString()} &ndash; {new Date(currentActiveEvent.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                      <Link href={`/campaigns/${currentActiveEvent.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
                        >
                          <span>View Campaign Details</span>
                          <ArrowRight className="size-3.5" />
                        </Button>
                      </Link>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleOpenJoinModal(currentActiveEvent)}
                          variant="outline"
                          size="sm"
                          className="h-9 px-4 text-xs font-semibold gap-1.5 cursor-pointer border-border hover:bg-muted"
                        >
                          <UserPlus className="size-3.5 text-primary" />
                          <span>Join a Team</span>
                        </Button>

                        <Button
                          onClick={() => handleOpenCreateModal(currentActiveEvent)}
                          variant="default"
                          size="sm"
                          className="h-9 px-4 text-xs font-bold gap-1.5 cursor-pointer bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
                        >
                          <PlusCircle className="size-3.5" />
                          <span>Form a Team</span>
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Dot Indicators */}
                  {activeEvents.length > 1 && (
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      {activeEvents.map((_, idx) => (
                        <button
                          key={`dot-${idx}`}
                          type="button"
                          onClick={() => setActiveEventIndex(idx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            activeEventIndex === idx
                              ? "w-6 bg-[#8b5cf6]"
                              : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                          }`}
                          title={`Go to Campaign ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* B. FILTERED CAMPAIGNS LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {selectedStatusFilter === "ALL"
                    ? "Campaigns Schedule"
                    : selectedStatusFilter === "ACTIVE"
                    ? "Active Campaigns"
                    : selectedStatusFilter === "REGISTRATION"
                    ? "Open for Registration"
                    : "Upcoming Campaigns"}
                </h3>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {filteredEvents.length} {filteredEvents.length === 1 ? "campaign" : "campaigns"}
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
                Loading campaigns list...
              </div>
            ) : filteredEvents.length === 0 ? (
              <Card className="p-8 text-center text-xs text-muted-foreground">
                No campaigns match the selected filter.
              </Card>
            ) : (
              <div className="space-y-2.5">
                {filteredEvents.map((ev) => {
                  const regInfo = getRegistrationDeadlineInfo(ev.regEnd, ev.startDate);

                  return (
                    <Card
                      key={ev.id}
                      className="p-4 bg-card border-border shadow-xs hover:border-primary/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left: Info */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                            {ev.code}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {ev.status}
                          </span>
                        </div>
                        <Link
                          href={`/campaigns/${ev.id}`}
                          className="hover:text-primary transition-colors block"
                        >
                          <h4 className="text-sm font-bold text-foreground truncate hover:underline">
                            {ev.title}
                          </h4>
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {ev.description || "International Asteroid Search Collaboration campaign."}
                        </p>
                      </div>

                      {/* Middle: Prominent Registration Deadline */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className={`p-2 rounded-lg border text-center min-w-[135px] ${
                          regInfo.isUrgent
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                            : regInfo.isClosed
                            ? "bg-muted/40 border-border text-muted-foreground"
                            : "bg-[#8b5cf6]/10 border-[#8b5cf6]/25 text-[#8b5cf6]"
                        }`}>
                          <div className="text-[9px] uppercase font-sans font-bold">
                            Registration Deadline
                          </div>
                          <div className="text-[11px] font-bold mt-0.5 text-foreground font-mono">
                            {regInfo.text}
                          </div>
                        </div>

                        {/* Observation Window */}
                        <div className="hidden sm:block p-2 rounded-lg border border-border bg-muted/20 text-center min-w-[125px] font-mono text-xs">
                          <div className="text-[9px] uppercase font-sans font-semibold text-muted-foreground">
                            Observation
                          </div>
                          <div className="text-[11px] text-foreground mt-0.5">
                            {new Date(ev.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} &ndash; {new Date(ev.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/campaigns/${ev.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2.5 text-xs font-semibold cursor-pointer border-border hover:bg-muted"
                          >
                            <span>Details</span>
                          </Button>
                        </Link>

                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleOpenCreateModal(ev)}
                          className="h-8 px-3 text-xs font-bold gap-1.5 cursor-pointer bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
                        >
                          <PlusCircle className="size-3" />
                          <span>Form Squad</span>
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: FORM A TEAM */}
      <Dialog
        open={!!selectedEventForTeam}
        onOpenChange={(open) => !open && setSelectedEventForTeam(null)}
      >
        <DialogContent className="sm:max-w-md bg-card border-border font-sans">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <PlusCircle className="size-4 text-primary" />
              <span>Form a Research Squad</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Registering a new squad for <strong className="text-foreground">{selectedEventForTeam?.title}</strong> ({selectedEventForTeam?.code}).
            </DialogDescription>
          </DialogHeader>

          {createError && (
            <div className="p-2.5 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-xs">
              {createError}
            </div>
          )}

          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">
                Squad / Team Name
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. Orion Asteroid Hunters, Team Kepler"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="h-9 text-xs bg-background font-sans"
              />
            </div>

            <div className="text-xs text-muted-foreground p-3 rounded-lg border border-border bg-muted/40 space-y-1.5">
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3.5 text-[#10b981] shrink-0 mt-0.5" />
                <span>You will be registered as the <strong>Squad Leader</strong>.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3.5 text-[#10b981] shrink-0 mt-0.5" />
                <span>A private <strong>invite code</strong> will be generated for your teammates.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3.5 text-[#10b981] shrink-0 mt-0.5" />
                <span>Squads allow a minimum of 2 and maximum of 6 researchers.</span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedEventForTeam(null)}
                disabled={createLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={createLoading || !teamName.trim()}
                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold"
              >
                {createLoading ? "Creating..." : "Create Squad"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: JOIN A TEAM BY CODE */}
      <Dialog open={joinModalOpen} onOpenChange={setJoinModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border font-sans">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <KeyRound className="size-4 text-primary" />
              <span>Join a Research Squad</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {selectedEventForJoin
                ? `Enter the invite code provided by your squad leader for ${selectedEventForJoin.title}.`
                : "Enter the private 8-character invite code provided by your squad leader."}
            </DialogDescription>
          </DialogHeader>

          {joinError && (
            <div className="p-2.5 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-xs">
              {joinError}
            </div>
          )}

          <form onSubmit={handleJoinTeamByCode} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">
                Squad Invite Code
              </label>
              <Input
                type="text"
                required
                maxLength={10}
                placeholder="e.g. A9B2X7K1"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="h-10 text-center font-mono font-bold tracking-widest text-sm bg-background uppercase"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Invite codes are generated when a squad leader creates the squad for an active or upcoming campaign.
            </p>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setJoinModalOpen(false)}
                disabled={joinLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={joinLoading || !joinCode.trim()}
                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold"
              >
                {joinLoading ? "Joining..." : "Join Squad"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
