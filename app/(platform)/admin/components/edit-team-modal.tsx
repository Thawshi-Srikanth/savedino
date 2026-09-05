"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { TeamData } from "./types";

interface EditTeamModalProps {
  editingTeam: TeamData | null;
  setEditingTeam: (t: TeamData | null) => void;
  editName: string;
  setEditName: (name: string) => void;
  editInviteCode: string;
  setEditInviteCode: (code: string) => void;
  editStatus: string;
  setEditStatus: (status: string) => void;
  editIsRecruiting: boolean;
  setEditIsRecruiting: (val: boolean) => void;
  editRecruitmentNotes: string;
  setEditRecruitmentNotes: (notes: string) => void;
  editDisqualificationReason: string;
  setEditDisqualificationReason: (reason: string) => void;
  editLeaderId: string;
  setEditLeaderId: (id: string) => void;
  editLoading: boolean;
  onSave: (e: React.FormEvent) => void;
}

export function EditTeamModal({
  editingTeam,
  setEditingTeam,
  editName,
  setEditName,
  editInviteCode,
  setEditInviteCode,
  editStatus,
  setEditStatus,
  editIsRecruiting,
  setEditIsRecruiting,
  editRecruitmentNotes,
  setEditRecruitmentNotes,
  editDisqualificationReason,
  setEditDisqualificationReason,
  editLeaderId,
  setEditLeaderId,
  editLoading,
  onSave,
}: EditTeamModalProps) {
  const handleRotateInviteCode = () => {
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newCode = `AST-${randomChars}`;
    setEditInviteCode(newCode);
    toast.info(`Rotated invite code to ${newCode}`);
  };

  return (
    <Dialog open={!!editingTeam} onOpenChange={(open) => !open && setEditingTeam(null)}>
      <DialogContent className="sm:max-w-lg bg-card border-border font-sans">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">
            Edit Squad Details &amp; Status
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update squad settings, recruitment stance, leader assignment, and status for{" "}
            <strong className="text-foreground">{editingTeam?.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Squad Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Squad Name</label>
              <Input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-9 text-xs bg-background font-sans"
              />
            </div>

            {/* Invite Code (Rotatable with Refresh Button, Not Custom Editable) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Invite Code</span>
                <span className="text-[10px] text-muted-foreground font-normal">Auto-generated</span>
              </label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="text"
                  readOnly
                  value={editInviteCode}
                  className="h-9 text-xs bg-muted/60 font-mono font-bold uppercase cursor-default select-all"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRotateInviteCode}
                  className="h-9 px-3 shrink-0 text-xs font-semibold gap-1.5 cursor-pointer shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d] active:translate-y-0.5"
                  title="Rotate to a new unique invite code"
                >
                  <RefreshCw className="size-3.5" />
                  <span>Rotate</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Squad Status (Active, Forming, Submitted, Disqualified) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Squad Status</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="h-9 text-xs font-sans bg-background">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active (In Good Standing)</SelectItem>
                  <SelectItem value="FORMING">Forming (Open Roster)</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted (Analysis Complete)</SelectItem>
                  <SelectItem value="DISQUALIFIED">Disabled / Disqualified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Squad Leader Assignment */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Squad Leader</label>
              <Select value={editLeaderId} onValueChange={setEditLeaderId}>
                <SelectTrigger className="h-9 text-xs font-sans bg-background">
                  <SelectValue placeholder="Select Leader" />
                </SelectTrigger>
                <SelectContent>
                  {editingTeam?.members.map((m) => (
                    <SelectItem key={m.user.id} value={m.user.id}>
                      {m.user.name} ({m.user.email.slice(0, 16)}...)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Disqualification Reason Field (Shown when status is DISQUALIFIED) */}
          {editStatus === "DISQUALIFIED" && (
            <div className="space-y-1.5 p-3 rounded-lg bg-destructive/10 border border-destructive/25 text-destructive">
              <label className="text-xs font-bold block text-destructive">
                Disqualification / Disabled Reason
              </label>
              <Textarea
                placeholder="Reason for disabling this squad (e.g. Code of Conduct violation, inactive leader)..."
                value={editDisqualificationReason}
                onChange={(e) => setEditDisqualificationReason(e.target.value)}
                rows={2}
                className="text-xs bg-background text-foreground resize-none font-sans border-destructive/30"
              />
              <span className="text-[11px] text-destructive/80 block">
                This explanation is stored in the database and displayed to squad members on their workspace.
              </span>
            </div>
          )}

          {/* Recruitment Toggle & Notes */}
          <div className="space-y-2 p-3 bg-muted/40 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-foreground block">
                  Recruiting Solo Researchers
                  {editStatus === "DISQUALIFIED" && (
                    <span className="text-destructive font-semibold ml-2 text-[10px] uppercase">
                      (Locked &bull; Disabled Squad)
                    </span>
                  )}
                </label>
                <span className="text-[11px] text-muted-foreground block">
                  {editStatus === "DISQUALIFIED"
                    ? "Disabled squads cannot recruit or accept new members"
                    : "Allow unassigned students to match into this squad"}
                </span>
              </div>
              <input
                type="checkbox"
                disabled={editStatus === "DISQUALIFIED"}
                checked={editStatus === "DISQUALIFIED" ? false : editIsRecruiting}
                onChange={(e) => setEditIsRecruiting(e.target.checked)}
                className="size-4 accent-primary rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-xs font-semibold text-foreground">Disclaimer &amp; Recruitment Notes</label>
              <Textarea
                placeholder="e.g. Looking for data analysis / Astrometrica specialists..."
                value={editRecruitmentNotes}
                onChange={(e) => setEditRecruitmentNotes(e.target.value)}
                rows={2}
                className="text-xs bg-background resize-none font-sans"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingTeam(null)}
              disabled={editLoading}
              className="shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d] active:translate-y-0.5 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={editLoading}
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold shadow-[0_2px_0_0_#7c3aed] active:translate-y-0.5 cursor-pointer"
            >
              {editLoading ? "Saving Changes..." : "Save Squad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
