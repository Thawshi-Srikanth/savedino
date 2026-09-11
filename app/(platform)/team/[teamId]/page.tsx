"use client";

import React, { useEffect, useState, use, useMemo } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { getTeamContextPermissions, isOrganizer, isAdmin } from "@/lib/rbac";
import { parseMpcReport } from "@/lib/mpc-parser";
import { isRegistrationClosed } from "@/lib/campaign-utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DinoLoading } from "@/components/dino-loading";
import { useMinimumLoading } from "@/hooks/use-minimum-loading";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Users,
  Copy,
  Check,
  Search,
  Plus,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  Crown,
  Settings,
  UserCheck,
  UserX,
  UserMinus,
  FileText,
  Telescope,
  RotateCw,
  Mail,
  Globe,
  Building2,
  AlertCircle,
  Inbox,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  role: string;
  createdAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
    institution?: string;
    country?: string;
  };
}

interface ImageSetItem {
  id: string;
  setCode: string;
  fitsUrl?: string | null;
  status:
    | "UNASSIGNED"
    | "CLAIM_REQUESTED"
    | "IN_PROGRESS"
    | "PENDING_APPROVAL"
    | "SUBMITTED"
    | "PENDING"
    | "CLAIMED"
    | "REPORTED"
    | "CLEAN";
  isClean?: boolean;
  mpcReportText?: string | null;
  submittedAt?: string | null;
  claimedByUser?: {
    id: string;
    name: string;
    email: string;
    institution?: string;
  } | null;
  candidates: Array<{
    id: string;
    candidateCode: string;
    ra: string;
    dec: string;
    magnitude: number;
    status: string;
    observationCount?: number;
    speedArcsecPerHour?: number | null;
  }>;
}

interface JoinRequestItem {
  id: string;
  message?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    institution?: string;
    country?: string;
  };
  alreadyJoinedSquad?: {
    teamId: string;
    teamName: string;
    isThisTeam: boolean;
  } | null;
}

interface TeamData {
  id: string;
  name: string;
  inviteCode?: string | null;
  status: string;
  leaderId: string;
  isRecruiting: boolean;
  recruitmentNotes?: string;
  disqualificationReason?: string;
  event: {
    id: string;
    title: string;
    code: string;
    regStart?: string;
    regEnd?: string;
    teamFormationStart?: string;
    teamFormationEnd?: string;
    startDate: string;
    endDate: string;
    status: string;
    maxTeamSize?: number;
  };
  members: TeamMember[];
}

export default function TeamWorkspacePage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = use(params);
  const { data: session } = useSession();

  const [team, setTeam] = useState<TeamData | null>(null);
  const [imageSets, setImageSets] = useState<ImageSetItem[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const isDisplayLoading = useMinimumLoading(loading, 1000);
  const [copied, setCopied] = useState<boolean>(false);

  // Active workspace tab
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<string>("imagesets");

  // Filter & Search for Image Sets
  const [imageSetTab, setImageSetTab] = useState<
    "ALL" | "UNASSIGNED" | "CLAIM_REQUESTED" | "IN_PROGRESS" | "PENDING_APPROVAL" | "SUBMITTED"
  >("ALL");
  const [setSearch, setSetSearch] = useState<string>("");

  // Leader Assign Modal State
  const [assignModalOpen, setAssignModalOpen] = useState<boolean>(false);
  const [selectedSetForAssign, setSelectedSetForAssign] = useState<ImageSetItem | null>(null);
  const [selectedMemberIdForAssign, setSelectedMemberIdForAssign] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  // Filter & Search for Join Requests
  const [requestSearch, setRequestSearch] = useState<string>("");
  const [requestStatusFilter, setRequestStatusFilter] = useState<
    "ALL" | "PENDING" | "ACCEPTED" | "REJECTED"
  >("ALL");
  const [requestPage, setRequestPage] = useState<number>(1);
  const REQUESTS_PER_PAGE = 8;

  // Recruitment Settings Form
  const [isRecruiting, setIsRecruiting] = useState<boolean>(true);
  const [recruitmentNotes, setRecruitmentNotes] = useState<string>("");
  const [recruitLoading, setRecruitLoading] = useState<boolean>(false);
  const [rotatingCode, setRotatingCode] = useState<boolean>(false);

  // Bulk Ingest Modal
  const [showIngestModal, setShowIngestModal] = useState<boolean>(false);
  const [bulkText, setBulkText] = useState<string>("");
  const [ingestLoading, setIngestLoading] = useState<boolean>(false);

  // MPC Upload Modal
  const [activeSetForReport, setActiveSetForReport] = useState<ImageSetItem | null>(null);
  const [mpcText, setMpcText] = useState<string>("");
  const [reportLoading, setReportLoading] = useState<boolean>(false);

  // Leader Submission Review Modal
  const [reviewingSet, setReviewingSet] = useState<ImageSetItem | null>(null);
  const [reviewActionLoading, setReviewActionLoading] = useState<boolean>(false);

  // Action Loading state for request accept/decline
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  // Member Removal State
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [removingMember, setRemovingMember] = useState<boolean>(false);

  // Access Restriction State
  const [accessDeniedError, setAccessDeniedError] = useState<string | null>(null);

  const fetchTeamData = async () => {
    try {
      const [setsRes, teamRes, reqRes] = await Promise.all([
        fetch(`/api/teams/${teamId}/image-sets`, { cache: "no-store" }),
        fetch(`/api/teams/${teamId}`, { cache: "no-store" }),
        fetch(`/api/teams/${teamId}/requests`, { cache: "no-store" }),
      ]);

      const teamData = await teamRes.json();
      if (!teamData.success) {
        setAccessDeniedError(
          teamData.error || "Access denied. You are not a member of this squad."
        );
        setLoading(false);
        return;
      }

      setAccessDeniedError(null);
      setTeam(teamData.team);
      setIsRecruiting(teamData.team.isRecruiting ?? true);
      setRecruitmentNotes(teamData.team.recruitmentNotes || "");

      const setsData = await setsRes.json();
      if (setsData.success) {
        setImageSets(setsData.imageSets || []);
      }

      const reqData = await reqRes.json();
      if (reqData.success) {
        setJoinRequests(reqData.requests || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load squad workspace");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [teamId]);

  const handleCopyInvite = async () => {
    if (!team?.inviteCode) {
      toast.error("Invite code not available");
      return;
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(team.inviteCode);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = team.inviteCode;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success(`Invite code ${team.inviteCode} copied!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy invite failed:", err);
      toast.error("Failed to copy code to clipboard");
    }
  };

  const handleRotateInviteCode = async () => {
    if (
      !confirm(
        "Are you sure you want to rotate the invite code? The old invite code will stop working."
      )
    ) {
      return;
    }
    setRotatingCode(true);
    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rotateInviteCode: true }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("New invite code generated!");
        fetchTeamData();
      } else {
        toast.error(data.error || "Failed to rotate invite code");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setRotatingCode(false);
    }
  };

  const handleSaveRecruitmentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecruitLoading(true);

    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isRecruiting,
          recruitmentNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Squad recruitment settings saved!");
        fetchTeamData();
      } else {
        toast.error(data.error || "Failed to update recruitment settings");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setRecruitLoading(false);
    }
  };

  const handleRespondToRequest = async (requestId: string, action: "ACCEPT" | "REJECT") => {
    setProcessingRequestId(requestId);
    try {
      const res = await fetch(`/api/teams/${teamId}/requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === "ACCEPT") {
          toast.success("Accepted citizen into squad!");
        } else {
          toast.info("Declined join request.");
        }
        fetchTeamData();
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleClaimAction = async (
    setId: string,
    action?: "REQUEST_CLAIM" | "APPROVE_CLAIM" | "REJECT_CLAIM" | "ASSIGN" | "RELEASE",
    targetUserId?: string
  ) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/image-sets/${setId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, targetUserId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Action updated successfully.");
        fetchTeamData();
      } else {
        toast.error(data.error || "Failed to process image set action.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    }
  };

  const handleBulkIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIngestLoading(true);

    try {
      const res = await fetch(`/api/teams/${teamId}/image-sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: bulkText }),
      });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.error || "Failed to import sets");
      } else {
        toast.success(`Imported ${data.totalAdded} image set(s) successfully!`);
        setBulkText("");
        fetchTeamData();
        setShowIngestModal(false);
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIngestLoading(false);
    }
  };

  const handleSubmitMpcReport = async (markCleanOnly = false) => {
    if (!activeSetForReport) return;
    setReportLoading(true);

    try {
      const res = await fetch(`/api/teams/${teamId}/image-sets/${activeSetForReport.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportText: mpcText,
          markClean: markCleanOnly,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.error || "Failed to submit report.");
      } else {
        if (data.pendingApproval) {
          toast.success("Report submitted! Awaiting squad leader review & approval.");
        } else if (markCleanOnly) {
          toast.success("Marked image set as clean (no candidates).");
        } else {
          toast.success("MPC observation report submitted and approved!");
        }
        setMpcText("");
        setActiveSetForReport(null);
        fetchTeamData();
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setReportLoading(false);
    }
  };

  const handleLeaderApproveReport = async (setId: string, action: "APPROVE" | "REJECT") => {
    setReviewActionLoading(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/image-sets/${setId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setReviewingSet(null);
        fetchTeamData();
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setRemovingMember(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/members/${memberToRemove.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Member removed from squad");
        setMemberToRemove(null);
        fetchTeamData();
      } else {
        toast.error(data.error || "Failed to remove member");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setRemovingMember(false);
    }
  };

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        setMpcText(content);
      }
    };
    reader.readAsText(file);
  };

  const {
    isMember,
    isLeader,
    isOrganizer: isStaffOrAdmin,
    isObserverMode,
    canManageTeam,
  } = useMemo(() => getTeamContextPermissions(session?.user, team), [session?.user, team]);
  const isAdminUser = isAdmin(session?.user);
  const isAdminRole = isAdminUser;
  const isLeaderOrAdmin = isLeader || isAdminUser;
  const memberCount = team?.members?.length || 0;

  // Check if registration period is closed
  const isRegClosed = team?.event ? isRegistrationClosed(team.event).closed : false;

  // Normalized Status Helper
  const getNormalizedStatus = (status: string) => {
    if (status === "UNASSIGNED" || status === "PENDING") return "UNASSIGNED";
    if (status === "CLAIM_REQUESTED") return "CLAIM_REQUESTED";
    if (status === "IN_PROGRESS" || status === "CLAIMED") return "IN_PROGRESS";
    if (status === "PENDING_APPROVAL") return "PENDING_APPROVAL";
    if (status === "SUBMITTED" || status === "REPORTED" || status === "CLEAN") return "SUBMITTED";
    return status;
  };

  // Filtered Image Sets
  const filteredSets = useMemo(() => {
    return imageSets.filter((s) => {
      const normalized = getNormalizedStatus(s.status);
      const matchesTab = imageSetTab === "ALL" || normalized === imageSetTab;
      const matchesSearch =
        !setSearch.trim() ||
        s.setCode.toLowerCase().includes(setSearch.toLowerCase()) ||
        (s.claimedByUser?.name &&
          s.claimedByUser.name.toLowerCase().includes(setSearch.toLowerCase())) ||
        s.candidates.some((c) => c.candidateCode.toLowerCase().includes(setSearch.toLowerCase()));
      return matchesTab && matchesSearch;
    });
  }, [imageSets, imageSetTab, setSearch]);

  // Filtered Join Requests
  const filteredRequests = useMemo(() => {
    return joinRequests.filter((r) => {
      const matchesStatus = requestStatusFilter === "ALL" || r.status === requestStatusFilter;
      const q = requestSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.user.name.toLowerCase().includes(q) ||
        r.user.email.toLowerCase().includes(q) ||
        (r.user.institution && r.user.institution.toLowerCase().includes(q)) ||
        (r.user.country && r.user.country.toLowerCase().includes(q)) ||
        (r.message && r.message.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [joinRequests, requestStatusFilter, requestSearch]);

  const totalRequestPages = Math.max(1, Math.ceil(filteredRequests.length / REQUESTS_PER_PAGE));
  const paginatedRequests = filteredRequests.slice(
    (requestPage - 1) * REQUESTS_PER_PAGE,
    requestPage * REQUESTS_PER_PAGE
  );

  const parsedPreview = mpcText ? parseMpcReport(mpcText) : null;
  const reviewingPreview = reviewingSet?.mpcReportText
    ? parseMpcReport(reviewingSet.mpcReportText)
    : null;

  const pendingRequests = joinRequests.filter((r) => r.status === "PENDING");
  const pendingClaimRequests = imageSets.filter(
    (s) => getNormalizedStatus(s.status) === "CLAIM_REQUESTED"
  );
  const awaitingApprovalSets = imageSets.filter(
    (s) => getNormalizedStatus(s.status) === "PENDING_APPROVAL"
  );
  const approvedSets = imageSets.filter((s) => getNormalizedStatus(s.status) === "SUBMITTED");
  const reportedCandidatesCount = imageSets.reduce(
    (acc, s) => acc + (s.candidates?.length || 0),
    0
  );

  if (isDisplayLoading) {
    return <DinoLoading size="lg" text="Loading squad workspace..." fullScreen />;
  }

  if (accessDeniedError) {
    return (
      <div className="w-full max-w-lg mx-auto py-16 px-4 select-none">
        <Card className="p-6 sm:p-8 bg-card border-border rounded-2xl shadow-sm text-center space-y-5">
          <div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <ShieldAlert className="size-6" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">Squad Workspace Restricted</h1>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              {accessDeniedError ||
                "You must be an active member of this squad to view its workspace. If you were previously a member, you may have been removed or left the squad."}
            </p>
          </div>

          <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Button
              asChild
              variant="default"
              className="w-full sm:w-auto h-9 text-xs font-bold bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl shadow-arcade-primary"
            >
              <Link href="/teams">
                <Users className="size-3.5 mr-1.5" />
                <span>Browse Squads Directory</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto h-9 text-xs font-bold rounded-xl shadow-arcade"
            >
              <Link href="/profile">
                <span>View My Profile</span>
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Campaign Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/teams"
          className="inline-flex items-center gap-1.5 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Squads Directory</span>
        </Link>

        {team?.event && (
          <Link
            href={`/campaigns/${team.event.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            <Telescope className="size-3.5 text-primary" />
            <span>
              Campaign:{" "}
              <strong className="text-foreground font-semibold">{team.event.title}</strong> (
              {team.event.code})
            </span>
          </Link>
        )}
      </div>

      {/* Organizer Read-Only Mode Banner */}
      {isObserverMode && (
        <div className="p-3.5 rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-800 dark:text-violet-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs font-sans">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-[#8b5cf6] text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-foreground">Organizer Read-Only Mode:</span>{" "}
              <span className="text-muted-foreground">
                You are inspecting this squad workspace with administrator privileges. All
                participant actions are in read-only mode.
              </span>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-8 text-xs font-bold shrink-0 rounded-xl border-violet-500/30 hover:bg-violet-500/20"
          >
            <Link href="/admin?tab=teams">Open Admin Console</Link>
          </Button>
        </div>
      )}

      {/* Disqualification / Disabled Banner */}
      {team?.status === "DISQUALIFIED" && (
        <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-3 shadow-sm">
          <AlertTriangle className="size-5 shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1">
            <div className="font-bold text-sm">Squad Disabled by Platform Administration</div>
            <p className="text-xs text-destructive/90 leading-relaxed font-sans">
              This squad has been disabled by platform administrators. Recruitment, invitations, and
              roster modifications are locked.
            </p>
            {team.disqualificationReason ? (
              <div className="mt-1.5 text-xs font-sans bg-background text-foreground p-3 rounded-xl border border-destructive/30 space-y-0.5">
                <span className="font-bold block text-[11px] uppercase tracking-wider text-destructive">
                  Reason:
                </span>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {team.disqualificationReason}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Squad Header Summary Card */}
      <Card className="p-5 sm:p-6 bg-card border-border space-y-4 shadow-arcade rounded-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-[#8b5cf6] text-white font-mono font-bold text-[10px] border-0 shadow-arcade-primary">
                {team?.event?.code || "CAMPAIGN"}
              </Badge>

              {team?.status === "DISQUALIFIED" ? (
                <Badge className="bg-[#ef4444] text-white font-bold text-[10px] border-0 shadow-arcade-destructive">
                  Disabled
                </Badge>
              ) : (
                <Badge className="bg-slate-700 text-white font-bold text-[10px] border-0 shadow-arcade">
                  {memberCount}/{team?.event?.maxTeamSize || 6} Members
                </Badge>
              )}

              {team?.status === "DISQUALIFIED" ? (
                <Badge className="bg-[#ef4444] text-white font-bold text-[10px] border-0 shadow-arcade-destructive">
                  Recruitment Locked
                </Badge>
              ) : team?.isRecruiting ? (
                <Badge className="bg-[#10b981] text-white font-bold text-[10px] border-0 shadow-arcade-emerald">
                  Recruiting Open
                </Badge>
              ) : (
                <Badge className="bg-slate-600 text-white font-bold text-[10px] border-0 shadow-arcade">
                  Recruiting Closed
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground break-words">
              {team?.name || "Squad Workspace"}
            </h1>
          </div>

          {/* Quick Invite Code (Leader/Admin only) */}
          {isLeaderOrAdmin && team?.inviteCode && (
            <div className="flex flex-wrap items-center gap-2.5">
              <div
                onClick={team?.status !== "DISQUALIFIED" ? handleCopyInvite : undefined}
                className="flex items-center gap-2 bg-background hover:bg-muted/50 transition-colors border border-border px-3 py-1.5 rounded-xl cursor-pointer select-none shadow-arcade active:translate-y-0.5"
                title={
                  team?.status === "DISQUALIFIED"
                    ? "Invite code deactivated"
                    : "Click to copy invite code"
                }
              >
                <div>
                  <span className="block text-[9px] font-mono text-muted-foreground uppercase">
                    Invite Code
                  </span>
                  <span className="text-xs font-mono font-bold text-foreground tracking-wider">
                    {team.inviteCode}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  disabled={team?.status === "DISQUALIFIED"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyInvite();
                  }}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
                  title="Copy Invite Code"
                >
                  {copied ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Clean Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/60">
          <div className="p-3 rounded-xl bg-background border border-border">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              Squad Roster
            </span>
            <span className="text-sm font-bold text-foreground">
              {memberCount} / {team?.event?.maxTeamSize || 6} Members
            </span>
          </div>
          <div className="p-3 rounded-xl bg-background border border-border">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              Image Sets
            </span>
            <span className="text-sm font-bold text-foreground">{imageSets.length} Total</span>
          </div>
          <div className="p-3 rounded-xl bg-background border border-border">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              Approved Sets
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {approvedSets.length} Finished
            </span>
          </div>
          <div className="p-3 rounded-xl bg-background border border-border">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              Discoveries
            </span>
            <span className="text-sm font-bold text-[#8b5cf6]">
              {reportedCandidatesCount} Candidates
            </span>
          </div>
        </div>
      </Card>

      {/* Main Workspace Navigation Tabs */}
      <Tabs
        value={activeWorkspaceTab}
        onValueChange={setActiveWorkspaceTab}
        className="w-full space-y-6"
      >
        {/* Modern Tabs Bar matching Admin & Profile headers */}
        <div className="border-b border-border">
          <div className="overflow-x-auto scrollbar-none">
            <TabsList className="h-10 bg-transparent p-0 gap-1 sm:gap-2 border-b-0 w-max sm:w-auto inline-flex justify-start">
              <TabsTrigger
                value="imagesets"
                className="h-10 px-3 sm:px-4 text-xs font-semibold gap-1.5 sm:gap-2 cursor-pointer rounded-t-xl rounded-b-none border-b-2 border-transparent transition-all data-[state=active]:border-b-[#8b5cf6] data-[state=active]:text-foreground data-[state=active]:bg-card data-[state=active]:font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 shadow-none shrink-0"
              >
                <Telescope className="size-3.5 shrink-0" />
                <span>Image Sets</span>
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-1.5 py-0 font-mono font-semibold transition-colors ${
                    activeWorkspaceTab === "imagesets"
                      ? "bg-[#8b5cf6] text-white shadow-arcade-primary"
                      : "text-muted-foreground bg-muted"
                  }`}
                >
                  {imageSets.length}
                </Badge>
                {pendingClaimRequests.length > 0 && isLeaderOrAdmin && (
                  <Badge className="bg-[#f59e0b] text-slate-950 text-[10px] px-1.5 py-0 font-bold border-0 shadow-arcade-amber">
                    {pendingClaimRequests.length} Claim{pendingClaimRequests.length > 1 ? "s" : ""}
                  </Badge>
                )}
                {awaitingApprovalSets.length > 0 && isLeaderOrAdmin && (
                  <Badge className="bg-[#f59e0b] text-slate-950 text-[10px] px-1.5 py-0 font-bold border-0 shadow-arcade-amber">
                    {awaitingApprovalSets.length} to Review
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="members"
                className="h-10 px-3 sm:px-4 text-xs font-semibold gap-1.5 sm:gap-2 cursor-pointer rounded-t-xl rounded-b-none border-b-2 border-transparent transition-all data-[state=active]:border-b-[#8b5cf6] data-[state=active]:text-foreground data-[state=active]:bg-card data-[state=active]:font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 shadow-none shrink-0"
              >
                <Users className="size-3.5 shrink-0" />
                <span>Squad Roster</span>
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-1.5 py-0 font-mono font-semibold transition-colors ${
                    activeWorkspaceTab === "members"
                      ? "bg-[#8b5cf6] text-white shadow-arcade-primary"
                      : "text-muted-foreground bg-muted"
                  }`}
                >
                  {memberCount}/{team?.event?.maxTeamSize || 6}
                </Badge>
              </TabsTrigger>

              {/* Join Requests: Leader/Admin Only */}
              {isLeaderOrAdmin && (
                <TabsTrigger
                  value="requests"
                  className="h-10 px-3 sm:px-4 text-xs font-semibold gap-1.5 sm:gap-2 cursor-pointer rounded-t-xl rounded-b-none border-b-2 border-transparent transition-all data-[state=active]:border-b-[#8b5cf6] data-[state=active]:text-foreground data-[state=active]:bg-card data-[state=active]:font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 shadow-none shrink-0"
                >
                  <Inbox className="size-3.5 shrink-0" />
                  <span>Join Requests</span>
                  {pendingRequests.length > 0 ? (
                    <Badge className="bg-[#f59e0b] text-slate-950 text-[10px] px-1.5 py-0 font-bold border-0 shadow-arcade-amber">
                      {pendingRequests.length} New
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 font-mono font-semibold text-muted-foreground bg-muted"
                    >
                      0
                    </Badge>
                  )}
                </TabsTrigger>
              )}

              {/* Squad Settings: Leader/Admin Only */}
              {isLeaderOrAdmin && (
                <TabsTrigger
                  value="settings"
                  className="h-10 px-3 sm:px-4 text-xs font-semibold gap-1.5 sm:gap-2 cursor-pointer rounded-t-xl rounded-b-none border-b-2 border-transparent transition-all data-[state=active]:border-b-[#8b5cf6] data-[state=active]:text-foreground data-[state=active]:bg-card data-[state=active]:font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 shadow-none shrink-0"
                >
                  <Settings className="size-3.5 shrink-0" />
                  <span>Squad Settings</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: IMAGE SETS (ASTEROID SEARCH)                                       */}
        {/* ========================================================================= */}
        <TabsContent value="imagesets" className="space-y-5">
          <Card className="p-5 sm:p-6 bg-card border-border shadow-arcade rounded-2xl space-y-5">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-foreground">
                  Telescope Image Sets &amp; Observation Reports
                </h2>
                <p className="text-xs text-muted-foreground">
                  Request telescope batch sets, inspect for moving asteroids, and submit reports for
                  squad leader approval.
                </p>
              </div>

              {/* Only Leader/Admin can Import Image Sets */}
              {isLeaderOrAdmin && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowIngestModal(true)}
                  className="h-8.5 px-3.5 text-xs font-bold gap-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl shadow-arcade-primary active:translate-y-0.5"
                >
                  <Plus className="size-3.5" />
                  <span>Import Image Sets</span>
                </Button>
              )}
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setImageSetTab("ALL")}
                  className={`text-xs px-3 py-1.5 rounded-xl transition-all font-medium cursor-pointer ${
                    imageSetTab === "ALL"
                      ? "bg-primary text-primary-foreground font-bold shadow-arcade-primary"
                      : "bg-background text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  All ({imageSets.length})
                </button>

                <button
                  type="button"
                  onClick={() => setImageSetTab("UNASSIGNED")}
                  className={`text-xs px-3 py-1.5 rounded-xl transition-all font-medium cursor-pointer ${
                    imageSetTab === "UNASSIGNED"
                      ? "bg-primary text-primary-foreground font-bold shadow-arcade-primary"
                      : "bg-background text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  To Analyze (
                  {imageSets.filter((s) => getNormalizedStatus(s.status) === "UNASSIGNED").length})
                </button>

                <button
                  type="button"
                  onClick={() => setImageSetTab("CLAIM_REQUESTED")}
                  className={`text-xs px-3 py-1.5 rounded-xl transition-all font-medium cursor-pointer ${
                    imageSetTab === "CLAIM_REQUESTED"
                      ? "bg-primary text-primary-foreground font-bold shadow-arcade-primary"
                      : "bg-background text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  Claim Requests ({pendingClaimRequests.length})
                </button>

                <button
                  type="button"
                  onClick={() => setImageSetTab("IN_PROGRESS")}
                  className={`text-xs px-3 py-1.5 rounded-xl transition-all font-medium cursor-pointer ${
                    imageSetTab === "IN_PROGRESS"
                      ? "bg-primary text-primary-foreground font-bold shadow-arcade-primary"
                      : "bg-background text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  In Analysis (
                  {imageSets.filter((s) => getNormalizedStatus(s.status) === "IN_PROGRESS").length})
                </button>

                <button
                  type="button"
                  onClick={() => setImageSetTab("PENDING_APPROVAL")}
                  className={`text-xs px-3 py-1.5 rounded-xl transition-all font-medium cursor-pointer ${
                    imageSetTab === "PENDING_APPROVAL"
                      ? "bg-primary text-primary-foreground font-bold shadow-arcade-primary"
                      : "bg-background text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  In Review ({awaitingApprovalSets.length})
                </button>

                <button
                  type="button"
                  onClick={() => setImageSetTab("SUBMITTED")}
                  className={`text-xs px-3 py-1.5 rounded-xl transition-all font-medium cursor-pointer ${
                    imageSetTab === "SUBMITTED"
                      ? "bg-primary text-primary-foreground font-bold shadow-arcade-primary"
                      : "bg-background text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  Approved ({approvedSets.length})
                </button>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search set or analyst..."
                  value={setSearch}
                  onChange={(e) => setSetSearch(e.target.value)}
                  className="h-8.5 pl-8 text-xs bg-background rounded-xl"
                />
              </div>
            </div>

            {/* Sets Grid */}
            {imageSets.length === 0 ? (
              <div className="py-14 text-center border border-dashed border-border rounded-2xl p-8 text-xs text-muted-foreground space-y-3">
                <FileText className="size-8 mx-auto text-muted-foreground/40" />
                <div className="space-y-1">
                  <div className="font-bold text-sm text-foreground">No image sets added yet</div>
                  <p>
                    {isLeaderOrAdmin
                      ? 'Click "Import Image Sets" above to add telescope batches for this campaign.'
                      : "The squad leader has not imported any image sets for this campaign yet."}
                  </p>
                </div>
                {isLeaderOrAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowIngestModal(true)}
                    className="h-8 text-xs font-bold rounded-xl"
                  >
                    Import First Batch
                  </Button>
                )}
              </div>
            ) : filteredSets.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                No image sets match the active filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {filteredSets.map((s) => {
                  const normalized = getNormalizedStatus(s.status);
                  const isClaimedByMe = s.claimedByUser?.id === session?.user?.id;

                  return (
                    <Card
                      key={s.id}
                      className="p-4 bg-background border-border hover:border-primary/40 transition-colors flex flex-col justify-between space-y-3.5 rounded-2xl shadow-xs"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-bold text-sm text-foreground">
                            {s.setCode}
                          </span>

                          {normalized === "UNASSIGNED" ? (
                            <Badge className="bg-slate-600 text-white font-mono font-bold text-[10px] border-0 shadow-arcade">
                              To Analyze
                            </Badge>
                          ) : normalized === "CLAIM_REQUESTED" ? (
                            <Badge className="bg-[#f59e0b] text-slate-950 font-mono font-bold text-[10px] border-0 shadow-arcade-amber">
                              Claim Requested
                            </Badge>
                          ) : normalized === "IN_PROGRESS" ? (
                            <Badge className="bg-[#0284c7] text-white font-mono font-bold text-[10px] border-0 shadow-arcade">
                              In Analysis
                            </Badge>
                          ) : normalized === "PENDING_APPROVAL" ? (
                            <Badge className="bg-[#f59e0b] text-slate-950 font-mono font-bold text-[10px] border-0 shadow-arcade-amber">
                              In Review
                            </Badge>
                          ) : s.isClean ? (
                            <Badge className="bg-slate-500 text-white font-mono font-bold text-[10px] border-0 shadow-arcade">
                              Clean (Approved)
                            </Badge>
                          ) : (
                            <Badge className="bg-[#10b981] text-white font-mono font-bold text-[10px] border-0 shadow-arcade-emerald">
                              Approved
                            </Badge>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground min-h-[32px]">
                          {normalized === "CLAIM_REQUESTED" ? (
                            <div className="space-y-1">
                              <div>
                                Requested by:{" "}
                                <strong className="text-foreground">
                                  {s.claimedByUser?.name || "Member"}
                                </strong>
                                {isClaimedByMe && (
                                  <span className="text-primary ml-1 font-semibold">(You)</span>
                                )}
                              </div>
                              <span className="text-[11px] text-[#d97706] font-semibold block">
                                Awaiting Squad Leader Approval
                              </span>
                            </div>
                          ) : normalized === "IN_PROGRESS" ? (
                            <div>
                              Analyst:{" "}
                              <strong className="text-foreground">
                                {s.claimedByUser?.name || "Member"}
                              </strong>
                              {isClaimedByMe && (
                                <span className="text-primary ml-1 font-semibold">(You)</span>
                              )}
                            </div>
                          ) : normalized === "PENDING_APPROVAL" ? (
                            <div className="space-y-1">
                              <div>
                                Submitted by:{" "}
                                <strong className="text-foreground">
                                  {s.claimedByUser?.name || "Member"}
                                </strong>
                              </div>
                              <span className="text-[11px] text-[#d97706] font-semibold block">
                                {s.isClean
                                  ? "Reported Clean (No Asteroids)"
                                  : `${s.candidates.length} Candidate(s) Found`}
                              </span>
                            </div>
                          ) : normalized === "SUBMITTED" ? (
                            <div className="space-y-1">
                              {s.isClean ? (
                                <span className="text-[11px] text-muted-foreground">
                                  Verified clean &bull; No moving objects
                                </span>
                              ) : (
                                <div className="space-y-1">
                                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    {s.candidates.length} candidate(s) approved:
                                  </span>
                                  <div className="flex flex-wrap gap-1">
                                    {s.candidates.map((c) => (
                                      <span
                                        key={c.id}
                                        className="text-[10px] font-mono bg-[#10b981] text-white font-bold px-1.5 py-0.5 rounded shadow-xs"
                                      >
                                        {c.candidateCode}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">
                              Ready for download and blinking
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2.5 border-t border-border/60">
                        {isObserverMode ? (
                          <Button
                            onClick={() => {
                              if (
                                s.mpcReportText ||
                                s.status === "SUBMITTED" ||
                                s.status === "IN_PROGRESS"
                              ) {
                                setActiveSetForReport(s);
                                setMpcText(s.mpcReportText || "");
                              }
                            }}
                            size="sm"
                            variant="outline"
                            disabled={normalized === "UNASSIGNED"}
                            className="w-full h-8 text-xs font-bold rounded-xl"
                          >
                            <span>
                              {normalized === "UNASSIGNED"
                                ? "Unassigned Batch"
                                : normalized === "CLAIM_REQUESTED"
                                  ? "Claim Pending Approval"
                                  : normalized === "SUBMITTED"
                                    ? "Inspect Final Report"
                                    : "Inspect Batch Progress"}
                            </span>
                          </Button>
                        ) : normalized === "UNASSIGNED" ? (
                          isLeaderOrAdmin ? (
                            <div className="flex gap-1.5">
                              <Button
                                onClick={() => handleClaimAction(s.id)}
                                size="sm"
                                variant="default"
                                className="flex-1 h-8 text-xs font-bold bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl shadow-arcade-primary active:translate-y-0.5"
                              >
                                <span>Claim for Self</span>
                              </Button>
                              <Button
                                onClick={() => {
                                  setSelectedSetForAssign(s);
                                  setSelectedMemberIdForAssign(team?.members[0]?.user.id || "");
                                  setAssignModalOpen(true);
                                }}
                                size="sm"
                                variant="outline"
                                className="h-8 px-2.5 text-xs font-bold rounded-xl"
                                title="Assign to Member"
                              >
                                Assign
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleClaimAction(s.id, "REQUEST_CLAIM")}
                              size="sm"
                              variant="outline"
                              className="w-full h-8 text-xs font-bold gap-1 bg-card hover:bg-accent rounded-xl shadow-arcade active:translate-y-0.5"
                            >
                              <span>Request to Claim</span>
                            </Button>
                          )
                        ) : normalized === "CLAIM_REQUESTED" ? (
                          isLeaderOrAdmin ? (
                            <div className="flex gap-1.5">
                              <Button
                                onClick={() => handleClaimAction(s.id, "APPROVE_CLAIM")}
                                size="sm"
                                variant="default"
                                className="flex-1 h-8 text-xs font-bold gap-1 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl shadow-arcade-emerald active:translate-y-0.5"
                              >
                                <Check className="size-3.5" />
                                <span>Approve Claim</span>
                              </Button>
                              <Button
                                onClick={() => handleClaimAction(s.id, "REJECT_CLAIM")}
                                size="sm"
                                variant="outline"
                                className="h-8 px-2.5 text-xs font-bold text-destructive hover:border-destructive/40 rounded-xl"
                              >
                                Decline
                              </Button>
                            </div>
                          ) : isClaimedByMe ? (
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold px-2 py-1 bg-amber-500/10 rounded-lg flex-1 text-center truncate">
                                Awaiting Approval
                              </div>
                              <Button
                                onClick={() => handleClaimAction(s.id, "RELEASE")}
                                size="sm"
                                variant="outline"
                                className="h-8 px-2.5 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl shrink-0"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                              className="w-full h-8 text-xs opacity-60 rounded-xl"
                            >
                              Requested by {s.claimedByUser?.name || "Member"}
                            </Button>
                          )
                        ) : normalized === "IN_PROGRESS" ? (
                          <div className="flex gap-1.5">
                            {(isClaimedByMe || isLeaderOrAdmin) && (
                              <Button
                                onClick={() => {
                                  setActiveSetForReport(s);
                                  setMpcText(s.mpcReportText || "");
                                }}
                                size="sm"
                                variant="default"
                                className="flex-1 h-8 text-xs font-bold bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl shadow-arcade-primary active:translate-y-0.5"
                              >
                                <span>Submit Report</span>
                              </Button>
                            )}
                            {(isClaimedByMe || isLeaderOrAdmin) && (
                              <Button
                                onClick={() => handleClaimAction(s.id, "RELEASE")}
                                size="sm"
                                variant="outline"
                                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-xl"
                                title="Release Set"
                              >
                                Release
                              </Button>
                            )}
                            {!isClaimedByMe && !isLeaderOrAdmin && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled
                                className="w-full h-8 text-xs opacity-60 rounded-xl"
                              >
                                Being Analyzed
                              </Button>
                            )}
                          </div>
                        ) : normalized === "PENDING_APPROVAL" ? (
                          isLeaderOrAdmin ? (
                            <Button
                              onClick={() => setReviewingSet(s)}
                              size="sm"
                              variant="default"
                              className="w-full h-8 text-xs font-bold gap-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl shadow-arcade-primary active:translate-y-0.5"
                            >
                              <Crown className="size-3.5 text-amber-300" />
                              <span>Review Submission</span>
                            </Button>
                          ) : (
                            <div className="w-full text-center py-1.5 px-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-[11px] font-semibold">
                              In Review
                            </div>
                          )
                        ) : (
                          <div className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="size-3.5" />
                            <span>Campaign Logged</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: SQUAD ROSTER & MEMBERS */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="members" className="space-y-5">
          <Card className="p-5 sm:p-6 bg-card border-border shadow-arcade rounded-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div>
                <h2 className="text-lg font-bold text-foreground">Squad Roster &amp; Members</h2>
                <p className="text-xs text-muted-foreground">
                  Citizen scientists and team leaders collaborating on this campaign.
                </p>
              </div>

              {/* Roster Capacity Indicator */}
              {(() => {
                const maxCapacity = team?.event?.maxTeamSize || 6;
                const isFull = memberCount >= maxCapacity;
                const openSlots = Math.max(0, maxCapacity - memberCount);
                return (
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-foreground">
                      {memberCount} of {maxCapacity} Slots Filled
                    </span>
                    <Badge
                      className={
                        isFull
                          ? "bg-slate-700 text-white text-[10px] font-bold border-0"
                          : "bg-[#8b5cf6] text-white text-[10px] font-bold border-0 shadow-arcade-primary"
                      }
                    >
                      {isFull
                        ? "Full Roster"
                        : `${openSlots} Slot${openSlots === 1 ? "" : "s"} Open`}
                    </Badge>
                  </div>
                );
              })()}
            </div>

            {/* Registration Window Information Alert */}
            {isRegClosed && (
              <div className="p-3.5 rounded-xl border border-border bg-muted/40 text-muted-foreground flex items-center gap-2.5 text-xs">
                <Info className="size-4 shrink-0 text-primary" />
                <span>
                  <strong>Campaign Active / Roster Locked:</strong> Member additions and removals
                  are only permitted during the campaign registration and team formation period.
                </span>
              </div>
            )}

            {/* Members Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {team?.members?.map((m, idx) => {
                const isThisMemberLeader = m.role === "LEADER" || m.user.id === team.leaderId;
                const isCurrentUser = m.user.id === session?.user?.id;

                return (
                  <div
                    key={m.id || idx}
                    className="p-4 border border-border rounded-2xl bg-background flex flex-col justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase font-mono">
                          {m.user.name.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                            <span className="break-words">{m.user.name}</span>
                            {isCurrentUser && (
                              <span className="text-[10px] text-primary font-mono">(You)</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                            <Mail className="size-3 shrink-0" />
                            <span>{m.user.email}</span>
                          </div>
                        </div>
                      </div>

                      {isThisMemberLeader ? (
                        <Badge className="bg-[#8b5cf6] text-white font-bold text-[10px] border-0 py-0.5 px-2 gap-1 shrink-0 shadow-arcade-primary">
                          <Crown className="size-3 text-amber-300" />
                          <span>Leader</span>
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-600 text-white font-bold text-[10px] border-0 py-0.5 px-2 shrink-0">
                          Member
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] font-sans">
                      <span className="text-muted-foreground font-mono">
                        {m.createdAt
                          ? `Joined ${new Date(m.createdAt).toLocaleDateString()}`
                          : "Active Squad Member"}
                      </span>

                      {/* Remove Member Button: Leader or Admin only (can't remove self) */}
                      {isLeaderOrAdmin && m.user.id !== team.leaderId && !isObserverMode && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isRegClosed && !isAdminUser}
                          onClick={() => setMemberToRemove(m)}
                          className="h-7 px-2 text-[11px] font-bold text-muted-foreground hover:text-destructive hover:border-destructive/40 rounded-xl gap-1 shrink-0 disabled:opacity-40"
                          title={
                            isRegClosed && !isAdminUser
                              ? "Roster modifications locked after registration ends"
                              : "Remove member from squad"
                          }
                        >
                          <UserMinus className="size-3" />
                          <span>Remove</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Empty Slots Fillers */}
              {(() => {
                const maxCapacity = team?.event?.maxTeamSize || 6;
                const openSlots = Math.max(0, maxCapacity - memberCount);
                if (openSlots <= 0) return null;

                if (openSlots <= 6) {
                  return Array.from({ length: openSlots }).map((_, idx) => (
                    <div
                      key={`empty-${idx}`}
                      className="p-4 border border-dashed border-border/70 rounded-2xl flex flex-col items-center justify-center text-muted-foreground min-h-[110px] space-y-1.5 text-center bg-background/50"
                    >
                      <Users className="size-5 opacity-40" />
                      <span className="text-xs font-bold text-foreground">
                        Open Slot #{memberCount + idx + 1}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {team?.isRecruiting ? "Accepting student applications" : "Awaiting invites"}
                      </span>
                    </div>
                  ));
                }

                // If more than 6 slots are open (e.g. 18 open slots in a 20-person squad)
                return (
                  <>
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div
                        key={`empty-${idx}`}
                        className="p-4 border border-dashed border-border/70 rounded-2xl flex flex-col items-center justify-center text-muted-foreground min-h-[110px] space-y-1.5 text-center bg-background/50"
                      >
                        <Users className="size-5 opacity-40" />
                        <span className="text-xs font-bold text-foreground">
                          Open Slot #{memberCount + idx + 1}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {team?.isRecruiting
                            ? "Accepting student applications"
                            : "Awaiting invites"}
                        </span>
                      </div>
                    ))}
                    <div className="p-4 border border-dashed border-primary/40 bg-primary/5 rounded-2xl flex flex-col items-center justify-center text-center min-h-[110px] space-y-1.5 col-span-1 sm:col-span-2 lg:col-span-1">
                      <div className="size-8 rounded-full bg-[#8b5cf6]/15 text-primary flex items-center justify-center font-bold text-xs font-mono">
                        +{openSlots - 3}
                      </div>
                      <span className="text-xs font-bold text-foreground">
                        +{openSlots - 3} More Open Slots
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        x{openSlots} total open slots ({memberCount}/{maxCapacity} filled)
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Shareable Invite Box in Roster Tab (Leader/Admin Only) */}
            {isLeaderOrAdmin && team?.inviteCode && (
              <div className="p-4 rounded-2xl bg-muted/30 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground">
                    Invite Scientists to Your Squad
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Share this 6-character code with students so they can join directly.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 bg-background border border-border rounded-xl font-mono font-bold text-xs tracking-wider text-foreground">
                    {team.inviteCode}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyInvite}
                    className="h-8 text-xs font-bold gap-1 rounded-xl shadow-arcade active:translate-y-0.5"
                  >
                    {copied ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: JOIN REQUESTS (LEADER / ADMIN ONLY) */}
        {/* ------------------------------------------------------------- */}
        {isLeaderOrAdmin && (
          <TabsContent value="requests" className="space-y-5">
            <Card className="p-5 sm:p-6 bg-card border-border shadow-arcade rounded-2xl space-y-5">
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <span>Student Join Applications</span>
                    {pendingRequests.length > 0 && (
                      <Badge className="bg-[#10b981] text-white text-[10px] font-bold border-0 shadow-arcade-emerald">
                        {pendingRequests.length} Pending
                      </Badge>
                    )}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Review and accept or decline student applications to join your squad.
                  </p>
                </div>

                {/* Status Filter */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setRequestStatusFilter("ALL");
                      setRequestPage(1);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-xl transition-all font-medium cursor-pointer ${
                      requestStatusFilter === "ALL"
                        ? "bg-primary text-primary-foreground font-bold shadow-arcade-primary"
                        : "bg-background text-muted-foreground hover:text-foreground border border-border"
                    }`}
                  >
                    All ({joinRequests.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRequestStatusFilter("PENDING");
                      setRequestPage(1);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-xl transition-all font-medium cursor-pointer ${
                      requestStatusFilter === "PENDING"
                        ? "bg-primary text-primary-foreground font-bold shadow-arcade-primary"
                        : "bg-background text-muted-foreground hover:text-foreground border border-border"
                    }`}
                  >
                    Pending ({joinRequests.filter((r) => r.status === "PENDING").length})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRequestStatusFilter("ACCEPTED");
                      setRequestPage(1);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-xl transition-all font-medium cursor-pointer ${
                      requestStatusFilter === "ACCEPTED"
                        ? "bg-primary text-primary-foreground font-bold shadow-arcade-primary"
                        : "bg-background text-muted-foreground hover:text-foreground border border-border"
                    }`}
                  >
                    Accepted ({joinRequests.filter((r) => r.status === "ACCEPTED").length})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRequestStatusFilter("REJECTED");
                      setRequestPage(1);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-xl transition-all font-medium cursor-pointer ${
                      requestStatusFilter === "REJECTED"
                        ? "bg-primary text-primary-foreground font-bold shadow-arcade-primary"
                        : "bg-background text-muted-foreground hover:text-foreground border border-border"
                    }`}
                  >
                    Declined ({joinRequests.filter((r) => r.status === "REJECTED").length})
                  </button>
                </div>
              </div>

              {/* Quick Search */}
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search applicants by name, email, institution, country, or message..."
                  value={requestSearch}
                  onChange={(e) => {
                    setRequestSearch(e.target.value);
                    setRequestPage(1);
                  }}
                  className="h-9 pl-9 text-xs bg-background rounded-xl"
                />
              </div>

              {/* Requests List */}
              {joinRequests.length === 0 ? (
                <div className="py-14 text-center border border-dashed border-border rounded-2xl p-8 text-xs text-muted-foreground space-y-2">
                  <Inbox className="size-8 mx-auto text-muted-foreground/40" />
                  <div className="font-bold text-sm text-foreground">
                    No join requests received yet
                  </div>
                  <p>
                    When students discover your team in the matchmaking directory, their requests
                    will appear here.
                  </p>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="py-10 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                  No join requests match your search or filter.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {paginatedRequests.map((req) => {
                    const hasJoinedOtherSquad =
                      req.alreadyJoinedSquad && !req.alreadyJoinedSquad.isThisTeam;
                    const maxCapacity = team?.event?.maxTeamSize || 6;
                    const isFull = memberCount >= maxCapacity;
                    const isSquadDisabled = team?.status === "DISQUALIFIED";
                    const isPending = req.status === "PENDING";
                    const isProcessing = processingRequestId === req.id;

                    return (
                      <Card
                        key={req.id}
                        className="p-4 sm:p-5 border-border bg-background rounded-2xl shadow-xs space-y-3 hover:border-border/80 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          {/* User Identity */}
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase font-mono shrink-0">
                              {req.user.name.substring(0, 2)}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-sm text-foreground">
                                  {req.user.name}
                                </span>
                                {req.status === "ACCEPTED" ? (
                                  <Badge className="bg-[#10b981] text-white font-bold text-[10px] border-0 shadow-arcade-emerald">
                                    Accepted
                                  </Badge>
                                ) : req.status === "REJECTED" ? (
                                  <Badge className="bg-[#ef4444] text-white font-bold text-[10px] border-0 shadow-arcade-destructive">
                                    Declined
                                  </Badge>
                                ) : (
                                  <Badge className="bg-[#f59e0b] text-slate-950 font-bold text-[10px] border-0 shadow-arcade-amber">
                                    Pending Review
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 font-sans">
                                <span className="flex items-center gap-1">
                                  <Mail className="size-3" />
                                  <span>{req.user.email}</span>
                                </span>
                                {req.user.country && (
                                  <span className="flex items-center gap-1">
                                    <Globe className="size-3" />
                                    <span>{req.user.country}</span>
                                  </span>
                                )}
                                {req.user.institution && (
                                  <span className="flex items-center gap-1">
                                    <Building2 className="size-3" />
                                    <span>{req.user.institution}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Submission Timestamp */}
                          <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1 shrink-0">
                            <Clock className="size-3" />
                            <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                          </span>
                        </div>

                        {/* Request Message Note */}
                        {req.message && (
                          <div className="p-3 rounded-xl bg-card border border-border text-xs text-muted-foreground italic">
                            &ldquo;{req.message}&rdquo;
                          </div>
                        )}

                        {/* Conflict Notification Alert */}
                        {hasJoinedOtherSquad && isPending && (
                          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-start gap-2.5 text-xs font-sans">
                            <AlertCircle className="size-4 shrink-0 mt-0.5" />
                            <div>
                              <strong>Already joined another squad:</strong> This citizen has
                              already joined squad{" "}
                              <strong>&quot;{req.alreadyJoinedSquad?.teamName}&quot;</strong> for
                              this campaign. You cannot accept them into this squad.
                            </div>
                          </div>
                        )}

                        {/* Leader Action Buttons */}
                        {isPending && isLeaderOrAdmin && (
                          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border/60">
                            <Button
                              size="sm"
                              variant="emerald"
                              disabled={
                                hasJoinedOtherSquad || isFull || isSquadDisabled || isProcessing
                              }
                              onClick={() => handleRespondToRequest(req.id, "ACCEPT")}
                              className="h-8.5 px-4 text-xs font-bold rounded-xl gap-1.5 active:translate-y-0.5 border-0 shadow-arcade-emerald"
                              title={
                                hasJoinedOtherSquad
                                  ? `Already in squad "${req.alreadyJoinedSquad?.teamName}"`
                                  : isFull
                                    ? `Squad roster is full (${memberCount}/${maxCapacity})`
                                    : isSquadDisabled
                                      ? "Squad is disabled"
                                      : "Accept applicant into squad"
                              }
                            >
                              <UserCheck className="size-3.5" />
                              <span>
                                {hasJoinedOtherSquad
                                  ? "Joined Another Squad"
                                  : isFull
                                    ? `Roster Full (${memberCount}/${maxCapacity})`
                                    : "Accept into Squad"}
                              </span>
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isProcessing}
                              onClick={() => handleRespondToRequest(req.id, "REJECT")}
                              className="h-8.5 px-3.5 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40 rounded-xl gap-1.5 shadow-arcade active:translate-y-0.5"
                              title="Decline request"
                            >
                              <UserX className="size-3.5" />
                              <span>Decline</span>
                            </Button>
                          </div>
                        )}
                      </Card>
                    );
                  })}

                  {/* Pagination Controls */}
                  {totalRequestPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground">
                      <span>
                        Showing {(requestPage - 1) * REQUESTS_PER_PAGE + 1} to{" "}
                        {Math.min(requestPage * REQUESTS_PER_PAGE, filteredRequests.length)} of{" "}
                        {filteredRequests.length} requests
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={requestPage <= 1}
                          onClick={() => setRequestPage((p) => Math.max(1, p - 1))}
                          className="h-8 px-2.5 text-xs rounded-xl shadow-xs"
                        >
                          Previous
                        </Button>
                        <span className="px-2 font-mono font-bold text-foreground">
                          {requestPage} / {totalRequestPages}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={requestPage >= totalRequestPages}
                          onClick={() => setRequestPage((p) => Math.min(totalRequestPages, p + 1))}
                          className="h-8 px-2.5 text-xs rounded-xl shadow-xs"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: SQUAD SETTINGS & RECRUITMENT (LEADER / ADMIN ONLY) */}
        {/* ------------------------------------------------------------- */}
        {isLeaderOrAdmin && (
          <TabsContent value="settings" className="space-y-5">
            <Card className="p-5 sm:p-6 bg-card border-border shadow-arcade rounded-2xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Squad Recruitment &amp; Access Controls
                </h2>
                <p className="text-xs text-muted-foreground">
                  Configure whether your squad is open to receive applications and manage invite
                  keys.
                </p>
              </div>

              <form onSubmit={handleSaveRecruitmentSettings} className="space-y-5">
                {/* Recruitment Stance Switch */}
                <div className="p-4 rounded-2xl border border-border bg-background flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="recruitingSwitch"
                      className="text-xs font-bold text-foreground block cursor-pointer"
                    >
                      Open for Public Student Applications
                    </label>
                    <p className="text-xs text-muted-foreground">
                      When enabled, solo students searching in the Campaign Directory can submit
                      join requests to your squad.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="recruitingSwitch"
                    checked={isRecruiting}
                    disabled={team?.status === "DISQUALIFIED"}
                    onChange={(e) => setIsRecruiting(e.target.checked)}
                    className="w-5 h-5 cursor-pointer accent-[#8b5cf6] rounded disabled:opacity-50"
                  />
                </div>

                {/* Recruitment Pitch */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground">
                    Squad Recruitment Pitch &amp; Preferred Timezone
                  </label>
                  <Textarea
                    rows={4}
                    placeholder="Mention the experience, timezone, or astrometry blinking availability you are looking for..."
                    value={recruitmentNotes}
                    disabled={team?.status === "DISQUALIFIED"}
                    onChange={(e) => setRecruitmentNotes(e.target.value)}
                    className="text-xs bg-background rounded-xl"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    This note will be visible to students browsing the campaign matchmaking
                    directory.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={recruitLoading || team?.status === "DISQUALIFIED"}
                    className="h-9 px-5 text-xs font-bold bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl shadow-arcade-primary active:translate-y-0.5"
                  >
                    {recruitLoading ? "Saving..." : "Save Recruitment Settings"}
                  </Button>
                </div>
              </form>

              {/* Invite Code Rotation Section */}
              <div className="pt-6 border-t border-border/60 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Squad Invite Code Management
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    If unauthorized students are joining, you can rotate the invite code to revoke
                    the old one.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-background border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      Current Code
                    </span>
                    <div className="font-mono font-bold text-sm text-foreground">
                      {team?.inviteCode}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={rotatingCode || team?.status === "DISQUALIFIED"}
                    onClick={handleRotateInviteCode}
                    className="h-8.5 text-xs font-bold gap-1.5 rounded-xl shadow-arcade active:translate-y-0.5"
                  >
                    <RotateCw className={`size-3.5 ${rotatingCode ? "animate-spin" : ""}`} />
                    <span>Rotate Invite Code</span>
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* IMPORT IMAGE SETS MODAL (Leader/Admin only) */}
      <Dialog open={showIngestModal} onOpenChange={setShowIngestModal}>
        <DialogContent className="bg-card border-border sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Import Image Sets</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Paste telescope image set codes separated by commas or line breaks.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBulkIngest} className="space-y-4">
            <Textarea
              required
              rows={5}
              placeholder="PS1-26A-01, PS1-26A-02, G96-24K02..."
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="text-xs font-mono bg-background rounded-xl"
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowIngestModal(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={ingestLoading || !bulkText.trim()}
                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold rounded-xl shadow-arcade-primary active:translate-y-0.5"
              >
                {ingestLoading ? "Importing..." : "Import Sets"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MPC REPORT SUBMISSION MODAL (Member Submission) */}
      <Dialog
        open={!!activeSetForReport}
        onOpenChange={(open) => !open && setActiveSetForReport(null)}
      >
        <DialogContent className="bg-card border-border max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Submit Observation Report</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Submitting report for Set:{" "}
              <strong className="text-foreground font-mono">{activeSetForReport?.setCode}</strong>
              {!isLeaderOrAdmin && (
                <span className="block mt-1 text-[#d97706] font-medium">
                  Note: Your submission will be routed to your squad leader for approval before
                  final campaign submission.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 border border-border rounded-xl bg-background flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground block">
                No moving candidates found?
              </span>
              <span className="text-[11px] text-muted-foreground">
                Mark this set clean without submitting MPC lines.
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSubmitMpcReport(true)}
              disabled={reportLoading}
              className="text-xs font-bold rounded-xl shadow-arcade active:translate-y-0.5"
            >
              Mark Clean
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground">
                Upload Report File (.txt or .rep)
              </label>
              <input
                type="file"
                accept=".txt,.rep"
                onChange={handleFileDrop}
                className="w-full text-xs p-2 border border-border rounded-xl bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground">
                Or Paste MPC Report Text:
              </label>
              <Textarea
                rows={6}
                placeholder="Paste Astrometrica MPC report lines here..."
                value={mpcText}
                onChange={(e) => setMpcText(e.target.value)}
                className="text-xs font-mono bg-background rounded-xl"
              />
            </div>

            {/* Parser Preview */}
            {parsedPreview && parsedPreview.candidates.length > 0 && (
              <div className="p-3.5 border border-emerald-500/30 bg-emerald-500/5 rounded-xl text-xs space-y-2">
                <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                  Parsed {parsedPreview.candidates.length} Candidate(s):
                </div>
                {parsedPreview.candidates.map((c) => (
                  <div
                    key={c.candidateCode}
                    className="p-2 border border-border bg-card rounded-xl"
                  >
                    <div className="flex justify-between font-bold text-foreground">
                      <span className="font-mono">
                        {c.candidateCode} {c.isNewDiscovery && "(New Discovery)"}
                      </span>
                      <span className="font-mono text-muted-foreground">Mag: {c.avgMagnitude}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                      Frames: {c.observationCount} &bull; Motion:{" "}
                      {c.speedArcsecPerHour
                        ? `${c.speedArcsecPerHour} arcsec/hr`
                        : "Calculating..."}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveSetForReport(null)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => handleSubmitMpcReport(false)}
                disabled={reportLoading || !mpcText.trim()}
                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold rounded-xl shadow-arcade-primary active:translate-y-0.5"
              >
                {reportLoading
                  ? "Saving..."
                  : isLeaderOrAdmin
                    ? "Confirm & Submit"
                    : "Submit for Leader Approval"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* LEADER SUBMISSION REVIEW & APPROVAL MODAL */}
      <Dialog open={!!reviewingSet} onOpenChange={(open) => !open && setReviewingSet(null)}>
        <DialogContent className="bg-card border-border max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Crown className="size-5 text-amber-400" />
              <span>Review Analyst Submission</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review observation data submitted for Image Set:{" "}
              <strong className="text-foreground font-mono">{reviewingSet?.setCode}</strong>
            </DialogDescription>
          </DialogHeader>

          {reviewingSet && (
            <div className="space-y-4">
              {/* Submitter Info Card */}
              <div className="p-3.5 bg-background border border-border rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold font-mono uppercase">
                    {reviewingSet.claimedByUser?.name.substring(0, 2) || "AN"}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">
                      {reviewingSet.claimedByUser?.name || "Team Member"}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {reviewingSet.claimedByUser?.email}
                    </div>
                  </div>
                </div>
                <Badge className="bg-[#f59e0b] text-slate-950 font-bold text-[10px] border-0 shadow-arcade-amber">
                  Pending Review
                </Badge>
              </div>

              {/* Status Details */}
              {reviewingSet.isClean ? (
                <div className="p-4 border border-slate-700/30 bg-slate-500/10 rounded-xl space-y-1 text-xs">
                  <span className="font-bold text-foreground block">Marked as Clean Set</span>
                  <p className="text-muted-foreground">
                    The analyst verified this image set and found no moving asteroid candidates.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviewingPreview && reviewingPreview.candidates.length > 0 ? (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-foreground block">
                        Detected Candidates ({reviewingPreview.candidates.length}):
                      </span>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {reviewingPreview.candidates.map((c) => (
                          <div
                            key={c.candidateCode}
                            className="p-2.5 border border-border bg-background rounded-xl text-xs flex justify-between items-center"
                          >
                            <div>
                              <span className="font-mono font-bold text-foreground">
                                {c.candidateCode}
                              </span>
                              <span className="text-[11px] text-muted-foreground block font-mono">
                                Frames: {c.observationCount} &bull; RA:{" "}
                                {c.observations?.[0]?.raRaw || "N/A"} Dec:{" "}
                                {c.observations?.[0]?.decRaw || "N/A"}
                              </span>
                            </div>
                            <Badge className="bg-[#10b981] text-white font-mono font-bold text-[10px] border-0">
                              Mag: {c.avgMagnitude}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {reviewingSet.mpcReportText && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground block">
                        Raw MPC Report Lines:
                      </label>
                      <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-36 whitespace-pre-wrap border border-border">
                        {reviewingSet.mpcReportText}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Review Actions */}
              <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={reviewActionLoading}
                  onClick={() => handleLeaderApproveReport(reviewingSet.id, "REJECT")}
                  className="rounded-xl text-xs font-bold text-muted-foreground hover:text-destructive hover:border-destructive/40"
                >
                  <ShieldAlert className="size-3.5 mr-1" />
                  <span>Request Revision</span>
                </Button>

                <Button
                  type="button"
                  variant="emerald"
                  size="sm"
                  disabled={reviewActionLoading}
                  onClick={() => handleLeaderApproveReport(reviewingSet.id, "APPROVE")}
                  className="rounded-xl text-xs font-bold gap-1.5 border-0 shadow-arcade-emerald active:translate-y-0.5"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>{reviewActionLoading ? "Approving..." : "Approve Submission"}</span>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* LEADER DIRECT ASSIGNMENT MODAL */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="bg-card border-border max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="size-5 text-primary" />
              <span>Assign Image Set</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select a squad member to analyze{" "}
              <strong className="text-foreground font-mono">{selectedSetForAssign?.setCode}</strong>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Select Squad Member</label>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {team?.members.map((m) => {
                  const isSelected = selectedMemberIdForAssign === m.user.id;
                  const isLeaderMember = m.user.id === team.leaderId;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMemberIdForAssign(m.user.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-xs"
                          : "border-border bg-background hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-8 rounded-lg bg-muted flex items-center justify-center font-bold text-xs font-mono uppercase">
                          {m.user.name.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-foreground truncate">
                              {m.user.name}
                            </span>
                            {isLeaderMember && <Crown className="size-3 text-amber-500 shrink-0" />}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {m.user.email}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAssignModalOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={!selectedMemberIdForAssign || isAssigning}
              onClick={async () => {
                if (!selectedSetForAssign || !selectedMemberIdForAssign) return;
                setIsAssigning(true);
                await handleClaimAction(
                  selectedSetForAssign.id,
                  "ASSIGN",
                  selectedMemberIdForAssign
                );
                setIsAssigning(false);
                setAssignModalOpen(false);
              }}
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold rounded-xl shadow-arcade-primary active:translate-y-0.5"
            >
              {isAssigning ? "Assigning..." : "Assign Set"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REMOVE MEMBER CONFIRMATION MODAL */}
      <Dialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <DialogContent className="bg-card border-border sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-destructive">
              <UserX className="size-5" />
              <span>Remove Member from Squad?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground space-y-1.5">
              <span>
                Are you sure you want to remove{" "}
                <strong className="text-foreground">{memberToRemove?.user.name}</strong> (
                {memberToRemove?.user.email}) from this squad?
              </span>
              <span className="block text-[11px] text-muted-foreground">
                Any unclaimed or in-progress image sets will be released back to the squad. This
                action is only permitted during the campaign registration and team formation period.
              </span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={removingMember}
              onClick={() => setMemberToRemove(null)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={removingMember}
              onClick={handleRemoveMember}
              className="rounded-xl text-xs font-bold gap-1.5 bg-[#ef4444] text-white hover:bg-[#dc2626] border-0 shadow-arcade-destructive active:translate-y-0.5"
            >
              {removingMember ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  <span>Removing...</span>
                </>
              ) : (
                <>
                  <UserX className="size-3.5" />
                  <span>Confirm Removal</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
