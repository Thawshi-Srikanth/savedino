"use client";

import React, { useEffect, useState, use, useMemo } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { parseMpcReport } from "@/lib/mpc-parser";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
  Upload,
  FileText,
  UserCheck,
  UserX,
  Sparkles,
  ArrowLeft,
  Crown,
  Settings,
  Plus,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  role: string;
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
  status: "PENDING" | "CLAIMED" | "CLEAN" | "REPORTED";
  claimedByUser?: {
    id: string;
    name: string;
    email: string;
  };
  candidates: Array<{
    id: string;
    candidateCode: string;
    ra: string;
    dec: string;
    magnitude: number;
    status: string;
  }>;
}

interface JoinRequestItem {
  id: string;
  message?: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    institution?: string;
    country?: string;
  };
}

interface TeamData {
  id: string;
  name: string;
  inviteCode: string;
  status: string;
  leaderId: string;
  isRecruiting: boolean;
  recruitmentNotes?: string;
  event: {
    id: string;
    title: string;
    code: string;
    startDate: string;
    endDate: string;
  };
  members: TeamMember[];
}

export default function TeamWorkspacePage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = use(params);
  const { data: session } = useSession();

  const [team, setTeam] = useState<TeamData | null>(null);
  const [imageSets, setImageSets] = useState<ImageSetItem[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Filter & Search for Image Sets
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "CLAIMED" | "REPORTED" | "CLEAN">("ALL");
  const [setSearch, setSetSearch] = useState<string>("");

  // Recruitment Settings Modal
  const [showRecruitModal, setShowRecruitModal] = useState<boolean>(false);
  const [isRecruiting, setIsRecruiting] = useState<boolean>(true);
  const [recruitmentNotes, setRecruitmentNotes] = useState<string>("");
  const [recruitLoading, setRecruitLoading] = useState<boolean>(false);

  // Bulk Ingest Modal
  const [showIngestModal, setShowIngestModal] = useState<boolean>(false);
  const [bulkText, setBulkText] = useState<string>("");
  const [ingestLoading, setIngestLoading] = useState<boolean>(false);

  // MPC Upload Modal
  const [activeSetForReport, setActiveSetForReport] = useState<ImageSetItem | null>(null);
  const [mpcText, setMpcText] = useState<string>("");
  const [reportLoading, setReportLoading] = useState<boolean>(false);

  const fetchTeamData = async () => {
    try {
      const setsRes = await fetch(`/api/teams/${teamId}/image-sets`);
      const setsData = await setsRes.json();
      if (setsData.success) {
        setImageSets(setsData.imageSets || []);
      }

      const mmRes = await fetch("/api/admin/matchmaking");
      const mmData = await mmRes.json();
      if (mmData.success) {
        const found = mmData.teams?.find((t: any) => t.id === teamId);
        if (found) {
          setTeam(found);
          setIsRecruiting(found.isRecruiting ?? true);
          setRecruitmentNotes(found.recruitmentNotes || "");
        }
      }

      const reqRes = await fetch(`/api/teams/${teamId}/requests`);
      const reqData = await reqRes.json();
      if (reqData.success) {
        setJoinRequests(reqData.requests || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [teamId]);

  const handleCopyInvite = () => {
    if (!team) return;
    navigator.clipboard.writeText(team.inviteCode);
    setCopied(true);
    toast.success("Invite code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveRecruitmentStance = async (e: React.FormEvent) => {
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
        toast.success("Recruitment settings updated!");
        fetchTeamData();
        setShowRecruitModal(false);
      } else {
        toast.error(data.error || "Failed to update settings");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setRecruitLoading(false);
    }
  };

  const handleRespondToRequest = async (requestId: string, action: "ACCEPT" | "REJECT") => {
    try {
      const res = await fetch(`/api/teams/${teamId}/requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === "ACCEPT") {
          toast.success("Accepted member into team!");
        } else {
          toast.info("Declined join request.");
        }
        fetchTeamData();
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    }
  };

  const handleClaimSet = async (setId: string, unclaim = false) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/image-sets/${setId}/claim`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        if (unclaim) {
          toast.info("Image set released.");
        } else {
          toast.success("Claimed image set for analysis!");
        }
        fetchTeamData();
      } else {
        toast.error(data.error || "Failed to update claim");
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
      const res = await fetch(
        `/api/teams/${teamId}/image-sets/${activeSetForReport.id}/report`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reportText: mpcText,
            markClean: markCleanOnly,
          }),
        }
      );
      const data = await res.json();

      if (!data.success) {
        toast.error(data.error || "Failed to submit report.");
      } else {
        if (markCleanOnly) {
          toast.success("Marked image set as clean (no candidates).");
        } else {
          toast.success("MPC report submitted successfully!");
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

  // Filtered Image Sets
  const filteredSets = useMemo(() => {
    return imageSets.filter((s) => {
      const matchesTab = activeTab === "ALL" || s.status === activeTab;
      const matchesSearch =
        !setSearch.trim() ||
        s.setCode.toLowerCase().includes(setSearch.toLowerCase()) ||
        s.claimedByUser?.name.toLowerCase().includes(setSearch.toLowerCase()) ||
        s.candidates.some((c) => c.candidateCode.toLowerCase().includes(setSearch.toLowerCase()));
      return matchesTab && matchesSearch;
    });
  }, [imageSets, activeTab, setSearch]);

  const parsedPreview = mpcText ? parseMpcReport(mpcText) : null;
  const memberCount = team?.members?.length || 0;
  const progressVal = Math.min(100, Math.round((memberCount / 6) * 100));
  const isLeader = team?.leaderId === session?.user?.id;
  const pendingRequests = joinRequests.filter((r) => r.status === "PENDING");

  if (loading) {
    return (
      <div className="py-24 text-center flex flex-col items-center gap-3">
        <RefreshCw className="size-6 animate-spin text-primary" />
        <span className="text-xs font-mono text-muted-foreground">Loading team workspace...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/teams"
          className="inline-flex items-center gap-1.5 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Teams Directory</span>
        </Link>
      </div>

      {/* 1. TEAM HEADER & INFO CARD */}
      <Card className="p-5 sm:p-6 bg-card border-border space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary">
                {team?.event?.code || "CAMPAIGN"}
              </span>
              <span className="text-[11px] text-muted-foreground">&bull;</span>
              <span className="text-xs text-muted-foreground">{team?.event?.title || "Asteroid Search"}</span>
              <Badge variant="secondary" className="text-[10px] font-sans font-medium px-2 py-0.5 ml-1">
                {memberCount}/6 Members
              </Badge>
              {team?.isRecruiting ? (
                <span className="text-[10px] font-sans font-semibold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-full">
                  Open for Join Requests
                </span>
              ) : (
                <span className="text-[10px] font-sans text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Recruitment Closed
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-foreground">
              {team?.name || "Team Workspace"}
            </h1>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isLeader && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowRecruitModal(true)}
                className="h-9 text-xs font-semibold gap-1.5 bg-background"
              >
                <Settings className="size-3.5 text-muted-foreground" />
                <span>Recruitment Settings</span>
              </Button>
            )}

            {/* Invite Code Pill Box */}
            <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-lg">
              <div>
                <span className="block text-[9px] font-mono text-muted-foreground uppercase">Invite Code</span>
                <span className="text-xs font-mono font-bold text-foreground tracking-wider">
                  {team?.inviteCode || "AST-XXXX"}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyInvite}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                title="Copy Invite Code"
              >
                {copied ? <Check className="size-3.5 text-[#10b981]" /> : <Copy className="size-3.5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="space-y-1.5 pt-2 border-t border-border/60">
          <div className="flex justify-between items-center text-xs font-mono text-muted-foreground">
            <span>Team Roster Capacity: {memberCount}/6 Members</span>
            <span>{progressVal}%</span>
          </div>
          <Progress value={progressVal} className="h-1.5" />
        </div>

        {/* Members Roster Grid */}
        <div className="space-y-2.5 pt-2">
          <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Team Members
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {team?.members?.map((m, idx) => (
              <div
                key={m.id || idx}
                className="p-3 border border-border rounded-lg bg-background text-xs space-y-1 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-mono text-muted-foreground">#{idx + 1}</span>
                  {m.role === "LEADER" ? (
                    <Crown className="size-3.5 text-amber-500" />
                  ) : (
                    <span className="text-[9px] text-muted-foreground uppercase font-mono">Member</span>
                  )}
                </div>
                <div className="font-semibold text-foreground truncate">{m.user.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{m.user.country || m.user.institution || "Active"}</div>
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: Math.max(0, 6 - memberCount) }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="p-3 border border-dashed border-border/70 rounded-lg text-xs flex flex-col items-center justify-center text-muted-foreground min-h-[64px]"
              >
                <span className="text-[11px] font-medium">Slot #{memberCount + idx + 1}</span>
                <span className="text-[9px] opacity-75">{memberCount + idx + 1 <= 2 ? "Required" : "Open"}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 2. PENDING JOIN REQUESTS (LEADER ONLY) */}
      {isLeader && pendingRequests.length > 0 && (
        <Card className="p-5 bg-card border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <span>Pending Join Requests ({pendingRequests.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 border border-border rounded-lg bg-background flex flex-col justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-foreground">{req.user.name}</span>
                    {req.user.country && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                        {req.user.country}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{req.user.email}</div>
                  {req.message && (
                    <p className="text-xs text-muted-foreground italic mt-2 bg-card p-2 rounded border border-border/60">
                      &quot;{req.message}&quot;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleRespondToRequest(req.id, "ACCEPT")}
                    className="flex-1 h-8 text-xs font-bold gap-1 bg-[#10b981] hover:bg-[#059669] text-white"
                  >
                    <UserCheck className="size-3.5" />
                    <span>Accept</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRespondToRequest(req.id, "REJECT")}
                    className="flex-1 h-8 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <UserX className="size-3.5" />
                    <span>Decline</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 3. IMAGE SETS & MPC FILES WORKSPACE (CLEAN GRID ARCHITECTURE) */}
      <Card className="p-5 sm:p-6 bg-card border-border space-y-5">
        {/* Workspace Title & Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div className="space-y-1">
            <h2 className="text-lg font-sans font-bold tracking-tight text-foreground">
              Image Sets &amp; MPC File Submissions
            </h2>
            <p className="text-xs text-muted-foreground">
              Claim telescope image sets to analyze in Astrometrica and submit MPC observation reports.
            </p>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={() => setShowIngestModal(true)}
            className="h-9 px-3.5 text-xs font-bold gap-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Import Image Sets</span>
          </Button>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`text-xs font-sans px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-primary text-primary-foreground font-bold"
                  : "bg-background text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              All Sets ({imageSets.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("PENDING")}
              className={`text-xs font-sans px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === "PENDING"
                  ? "bg-primary text-primary-foreground font-bold"
                  : "bg-background text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              To Analyze ({imageSets.filter((s) => s.status === "PENDING").length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("CLAIMED")}
              className={`text-xs font-sans px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === "CLAIMED"
                  ? "bg-primary text-primary-foreground font-bold"
                  : "bg-background text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              In Analysis ({imageSets.filter((s) => s.status === "CLAIMED").length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("REPORTED")}
              className={`text-xs font-sans px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === "REPORTED"
                  ? "bg-primary text-primary-foreground font-bold"
                  : "bg-background text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              Candidates Found ({imageSets.filter((s) => s.status === "REPORTED").length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("CLEAN")}
              className={`text-xs font-sans px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === "CLEAN"
                  ? "bg-primary text-primary-foreground font-bold"
                  : "bg-background text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              Clean ({imageSets.filter((s) => s.status === "CLEAN").length})
            </button>
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search set or analyst..."
              value={setSearch}
              onChange={(e) => setSetSearch(e.target.value)}
              className="h-8 pl-8 text-xs font-sans bg-background"
            />
          </div>
        </div>

        {/* Image Sets Grid */}
        {imageSets.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-border rounded-xl p-8 text-xs text-muted-foreground space-y-2">
            <FileText className="size-8 mx-auto text-muted-foreground/40" />
            <div className="font-semibold text-foreground">No image sets added yet</div>
            <p>Click &quot;Import Image Sets&quot; above to paste telescope batch codes.</p>
          </div>
        ) : filteredSets.length === 0 ? (
          <div className="py-10 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
            No image sets match the active filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredSets.map((s) => {
              const isClaimedByMe = s.claimedByUser?.id === session?.user?.id;

              return (
                <Card
                  key={s.id}
                  className="p-4 bg-background border-border hover:border-primary/40 transition-colors flex flex-col justify-between space-y-3.5"
                >
                  <div className="space-y-2.5">
                    {/* Set Code Header & Status Pill */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">
                        {s.setCode}
                      </span>

                      {s.status === "PENDING" ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          To Analyze
                        </span>
                      ) : s.status === "CLAIMED" ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#38bdf8]/10 text-[#38bdf8] font-bold">
                          In Analysis
                        </span>
                      ) : s.status === "REPORTED" ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10b981]/10 text-[#10b981] font-bold">
                          Reported
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          Clean
                        </span>
                      )}
                    </div>

                    {/* Analyst info / status note */}
                    <div className="text-xs text-muted-foreground min-h-[28px]">
                      {s.status === "CLAIMED" ? (
                        <div>
                          Analyst: <strong className="text-foreground">{s.claimedByUser?.name || "Member"}</strong>
                          {isClaimedByMe && <span className="text-primary ml-1 font-semibold">(You)</span>}
                        </div>
                      ) : s.status === "REPORTED" ? (
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-[#10b981]">
                            {s.candidates.length} candidate(s) logged:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {s.candidates.map((c) => (
                              <span
                                key={c.id}
                                className="text-[10px] font-mono bg-[#10b981]/10 text-[#10b981] px-1.5 py-0.5 rounded border border-[#10b981]/20"
                              >
                                {c.candidateCode}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : s.status === "CLEAN" ? (
                        <span className="text-[11px] text-muted-foreground">Verified clean &bull; No moving objects</span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Ready for download and blinking</span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2.5 border-t border-border/60">
                    {s.status === "PENDING" ? (
                      <Button
                        onClick={() => handleClaimSet(s.id)}
                        size="sm"
                        variant="outline"
                        className="w-full h-8 text-xs font-bold gap-1 bg-card hover:bg-accent cursor-pointer"
                      >
                        <span>Claim Set</span>
                      </Button>
                    ) : s.status === "CLAIMED" ? (
                      <div className="flex gap-1.5">
                        <Button
                          onClick={() => {
                            setActiveSetForReport(s);
                            setMpcText("");
                          }}
                          size="sm"
                          variant="default"
                          className="flex-1 h-8 text-xs font-bold bg-[#8b5cf6] hover:bg-[#7c3aed] text-white cursor-pointer"
                        >
                          <span>Submit Report</span>
                        </Button>
                        <Button
                          onClick={() => handleClaimSet(s.id, true)}
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Release Set"
                        >
                          Release
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="w-full h-8 text-xs opacity-50"
                      >
                        Completed
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* RECRUITMENT MODAL */}
      <Dialog open={showRecruitModal} onOpenChange={setShowRecruitModal}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-sans text-lg font-bold">Recruitment Settings</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure whether your team is open to receive join requests from other scientists.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveRecruitmentStance} className="space-y-4">
            <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-background">
              <input
                type="checkbox"
                id="isRecruitingCheckbox"
                checked={isRecruiting}
                onChange={(e) => setIsRecruiting(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-primary"
              />
              <label htmlFor="isRecruitingCheckbox" className="text-xs font-semibold cursor-pointer text-foreground">
                Open for Join Requests
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">
                Recruitment Message / Notes
              </label>
              <Textarea
                rows={3}
                placeholder="Mention what experience or availability you are looking for..."
                value={recruitmentNotes}
                onChange={(e) => setRecruitmentNotes(e.target.value)}
                className="text-xs font-sans bg-background"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowRecruitModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="default" size="sm" disabled={recruitLoading} className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold">
                {recruitLoading ? "Saving..." : "Save Settings"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* IMPORT IMAGE SETS MODAL */}
      <Dialog open={showIngestModal} onOpenChange={setShowIngestModal}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-sans text-lg font-bold">Import Image Sets</DialogTitle>
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
              className="text-xs font-mono bg-background"
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowIngestModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="default" size="sm" disabled={ingestLoading || !bulkText.trim()} className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold">
                {ingestLoading ? "Importing..." : "Import Sets"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MPC REPORT SUBMISSION MODAL */}
      <Dialog open={!!activeSetForReport} onOpenChange={(open) => !open && setActiveSetForReport(null)}>
        <DialogContent className="bg-card border-border max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-sans text-lg font-bold">MPC Report Submission</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Submitting observation report for Set: <strong className="text-foreground font-mono">{activeSetForReport?.setCode}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 border border-border rounded-lg bg-background flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground block">No moving candidates found?</span>
              <span className="text-[11px] text-muted-foreground">Mark this set as clean without submitting MPC lines.</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSubmitMpcReport(true)}
              disabled={reportLoading}
              className="text-xs font-semibold"
            >
              Mark Clean
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">
                Upload Report File (.txt or .rep)
              </label>
              <input
                type="file"
                accept=".txt,.rep"
                onChange={handleFileDrop}
                className="w-full text-xs p-2 border border-border rounded-lg bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">
                Or Paste MPC Report Text:
              </label>
              <Textarea
                rows={6}
                placeholder="Paste Astrometrica MPC report lines here..."
                value={mpcText}
                onChange={(e) => setMpcText(e.target.value)}
                className="text-xs font-mono bg-background"
              />
            </div>

            {/* Parser Preview */}
            {parsedPreview && parsedPreview.candidates.length > 0 && (
              <div className="p-3 border border-[#10b981]/30 bg-[#10b981]/5 rounded-lg text-xs space-y-2">
                <div className="font-bold text-[#10b981] text-xs">
                  Parsed {parsedPreview.candidates.length} Candidate(s):
                </div>
                {parsedPreview.candidates.map((c) => (
                  <div key={c.candidateCode} className="p-2 border border-border bg-card rounded-md">
                    <div className="flex justify-between font-semibold text-foreground">
                      <span className="font-mono">{c.candidateCode} {c.isNewDiscovery && "(New Discovery)"}</span>
                      <span className="font-mono text-muted-foreground">Mag: {c.avgMagnitude}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                      Frames: {c.observationCount} &bull; Motion: {c.speedArcsecPerHour ? `${c.speedArcsecPerHour} arcsec/hr` : "Calculating..."}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" size="sm" onClick={() => setActiveSetForReport(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => handleSubmitMpcReport(false)}
                disabled={reportLoading || !mpcText.trim()}
                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold"
              >
                {reportLoading ? "Saving..." : "Confirm Submission"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
