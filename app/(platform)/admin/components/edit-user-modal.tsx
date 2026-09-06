"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserData } from "./types";

interface EditUserModalProps {
  editingUser: UserData | null;
  setEditingUser: (u: UserData | null) => void;
  editName: string;
  setEditName: (name: string) => void;
  editRole: string;
  setEditRole: (role: string) => void;
  editInstitution: string;
  setEditInstitution: (inst: string) => void;
  editCountry: string;
  setEditCountry: (country: string) => void;
  editVerified: boolean;
  setEditVerified: (v: boolean) => void;
  editLoading: boolean;
  onSave: (e: React.FormEvent) => void;
}

export function EditUserModal({
  editingUser,
  setEditingUser,
  editName,
  setEditName,
  editRole,
  setEditRole,
  editInstitution,
  setEditInstitution,
  editCountry,
  setEditCountry,
  editVerified,
  setEditVerified,
  editLoading,
  onSave,
}: EditUserModalProps) {
  return (
    <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">
            Edit User &amp; Platform Role
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update platform access level, contact information, and role for <strong className="text-foreground">{editingUser?.email}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSave} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Full Name</label>
            <Input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-9 text-xs bg-background font-sans"
            />
          </div>

          {/* Platform Role Select */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Platform Role</label>
            <Select value={editRole} onValueChange={setEditRole}>
              <SelectTrigger className="h-9 text-xs font-sans bg-background">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator (Full Platform Control)</SelectItem>
                <SelectItem value="staff">Staff (Moderator &amp; Operations)</SelectItem>
                <SelectItem value="user">Citizen Scientist (General Participant)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Institution & Country */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Institution / School</label>
              <Input
                type="text"
                placeholder="e.g. MIT, Cambridge"
                value={editInstitution}
                onChange={(e) => setEditInstitution(e.target.value)}
                className="h-9 text-xs bg-background font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Country</label>
              <Input
                type="text"
                placeholder="e.g. United States, Japan"
                value={editCountry}
                onChange={(e) => setEditCountry(e.target.value)}
                className="h-9 text-xs bg-background font-sans"
              />
            </div>
          </div>

          {/* Email Verified Checkbox */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-background">
            <input
              type="checkbox"
              id="editVerifiedCheckbox"
              checked={editVerified}
              onChange={(e) => setEditVerified(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-primary"
            />
            <label htmlFor="editVerifiedCheckbox" className="text-xs font-medium cursor-pointer text-foreground">
              Email Verified / Active Account
            </label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingUser(null)}
              disabled={editLoading}
              className="shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d] active:translate-y-0.5 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={editLoading}
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold shadow-[0_2px_0_0_#7c3aed] active:translate-y-0.5 cursor-pointer"
            >
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
