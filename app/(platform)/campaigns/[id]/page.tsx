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
  Sparkles,
  FileText,
  Layers,
  Circle,
  Pin,
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

function getPhaseStatus(startDateStr: string, endDateStr: string) {
  const now = new Date().getTime();
  const start = new Date(startDateStr).getTime();
  const end = new Date(endDateStr).getTime();

  if (now < start) return "UPCOMING";
  if (now >= start && now <= end) return "ACTIVE";
  return "COMPLETED";
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
        <div className="text-sm font-semibold text-foreground">Loading campaign details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="w-full py-20 text-center space-y-4 font-sans">
        <div className="text-sm text-muted-foreground">Campaign could not be found.</div>
        <Link href="/campaigns">
          <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
            <ArrowLeft className="size-4" />
            <span>Back to Campaigns</span>
          </Button>
        </Link>
      </div>
    );
  }

  const regInfo = getRegistrationDeadlineInfo(event.regEnd, event.startDate);
  const squadCount = event._count?.teams || event.teams?.length || 0;

  // Timeline Phases
  const phases = [
    {
      step: 1,
      name: "Registration Period",
      start: event.regStart,
      end: event.regEnd,
      status: getPhaseStatus(event.regStart, event.regEnd),
      description: "Sign up and create your researcher profile. Squad leaders establish rosters and generate private invite codes.",
    },
    {
      step: 2,
      name: "Squad Formation & Matching",
      start: event.teamFormationStart || event.regStart,
      end: event.teamFormationEnd || event.startDate,
      status: getPhaseStatus(event.teamFormationStart || event.regStart, event.teamFormationEnd || event.startDate),
      description: "Recruit 2 to 6 teammates or request solo matchmaking to finalize your squad roster before observation starts.",
    },
    {
      step: 3,
      name: "Telescope Observation & Analysis",
      start: event.startDate,
      end: event.endDate,
      status: getPhaseStatus(event.startDate, event.endDate),
      description: "Official survey telescope FITS image sets released. Squads blink image sets and measure astrometry to discover moving asteroids.",
    },
    {
      step: 4,
      name: "Astrometry Discovery Report",
      start: event.submissionStart || event.startDate,
      end: event.submissionEnd || event.endDate,
      status: getPhaseStatus(event.submissionStart || event.startDate, event.submissionEnd || event.endDate),
      description: "Validate celestial coordinates and submit final MPC 80-column discovery report files for verification.",
    },
  ];

  return (
    <div className="w-full space-y-6 font-sans max-w-6xl mx-auto py-2">
      {/* 1. TOP BREADCRUMB NAVIGATION */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Campaigns</span>
        </Link>

        <span className="text-xs font-mono font-bold text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
          {event.code}
        </span>
      </div>

      {/* 2. MAIN 2-COLUMN LAYOUT: CONTENT ON LEFT, STICKY YELLOW ACTION CARD ON RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* === LEFT COLUMN: EMBEDDED CAMPAIGN CONTENT & VERTICAL TIMELINE (8 COLS) === */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header & Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {event.status === "ACTIVE" ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] text-xs font-bold">
                  <div className="size-2 rounded-full bg-[#10b981] animate-pulse" />
                  <span>Active Observation</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted border border-border text-muted-foreground text-xs font-mono">
                  <span>{event.status}</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              {event.title}
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {event.description || "International Astronomical Search Collaboration campaign for astrometric asteroid discovery."}
            </p>
          </div>

          {/* Quick Metrics Bar Embedded in Background */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl border border-border bg-muted/15">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-sans">
                Observation Window
              </div>
              <div className="text-sm font-bold text-foreground font-mono mt-1">
                {new Date(event.startDate).toLocaleDateString()} &ndash; {new Date(event.endDate).toLocaleDateString()}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-muted/15">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-sans">
                Registered Squads
              </div>
              <div className="text-sm font-bold text-foreground font-mono mt-1 flex items-center justify-between">
                <span>{squadCount} Teams Formed</span>
                <Link
                  href={`/teams?eventId=${event.id}`}
                  className="text-xs text-primary font-sans hover:underline inline-flex items-center gap-1"
                >
                  <span>Explore</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Detailed Vertical Milestone Timeline */}
          <div className="space-y-5 pt-4 border-t border-border">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                <span>Campaign Schedule &amp; Milestones</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Chronological phases from initial sign-up to discovery verification.
              </p>
            </div>

            {/* Vertical Stepper Embedded in Canvas */}
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
              {phases.map((phase) => {
                const isLive = phase.status === "ACTIVE";
                const isDone = phase.status === "COMPLETED";

                return (
                  <div key={phase.step} className="relative group">
                    {/* Step Circle */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-0.5 size-6 sm:size-7 rounded-full flex items-center justify-center text-[11px] font-bold font-mono transition-transform ${
                        isLive
                          ? "bg-[#8b5cf6] text-white ring-4 ring-[#8b5cf6]/20 shadow-xs"
                          : isDone
                          ? "bg-[#10b981] text-white"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="size-3.5" /> : phase.step}
                    </div>

                    {/* Step Content */}
                    <div className="p-4 rounded-xl border border-border/70 bg-muted/15 space-y-1.5 hover:border-border transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground">
                            Phase {phase.step}: {phase.name}
                          </h3>
                          {isLive && (
                            <span className="text-[10px] font-bold text-white bg-[#8b5cf6] px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Live Now
                            </span>
                          )}
                          {isDone && (
                            <span className="text-[10px] font-semibold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded">
                              Completed
                            </span>
                          )}
                        </div>

                        {/* Phase Dates */}
                        <div className="text-xs font-mono text-muted-foreground">
                          {new Date(phase.start).toLocaleDateString("en-US", { month: "short", day: "numeric" })} &ndash; {new Date(phase.end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {phase.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN: STICKY SOLID PURPLE ACTION & SQUAD BOX (4 COLS) === */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
          {/* Solid Electric Violet Highlight Card (No Outline, 3D Theme Shadow) */}
          <div className="relative rounded-2xl p-5 space-y-4 bg-[#8b5cf6] dark:bg-[#7c3aed] text-white shadow-[0_4px_0_0_#6d28d9] dark:shadow-[0_4px_0_0_#5b21b6] transition-all">
            {/* Top Tag */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider">
                <Pin className="size-3 text-white" />
                <span>Squad Action</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-white/90">
                {event.code}
              </span>
            </div>

            {/* Registration Deadline Alert Inside Purple Box */}
            <div className="p-3 rounded-xl bg-black/20 border border-white/10 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                <Clock className="size-3.5 text-white" />
                <span>Registration Deadline</span>
              </div>
              <div className="text-base font-extrabold text-white font-mono">
                {regInfo.text}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
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
                className="w-full h-10 text-xs font-extrabold gap-2 cursor-pointer bg-white hover:bg-white/95 text-[#6d28d9] shadow-sm border-0"
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
                className="w-full h-10 text-xs font-bold gap-2 cursor-pointer border-0 bg-white/15 hover:bg-white/25 text-white"
              >
                <KeyRound className="size-4 text-white" />
                <span>Join with Code</span>
              </Button>

              <Link href={`/teams?eventId=${event.id}`} className="block w-full">
                <Button
                  variant="ghost"
                  className="w-full h-9 text-xs font-semibold gap-1.5 cursor-pointer text-white/90 hover:bg-white/15 hover:text-white"
                >
                  <Users className="size-3.5" />
                  <span>View Joined Teams ({squadCount})</span>
                </Button>
              </Link>
            </div>

            {/* Quick Squad Guidelines */}
            <div className="pt-2 border-t border-white/20 text-[11px] text-white/85 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-white">
                <CheckCircle2 className="size-3.5 text-white shrink-0" />
                <span>2 to 6 researchers per squad</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-white">
                <CheckCircle2 className="size-3.5 text-white shrink-0" />
                <span>Share invite codes with teammates</span>
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
              <span>Form a Research Squad</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Registering a new squad for <strong className="text-foreground">{event.title}</strong> ({event.code}).
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
                placeholder="e.g. Orion Asteroid Hunters"
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

      {/* JOIN BY CODE MODAL */}
      <Dialog open={joinModalOpen} onOpenChange={setJoinModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border font-sans">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <KeyRound className="size-4 text-primary" />
              <span>Join a Research Squad</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter the private invite code provided by your squad leader for <strong className="text-foreground">{event.title}</strong>.
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
