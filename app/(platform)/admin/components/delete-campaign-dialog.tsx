"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { EventData } from "./types";

interface DeleteCampaignDialogProps {
  deletingCampaign: EventData | null;
  setDeletingCampaign: (ev: EventData | null) => void;
  deleteCampLoading: boolean;
  onConfirmDelete: () => void;
}

export function DeleteCampaignDialog({
  deletingCampaign,
  setDeletingCampaign,
  deleteCampLoading,
  onConfirmDelete,
}: DeleteCampaignDialogProps) {
  return (
    <Dialog
      open={!!deletingCampaign}
      onOpenChange={(open) => !open && setDeletingCampaign(null)}
    >
      <DialogContent className="sm:max-w-md bg-card border-border font-sans">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
            <Trash2 className="size-4" />
            <span>Delete Campaign Event</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground space-y-2">
            <span>
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground">{deletingCampaign?.title}</strong> (
              <span className="font-mono font-bold text-foreground">
                {deletingCampaign?.code}
              </span>
              )?
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="size-3.5 shrink-0" />
            <span>Permanent Deletion Warning</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            This will permanently delete this campaign event along with all associated teams, squad memberships, and image set observation logs.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDeletingCampaign(null)}
            disabled={deleteCampLoading}
            className="shadow-arcade active:translate-y-0.5 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirmDelete}
            disabled={deleteCampLoading}
            className="font-bold shadow-arcade-destructive active:translate-y-0.5 cursor-pointer"
          >
            {deleteCampLoading ? "Deleting..." : "Delete Campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
