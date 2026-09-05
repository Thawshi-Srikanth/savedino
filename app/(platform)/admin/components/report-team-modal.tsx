"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamData } from "./types";

interface ReportTeamModalProps {
  reportingTeam: TeamData | null;
  setReportingTeam: (t: TeamData | null) => void;
  reportLoading: boolean;
  onConfirmReport: (teamId: string, action: "DISQUALIFY" | "WARN", reason: string) => void;
}

export function ReportTeamModal({
  reportingTeam,
  setReportingTeam,
  reportLoading,
  onConfirmReport,
}: ReportTeamModalProps) {
  const [reportAction, setReportAction] = useState<"DISQUALIFY" | "WARN">("DISQUALIFY");
  const [reportReason, setReportReason] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingTeam) return;
    onConfirmReport(reportingTeam.id, reportAction, reportReason);
  };

  return (
    <Dialog open={!!reportingTeam} onOpenChange={(open) => !open && setReportingTeam(null)}>
      <DialogContent className="sm:max-w-md bg-card border-border font-sans">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-destructive">
            Report &amp; Disable Squad
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Flag, issue moderation warnings, or immediately disqualify and disable{" "}
            <strong className="text-foreground">{reportingTeam?.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Action Type</label>
            <Select value={reportAction} onValueChange={(val) => setReportAction(val as any)}>
              <SelectTrigger className="h-9 text-xs font-sans bg-background">
                <SelectValue placeholder="Select Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DISQUALIFY">Disqualify &amp; Disable Squad</SelectItem>
                <SelectItem value="WARN">Issue Moderation Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Reason / Violation Notes</label>
            <Textarea
              required
              rows={3}
              placeholder="Provide reason for moderation or disqualification (e.g., policy violation, duplicate submissions)..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="text-xs bg-background resize-none font-sans"
            />
          </div>

          {reportAction === "DISQUALIFY" && (
            <div className="p-2.5 rounded bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              Disqualifying this squad will immediately change its status to <strong>DISQUALIFIED</strong> and lock submissions.
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReportingTeam(null)}
              disabled={reportLoading}
              className="shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d] active:translate-y-0.5 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={reportLoading || !reportReason.trim()}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold shadow-[0_2px_0_0_#b91c1c] active:translate-y-0.5 cursor-pointer"
            >
              {reportLoading ? "Processing..." : reportAction === "DISQUALIFY" ? "Disqualify Squad" : "Log Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
