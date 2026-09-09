"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
  Search,
  RefreshCw,
  HelpCircle,
  Telescope,
  Users,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Edit2,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { toast } from "sonner";
import { TeamData, EventData, getInitials } from "./types";

interface TeamsTabProps {
  teams: TeamData[];
  events: EventData[];
  filteredTeams: TeamData[];
  paginatedTeams: TeamData[];
  teamSearch: string;
  setTeamSearch: (s: string) => void;
  teamCapacityFilter: string;
  setTeamCapacityFilter: (s: string) => void;
  teamCampaignFilter: string;
  setTeamCampaignFilter: (s: string) => void;
  teamCurrentPage: number;
  setTeamCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  teamPageSize: number;
  setTeamPageSize: (n: number) => void;
  totalTeamPages: number;
  getTeamPageNumbers: () => (number | string)[];
  openSquadsCount: number;
  fullSquadsCount: number;
  totalSquadMembers: number;
  totalOpenSlots: number;
  loading: boolean;
  fetchAdminData: () => void;
  onQuickStatusChange: (teamId: string, newStatus: string) => void;
  onRotateInviteCode: (teamId: string) => void;
  onEditTeam: (team: TeamData) => void;
  onReportTeam: (team: TeamData) => void;
  onDeleteTeam: (team: TeamData) => void;
}

export function TeamsTab({
  teams,
  events,
  filteredTeams,
  paginatedTeams,
  teamSearch,
  setTeamSearch,
  teamCapacityFilter,
  setTeamCapacityFilter,
  teamCampaignFilter,
  setTeamCampaignFilter,
  teamCurrentPage,
  setTeamCurrentPage,
  teamPageSize,
  setTeamPageSize,
  totalTeamPages,
  getTeamPageNumbers,
  openSquadsCount,
  fullSquadsCount,
  totalSquadMembers,
  totalOpenSlots,
  loading,
  fetchAdminData,
  onQuickStatusChange,
  onRotateInviteCode,
  onEditTeam,
  onReportTeam,
  onDeleteTeam,
}: TeamsTabProps) {
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Invite code '${code}' copied to clipboard!`);
  };

  const handleCopyJoinLink = (code: string) => {
    const url = `${window.location.origin}/teams?join=${code}`;
    navigator.clipboard.writeText(url);
    toast.success("Squad join link copied to clipboard!");
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#10b981] text-white shadow-xs tracking-wide">
            Active
          </span>
        );
      case "FORMING":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0284c7] dark:bg-[#38bdf8] text-white dark:text-slate-950 shadow-xs tracking-wide">
            Forming
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f59e0b] text-[#0f172a] shadow-xs tracking-wide">
            Submitted
          </span>
        );
      case "DISQUALIFIED":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-destructive text-destructive-foreground shadow-xs tracking-wide">
            Disabled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 shadow-xs tracking-wide">
            {status}
          </span>
        );
    }
  };

  const disabledSquadsCount = teams.filter((t) => t.status === "DISQUALIFIED").length;
  const activeSquadsCount = teams.filter((t) => t.status === "ACTIVE").length;

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start w-full font-sans">
      {/* Left Squad Filter Sidebar */}
      <aside className="w-full md:w-56 shrink-0 bg-card border border-border rounded-xl p-3 shadow-arcade-lg space-y-2.5">
        <div className="px-2 py-1 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-sans">
            Squad Rosters
          </span>
          <Badge variant="secondary" className="text-[10px] font-mono font-bold px-1.5 py-0 bg-muted text-foreground">
            {teams.length}
          </Badge>
        </div>

        <nav className="space-y-1">
          <button
            type="button"
            onClick={() => setTeamCapacityFilter("ALL")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              teamCapacityFilter === "ALL"
                ? "bg-primary text-primary-foreground shadow-arcade-primary active:translate-y-0.5 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <span>All Squads</span>
            <span className="font-mono text-[11px] font-bold">{teams.length}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setTeamCapacityFilter(
                teamCapacityFilter === "ACTIVE" ? "ALL" : "ACTIVE"
              )
            }
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              teamCapacityFilter === "ACTIVE"
                ? "bg-[#10b981] text-white font-bold shadow-arcade-emerald active:translate-y-0.5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <span>Active Squads</span>
            <span className={`font-mono text-[11px] font-bold ${teamCapacityFilter === "ACTIVE" ? "text-white" : "text-muted-foreground"}`}>
              {activeSquadsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setTeamCapacityFilter(
                teamCapacityFilter === "OPEN" ? "ALL" : "OPEN"
              )
            }
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              teamCapacityFilter === "OPEN"
                ? "bg-[#0284c7] dark:bg-[#38bdf8] text-white dark:text-slate-950 font-bold shadow-arcade active:translate-y-0.5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <span>Open Slots</span>
            <span className={`font-mono text-[11px] font-bold ${teamCapacityFilter === "OPEN" ? "text-white dark:text-slate-950" : "text-muted-foreground"}`}>
              {openSquadsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setTeamCapacityFilter(
                teamCapacityFilter === "FULL" ? "ALL" : "FULL"
              )
            }
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              teamCapacityFilter === "FULL"
                ? "bg-[#8b5cf6] text-white font-bold shadow-arcade-primary active:translate-y-0.5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <span>Full Squads</span>
            <span className={`font-mono text-[11px] font-bold ${teamCapacityFilter === "FULL" ? "text-white" : "text-muted-foreground"}`}>
              {fullSquadsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setTeamCapacityFilter(
                teamCapacityFilter === "DISQUALIFIED" ? "ALL" : "DISQUALIFIED"
              )
            }
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              teamCapacityFilter === "DISQUALIFIED"
                ? "bg-destructive text-destructive-foreground font-bold shadow-arcade-destructive active:translate-y-0.5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <span>Disabled / Reported</span>
            <span className={`font-mono text-[11px] font-bold ${teamCapacityFilter === "DISQUALIFIED" ? "text-destructive-foreground" : "text-destructive"}`}>
              {disabledSquadsCount}
            </span>
          </button>
        </nav>

        {/* Quick Summary Metrics */}
        <div className="pt-2.5 border-t border-border space-y-1.5 text-[11px] text-muted-foreground px-1">
          <div className="flex justify-between">
            <span>Researchers in Squads:</span>
            <span className="font-bold text-foreground font-mono">{totalSquadMembers}</span>
          </div>
          <div className="flex justify-between">
            <span>Open Squad Slots:</span>
            <span className="font-bold text-[#10b981] font-mono">{totalOpenSlots}</span>
          </div>
          <div className="flex justify-between">
            <span>Full Squads:</span>
            <span className="font-bold text-[#8b5cf6] font-mono">{fullSquadsCount}</span>
          </div>
          {disabledSquadsCount > 0 && (
            <div className="flex justify-between text-destructive">
              <span>Disabled Squads:</span>
              <span className="font-bold font-mono">{disabledSquadsCount}</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Squad Management Table Card */}
      <Card className="p-0 overflow-hidden flex flex-col border border-border rounded-xl flex-1 min-w-0 w-full bg-card shadow-xs">
        {/* Controls Toolbar */}
        <div className="p-3 border-b border-border shrink-0 bg-card">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search squad name, invite code, campaign, or member..."
                value={teamSearch}
                onChange={(e) => {
                  setTeamSearch(e.target.value);
                  setTeamCurrentPage(1);
                }}
                className="pl-8 text-xs h-8 bg-background font-sans"
              />
              {teamSearch && (
                <button
                  type="button"
                  onClick={() => setTeamSearch("")}
                  className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Capacity Filter Selector */}
            <Select
              value={teamCapacityFilter}
              onValueChange={(val) => {
                setTeamCapacityFilter(val);
                setTeamCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs font-sans bg-background w-full sm:w-[140px]">
                <SelectValue placeholder="All Capacities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses ({teams.length})</SelectItem>
                <SelectItem value="ACTIVE">Active ({activeSquadsCount})</SelectItem>
                <SelectItem value="OPEN">Open Slots ({openSquadsCount})</SelectItem>
                <SelectItem value="FULL">Full Squads ({fullSquadsCount})</SelectItem>
                <SelectItem value="DISQUALIFIED">Disabled ({disabledSquadsCount})</SelectItem>
              </SelectContent>
            </Select>

            {/* Campaign Filter Selector */}
            <Select
              value={teamCampaignFilter}
              onValueChange={(val) => {
                setTeamCampaignFilter(val);
                setTeamCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs font-sans bg-background w-full sm:w-[140px]">
                <SelectValue placeholder="All Campaigns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Campaigns</SelectItem>
                {events.map((ev) => (
                  <SelectItem key={ev.id} value={ev.id}>
                    {ev.code} ({ev.title.slice(0, 16)}...)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Refresh Icon Button with Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={fetchAdminData}
                  className="h-8 w-8 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground shadow-arcade active:translate-y-0.5"
                >
                  <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Refresh data
              </TooltipContent>
            </Tooltip>

            {/* Info Tooltip (Ghost Icon Button) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0 cursor-help text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg"
                  aria-label="Squads guide"
                >
                  <HelpCircle className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="end" className="max-w-xs p-3 space-y-1 shadow-lg border border-border bg-popover text-popover-foreground rounded-lg">
                <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <HelpCircle className="size-3.5 text-[#8b5cf6]" />
                  <span>Squad &amp; Roster Management</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Monitor campaign squad rosters, squad leader assignments, edit details, disable/disqualify, and report squads.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Scrollable Table Area */}
        <div className="w-full overflow-x-auto min-h-0 relative">
          {filteredTeams.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-foreground space-y-2">
              <Telescope className="size-8 mx-auto text-muted-foreground/30 mb-1" />
              <div className="font-semibold text-sm text-foreground">No matching squads found</div>
              <p className="text-muted-foreground max-w-sm mx-auto">
                No campaign squads match your active search and filter criteria. Try clearing filters.
              </p>
              {(teamSearch || teamCapacityFilter !== "ALL" || teamCampaignFilter !== "ALL") && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTeamSearch("");
                    setTeamCapacityFilter("ALL");
                    setTeamCampaignFilter("ALL");
                  }}
                  className="h-7 text-xs mt-2 cursor-pointer shadow-arcade active:translate-y-0.5"
                >
                  Reset All Filters
                </Button>
              )}
            </div>
          ) : (
            <Table className="w-full table-fixed border-b border-border">
              <TableHeader className="sticky top-0 z-20 bg-card">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[18%] border-b border-border shadow-xs">Squad &amp; Code</TableHead>
                  <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[11%] border-b border-border shadow-xs">Status</TableHead>
                  <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[13%] border-b border-border shadow-xs">Campaign</TableHead>
                  <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[16%] border-b border-border shadow-xs">Squad Leader</TableHead>
                  <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[15%] border-b border-border shadow-xs">Roster</TableHead>
                  <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[21%] border-b border-border shadow-xs">Disclaimer &amp; Notes</TableHead>
                  <TableHead className="sticky top-0 z-20 bg-card text-right text-xs font-bold py-2.5 px-3 w-[6%] border-b border-border shadow-xs"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTeams.map((t) => {
                  const leaderMember = t.members.find((m) => m.role === "LEADER" || m.role === "leader" || m.userId === t.leaderId) || t.members[0];
                  const maxTeamSize = t.event?.maxTeamSize || 6;
                  const isFull = t.members.length >= maxTeamSize;
                  const isDisqualified = t.status === "DISQUALIFIED";

                  return (
                    <TableRow key={t.id} className="hover:bg-muted/30 border-b border-border/60">
                      {/* Squad Name & Invite Code */}
                      <TableCell className="py-2.5 px-3 w-[18%] min-w-0 overflow-hidden">
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-semibold text-xs text-foreground truncate flex items-center gap-1.5">
                            <span className="truncate">{t.name}</span>
                            {isDisqualified && (
                              <span className="size-1.5 rounded-full bg-destructive shrink-0" title="Squad Disabled" />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <span className="text-muted-foreground font-sans">Code:</span>
                            <span className="font-bold text-primary font-mono">{t.inviteCode}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(t.inviteCode)}
                              className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                              title="Copy Invite Code"
                            >
                              <Copy className="size-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onRotateInviteCode(t.id)}
                              className="text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                              title="Rotate & generate new unique invite code"
                            >
                              <RefreshCw className="size-3" />
                            </button>
                          </div>
                        </div>
                      </TableCell>

                      {/* Status Dropdown */}
                      <TableCell className="py-2.5 px-3 w-[11%] whitespace-nowrap overflow-hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="focus:outline-hidden hover:opacity-85 transition-opacity cursor-pointer inline-flex items-center"
                            >
                              {renderStatusBadge(t.status)}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48 bg-card border-border">
                            <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase">
                              Change Squad Status
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onQuickStatusChange(t.id, "ACTIVE")}
                              className="text-xs cursor-pointer"
                            >
                              <span>Active</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onQuickStatusChange(t.id, "FORMING")}
                              className="text-xs cursor-pointer"
                            >
                              <span>Forming</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onQuickStatusChange(t.id, "SUBMITTED")}
                              className="text-xs cursor-pointer"
                            >
                              <span>Submitted</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onQuickStatusChange(t.id, "DISQUALIFIED")}
                              className="text-xs cursor-pointer text-destructive focus:text-destructive"
                            >
                              <span>Disable / Disqualify</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>

                      {/* Campaign Event */}
                      <TableCell className="py-2.5 px-3 w-[13%] min-w-0 overflow-hidden">
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-mono text-xs font-bold text-primary truncate">
                            {t.event?.code || "AST"}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {t.event?.title || "Campaign Event"}
                          </div>
                        </div>
                      </TableCell>

                      {/* Squad Leader */}
                      <TableCell className="py-2.5 px-3 w-[16%] min-w-0 overflow-hidden">
                        {leaderMember ? (
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="size-6 rounded-full bg-muted border border-border flex items-center justify-center font-mono text-[9px] font-bold text-foreground shrink-0">
                              {getInitials(leaderMember.user.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-xs text-foreground truncate">
                                {leaderMember.user.name}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-mono truncate">
                                {leaderMember.user.email}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No leader assigned</span>
                        )}
                      </TableCell>

                      {/* Roster & Capacity */}
                      <TableCell className="py-2.5 px-3 w-[15%] min-w-0 overflow-hidden">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {isFull ? (
                              <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#8b5cf6] text-white shadow-xs">
                                {t.members.length}/{maxTeamSize} Full
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#10b981] text-white shadow-xs">
                                {t.members.length}/{maxTeamSize}
                              </span>
                            )}
                            <span className="text-[11px] text-muted-foreground font-mono">
                              ({Math.max(0, maxTeamSize - t.members.length)} open)
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1 max-w-full">
                            {t.members.slice(0, 3).map((m) => (
                              <span
                                key={m.id}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-foreground font-sans truncate max-w-[85px]"
                                title={m.user.name}
                              >
                                {m.user.name.split(" ")[0]}
                              </span>
                            ))}
                            {t.members.length > 3 && (
                              <span className="text-[10px] text-muted-foreground font-mono font-bold">
                                +{t.members.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Disclaimer & Moderation Notes */}
                      <TableCell className="py-2.5 px-3 w-[21%] min-w-0 overflow-hidden">
                        {t.disqualificationReason || t.recruitmentNotes ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-pointer group flex items-start gap-1.5 min-w-0">
                                {t.disqualificationReason ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-destructive text-white shadow-xs shrink-0">
                                    <ShieldAlert className="size-3 text-white" />
                                    Disabled
                                  </span>
                                ) : t.recruitmentNotes?.includes("[ADMIN") ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-destructive text-white shadow-xs shrink-0">
                                    <ShieldAlert className="size-3 text-white" />
                                    Notice
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-foreground border border-border shrink-0">
                                    <FileText className="size-3 text-primary" />
                                    Notes
                                  </span>
                                )}
                                <span className="text-[11px] text-muted-foreground group-hover:text-foreground line-clamp-2 leading-tight break-words min-w-0 flex-1">
                                  {t.disqualificationReason || t.recruitmentNotes?.replace(/^\[ADMIN [^\]]*\]:\s*/, "")}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="start" className="max-w-sm p-3 space-y-2 bg-popover text-popover-foreground border border-border shadow-xl rounded-lg">
                              {t.disqualificationReason && (
                                <div className="space-y-1">
                                  <div className="font-bold text-xs flex items-center gap-1.5 text-destructive">
                                    <ShieldAlert className="size-3.5 text-destructive" />
                                    <span>Disqualification Reason</span>
                                  </div>
                                  <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed font-sans bg-destructive/10 p-2 rounded border border-destructive/20">
                                    {t.disqualificationReason}
                                  </p>
                                </div>
                              )}
                              {t.recruitmentNotes && (
                                <div className="space-y-1">
                                  <div className="font-bold text-xs flex items-center gap-1.5 text-foreground">
                                    <FileText className="size-3.5 text-primary" />
                                    <span>Recruitment Stance Notes</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans">
                                    {t.recruitmentNotes}
                                  </p>
                                </div>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-xs text-muted-foreground/50 font-sans italic">
                            &mdash;
                          </span>
                        )}
                      </TableCell>

                      {/* Actions Dropdown */}
                      <TableCell className="py-2.5 px-3 w-[6%] text-right whitespace-nowrap overflow-hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer rounded-md"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 bg-card border-border">
                            <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase">
                              Squad Management
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onEditTeam(t)}
                              className="text-xs cursor-pointer gap-2"
                            >
                              <Edit2 className="size-3.5" />
                              <span>Edit Squad Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onRotateInviteCode(t.id)}
                              className="text-xs cursor-pointer gap-2"
                            >
                              <RefreshCw className="size-3.5" />
                              <span>Rotate Invite Code</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCopyCode(t.inviteCode)}
                              className="text-xs cursor-pointer gap-2"
                            >
                              <Copy className="size-3.5" />
                              <span>Copy Invite Code</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCopyJoinLink(t.inviteCode)}
                              className="text-xs cursor-pointer gap-2"
                            >
                              <ExternalLink className="size-3.5" />
                              <span>Copy Join Link</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onReportTeam(t)}
                              className="text-xs cursor-pointer gap-2 text-amber-500 focus:text-amber-500"
                            >
                              <AlertTriangle className="size-3.5" />
                              <span>Report / Disable Squad</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDeleteTeam(t)}
                              className="text-xs cursor-pointer gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                              <span>Delete Squad</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination Footer */}
        {filteredTeams.length > 0 && (
          <div className="p-2.5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground bg-card">
            {/* Rows info */}
            <div className="flex items-center gap-2">
              <span>
                Showing{" "}
                <strong className="text-foreground font-mono">
                  {Math.min(filteredTeams.length, (teamCurrentPage - 1) * teamPageSize + 1)}
                </strong>{" "}
                to{" "}
                <strong className="text-foreground font-mono">
                  {Math.min(filteredTeams.length, teamCurrentPage * teamPageSize)}
                </strong>{" "}
                of <strong className="text-foreground font-mono">{filteredTeams.length}</strong> squads
              </span>

              {/* Rows Per Page Selector */}
              <div className="flex items-center gap-1.5 ml-2 border-l border-border pl-3">
                <span className="text-[11px]">Rows:</span>
                <Select
                  value={teamPageSize.toString()}
                  onValueChange={(val) => {
                    setTeamPageSize(Number(val));
                    setTeamCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-6 w-14 text-xs font-mono bg-background">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5" className="text-xs font-mono">5</SelectItem>
                    <SelectItem value="10" className="text-xs font-mono">10</SelectItem>
                    <SelectItem value="20" className="text-xs font-mono">20</SelectItem>
                    <SelectItem value="50" className="text-xs font-mono">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Page Buttons with 3D Arcade tactile feel */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTeamCurrentPage(1)}
                disabled={teamCurrentPage === 1}
                className="h-7 w-7 p-0 shadow-arcade active:translate-y-0.5 cursor-pointer disabled:opacity-40"
                title="First Page"
              >
                <ChevronsLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTeamCurrentPage((p) => Math.max(1, p - 1))}
                disabled={teamCurrentPage === 1}
                className="h-7 w-7 p-0 shadow-arcade active:translate-y-0.5 cursor-pointer disabled:opacity-40"
                title="Previous Page"
              >
                <ChevronLeft className="size-3.5" />
              </Button>

              {/* Dynamic Page Numbers */}
              <div className="flex items-center gap-1 mx-1">
                {getTeamPageNumbers().map((page, idx) => {
                  if (page === "...") {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-1.5 py-0.5 text-xs text-muted-foreground font-mono">
                        ...
                      </span>
                    );
                  }
                  const pageNum = Number(page);
                  const isActive = teamCurrentPage === pageNum;
                  return (
                    <Button
                      key={`page-${pageNum}`}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTeamCurrentPage(pageNum)}
                      className={`h-7 min-w-[28px] px-2 text-xs font-mono cursor-pointer transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground font-bold shadow-arcade-primary active:translate-y-0.5"
                          : "shadow-arcade active:translate-y-0.5 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setTeamCurrentPage((p) => Math.min(totalTeamPages, p + 1))}
                disabled={teamCurrentPage === totalTeamPages}
                className="h-7 w-7 p-0 shadow-arcade active:translate-y-0.5 cursor-pointer disabled:opacity-40"
                title="Next Page"
              >
                <ChevronRight className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTeamCurrentPage(totalTeamPages)}
                disabled={teamCurrentPage === totalTeamPages}
                className="h-7 w-7 p-0 shadow-arcade active:translate-y-0.5 cursor-pointer disabled:opacity-40"
                title="Last Page"
              >
                <ChevronsRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
