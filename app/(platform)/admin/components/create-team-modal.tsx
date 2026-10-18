"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Telescope,
  Crown,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  UserCheck,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { EventData, TeamData, UserData, getInitials } from "./types";
import { generateInviteCode } from "@/lib/campaign-utils";
import { resolveCountryCode, getCountryFlag } from "@/lib/phone-validation";

interface CreateTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: EventData[];
  users: UserData[];
  onTeamCreated: (newTeam: TeamData) => void;
}

export function CreateTeamModal({
  open,
  onOpenChange,
  events,
  users,
  onTeamCreated,
}: CreateTeamModalProps) {
  const [eventId, setEventId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [leaderId, setLeaderId] = useState<string>("");
  const [inviteCode, setInviteCode] = useState<string>("");
  const [status, setStatus] = useState<string>("FORMING");
  const [isRecruiting, setIsRecruiting] = useState<boolean>(true);
  const [recruitmentNotes, setRecruitmentNotes] = useState<string>("");
  const [leaderContact, setLeaderContact] = useState<string>("");
  const [leaderSearch, setLeaderSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize or reset form state whenever modal opens
  useEffect(() => {
    if (open) {
      setName("");
      setLeaderId("");
      setLeaderSearch("");
      setStatus("FORMING");
      setIsRecruiting(true);
      setRecruitmentNotes("");
      setLeaderContact("");
      setInviteCode(generateInviteCode());

      // Auto-select first active or available campaign if not selected
      if (!eventId && events.length > 0) {
        const activeEvent = events.find((e) => e.status === "ACTIVE") || events[0];
        setEventId(activeEvent.id);
      }
    }
  }, [open, events]);

  const handleRotateInviteCode = () => {
    const newCode = generateInviteCode();
    setInviteCode(newCode);
    toast.info(`Generated new invite code: ${newCode}`);
  };

  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === eventId);
  }, [events, eventId]);

  const selectedLeaderUser = useMemo(() => {
    return users.find((u) => u.id === leaderId);
  }, [users, leaderId]);

  // Filter candidates for squad leader
  const candidateUsers = useMemo(() => {
    return users.filter((u) => {
      // Exclude banned users
      if (u.banned) return false;

      // Filter by search query if typed
      if (leaderSearch.trim()) {
        const query = leaderSearch.toLowerCase().trim();
        const matchesName = u.name.toLowerCase().includes(query);
        const matchesEmail = u.email.toLowerCase().includes(query);
        const matchesInst = u.institution ? u.institution.toLowerCase().includes(query) : false;
        return matchesName || matchesEmail || matchesInst;
      }

      return true;
    });
  }, [users, leaderSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventId) {
      toast.error("Please select a campaign.");
      return;
    }

    if (!name.trim()) {
      toast.error("Please provide a squad name.");
      return;
    }

    if (!leaderId) {
      toast.error("Please select a squad leader.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          name: name.trim(),
          leaderId,
          inviteCode: inviteCode.trim().toUpperCase(),
          status,
          isRecruiting,
          recruitmentNotes: recruitmentNotes.trim() || null,
          leaderContact: leaderContact.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create squad");
      }

      toast.success(data.message || `Squad "${data.team.name}" created successfully.`);
      onTeamCreated(data.team);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create squad.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border font-sans p-0 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header Hero */}
        <div className="p-6 pb-4 border-b border-border bg-gradient-to-b from-muted/30 to-card space-y-1">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs shrink-0">
                <Telescope className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Create Squad Manually
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Register a new research squad, assign a campaign, and designate a squad leader.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          id="create-team-form"
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {/* Campaign Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Telescope className="size-3.5 text-primary" />
                <span>Campaign Event</span>
                <span className="text-destructive">*</span>
              </span>
              {selectedEvent && (
                <span className="text-[11px] font-mono text-muted-foreground">
                  Max size: {selectedEvent.maxTeamSize || 6} members
                </span>
              )}
            </label>
            <Select value={eventId} onValueChange={setEventId}>
              <SelectTrigger className="h-9 text-xs font-sans bg-background">
                <SelectValue placeholder="-- Choose Campaign Event --" />
              </SelectTrigger>
              <SelectContent>
                {events.map((ev) => (
                  <SelectItem key={ev.id} value={ev.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary">{ev.code}</span>
                      <span>&bull;</span>
                      <span className="font-medium text-foreground">{ev.title}</span>
                      <span className="text-muted-foreground text-[10px]">({ev.status})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Squad Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1">
                <span>Squad Name</span>
                <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. Asteroid Hunters Alpha"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-xs bg-background font-sans"
              />
            </div>

            {/* Invite Code (Auto-generated with Rotate button) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Invite Code</span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Shareable code
                </span>
              </label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="h-9 text-xs bg-muted/40 font-mono font-bold uppercase select-all"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRotateInviteCode}
                  className="h-9 px-3 shrink-0 text-xs font-semibold gap-1.5 cursor-pointer shadow-arcade active:translate-y-0.5"
                  title="Generate another code"
                >
                  <RefreshCw className="size-3.5" />
                  <span>Randomize</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Squad Leader Assignment Section */}
          <div className="space-y-2 p-3.5 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Crown className="size-3.5 text-amber-500" />
                <span>Squad Leader Assignment</span>
                <span className="text-destructive">*</span>
              </label>
              {selectedLeaderUser && (
                <button
                  type="button"
                  onClick={() => setLeaderId("")}
                  className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
                >
                  <X className="size-3" />
                  <span>Change Leader</span>
                </button>
              )}
            </div>

            {selectedLeaderUser ? (
              <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-full bg-primary/20 text-primary font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {getInitials(selectedLeaderUser.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-foreground truncate">
                        {selectedLeaderUser.name}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30">
                        <Crown className="size-2.5" />
                        <span>Leader</span>
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground truncate">
                      {selectedLeaderUser.email}
                      {selectedLeaderUser.country && ` &bull; ${selectedLeaderUser.country}`}
                    </div>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] text-emerald-500 border-emerald-500/30 bg-emerald-500/10 shrink-0"
                >
                  <CheckCircle2 className="size-3 mr-1" />
                  Selected
                </Badge>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search candidate by name, email, or institution..."
                    value={leaderSearch}
                    onChange={(e) => setLeaderSearch(e.target.value)}
                    className="pl-8 text-xs h-8 bg-background font-sans"
                  />
                  {leaderSearch && (
                    <button
                      type="button"
                      onClick={() => setLeaderSearch("")}
                      className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="max-h-44 overflow-y-auto rounded-lg border border-border bg-background divide-y divide-border/60">
                  {candidateUsers.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No matching registered users found.
                    </div>
                  ) : (
                    candidateUsers.slice(0, 50).map((u) => {
                      const inThisEvent = u.teamMembers?.some(
                        (tm) => tm.team?.event?.id === eventId
                      );
                      const isUnassigned = !u.teamMembers || u.teamMembers.length === 0;

                      return (
                        <button
                          key={u.id}
                          type="button"
                          disabled={inThisEvent}
                          onClick={() => setLeaderId(u.id)}
                          className={`w-full p-2.5 text-left flex items-center justify-between gap-3 text-xs transition-colors ${
                            inThisEvent
                              ? "opacity-40 cursor-not-allowed bg-muted/20"
                              : "hover:bg-muted/50 cursor-pointer"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-foreground truncate flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isUnassigned ? (
                                <span className="inline-flex items-center text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                  Solo Available
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-[9px] font-medium px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                                  In Squad ({u.teamMembers.length})
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono truncate">
                              {u.email}
                              {u.institution && ` &bull; ${u.institution}`}
                            </div>
                          </div>

                          <div className="shrink-0">
                            {inThisEvent ? (
                              <span className="text-[10px] text-destructive font-semibold">
                                Already in Campaign
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-primary hover:underline">
                                Select Leader &rarr;
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Squad Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Initial Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 text-xs font-sans bg-background">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FORMING">Forming (Open for enrollment)</SelectItem>
                  <SelectItem value="ACTIVE">Active (Ready for research)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Leader Contact Details */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Leader Contact / Link</span>
                <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. WhatsApp link, Discord tag, or email"
                value={leaderContact}
                onChange={(e) => setLeaderContact(e.target.value)}
                className="h-9 text-xs bg-background font-sans"
              />
            </div>
          </div>

          {/* Recruitment Toggle & Notes */}
          <div className="space-y-2 p-3 bg-muted/30 rounded-xl border border-border">
            <div className="flex items-center justify-between">
              <div>
                <label
                  className="text-xs font-bold text-foreground block cursor-pointer"
                  htmlFor="recruiting-checkbox"
                >
                  Recruiting Solo Researchers
                </label>
                <span className="text-[11px] text-muted-foreground block">
                  Allow unassigned students in matchmaking to apply or match into this squad
                </span>
              </div>
              <input
                id="recruiting-checkbox"
                type="checkbox"
                checked={isRecruiting}
                onChange={(e) => setIsRecruiting(e.target.checked)}
                className="size-4 accent-primary rounded cursor-pointer"
              />
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Recruitment Pitch &amp; Notes</span>
                <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
              </label>
              <Textarea
                placeholder="e.g. Looking for data analysis / Astrometrica specialists..."
                value={recruitmentNotes}
                onChange={(e) => setRecruitmentNotes(e.target.value)}
                rows={2}
                className="text-xs bg-background resize-none font-sans"
              />
            </div>
          </div>
        </form>

        {/* Footer Toolbar */}
        <DialogFooter className="p-4 border-t border-border bg-card flex items-center justify-between gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="shadow-arcade active:translate-y-0.5 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-team-form"
            size="sm"
            disabled={!eventId || !name.trim() || !leaderId || loading}
            className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold shadow-arcade-primary active:translate-y-0.5 cursor-pointer gap-1.5"
          >
            {loading ? (
              <>
                <RefreshCw className="size-3.5 animate-spin" />
                <span>Creating Squad...</span>
              </>
            ) : (
              <>
                <Users className="size-3.5" />
                <span>Create Squad</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
