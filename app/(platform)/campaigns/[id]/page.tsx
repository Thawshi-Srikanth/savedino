"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DinoLoading } from "@/components/dino-loading";
import { useMinimumLoading } from "@/hooks/use-minimum-loading";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
  Flag,
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
  maxTeamSize?: number;
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

function formatStageDate(dateStr?: string) {
  if (!dateStr) return "TBA";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "TBA";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDurationDays(startStr?: string, endStr?: string) {
  if (!startStr || !endStr) return null;
  const start = new Date(startStr).getTime();
  const end = new Date(endStr).getTime();
  if (isNaN(start) || isNaN(end) || end <= start) return null;
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

function getHumanizedCountdown(targetDateMs: number, now: number): string {
  const diffMs = targetDateMs - now;
  if (diffMs <= 0) return "Ending now";

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (totalDays > 1) {
    const remHours = totalHours % 24;
    return remHours > 0 ? `${totalDays} days ${remHours}h` : `${totalDays} days`;
  } else if (totalDays === 1) {
    const remHours = totalHours % 24;
    return remHours > 0 ? `1 day ${remHours}h` : `1 day`;
  } else if (totalHours >= 1) {
    const remMinutes = totalMinutes % 60;
    return remMinutes > 0 ? `${totalHours}h ${remMinutes}m` : `${totalHours} hours`;
  } else if (totalMinutes >= 1) {
    return `${totalMinutes} minutes`;
  } else {
    return "Less than a minute";
  }
}

function getRegistrationDeadlineInfo(
  regEndStr?: string,
  startDateStr?: string,
  nowMs: number = Date.now()
) {
  const targetStr = regEndStr || startDateStr;
  if (!targetStr) {
    return {
      text: "TBA",
      formattedDate: "TBA",
      countdownText: null,
      isUrgent: false,
      isClosed: false,
      daysLeft: null,
    };
  }

  const targetDate = new Date(targetStr);
  const diffMs = targetDate.getTime() - nowMs;
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const formattedDate = targetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (diffMs <= 0) {
    return {
      text: `Closed on ${formattedDate}`,
      formattedDate,
      countdownText: "Closed",
      isUrgent: false,
      isClosed: true,
      daysLeft: 0,
    };
  }

  const countdown = getHumanizedCountdown(targetDate.getTime(), nowMs);

  return {
    text: `${formattedDate} (${countdown} left)`,
    formattedDate,
    countdownText: `${countdown} left`,
    isUrgent: daysLeft <= 5,
    isClosed: false,
    daysLeft,
  };
}

function getStageTimelineData(startStr?: string, endStr?: string, now: number = Date.now()) {
  if (!startStr || !endStr) {
    return { status: "UPCOMING" as const, progress: 0, countdownText: null, start: 0, end: 0 };
  }

  const start = new Date(startStr).getTime();
  const end = new Date(endStr).getTime();

  if (isNaN(start) || isNaN(end)) {
    return { status: "UPCOMING" as const, progress: 0, countdownText: null, start: 0, end: 0 };
  }

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

  let countdownText: string | null = null;
  if (status === "ACTIVE") {
    countdownText = getHumanizedCountdown(end, now);
  } else if (status === "UPCOMING") {
    countdownText = getHumanizedCountdown(start, now);
  }

  return { status, progress, countdownText, start, end };
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isDisplayLoading = useMinimumLoading(loading, 1000);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Real-time 1s ticker for live countdowns & progress
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

    // Check registration deadline
    const regDeadlineStr = event.teamFormationEnd || event.regEnd || event.startDate;
    if (regDeadlineStr && Date.now() > new Date(regDeadlineStr).getTime()) {
      setCreateError("Registration and team formation for this campaign has closed.");
      return;
    }

    if (!teamName.trim()) {
      setCreateError("Please enter a team name.");
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
        setCreateError(data.error || "Failed to create team.");
      } else {
        toast.success("Team created successfully!");
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
    if (!event) return;

    // Check registration deadline
    const regDeadlineStr = event.teamFormationEnd || event.regEnd || event.startDate;
    if (regDeadlineStr && Date.now() > new Date(regDeadlineStr).getTime()) {
      setJoinError("Team registration for this campaign has closed.");
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
        setJoinError(data.error || "Failed to join team.");
      } else {
        toast.success("Joined team successfully!");
        setJoinModalOpen(false);
        router.push(`/team/${data.teamId}`);
      }
    } catch (err: any) {
      setJoinError(err.message || "An error occurred.");
    } finally {
      setJoinLoading(false);
    }
  };

  if (isDisplayLoading) {
    return <DinoLoading size="lg" text="Loading campaign details..." fullScreen />;
  }

  if (!event) {
    return (
      <div className="w-full py-20 text-center space-y-4 font-sans">
        <div className="text-base font-semibold text-foreground">Campaign Not Found</div>
        <Link href="/campaigns" prefetch={false}>
          <Button variant="outline" size="sm" className="gap-2 cursor-pointer shadow-arcade-sm">
            <ArrowLeft className="size-4" />
            <span>Back to Campaigns</span>
          </Button>
        </Link>
      </div>
    );
  }

  const regInfo = getRegistrationDeadlineInfo(event.regEnd, event.startDate, currentTime);
  const squadCount = event._count?.teams || event.teams?.length || 0;

  // Simple, direct step stages without jargon
  const pipelineStages = [
    {
      stage: "Stage 1",
      name: "Registration",
      description: "Sign up and create your account to participate.",
      start: event.regStart,
      end: event.regEnd,
    },
    {
      stage: "Stage 2",
      name: "Team Formation",
      description: "Create a team of 2 to 6 members or join with an invite code.",
      start: event.teamFormationStart || event.regStart,
      end: event.teamFormationEnd || event.startDate,
    },
    {
      stage: "Stage 3",
      name: "Image Search",
      description: "Analyze telescope images to find and track moving asteroids.",
      start: event.startDate,
      end: event.endDate,
    },
    {
      stage: "Stage 4",
      name: "Submit Reports",
      description: "Submit your final discovery reports and measurements.",
      start: event.submissionStart || event.startDate,
      end: event.submissionEnd || event.endDate,
    },
  ];

  return (
    <div className="w-full space-y-8 font-sans max-w-6xl mx-auto py-2">
      {/* 1. STICKY BREADCRUMB & HEADER STRIP */}
      <div className="sticky top-16 z-30 -mt-2 py-3 bg-background/95 dark:bg-background/95 backdrop-blur-md border-b border-border flex items-center justify-between gap-3 text-xs font-sans">
        <Breadcrumb>
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/campaigns"
                  prefetch={false}
                  className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
                >
                  <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Campaigns</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground/40" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-mono font-bold text-foreground">
                {event.code}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Theme Status Pill with 3D Shadow */}
        <div className="flex items-center gap-2">
          {event.status === "ACTIVE" ? (
            <Badge className="bg-[#10b981] hover:bg-[#059669] text-white border-0 font-sans font-bold text-xs px-2.5 py-1 gap-1.5 shadow-arcade-emerald rounded-lg">
              <span className="size-1.5 rounded-full bg-white" />
              <span>{event.status}</span>
            </Badge>
          ) : event.status === "UPCOMING" ? (
            <Badge className="bg-sky-500 hover:bg-sky-600 text-white border-0 font-sans font-bold text-xs px-2.5 py-1 shadow-arcade-sm rounded-lg">
              Upcoming
            </Badge>
          ) : (
            <Badge className="bg-slate-700 hover:bg-slate-800 text-white border-0 font-sans font-bold text-xs px-2.5 py-1 shadow-arcade-sm rounded-lg">
              {event.status}
            </Badge>
          )}
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* === LEFT COLUMN: PIPELINE TIMELINE (8 COLS) === */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header & Overview */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground font-sans">
              {event.title}
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {event.description ||
                "International Astronomical Search Collaboration campaign for asteroid discovery."}
            </p>

            {/* Campaign Specs Strip */}
            <div className="pt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-sans text-muted-foreground border-t border-border">
              <div className="inline-flex items-center gap-1.5">
                <span className="text-muted-foreground">Timeline:</span>
                <strong className="text-foreground font-mono">
                  {formatStageDate(event.startDate)} &ndash; {formatStageDate(event.endDate)}
                </strong>
              </div>

              <div className="inline-flex items-center gap-1.5">
                <span className="text-muted-foreground">Teams:</span>
                <strong className="text-foreground">{squadCount} registered</strong>
                <Link
                  href={`/teams?eventId=${event.id}`}
                  prefetch={false}
                  className="text-primary font-sans hover:underline font-semibold"
                >
                  (view teams)
                </Link>
              </div>
            </div>
          </div>

          {/* === VERTICAL STAGE FLOW (START & END CONNECTED WITH VERTICAL PROGRESS LINE) === */}
          <div className="space-y-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-sans">
                  Schedule & Steps
                </h2>
              </div>

              <span className="text-xs text-muted-foreground font-sans font-medium">4 Steps</span>
            </div>

            {/* Vertical Non-Containerized Flow for All Stages */}
            <div className="space-y-8 pt-2">
              {pipelineStages.map((phase, idx) => {
                const phaseData = getStageTimelineData(phase.start, phase.end, currentTime);
                const isLive = phaseData.status === "ACTIVE";
                const isDone = phaseData.status === "COMPLETED";
                const durationDays = getDurationDays(phase.start, phase.end);
                const startDateFormatted = formatStageDate(phase.start);
                const endDateFormatted = formatStageDate(phase.end);

                return (
                  <div
                    key={phase.stage}
                    className={`space-y-3 pb-8 ${
                      idx < pipelineStages.length - 1 ? "border-b border-border/50" : ""
                    }`}
                  >
                    {/* 1. STAGE HEADER - Direct & Simple */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Badge
                          variant={isLive ? "default" : "outline"}
                          className={`font-sans font-bold text-xs px-2.5 py-0.5 rounded-lg ${
                            isLive
                              ? "bg-[#8b5cf6] text-white border-0 shadow-arcade-primary"
                              : isDone
                                ? "bg-[#10b981] text-white border-0 shadow-arcade-emerald"
                                : "bg-muted text-muted-foreground border-border shadow-arcade-sm"
                          }`}
                        >
                          Step {idx + 1}
                        </Badge>

                        <h3 className="text-base sm:text-lg font-bold text-foreground font-sans">
                          {phase.name}
                        </h3>

                        {durationDays && (
                          <span className="text-xs font-mono text-muted-foreground">
                            ({durationDays} days)
                          </span>
                        )}
                      </div>

                      {/* Status indicator text (Not inside badge) */}
                      <div className="flex items-center gap-2 text-xs font-sans">
                        {isLive && (
                          <span className="inline-flex items-center gap-1.5 font-bold text-[#8b5cf6] dark:text-[#a78bfa]">
                            <span className="size-2 rounded-full bg-[#8b5cf6] animate-pulse" />
                            <span>Active Now</span>
                          </span>
                        )}
                        {isDone && (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-[#10b981]">
                            <Check className="size-3.5 stroke-[3]" />
                            <span>Completed</span>
                          </span>
                        )}
                        {!isLive && !isDone && (
                          <span className="font-medium text-muted-foreground">Upcoming</span>
                        )}
                      </div>
                    </div>

                    {/* Stage Description */}
                    {phase.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {phase.description}
                      </p>
                    )}

                    {/* 2. VERTICAL TWO-POINT TIMELINE (START TO END) */}
                    <div className="relative pl-9 pt-3 pb-2">
                      {/* Vertical Progress Line Track connecting Start to End */}
                      <div className="absolute left-[12px] top-4 bottom-4 w-1 rounded-full bg-slate-200 dark:bg-[#28292e] overflow-hidden">
                        <div
                          className={`w-full transition-all duration-700 ease-out rounded-full ${
                            isDone
                              ? "bg-[#10b981]"
                              : isLive
                                ? "bg-gradient-to-b from-[#8b5cf6] to-[#a855f7]"
                                : "bg-transparent"
                          }`}
                          style={{ height: `${phaseData.progress}%` }}
                        />
                      </div>

                      {/* START POINT NODE (TOP) - Themed Rounded Box with 3D Shadow */}
                      <div className="relative flex items-center gap-3">
                        <div
                          className={`absolute -left-9 size-7 rounded-lg border flex items-center justify-center transition-all ${
                            isDone
                              ? "bg-[#10b981] border-[#059669] text-white shadow-arcade-emerald"
                              : isLive
                                ? "bg-[#8b5cf6] border-[#7c3aed] text-white shadow-arcade-primary"
                                : "bg-card border-border text-muted-foreground shadow-arcade-sm"
                          }`}
                        >
                          {isDone || isLive ? (
                            <Check className="size-3.5 stroke-[3]" />
                          ) : (
                            <span className="size-1.5 rounded-xs bg-muted-foreground/60" />
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-sans">
                          <span className="font-mono font-bold text-foreground">
                            {startDateFormatted}
                          </span>
                          <span className="text-muted-foreground text-xs font-medium">(Start)</span>
                        </div>
                      </div>

                      {/* IN-PLACE COUNTDOWN FLOW (EXPANDED HEIGHT, NO PERCENTAGE) */}
                      <div className="my-7 pl-2 py-3 min-h-[64px] flex flex-col justify-center space-y-1.5 text-xs font-sans">
                        {isLive && phaseData.countdownText && (
                          <div className="flex items-center gap-2 text-foreground font-medium">
                            <Clock className="size-3.5 text-[#8b5cf6]" />
                            <span>{phaseData.countdownText} remaining</span>
                          </div>
                        )}

                        {!isLive && !isDone && phaseData.countdownText && (
                          <div className="flex items-center gap-2 text-muted-foreground font-medium">
                            <Clock className="size-3.5 text-muted-foreground" />
                            <span>Starts in {phaseData.countdownText}</span>
                          </div>
                        )}

                        {isDone && (
                          <div className="text-xs text-[#10b981] font-semibold flex items-center gap-1.5">
                            <Check className="size-3.5 stroke-[3]" />
                            <span>Completed</span>
                          </div>
                        )}
                      </div>

                      {/* END POINT NODE (BOTTOM) - Themed Rounded Box with 3D Shadow */}
                      <div className="relative flex items-center gap-3">
                        <div
                          className={`absolute -left-9 size-7 rounded-lg border flex items-center justify-center transition-all ${
                            isDone
                              ? "bg-[#10b981] border-[#059669] text-white shadow-arcade-emerald"
                              : isLive
                                ? "bg-card border-[#8b5cf6] text-[#8b5cf6] shadow-arcade-sm"
                                : "bg-card border-border text-muted-foreground shadow-arcade-sm"
                          }`}
                        >
                          {isDone ? (
                            <Check className="size-3.5 stroke-[3]" />
                          ) : (
                            <Flag className="size-3" />
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-sans">
                          <span className="font-mono font-bold text-foreground">
                            {endDateFormatted}
                          </span>
                          <span className="text-muted-foreground text-xs font-medium">(End)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN: STICKY SIDEBAR (4 COLS) === */}
        <div className="lg:col-span-4 lg:sticky lg:top-36 z-20 space-y-4 font-sans">
          {(() => {
            const activePipelineStage = pipelineStages.find((phase) => {
              const data = getStageTimelineData(phase.start, phase.end, currentTime);
              return data.status === "ACTIVE";
            });
            const allStagesCompleted = pipelineStages.every((phase) => {
              const data = getStageTimelineData(phase.start, phase.end, currentTime);
              return data.status === "COMPLETED";
            });

            const regDeadlineStr = event.teamFormationEnd || event.regEnd || event.startDate;
            const isRegClosed = regDeadlineStr
              ? currentTime > new Date(regDeadlineStr).getTime()
              : false;

            return (
              <>
                {/* 1. Dynamic Deadline & Countdown */}
                <div className="space-y-1.5 px-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-sans">
                    {allStagesCompleted
                      ? "Campaign Status"
                      : activePipelineStage?.name === "Image Search"
                        ? "Search Window Closes"
                        : activePipelineStage?.name === "Submit Reports"
                          ? "Submission Deadline"
                          : "Registration Deadline"}
                  </div>

                  <div
                    className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-foreground select-none"
                    style={{
                      textShadow: "0 3px 0 var(--border), 0 4px 6px rgba(0,0,0,0.06)",
                    }}
                  >
                    {allStagesCompleted
                      ? "Completed"
                      : activePipelineStage?.name === "Image Search"
                        ? formatStageDate(event.endDate)
                        : activePipelineStage?.name === "Submit Reports"
                          ? formatStageDate(event.submissionEnd || event.endDate)
                          : regInfo.formattedDate}
                  </div>

                  {(() => {
                    if (allStagesCompleted) {
                      return (
                        <div className="text-xs font-mono font-semibold text-muted-foreground">
                          All phases concluded
                        </div>
                      );
                    }
                    if (activePipelineStage?.name === "Image Search") {
                      const searchTimeline = getStageTimelineData(
                        event.startDate,
                        event.endDate,
                        currentTime
                      );
                      return searchTimeline.countdownText ? (
                        <div className="text-xs font-mono font-semibold text-[#8b5cf6]">
                          {searchTimeline.countdownText} remaining
                        </div>
                      ) : null;
                    }
                    if (activePipelineStage?.name === "Submit Reports") {
                      const submitTimeline = getStageTimelineData(
                        event.submissionStart || event.startDate,
                        event.submissionEnd || event.endDate,
                        currentTime
                      );
                      return submitTimeline.countdownText ? (
                        <div className="text-xs font-mono font-semibold text-emerald-500">
                          {submitTimeline.countdownText} remaining
                        </div>
                      ) : null;
                    }
                    return regInfo.countdownText ? (
                      <div
                        className={`text-xs font-mono font-semibold ${
                          regInfo.isUrgent ? "text-amber-500" : "text-muted-foreground"
                        }`}
                      >
                        {regInfo.countdownText}
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* 2. Solid Theme Action Card with dynamic buttons based on active stage */}
                <div className="relative rounded-2xl p-5 space-y-4 bg-[#8b5cf6] dark:bg-[#7c3aed] text-white shadow-arcade-primary-lg border-0 transition-all">
                  {/* Header / Active Stage Status */}
                  <div className="flex items-center justify-between pb-1 border-b border-white/20">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-white/90">
                      {allStagesCompleted
                        ? "Campaign Concluded"
                        : activePipelineStage?.name === "Image Search"
                          ? "Image Search Live"
                          : activePipelineStage?.name === "Submit Reports"
                            ? "Submissions Open"
                            : isRegClosed
                              ? "Registration Closed"
                              : "Registration Active"}
                    </span>
                    <span className="size-2 rounded-full bg-white animate-pulse" />
                  </div>

                  {/* 3D Action Buttons */}
                  <div className="space-y-2.5">
                    {/* If Image Search is active */}
                    {activePipelineStage?.name === "Image Search" && (
                      <>
                        <Link
                          href={`/teams?eventId=${event.id}`}
                          prefetch={false}
                          className="block w-full"
                        >
                          <Button
                            variant="default"
                            className="w-full h-11 text-xs font-sans font-bold gap-2 cursor-pointer bg-white hover:bg-white/90 text-[#6d28d9] shadow-arcade-sm active:translate-y-0.5 border-0 rounded-xl"
                          >
                            <Telescope className="size-4" />
                            <span>Start Image Search</span>
                          </Button>
                        </Link>

                        {!isRegClosed ? (
                          <div className="grid grid-cols-2 gap-2">
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
                              variant="outline"
                              className="h-10 text-xs font-sans font-bold gap-1.5 cursor-pointer border-white/30 bg-white/15 text-white hover:bg-white/25 active:translate-y-0.5 rounded-xl"
                            >
                              <PlusCircle className="size-3.5" />
                              <span>Form Team</span>
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
                              className="h-10 text-xs font-sans font-bold gap-1.5 cursor-pointer border-white/30 bg-white/15 text-white hover:bg-white/25 active:translate-y-0.5 rounded-xl"
                            >
                              <KeyRound className="size-3.5" />
                              <span>Join Code</span>
                            </Button>
                          </div>
                        ) : (
                          <Link
                            href={`/teams?eventId=${event.id}`}
                            prefetch={false}
                            className="block w-full"
                          >
                            <Button className="w-full h-10 text-xs font-sans font-bold gap-2 cursor-pointer bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-arcade-amber-lg active:translate-y-0.5 border-0 rounded-xl transition-all">
                              <Users className="size-4" />
                              <span>View Joined Teams ({squadCount})</span>
                            </Button>
                          </Link>
                        )}
                      </>
                    )}

                    {/* If Submit Reports is active */}
                    {activePipelineStage?.name === "Submit Reports" && (
                      <>
                        <Link
                          href={`/teams?eventId=${event.id}`}
                          prefetch={false}
                          className="block w-full"
                        >
                          <Button
                            variant="default"
                            className="w-full h-11 text-xs font-sans font-bold gap-2 cursor-pointer bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-arcade-emerald-lg active:translate-y-0.5 border-0 rounded-xl"
                          >
                            <CheckCircle2 className="size-4" />
                            <span>Submit Reports</span>
                          </Button>
                        </Link>

                        <Link
                          href={`/teams?eventId=${event.id}`}
                          prefetch={false}
                          className="block w-full"
                        >
                          <Button className="w-full h-11 text-xs font-sans font-bold gap-2 cursor-pointer bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-arcade-amber-lg active:translate-y-0.5 border-0 rounded-xl transition-all">
                            <Users className="size-4" />
                            <span>View Teams ({squadCount})</span>
                          </Button>
                        </Link>
                      </>
                    )}

                    {/* If Completed */}
                    {allStagesCompleted && (
                      <Link
                        href={`/teams?eventId=${event.id}`}
                        prefetch={false}
                        className="block w-full"
                      >
                        <Button
                          variant="default"
                          className="w-full h-11 text-xs font-sans font-bold gap-2 cursor-pointer bg-white hover:bg-white/90 text-[#6d28d9] shadow-arcade-sm active:translate-y-0.5 border-0 rounded-xl"
                        >
                          <Sparkles className="size-4" />
                          <span>View Results & Teams ({squadCount})</span>
                        </Button>
                      </Link>
                    )}

                    {/* Default: Registration / Team Formation / Upcoming */}
                    {!allStagesCompleted &&
                      activePipelineStage?.name !== "Image Search" &&
                      activePipelineStage?.name !== "Submit Reports" && (
                        <>
                          {isRegClosed ? (
                            <Button
                              disabled
                              className="w-full h-11 text-xs font-sans font-bold gap-2 opacity-70 bg-white/20 text-white border border-white/30 rounded-xl cursor-not-allowed"
                            >
                              <Clock className="size-4" />
                              <span>Registration Closed</span>
                            </Button>
                          ) : (
                            <>
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
                                className="w-full h-11 text-xs font-sans font-bold gap-2 cursor-pointer bg-white hover:bg-white/90 text-[#6d28d9] shadow-arcade-sm active:translate-y-0.5 border-0 rounded-xl"
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
                            </>
                          )}

                          <Link
                            href={`/teams?eventId=${event.id}`}
                            prefetch={false}
                            className="block w-full"
                          >
                            <Button className="w-full h-11 text-xs font-sans font-bold gap-2 cursor-pointer bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-arcade-amber active:translate-y-0.5 border-0 rounded-xl transition-all">
                              <Users className="size-4" />
                              <span>View Joined Teams ({squadCount})</span>
                            </Button>
                          </Link>
                        </>
                      )}
                  </div>

                  {/* Checklist / Status Details */}
                  <div className="pt-3 border-t border-white/20 text-xs font-sans text-white/85 space-y-1.5">
                    {activePipelineStage?.name === "Image Search" ? (
                      <>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-white shrink-0" />
                          <span>Claim image sets from team workspace</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-white shrink-0" />
                          <span>Blink 4 frames to detect moving asteroids</span>
                        </div>
                      </>
                    ) : activePipelineStage?.name === "Submit Reports" ? (
                      <>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-white shrink-0" />
                          <span>Review astrometry measurements</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-white shrink-0" />
                          <span>Export and submit MPC format reports</span>
                        </div>
                      </>
                    ) : allStagesCompleted ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-white shrink-0" />
                        <span>Campaign observations completed and archived</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-white shrink-0" />
                          <span>2 to 6 members per team</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-white shrink-0" />
                          <span>Share invite code with teammates</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* FORM TEAM MODAL */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border font-sans">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <PlusCircle className="size-4 text-primary" />
              <span>Form a Team</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Create a new team for <strong className="text-foreground">{event.title}</strong> (
              {event.code}).
            </DialogDescription>
          </DialogHeader>

          {createError && (
            <div className="p-2.5 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-xs font-medium">
              Error: {createError}
            </div>
          )}

          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">Team Name</label>
              <Input
                type="text"
                required
                placeholder="e.g. Orion Hunters, Team Kepler"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="h-9 text-xs bg-background font-sans"
              />
            </div>

            <div className="text-xs text-muted-foreground p-3 rounded-lg border border-border bg-muted/40 space-y-1.5">
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3.5 text-[#10b981] shrink-0 mt-0.5" />
                <span>
                  You will be the <strong>Team Leader</strong>.
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3.5 text-[#10b981] shrink-0 mt-0.5" />
                <span>
                  An <strong>invite code</strong> will be generated for your teammates.
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3.5 text-[#10b981] shrink-0 mt-0.5" />
                <span>Teams have 2 to {event.maxTeamSize || 6} members.</span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateModalOpen(false)}
                disabled={createLoading}
                className="text-xs shadow-arcade-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={createLoading || !teamName.trim()}
                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold text-xs shadow-arcade-primary"
              >
                {createLoading ? "Creating..." : "Create Team"}
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
              <span>Join a Team</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter the invite code from your team leader for{" "}
              <strong className="text-foreground">{event.title}</strong>.
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
                Team Invite Code
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
                className="text-xs shadow-arcade-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={joinLoading || !joinCode.trim()}
                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold text-xs shadow-arcade-primary"
              >
                {joinLoading ? "Joining..." : "Join Team"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
