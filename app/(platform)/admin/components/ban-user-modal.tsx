"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldAlert, UserCheck, AlertTriangle, Mail, UserX, AlertCircle } from "lucide-react";
import { UserData } from "./types";

export const PREDEFINED_BAN_REASONS = [
  "Violation of Code of Conduct / Platform Terms",
  "Academic Dishonesty / Data Falsification or Plagiarism in Asteroid Submissions",
  "Harassment, Abuse, or Disruptive Behavior towards Squad Members or Organizers",
  "Multiple Accounts / Identity Impersonation",
  "Automated Botting, Scraping, or Unauthorized Scripting",
  "Spam, Advertising, or Phishing Links",
  "Other Reason (Specify below)",
] as const;

export type ModerationAction = "BAN" | "UNBAN" | "WARN_NAME";

interface BanUserModalProps {
  user: UserData | null;
  initialAction?: ModerationAction;
  onClose: () => void;
  loading: boolean;
  onConfirmAction: (
    userId: string,
    action: ModerationAction,
    reason: string,
    customMessage: string,
    sendEmail: boolean
  ) => Promise<void> | void;
}

export function BanUserModal({
  user,
  initialAction = "BAN",
  onClose,
  loading,
  onConfirmAction,
}: BanUserModalProps) {
  const isCurrentlyBanned = Boolean(user?.banned);

  const [activeTab, setActiveTab] = useState<"BAN" | "WARN_NAME">("BAN");
  const [selectedReason, setSelectedReason] = useState<string>(PREDEFINED_BAN_REASONS[0]);
  const [customMessage, setCustomMessage] = useState<string>("");
  const [sendEmail, setSendEmail] = useState<boolean>(true);

  // Reset fields when opening modal for a new user
  useEffect(() => {
    if (user) {
      setActiveTab(initialAction === "WARN_NAME" ? "WARN_NAME" : "BAN");
      setSelectedReason(PREDEFINED_BAN_REASONS[0]);
      setCustomMessage("");
      setSendEmail(true);
    }
  }, [user, initialAction]);

  if (!user) return null;

  const isOtherSelected = selectedReason === "Other Reason (Specify below)";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (isCurrentlyBanned) {
      await onConfirmAction(user.id, "UNBAN", "", "", false);
    } else if (activeTab === "WARN_NAME") {
      await onConfirmAction(
        user.id,
        "WARN_NAME",
        "Invalid / Incomplete Full Name",
        customMessage.trim(),
        true
      );
    } else {
      const finalReason = isOtherSelected
        ? customMessage.trim() || "Violation of Community Guidelines"
        : selectedReason;

      await onConfirmAction(user.id, "BAN", finalReason, customMessage.trim(), sendEmail);
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border font-sans">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-lg ${
                isCurrentlyBanned
                  ? "bg-emerald-500/10 text-emerald-500"
                  : activeTab === "WARN_NAME"
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-destructive/10 text-destructive"
              }`}
            >
              {isCurrentlyBanned ? (
                <UserCheck className="size-5" />
              ) : activeTab === "WARN_NAME" ? (
                <AlertCircle className="size-5" />
              ) : (
                <ShieldAlert className="size-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {isCurrentlyBanned
                  ? "Reinstate Account"
                  : activeTab === "WARN_NAME"
                    ? "Send Invalid Name Warning"
                    : "Ban User Account"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Target User: <strong className="text-foreground">{user.name}</strong> ({user.email})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Action Type Mode Switcher (When user is active) */}
        {!isCurrentlyBanned && (
          <div className="grid grid-cols-2 p-1 bg-muted rounded-lg text-xs font-semibold gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("BAN")}
              className={`py-1.5 px-3 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "BAN"
                  ? "bg-destructive text-destructive-foreground font-bold shadow-arcade-destructive"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/60"
              }`}
            >
              <UserX className="size-3.5" />
              <span>Ban Account</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("WARN_NAME")}
              className={`py-1.5 px-3 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "WARN_NAME"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-arcade"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/60"
              }`}
            >
              <AlertCircle className="size-3.5" />
              <span>Name Warning</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {isCurrentlyBanned ? (
            // Reinstating an already banned user
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-destructive">
                  <AlertTriangle className="size-4" />
                  <span>Currently Suspended</span>
                </div>
                <p className="text-muted-foreground">
                  Reason:{" "}
                  <strong className="text-foreground">{user.banReason || "Not specified"}</strong>
                </p>
                {user.bannedAt && (
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Suspended on: {new Date(user.bannedAt).toLocaleString()}
                  </p>
                )}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Reinstating this account will allow <strong>{user.name}</strong> to sign in and
                participate in campaigns again.
              </p>
            </div>
          ) : activeTab === "WARN_NAME" ? (
            // WARN_NAME mode (Invalid Full Name Warning)
            <div className="space-y-3.5">
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs text-amber-500 dark:text-amber-400 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="size-3.5" />
                  <span>Notice: This will NOT ban the user</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  An email warning will be dispatched instructing the user to update their full
                  legal name in their profile settings before campaign registration closes to
                  participate.
                </p>
              </div>

              {/* Current Name Preview */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Current Name on Record
                </label>
                <div className="p-2 rounded bg-background border border-border text-xs font-mono text-foreground font-semibold">
                  {user.name}
                </div>
              </div>

              {/* Custom Organizer Note */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Specific Organizer Note (Optional)</span>
                  <span className="text-[11px] text-muted-foreground font-normal">
                    Included in email
                  </span>
                </label>
                <Textarea
                  rows={3}
                  placeholder="e.g., Please enter your authentic first and last legal name (no initials or nicknames) for NASA/IASC certificates."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="text-xs bg-background resize-none font-sans"
                />
              </div>

              <div className="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded border border-border">
                The email includes a direct button to{" "}
                <code className="text-primary font-mono font-bold">/profile</code> where they can
                update their full name.
              </div>
            </div>
          ) : (
            // BAN mode (Ban user account)
            <div className="space-y-3.5">
              {/* Primary Predefined Reason Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Primary Violation Reason</span>
                  <span className="text-[11px] text-muted-foreground font-normal">Predefined</span>
                </label>
                <Select value={selectedReason} onValueChange={(val) => setSelectedReason(val)}>
                  <SelectTrigger className="h-9 text-xs font-sans bg-background border-border">
                    <SelectValue placeholder="Select primary reason" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {PREDEFINED_BAN_REASONS.map((r) => (
                      <SelectItem key={r} value={r} className="text-xs">
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Manual Custom Message / Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>
                    {isOtherSelected ? "Specific Reason / Notes *" : "Additional Notes (Optional)"}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-normal">
                    Included in email notice
                  </span>
                </label>
                <Textarea
                  rows={3}
                  required={isOtherSelected}
                  placeholder={
                    isOtherSelected
                      ? "Explain the specific violation reason..."
                      : "Add specific notes, violation context, or instructions for the user..."
                  }
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="text-xs bg-background resize-none font-sans"
                />
              </div>

              {/* Send Email Notice Option */}
              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="sendBanEmail"
                  checked={sendEmail}
                  onCheckedChange={(checked: boolean | "indeterminate") =>
                    setSendEmail(Boolean(checked))
                  }
                />
                <label
                  htmlFor="sendBanEmail"
                  className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1.5 select-none"
                >
                  <Mail className="size-3.5 text-primary" />
                  <span>Send suspension email notice to {user.email}</span>
                </label>
              </div>

              {/* Squad Leader Warning Notice */}
              <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-[11px] text-destructive leading-relaxed">
                Banning this user will immediately revoke active logins, remove them from all
                research squads, and automatically notify their squad leader(s).
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="shadow-arcade active:translate-y-0.5 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading || (activeTab === "BAN" && isOtherSelected && !customMessage.trim())
              }
              className={`font-bold active:translate-y-0.5 cursor-pointer ${
                isCurrentlyBanned
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-arcade"
                  : activeTab === "WARN_NAME"
                    ? "bg-amber-600 hover:bg-amber-700 text-white shadow-arcade"
                    : "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-arcade-destructive"
              }`}
            >
              {loading
                ? "Processing..."
                : isCurrentlyBanned
                  ? "Reinstate Account"
                  : activeTab === "WARN_NAME"
                    ? "Send Name Warning Email"
                    : "Ban Account & Remove from Squads"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
