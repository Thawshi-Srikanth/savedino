"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { parseMpcReport } from "@/lib/mpc-parser";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/8bit/card";
import { Button } from "@/components/ui/8bit/button";
import { Badge } from "@/components/ui/8bit/badge";
import { Input, Textarea } from "@/components/ui/8bit/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/8bit/dialog";

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

  // Recruitment Settings Modal
  const [showRecruitModal, setShowRecruitModal] = useState<boolean>(false);
  const [isRecruiting, setIsRecruiting] = useState<boolean>(true);
  const [recruitmentNotes, setRecruitmentNotes] = useState<string>("");
  const [recruitLoading, setRecruitLoading] = useState<boolean>(false);

  // Bulk Ingest Modal
  const [showIngestModal, setShowIngestModal] = useState<boolean>(false);
  const [bulkText, setBulkText] = useState<string>("");
  const [ingestLoading, setIngestLoading] = useState<boolean>(false);
  const [ingestMsg, setIngestMsg] = useState<string | null>(null);

  // MPC Upload Modal
  const [activeSetForReport, setActiveSetForReport] = useState<ImageSetItem | null>(null);
  const [mpcText, setMpcText] = useState<string>("");
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const fetchTeamData = async () => {
    try {
      // Fetch sets
      const setsRes = await fetch(`/api/teams/${teamId}/image-sets`);
      const setsData = await setsRes.json();
      if (setsData.success) {
        setImageSets(setsData.imageSets || []);
      }

      // Fetch team details
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

      // Fetch join requests
      const reqRes = await fetch(`/api/teams/${teamId}/requests`);
      const reqData = await reqRes.json();
      if (reqData.success) {
        setJoinRequests(reqData.requests || []);
      }
    } catch (err) {
      console.error(err);
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
        fetchTeamData();
        setShowRecruitModal(false);
      }
    } catch (err) {
      console.error(err);
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
        fetchTeamData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClaimSet = async (setId: string) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/image-sets/${setId}/claim`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        fetchTeamData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIngestLoading(true);
    setIngestMsg(null);

    try {
      const res = await fetch(`/api/teams/${teamId}/image-sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: bulkText }),
      });
      const data = await res.json();

      if (!data.success) {
        setIngestMsg(`Error: ${data.error}`);
      } else {
        setIngestMsg(`Success! Added ${data.totalAdded} image set(s).`);
        setBulkText("");
        fetchTeamData();
        setTimeout(() => setShowIngestModal(false), 1500);
      }
    } catch (err: any) {
      setIngestMsg(`Error: ${err.message}`);
    } finally {
      setIngestLoading(false);
    }
  };

  const handleSubmitMpcReport = async (markCleanOnly = false) => {
    if (!activeSetForReport) return;
    setReportLoading(true);
    setReportError(null);

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
        setReportError(data.error || "Failed to submit report.");
      } else {
        setMpcText("");
        setActiveSetForReport(null);
        fetchTeamData();
      }
    } catch (err: any) {
      setReportError(err.message || "An error occurred.");
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

  const parsedPreview = mpcText ? parseMpcReport(mpcText) : null;
  const memberCount = team?.members?.length || 0;
  const progressVal = Math.min(100, Math.round((memberCount / 6) * 100));
  const isLeader = team?.leaderId === session?.user?.id;
  const pendingRequests = joinRequests.filter((r) => r.status === "PENDING");

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Team Banner Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <Badge variant="primary">{team?.event?.code || "IASC CAMPAIGN"}</Badge>
              <Badge variant={memberCount < 2 ? "amber" : "emerald"}>
                {memberCount < 2 ? "FORMING (NEEDS 2)" : `READY (${memberCount}/6)`}
              </Badge>
              {team?.isRecruiting ? (
                <Badge variant="emerald">RECRUITING OPEN</Badge>
              ) : (
                <Badge variant="outline">RECRUITING CLOSED</Badge>
              )}
            </div>

            <h1 className="text-base sm:text-xl font-pixel font-bold uppercase">{team?.name || "Team Workspace"}</h1>
            <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-1">
              Campaign: {team?.event?.title || "Active Pan-STARRS Asteroid Search"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isLeader && (
              <Button size="sm" variant="outline" onClick={() => setShowRecruitModal(true)}>
                ⚙ Recruitment Stance
              </Button>
            )}

            {/* Invite Code Box */}
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#202124] border-2 border-[#535353] dark:border-[#80868b] p-3">
              <div>
                <span className="block text-[9px] font-pixel uppercase tracking-widest text-gray-500">
                  TEAM INVITE CODE
                </span>
                <span className="text-sm font-pixel font-bold tracking-wider text-[#0284c7] dark:text-[#38bdf8]">
                  {team?.inviteCode || "AST-XXXX"}
                </span>
              </div>
              <Button size="sm" variant="outline" onClick={handleCopyInvite}>
                {copied ? "COPIED!" : "COPY"}
              </Button>
            </div>
          </div>
        </div>

        {/* Squad Capacity Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-pixel uppercase">
            <span>Squad Capacity: {memberCount}/6 Members</span>
            <span>{progressVal}%</span>
          </div>
          <Progress value={progressVal} className="h-2 border border-[#535353] dark:border-[#80868b]" />
        </div>

        {/* Members Roster */}
        <div className="mt-6 pt-4 border-t border-[#535353]/20 dark:border-[#80868b]/20">
          <span className="block text-[10px] font-pixel uppercase tracking-wider mb-3">
            Team Roster ({memberCount} / 6 Members):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {team?.members?.map((m, idx) => (
              <div
                key={m.id || idx}
                className="p-2 border-2 border-[#535353] dark:border-[#80868b] bg-gray-50 dark:bg-[#202124] text-xs font-mono"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[9px] font-bold text-[#0284c7] dark:text-[#38bdf8]">
                    #{idx + 1}
                  </span>
                  <Badge variant="outline" className="text-[8px] px-1 py-0">
                    {m.role}
                  </Badge>
                </div>
                <div className="font-bold truncate">{m.user.name}</div>
                <div className="text-[10px] text-gray-400 truncate">{m.user.country || "Cadet"}</div>
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: Math.max(0, 6 - memberCount) }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="p-2 border-2 border-dashed border-[#535353]/40 dark:border-[#80868b]/40 text-xs font-mono flex flex-col items-center justify-center text-gray-400 min-h-[64px]"
              >
                <span className="text-[9px] font-pixel">SLOT #{memberCount + idx + 1}</span>
                <span className="text-[8px]">{memberCount + idx + 1 <= 2 ? "REQUIRED" : "OPEN"}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* PENDING JOIN REQUESTS CARD FOR TEAM LEADER */}
      {isLeader && (
        <Card className="p-6 border-2 border-[#0284c7] dark:border-[#38bdf8]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-pixel text-[#0284c7] dark:text-[#38bdf8] uppercase">
                CADET MATCHMAKING INBOX
              </span>
              <h2 className="text-sm font-pixel font-bold uppercase mt-0.5">
                Pending Join Requests ({pendingRequests.length})
              </h2>
            </div>
            <Badge variant="amber">{pendingRequests.length} PENDING</Badge>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 text-center text-xs font-mono text-gray-400">
              No pending cadet join requests. Share your invite code or keep recruitment open!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 border-2 border-[#535353] dark:border-[#80868b] bg-gray-50 dark:bg-[#202124] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-pixel text-xs font-bold">{req.user.name}</span>
                      <span className="text-xs font-mono text-gray-500">({req.user.email})</span>
                      {req.user.country && (
                        <Badge variant="outline" className="text-[8px]">{req.user.country}</Badge>
                      )}
                    </div>
                    {req.message && (
                      <p className="text-xs font-mono text-gray-600 dark:text-gray-300 italic">
                        &quot;{req.message}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="emerald"
                      onClick={() => handleRespondToRequest(req.id, "ACCEPT")}
                    >
                      ✓ Accept Cadet
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRespondToRequest(req.id, "REJECT")}
                    >
                      X Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Image Sets Workspace Kanban */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#535353]/30 dark:border-[#80868b]/30 pb-4 mb-6">
          <div>
            <span className="text-[10px] font-mono text-[#0284c7] dark:text-[#38bdf8] font-bold uppercase tracking-widest">
              PAN-STARRS IMAGE SETS WORKSPACE
            </span>
            <h2 className="text-sm sm:text-base font-pixel font-bold uppercase mt-1">
              Assigned Image Sets &amp; MPC Submissions
            </h2>
          </div>

          <Button variant="primary" onClick={() => setShowIngestModal(true)}>
            + Ingest Sets from IASC
          </Button>
        </div>

        {/* Kanban Columns */}
        {imageSets.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-[#535353]/40 dark:border-[#80868b]/40 p-8 font-mono text-xs">
            No image sets logged yet. Click &quot;+ Ingest Sets from IASC&quot; above to copy-paste your batch from your IASC dashboard.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 1. PENDING */}
            <div className="border-2 border-[#535353]/40 dark:border-[#80868b]/40 p-3 bg-gray-50 dark:bg-[#202124]">
              <div className="flex items-center justify-between text-[10px] font-pixel uppercase mb-3 text-gray-500">
                <span>📥 To Analyze</span>
                <Badge variant="outline">{imageSets.filter((s) => s.status === "PENDING").length}</Badge>
              </div>
              <div className="space-y-2">
                {imageSets
                  .filter((s) => s.status === "PENDING")
                  .map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 bg-white dark:bg-[#2b2c2f] border-2 border-[#535353] dark:border-[#80868b] shadow-[2px_2px_0px_#000] text-xs font-mono"
                    >
                      <div className="font-bold text-[#0284c7] dark:text-[#38bdf8] mb-1">{s.setCode}</div>
                      <Button
                        onClick={() => handleClaimSet(s.id)}
                        size="sm"
                        variant="secondary"
                        className="w-full"
                      >
                        Claim to Analyze
                      </Button>
                    </div>
                  ))}
              </div>
            </div>

            {/* 2. IN PROGRESS */}
            <div className="border-2 border-[#535353]/40 dark:border-[#80868b]/40 p-3 bg-gray-50 dark:bg-[#202124]">
              <div className="flex items-center justify-between text-[10px] font-pixel uppercase mb-3 text-amber-600 dark:text-amber-400">
                <span>🔍 In Analysis</span>
                <Badge variant="amber">{imageSets.filter((s) => s.status === "CLAIMED").length}</Badge>
              </div>
              <div className="space-y-2">
                {imageSets
                  .filter((s) => s.status === "CLAIMED")
                  .map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 bg-white dark:bg-[#2b2c2f] border-2 border-[#535353] dark:border-[#80868b] shadow-[2px_2px_0px_#000] text-xs font-mono"
                    >
                      <div className="font-bold text-[#0284c7] dark:text-[#38bdf8] mb-1">{s.setCode}</div>
                      <div className="text-[10px] text-gray-400 mb-2">Claimed: {s.claimedByUser?.name || "Cadet"}</div>
                      <div className="flex gap-1.5">
                        <Button
                          onClick={() => {
                            setActiveSetForReport(s);
                            setMpcText("");
                            setReportError(null);
                          }}
                          size="sm"
                          variant="primary"
                          className="flex-1"
                        >
                          Submit MPC
                        </Button>
                        <Button
                          onClick={() => handleClaimSet(s.id)}
                          size="sm"
                          variant="ghost"
                          className="px-2"
                          title="Unclaim"
                        >
                          X
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* 3. REPORTED DISCOVERIES */}
            <div className="border-2 border-[#535353]/40 dark:border-[#80868b]/40 p-3 bg-gray-50 dark:bg-[#202124]">
              <div className="flex items-center justify-between text-[10px] font-pixel uppercase mb-3 text-emerald-600 dark:text-emerald-400">
                <span>🚀 Candidates Found</span>
                <Badge variant="emerald">{imageSets.filter((s) => s.status === "REPORTED").length}</Badge>
              </div>
              <div className="space-y-2">
                {imageSets
                  .filter((s) => s.status === "REPORTED")
                  .map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 bg-white dark:bg-[#2b2c2f] border-emerald-500 shadow-[2px_2px_0px_#000] text-xs font-mono"
                    >
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">{s.setCode}</div>
                      <div className="text-[10px] text-gray-400 mb-1.5">
                        Candidates: {s.candidates.length}
                      </div>
                      {s.candidates.map((c) => (
                        <div key={c.id} className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 p-1 border border-emerald-500/30 rounded mb-1">
                          <strong>{c.candidateCode}</strong> — Mag: {c.magnitude}
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </div>

            {/* 4. CLEAN */}
            <div className="border-2 border-[#535353]/40 dark:border-[#80868b]/40 p-3 bg-gray-50 dark:bg-[#202124]">
              <div className="flex items-center justify-between text-[10px] font-pixel uppercase mb-3 text-gray-400">
                <span>✅ Clean (No Asteroid)</span>
                <Badge variant="outline">{imageSets.filter((s) => s.status === "CLEAN").length}</Badge>
              </div>
              <div className="space-y-2">
                {imageSets
                  .filter((s) => s.status === "CLEAN")
                  .map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 bg-white dark:bg-[#2b2c2f] border border-gray-300 dark:border-gray-700 text-xs font-mono text-gray-500"
                    >
                      <div className="font-bold mb-0.5">{s.setCode}</div>
                      <div className="text-[9px]">Verified Clean</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Recruitment Stance Modal */}
      <Dialog open={showRecruitModal} onOpenChange={setShowRecruitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recruitment Stance Settings</DialogTitle>
            <DialogDescription>
              Configure whether your squad is open to cadet join requests from the Campaigns Hub.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveRecruitmentStance} className="space-y-4">
            <div className="flex items-center gap-3 p-3 border border-dashed border-[#535353]/40 dark:border-[#80868b]/40">
              <input
                type="checkbox"
                id="isRecruitingCheckbox"
                checked={isRecruiting}
                onChange={(e) => setIsRecruiting(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="isRecruitingCheckbox" className="text-xs font-pixel uppercase cursor-pointer">
                Open for Cadet Join Requests
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-pixel uppercase mb-1">
                Recruitment Notes / Seeking Message
              </label>
              <Textarea
                rows={3}
                placeholder="e.g. Seeking 2 cadets with Astrometrica experience for Pan-STARRS search!"
                value={recruitmentNotes}
                onChange={(e) => setRecruitmentNotes(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowRecruitModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={recruitLoading}>
                {recruitLoading ? "SAVING..." : "SAVE RECRUITMENT STANCE >"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Ingest Modal */}
      <Dialog open={showIngestModal} onOpenChange={setShowIngestModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ingest Picture Sets from IASC</DialogTitle>
            <DialogDescription>
              Paste text/table from your IASC dashboard (e.g. <code>PS1-26A-01, PS1-26A-02</code>). Our 8-bit parser will auto-extract set codes.
            </DialogDescription>
          </DialogHeader>

          {ingestMsg && (
            <div className="p-2.5 border-2 border-[#535353] dark:border-[#80868b] bg-gray-50 dark:bg-[#202124] text-xs font-mono mb-3">
              {ingestMsg}
            </div>
          )}

          <form onSubmit={handleBulkIngest} className="space-y-4">
            <Textarea
              required
              rows={5}
              placeholder="Paste here: e.g. PS1-26A-01, PS1-26A-02, G96-24K02..."
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowIngestModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={ingestLoading || !bulkText}>
                {ingestLoading ? "PARSING..." : "INGEST SETS >"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MPC Upload Modal */}
      <Dialog open={!!activeSetForReport} onOpenChange={(open) => !open && setActiveSetForReport(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Astrometrica MPC Report Parser</DialogTitle>
            <DialogDescription>
              Submitting for Set: <strong>{activeSetForReport?.setCode}</strong>
            </DialogDescription>
          </DialogHeader>

          {reportError && (
            <div className="p-2.5 border border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 text-xs font-mono mb-3">
              ! {reportError}
            </div>
          )}

          <div className="p-3 border border-dashed border-[#535353]/40 dark:border-[#80868b]/40 mb-4 flex items-center justify-between">
            <span className="text-xs font-mono">No asteroids found in this set?</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSubmitMpcReport(true)}
              disabled={reportLoading}
            >
              Mark Clean
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-pixel uppercase mb-1.5">
                Upload MPCrep.txt from Astrometrica
              </label>
              <input
                type="file"
                accept=".txt,.rep"
                onChange={handleFileDrop}
                className="w-full text-xs font-mono p-2 border border-[#535353] dark:border-[#80868b]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-pixel uppercase mb-1.5">
                Or Paste MPC Report Text:
              </label>
              <Textarea
                rows={6}
                placeholder="COD F51&#10;CON Team SaveDino...&#10;     P10aBcD* C2026 09 03.24561 21 14 32.18 +14 22 18.4          21.4 R      F51..."
                value={mpcText}
                onChange={(e) => setMpcText(e.target.value)}
              />
            </div>

            {/* Real-time Parser Preview */}
            {parsedPreview && parsedPreview.candidates.length > 0 && (
              <div className="p-3 border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-xs font-mono space-y-2">
                <div className="font-bold text-emerald-700 dark:text-emerald-300 font-pixel text-[10px] uppercase">
                  ✓ Valid MPC Format! Found {parsedPreview.candidates.length} Candidate(s):
                </div>
                {parsedPreview.candidates.map((c) => (
                  <div key={c.candidateCode} className="p-2 border border-emerald-500/40 bg-white dark:bg-[#202124]">
                    <div className="flex justify-between font-bold">
                      <span>Code: {c.candidateCode} {c.isNewDiscovery && "★ (NEW DISCOVERY)"}</span>
                      <span>Avg Mag: {c.avgMagnitude}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      Observations: {c.observationCount} frames | Motion Rate: {c.speedArcsecPerHour ? `${c.speedArcsecPerHour} arcsec/hr` : "Calculating..."}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setActiveSetForReport(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => handleSubmitMpcReport(false)}
                disabled={reportLoading || !mpcText}
              >
                {reportLoading ? "SAVING..." : "CONFIRM SUBMISSION >"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
