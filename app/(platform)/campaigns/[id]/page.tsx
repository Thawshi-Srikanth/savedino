"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
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
  CheckCircle2,
  Clock,
  ArrowLeft,
  ArrowRight,
  Pin,
  Check,
  Radio,
  Terminal,
  FileCode,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface EventDetail {
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
  teams: Array<{
    id: string;
    name: string;
    inviteCode: string;
    status: string;
  }>;
  _count?: {
    teams: number;
  };
}

function getRegistrationDeadlineInfo(regEndStr?: string, startDateStr?: string) {
  const targetStr = regEndStr || startDateStr;
  if (!targetStr) {
    return { text: "TBA", formattedDate: "TBA", isUrgent: false, isClosed: false, daysLeft: null };
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
      text: `Closed on ${formattedDate}`,
      formattedDate,
      isUrgent: false,
      isClosed: true,
      daysLeft: 0,
    };
  }

  if (daysLeft === 0) {
    return {
      text: `Closes Today (${formattedDate})`,
      formattedDate,
      isUrgent: true,
      isClosed: false,
      daysLeft: 0,
    };
  }

  if (daysLeft === 1) {
    return {
      text: `Closes Tomorrow (${formattedDate})`,
      formattedDate,
      isUrgent: true,
      isClosed: false,
      daysLeft: 1,
    };
  }

  return {
    text: `${formattedDate} (${daysLeft} days left)`,
    formattedDate,
    isUrgent: daysLeft <= 5,
    isClosed: false,
    daysLeft,
  };
}

function getStageTimelineData(startStr: string, endStr: string, now: number) {
  const start = new Date(startStr).getTime();
  const end = new Date(endStr).getTime();

  let status: "UPCOMING" | "ACTIVE" | "COMPLETED" = "UPCOMING";
  let progress = 0;

  if (now >= end) {
    status = "COMPLETED";
    progress = 100;
  } else if (now >= start) {
    status = "ACTIVE";
    const total = Math.max(1, end - start);
    progress = Math.min(99, Math.max(1, Math.round(((now - start) / total) * 100)));
  } else {
    status = "UPCOMING";
    progress = 0;
  }

  // Countdown timer calculation if <= 30 days
  let timerText: string | null = null;
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  if (status === "ACTIVE") {
    const diff = Math.max(0, end - now);
    if (diff <= thirtyDaysMs) {
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      timerText = `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
    }
  } else if (status === "UPCOMING") {
    const diff = Math.max(0, start - now);
    if (diff <= thirtyDaysMs) {
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      timerText = `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
    }
  }

  return { status, progress, timerText, start, end };
}

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Real-time 1s ticker for live countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [teamName, setTeamName] = useState<string>("");
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [joinModalOpen, setJoinModalOpen] = useState<boolean>(false);
  const [joinCode, setJoinCode] = useState<string>("");
  const [joinLoading, setJoinLoading] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const fetchCampaign = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${id}`);
      const data = await res.json();
      if (data.success && data.event) {
        setEvent(data.event);
      } else {
        toast.error(data.error || "Campaign not found.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load campaign details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push("/login");
      return;
    }
    if (!event) return;

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
          eventId: event.id,
          name: teamName.trim(),
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setCreateError(data.error || "Failed to create squad.");
      } else {
        toast.success("Squad formed successfully!");
        setCreateModalOpen(false);
        router.push(`/team/${data.team.id}`);
      }
    } catch (err: any) {
      setCreateError(err.message || "An error occurred.");
    } finally {
      setCreateLoading(false);
    }
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

  if (loading) {
    return (
      <div className="w-full py-24 text-center space-y-3 font-sans">
        <Rocket className="size-8 mx-auto text-primary animate-bounce" />
        <div className="text-sm font-semibold text-foreground">
          Loading campaign details...
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="w-full py-20 text-center space-y-4 font-sans">
        <div className="text-base font-semibold text-foreground">Campaign Not Found</div>
        <Link href="/campaigns">
          <Button variant="outline" size="sm" className="gap-2 cursor-pointer shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d]">
            <ArrowLeft className="size-4" />
            <span>Back to Campaigns</span>
          </Button>
        </Link>
      </div>
    );
  }

  const regInfo = getRegistrationDeadlineInfo(event.regEnd, event.startDate);
  const squadCount = event._count?.teams || event.teams?.length || 0;

  // Pipeline Stages
  const pipelineStages = [
    {
      stage: "Stage 1",
      code: "Registration",
      name: "Researcher Onboarding & Account Setup",
      start: event.regStart,
      end: event.regEnd,
    },
    {
      stage: "Stage 2",
      code: "Team Formation",
      name: "Squad Roster Assembly & Solo Matching",
      start: event.teamFormationStart || event.regStart,
      end: event.teamFormationEnd || event.startDate,
    },
    {
      stage: "Stage 3",
      code: "Observation",
      name: "Telescope Image Analysis & Asteroid Search",
      start: event.startDate,
      end: event.endDate,
    },
    {
      stage: "Stage 4",
      code: "Discovery Report",
      name: "Astrometry Verification & MPC Submission",
      start: event.submissionStart || event.startDate,
      end: event.submissionEnd || event.endDate,
    },
  ];

  return (
    <div className="w-full space-y-8 font-sans max-w-6xl mx-auto py-2">
      {/* 1. BREADCRUMB & HEADER STRIP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border text-xs font-sans">
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-2 font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
        >
          <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Campaigns</span>
        </Link>

        {/* Theme Spec Code Badge with 3D Shadow */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium">Campaign:</span>
          <Badge variant="outline" className="font-sans font-bold bg-card border-border text-foreground px-2.5 py-0.5 shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d]">
            {event.code}
          </Badge>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* === LEFT COLUMN: PIPELINE TIMELINE (8 COLS) === */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header & Overview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {event.status === "ACTIVE" ? (
                <Badge className="bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/40 font-sans font-semibold text-xs px-2.5 py-0.5 gap-1.5 shadow-[0_2px_0_0_#a7f3d0] dark:shadow-[0_2px_0_0_#065f46]">
                  <span className="size-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  <span>Active Campaign</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground border-border font-sans font-medium text-xs px-2.5 py-0.5 shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d]">
                  {event.status}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground font-sans">
              {event.title}
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {event.description || "International Astronomical Search Collaboration campaign for astrometric asteroid discovery."}
            </p>

            {/* Campaign Specs Strip */}
            <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-sans text-muted-foreground border-t border-border">
              <div>
                <span className="text-muted-foreground">Timeline: </span>
                <strong className="text-foreground font-sans">{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</strong>
              </div>

              <div>
                <span className="text-muted-foreground">Squads: </span>
                <strong className="text-foreground">{squadCount} registered</strong>
                <Link
                  href={`/teams?eventId=${event.id}`}
                  className="text-primary font-sans hover:underline text-xs ml-1.5 font-semibold"
                >
                  (view roster)
                </Link>
              </div>

              <div>
                <span className="text-muted-foreground">Data Type: </span>
                <span className="text-foreground font-medium">16-bit FITS Images</span>
              </div>
            </div>
          </div>

          {/* === SINGLE VERTICAL TIMELINE === */}
          <div className="space-y-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-sans">
                  Campaign Schedule
                </h2>
              </div>

              <span className="text-xs text-muted-foreground font-sans">
                4 Stages
              </span>
            </div>

            {/* Single Continuous Vertical Timeline */}
            <div className="relative pl-6 sm:pl-8 border-l-2 border-border space-y-9 my-4 ml-3 sm:ml-4">
              {pipelineStages.map((phase, idx) => {
                const phaseData = getStageTimelineData(phase.start, phase.end, currentTime);
                const isLive = phaseData.status === "ACTIVE";
                const isDone = phaseData.status === "COMPLETED";

                return (
                  <div key={phase.stage} className="relative">
                    {/* Node Dot on Vertical Line */}
                    <div
                      className={`absolute -left-[31px] sm:-left-[39px] top-1.5 size-3.5 rounded-full border-2 transition-all flex items-center justify-center ${
                        isLive
                          ? "bg-[#8b5cf6] border-white dark:border-background ring-4 ring-[#8b5cf6]/30 shadow-xs"
                          : isDone
                          ? "bg-[#10b981] border-white dark:border-background ring-2 ring-[#10b981]/20"
                          : "bg-muted border-border"
                      }`}
                    >
                      {isDone && <Check className="size-2 text-white stroke-[3]" />}
                      {isLive && <span className="size-1 rounded-full bg-white animate-ping" />}
                    </div>

                    {/* Stage Details */}
                    <div className="space-y-1.5">
                      {/* Top Row: Stage Name & Theme Badges with 3D Shadow */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={isLive ? "default" : "outline"}
                            className={`font-sans font-semibold text-xs px-2.5 py-0.5 ${
                              isLive
                                ? "bg-[#8b5cf6] hover:bg-[#7c3aed] text-white border-0 shadow-[0_2px_0_0_#6d28d9] dark:shadow-[0_2px_0_0_#5b21b6]"
                                : isDone
                                ? "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30 shadow-[0_2px_0_0_#a7f3d0] dark:shadow-[0_2px_0_0_#065f46]"
                                : "bg-card text-foreground border-border shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d]"
                            }`}
                          >
                            Stage {idx + 1}
                          </Badge>

                          <h3 className="text-base font-bold text-foreground font-sans">
                            {phase.name}
                          </h3>
                        </div>

                        {/* Status / Countdown Timer Badges with 3D Shadow */}
                        <div className="flex flex-wrap items-center gap-2 font-sans text-xs shrink-0">
                          {/* Live countdown timer badge if within 30 days */}
                          {phaseData.timerText && isLive && (
                            <Badge className="bg-[#8b5cf6]/15 text-[#8b5cf6] dark:text-[#a78bfa] border border-[#8b5cf6]/30 font-sans font-medium text-xs px-2.5 py-0.5 gap-1.5 shadow-[0_2px_0_0_#d8b4fe] dark:shadow-[0_2px_0_0_#5b21b6] animate-pulse">
                              <Clock className="size-3 text-[#8b5cf6]" />
                              <span>Ends in {phaseData.timerText}</span>
                            </Badge>
                          )}

                          {phaseData.timerText && !isLive && !isDone && (
                            <Badge variant="outline" className="bg-card text-muted-foreground border-border font-sans font-medium text-xs px-2.5 py-0.5 gap-1.5 shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d]">
                              <Clock className="size-3 text-muted-foreground" />
                              <span>Starts in {phaseData.timerText}</span>
                            </Badge>
                          )}

                          {isLive && (
                            <Badge className="bg-[#8b5cf6] text-white border-0 font-sans font-semibold text-xs px-2.5 py-0.5 shadow-[0_2px_0_0_#6d28d9] dark:shadow-[0_2px_0_0_#5b21b6]">
                              Active
                            </Badge>
                          )}
                          {isDone && (
                            <Badge variant="outline" className="bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30 font-sans font-semibold text-xs px-2.5 py-0.5 shadow-[0_2px_0_0_#a7f3d0] dark:shadow-[0_2px_0_0_#065f46]">
                              Completed
                            </Badge>
                          )}
                          {!isLive && !isDone && !phaseData.timerText && (
                            <Badge variant="outline" className="bg-card text-muted-foreground border-border font-sans font-medium text-xs px-2.5 py-0.5 shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d]">
                              Upcoming
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Start Date & End Date + Progress % */}
                      <div className="flex flex-wrap items-center gap-3 text-xs font-sans text-muted-foreground pt-0.5">
                        <span className="text-foreground font-medium">
                          Start: {new Date(phase.start).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <span className="text-muted-foreground/60">-</span>
                        <span className="text-foreground font-medium">
                          End: {new Date(phase.end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <span className="text-muted-foreground/50">|</span>
                        <span className="text-muted-foreground text-xs">
                          {phaseData.progress}% complete
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN: SOLID PURPLE STICKY ACTION CARD (4 COLS) === */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
          {/* Solid Electric Violet Sticky Card */}
          <div className="relative rounded-2xl p-6 space-y-5 bg-[#8b5cf6] dark:bg-[#7c3aed] text-white shadow-[0_4px_0_0_#6d28d9] dark:shadow-[0_4px_0_0_#5b21b6] border-0 transition-all">
            {/* Top Header Note Tape */}
            <div className="flex items-center justify-between pb-3 border-b border-white/20 font-sans text-xs">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Pin className="size-3.5" />
                <span>Squad Actions</span>
              </div>
              <Badge className="bg-white/20 hover:bg-white/20 text-white border-0 font-sans font-bold text-xs px-2 py-0.5 shadow-[0_2px_0_0_rgba(0,0,0,0.15)]">
                {event.code}
              </Badge>
            </div>

            {/* Registration Deadline Alert Inside Purple Card */}
            <div className="space-y-1.5 p-3.5 rounded-xl bg-black/20 border border-white/10">
              <div className="text-xs font-medium uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                <Clock className="size-3 text-white/90" />
                <span>Registration Deadline</span>
              </div>
              <div className="text-base sm:text-lg font-bold font-sans text-white">
                {regInfo.text}
              </div>
            </div>

            {/* 3D Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <Button
                onClick={() => {
                  if (!session) {
                    router.push("/login");
                    return;
                  }
                  setCreateError(null);
                  setTeamName("");
                  setCreateModalOpen(true);
                }}
                variant="default"
                className="w-full h-11 text-xs font-sans font-bold gap-2 cursor-pointer bg-white hover:bg-white/90 text-[#6d28d9] shadow-[0_3px_0_0_#e2e8f0] active:translate-y-0.5 border-0 rounded-xl"
              >
                <PlusCircle className="size-4" />
                <span>Form a Team</span>
              </Button>

              <Button
                onClick={() => {
                  if (!session) {
                    router.push("/login");
                    return;
                  }
                  setJoinError(null);
                  setJoinCode("");
                  setJoinModalOpen(true);
                }}
                variant="outline"
                className="w-full h-11 text-xs font-sans font-bold gap-2 cursor-pointer border-white/30 bg-white/15 text-white hover:bg-white/25 active:translate-y-0.5 rounded-xl"
              >
                <KeyRound className="size-4" />
                <span>Join with Code</span>
              </Button>

              <Link href={`/teams?eventId=${event.id}`} className="block w-full">
                <Button
                  variant="ghost"
                  className="w-full h-9 text-xs font-sans font-semibold gap-1.5 cursor-pointer text-white/90 hover:text-white hover:bg-white/15 rounded-xl"
                >
                  <Users className="size-3.5" />
                  <span>View Joined Teams ({squadCount})</span>
                </Button>
              </Link>
            </div>

            {/* Squad Rules Checklist */}
            <div className="pt-3 border-t border-white/20 text-xs font-sans text-white/85 space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-white shrink-0" />
                <span>2 to 6 scientists per squad</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-white shrink-0" />
                <span>Share invite codes with colleagues</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FORM SQUAD MODAL */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border font-sans">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <PlusCircle className="size-4 text-primary" />
              <span>Form Research Squad</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Registering a new squad for <strong className="text-foreground">{event.title}</strong> ({event.code}).
            </DialogDescription>
          </DialogHeader>

          {createError && (
            <div className="p-2.5 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-xs font-medium">
              Error: {createError}
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
                onClick={() => setCreateModalOpen(false)}
                disabled={createLoading}
                className="text-xs shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={createLoading || !teamName.trim()}
                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold text-xs shadow-[0_2px_0_0_#6d28d9] dark:shadow-[0_2px_0_0_#5b21b6]"
              >
                {createLoading ? "Creating..." : "Create Squad"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* JOIN BY CODE MODAL */}
      <Dialog open={joinModalOpen} onOpenChange={setJoinModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border font-sans">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <KeyRound className="size-4 text-primary" />
              <span>Join Research Squad</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter the private invite code provided by your squad leader for <strong className="text-foreground">{event.title}</strong>.
            </DialogDescription>
          </DialogHeader>

          {joinError && (
            <div className="p-2.5 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-xs font-medium">
              Error: {joinError}
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

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setJoinModalOpen(false)}
                disabled={joinLoading}
                className="text-xs shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={joinLoading || !joinCode.trim()}
                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold text-xs shadow-[0_2px_0_0_#6d28d9] dark:shadow-[0_2px_0_0_#5b21b6]"
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
