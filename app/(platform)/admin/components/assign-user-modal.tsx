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
import { UserData, TeamData } from "./types";

interface AssignUserModalProps {
  assigningUser: UserData | null;
  setAssigningUser: (u: UserData | null) => void;
  teams: TeamData[];
  selectedTeamId: string;
  setSelectedTeamId: (id: string) => void;
  assignLoading: boolean;
  onAssign: (e: React.FormEvent) => void;
}

export function AssignUserModal({
  assigningUser,
  setAssigningUser,
  teams,
  selectedTeamId,
  setSelectedTeamId,
  assignLoading,
  onAssign,
}: AssignUserModalProps) {
  return (
    <Dialog open={!!assigningUser} onOpenChange={() => setAssigningUser(null)}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">
            Assign Solo Student to Squad
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Assigning <strong className="text-foreground">{assigningUser?.name}</strong> (
            {assigningUser?.email}) into an open team slot.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onAssign} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase mb-1.5 text-foreground">
              Select Open Squad
            </label>
            <select
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden font-sans"
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              required
            >
              <option value="">-- Choose a Squad --</option>
              {teams
                .filter((t) => !t.event?.maxTeamSize || t.members.length < t.event.maxTeamSize)
                .map((t) => {
                  const maxCap = t.event?.maxTeamSize ? `${t.event.maxTeamSize}` : "∞";
                  return (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.event?.code || "AST"}) &bull; {t.members.length}/{maxCap} Members
                    </option>
                  );
                })}
            </select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAssigningUser(null)}
              disabled={assignLoading}
              className="shadow-arcade active:translate-y-0.5 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={!selectedTeamId || assignLoading}
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold shadow-arcade-primary active:translate-y-0.5 cursor-pointer"
            >
              {assignLoading ? "Assigning..." : "Confirm Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
