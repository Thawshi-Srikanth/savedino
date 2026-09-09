"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { UserData } from "./types";

interface DeleteUserDialogProps {
  deletingUser: UserData | null;
  setDeletingUser: (u: UserData | null) => void;
  deleteLoading: boolean;
  onConfirmDelete: () => void;
}

export function DeleteUserDialog({
  deletingUser,
  setDeletingUser,
  deleteLoading,
  onConfirmDelete,
}: DeleteUserDialogProps) {
  return (
    <Dialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
            <Trash2 className="size-4" />
            <span>Delete Account</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Are you sure you want to delete{" "}
            <strong className="text-foreground">{deletingUser?.name}</strong> ({deletingUser?.email}
            )? This action cannot be undone and will remove all their squad memberships and
            submissions.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDeletingUser(null)}
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
            className="font-bold shadow-arcade-destructive active:translate-y-0.5 cursor-pointer"
          >
            {deleteLoading ? "Deleting..." : "Delete User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
