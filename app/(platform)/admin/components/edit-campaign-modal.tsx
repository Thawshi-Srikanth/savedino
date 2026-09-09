"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2, Calendar, Users, Telescope, FileCode } from "lucide-react";
import { EventData } from "./types";

interface EditCampaignModalProps {
  editingCampaign: EventData | null;
  setEditingCampaign: (ev: EventData | null) => void;
  editCampTab: string;
  setEditCampTab: (tab: string) => void;
  editCampTitle: string;
  setEditCampTitle: (val: string) => void;
  editCampCode: string;
  setEditCampCode: (val: string) => void;
  editCampStatus: string;
  setEditCampStatus: (val: string) => void;
  editCampDesc: string;
  setEditCampDesc: (val: string) => void;
  editCampMaxTeamSize: number;
  setEditCampMaxTeamSize: (val: number) => void;
  editCampRegStart: string;
  setEditCampRegStart: (val: string) => void;
  editCampRegEnd: string;
  setEditCampRegEnd: (val: string) => void;
  editCampTeamStart: string;
  setEditCampTeamStart: (val: string) => void;
  editCampTeamEnd: string;
  setEditCampTeamEnd: (val: string) => void;
  editCampStart: string;
  setEditCampStart: (val: string) => void;
  editCampEnd: string;
  setEditCampEnd: (val: string) => void;
  editCampSubStart: string;
  setEditCampSubStart: (val: string) => void;
  editCampSubEnd: string;
  setEditCampSubEnd: (val: string) => void;
  editCampLoading: boolean;
  onSave: (e: React.FormEvent) => void;
}

export function EditCampaignModal({
  editingCampaign,
  setEditingCampaign,
  editCampTab,
  setEditCampTab,
  editCampTitle,
  setEditCampTitle,
  editCampCode,
  setEditCampCode,
  editCampStatus,
  setEditCampStatus,
  editCampDesc,
  setEditCampDesc,
  editCampMaxTeamSize,
  setEditCampMaxTeamSize,
  editCampRegStart,
  setEditCampRegStart,
  editCampRegEnd,
  setEditCampRegEnd,
  editCampTeamStart,
  setEditCampTeamStart,
  editCampTeamEnd,
  setEditCampTeamEnd,
  editCampStart,
  setEditCampStart,
  editCampEnd,
  setEditCampEnd,
  editCampSubStart,
  setEditCampSubStart,
  editCampSubEnd,
  setEditCampSubEnd,
  editCampLoading,
  onSave,
}: EditCampaignModalProps) {
  return (
    <Dialog
      open={!!editingCampaign}
      onOpenChange={(open) => !open && setEditingCampaign(null)}
    >
      <DialogContent className="sm:max-w-2xl bg-card border-border font-sans max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Edit2 className="size-4 text-primary" />
            <span>Edit Campaign &bull; {editingCampaign?.code}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Modify campaign metadata, public descriptions, and timeline milestone dates.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSave} className="space-y-4 pt-1">
          {/* Nav Tabs for Edit Modal */}
          <div className="flex border-b border-border text-xs">
            <button
              type="button"
              onClick={() => setEditCampTab("overview")}
              className={`pb-2 px-3 font-bold border-b-2 transition-colors cursor-pointer ${
                editCampTab === "overview"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Overview &amp; Identity
            </button>
            <button
              type="button"
              onClick={() => setEditCampTab("schedule")}
              className={`pb-2 px-3 font-bold border-b-2 transition-colors cursor-pointer ${
                editCampTab === "schedule"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Timeline &amp; Milestone Schedules
            </button>
          </div>

          {editCampTab === "overview" ? (
            <div className="space-y-3.5">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Campaign Title</label>
                <Input
                  required
                  value={editCampTitle}
                  onChange={(e) => setEditCampTitle(e.target.value)}
                  placeholder="e.g. IASC Pan-STARRS Campaign 2026-A"
                  className="h-9 text-xs bg-background"
                />
              </div>

              {/* Code, Status & Max Team Size */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Campaign Code</label>
                  <Input
                    required
                    value={editCampCode}
                    onChange={(e) => setEditCampCode(e.target.value.toUpperCase())}
                    placeholder="e.g. IASC-2026-A"
                    className="h-9 text-xs font-mono font-bold bg-background"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Status</label>
                  <Select value={editCampStatus} onValueChange={setEditCampStatus}>
                    <SelectTrigger className="h-9 text-xs bg-background">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active (Ongoing)</SelectItem>
                      <SelectItem value="UPCOMING">Upcoming</SelectItem>
                      <SelectItem value="SUBMISSION_OPEN">Submissions Open</SelectItem>
                      <SelectItem value="COMPLETED">Completed / Concluded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Max Squad Size</label>
                  <Input
                    type="number"
                    min={2}
                    max={30}
                    required
                    value={editCampMaxTeamSize}
                    onChange={(e) => setEditCampMaxTeamSize(Math.max(2, Math.min(30, parseInt(e.target.value) || 6)))}
                    className="h-9 text-xs font-mono bg-background"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Description</label>
                <textarea
                  value={editCampDesc}
                  onChange={(e) => setEditCampDesc(e.target.value)}
                  rows={3}
                  placeholder="Campaign details, telescope source, and research objective..."
                  className="w-full p-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden leading-relaxed font-sans"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* 1. Registration Window */}
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-primary" />
                  <span>Stage 1: Student Registration Window</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">Registration Opens</label>
                    <Input
                      type="datetime-local"
                      value={editCampRegStart}
                      onChange={(e) => setEditCampRegStart(e.target.value)}
                      className="h-8 text-xs bg-background font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">Registration Closes</label>
                    <Input
                      type="datetime-local"
                      value={editCampRegEnd}
                      onChange={(e) => setEditCampRegEnd(e.target.value)}
                      className="h-8 text-xs bg-background font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Team Formation Window */}
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Users className="size-3.5 text-primary" />
                  <span>Stage 2: Team Formation Window</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">Team Setup Opens</label>
                    <Input
                      type="datetime-local"
                      value={editCampTeamStart}
                      onChange={(e) => setEditCampTeamStart(e.target.value)}
                      className="h-8 text-xs bg-background font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">Team Setup Closes</label>
                    <Input
                      type="datetime-local"
                      value={editCampTeamEnd}
                      onChange={(e) => setEditCampTeamEnd(e.target.value)}
                      className="h-8 text-xs bg-background font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Image Search Window */}
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Telescope className="size-3.5 text-[#8b5cf6]" />
                  <span>Stage 3: Telescope Image Search Window</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">Campaign Starts</label>
                    <Input
                      type="datetime-local"
                      required
                      value={editCampStart}
                      onChange={(e) => setEditCampStart(e.target.value)}
                      className="h-8 text-xs bg-background font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">Campaign Ends</label>
                    <Input
                      type="datetime-local"
                      required
                      value={editCampEnd}
                      onChange={(e) => setEditCampEnd(e.target.value)}
                      className="h-8 text-xs bg-background font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Submission Window */}
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <FileCode className="size-3.5 text-emerald-500" />
                  <span>Stage 4: Report Submission Window</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">Submissions Open</label>
                    <Input
                      type="datetime-local"
                      value={editCampSubStart}
                      onChange={(e) => setEditCampSubStart(e.target.value)}
                      className="h-8 text-xs bg-background font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">Submissions Deadline</label>
                    <Input
                      type="datetime-local"
                      value={editCampSubEnd}
                      onChange={(e) => setEditCampSubEnd(e.target.value)}
                      className="h-8 text-xs bg-background font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingCampaign(null)}
              disabled={editCampLoading}
              className="shadow-arcade active:translate-y-0.5 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={editCampLoading}
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold shadow-arcade-primary active:translate-y-0.5 cursor-pointer"
            >
              {editCampLoading ? "Saving Changes..." : "Save Campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
