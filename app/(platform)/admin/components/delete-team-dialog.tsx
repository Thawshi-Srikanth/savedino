"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { TeamData } from "./types";

interface DeleteTeamDialogProps {
  deletingTeam: TeamData | null;
  setDeletingTeam: (t: TeamData | null) => void;
  deleteLoading: boolean;
  onConfirmDelete: () => void;
}

export function DeleteTeamDialog({
  deletingTeam,
  setDeletingTeam,
  deleteLoading,
  onConfirmDelete,
}: DeleteTeamDialogProps) {
  return (
    <Dialog open={!!deletingTeam} onOpenChange={(open) => !open && setDeletingTeam(null)}>
      <DialogContent className="sm:max-w-md bg-card border-border font-sans">
        <DialogHeader>
          <DialogTitle className="text-destructive font-bold text-base flex items-center gap-2">
            <Trash2 className="size-4" />
            <span>Permanently Delete Squad?</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground space-y-2">
            <div>
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground">{deletingTeam?.name}</strong> (Code:{" "}
              <span className="font-mono text-foreground font-bold">{deletingTeam?.inviteCode}</span>)?
            </div>
            <div className="p-2.5 rounded bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              All member affiliations and squad enrollments for {deletingTeam?.members.length} researchers will be released back to the unassigned candidate pool.
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDeletingTeam(null)}
            disabled={deleteLoading}
            className="shadow-arcade active:translate-y-0.5 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirmDelete}
            disabled={deleteLoading}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold shadow-arcade-destructive active:translate-y-0.5 cursor-pointer"
          >
            {deleteLoading ? "Deleting Squad..." : "Yes, Delete Squad"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
