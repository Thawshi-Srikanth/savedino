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

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start w-full font-sans">
      {/* Left Squad Filter Sidebar */}
      <aside className="w-full md:w-56 shrink-0 bg-card border border-border rounded-xl p-3 shadow-[0_3px_0_0_#e2e8f0] dark:shadow-[0_3px_0_0_#27282d] space-y-2.5">
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
                ? "bg-primary text-primary-foreground shadow-[0_2px_0_0_#7c3aed] active:translate-y-0.5 font-bold"
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
                teamCapacityFilter === "OPEN" ? "ALL" : "OPEN"
              )
            }
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              teamCapacityFilter === "OPEN"
                ? "bg-[#10b981] text-white font-bold shadow-[0_2px_0_0_#059669] active:translate-y-0.5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <span>Open Slots (&lt; 6)</span>
            <span className={`font-mono text-[11px] font-bold ${teamCapacityFilter === "OPEN" ? "text-white" : "text-muted-foreground"}`}>
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
                ? "bg-[#8b5cf6] text-white font-bold shadow-[0_2px_0_0_#7c3aed] active:translate-y-0.5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <span>Full Squads (6/6)</span>
            <span className={`font-mono text-[11px] font-bold ${teamCapacityFilter === "FULL" ? "text-white" : "text-muted-foreground"}`}>
              {fullSquadsCount}
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
                <SelectItem value="ALL">All Capacities ({teams.length})</SelectItem>
                <SelectItem value="OPEN">Open Slots ({openSquadsCount})</SelectItem>
                <SelectItem value="FULL">Full Squads ({fullSquadsCount})</SelectItem>
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
                  className="h-8 w-8 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d] active:translate-y-0.5"
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
                  Monitor campaign squad rosters, squad leader assignments, invite codes, and team slot capacities.
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
                  className="h-7 text-xs mt-2 cursor-pointer shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d] active:translate-y-0.5"
                >
                  Reset All Filters
                </Button>
              )}
            </div>
          ) : (
            <Table className="w-full table-fixed border-b border-border">
              <TableHeader className="sticky top-0 z-20 bg-card">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[26%] border-b border-border shadow-xs">Squad &amp; Invite Code</TableHead>
                  <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[18%] border-b border-border shadow-xs">Campaign</TableHead>
                  <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[22%] border-b border-border shadow-xs">Squad Leader</TableHead>
                  <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[28%] border-b border-border shadow-xs">Roster &amp; Capacity</TableHead>
                  <TableHead className="sticky top-0 z-20 bg-card text-right text-xs font-bold py-2.5 px-3 w-[6%] border-b border-border shadow-xs"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTeams.map((t) => {
                  const leaderMember = t.members.find((m) => m.role === "LEADER" || m.role === "leader") || t.members[0];
                  const isFull = t.members.length >= 6;

                  return (
                    <TableRow key={t.id} className="hover:bg-muted/30 border-b border-border/60">
                      {/* Squad Name & Invite Code */}
                      <TableCell className="py-2.5 px-3 w-[26%] min-w-0 overflow-hidden">
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-semibold text-xs text-foreground truncate">
                            {t.name}
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
                          </div>
                        </div>
                      </TableCell>

                      {/* Campaign Event */}
                      <TableCell className="py-2.5 px-3 w-[18%] min-w-0 overflow-hidden">
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
                      <TableCell className="py-2.5 px-3 w-[22%] min-w-0 overflow-hidden">
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

                      {/* Roster & Capacity Badge */}
                      <TableCell className="py-2.5 px-3 w-[28%] min-w-0 overflow-hidden">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2">
                            {isFull ? (
                              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#8b5cf6] text-white shadow-xs tracking-wide">
                                Full (6/6)
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#10b981] text-white shadow-xs tracking-wide">
                                {t.members.length}/6 Members
                              </span>
                            )}
                          </div>

                          {/* Member Chips */}
                          <div className="flex flex-wrap gap-1 max-w-full">
                            {t.members.map((m) => (
                              <span
                                key={m.id}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground font-sans truncate max-w-[110px]"
                                title={m.user.name}
                              >
                                {m.user.name.split(" ")[0]}
                                {(m.role === "LEADER" || m.role === "leader") && " ★"}
                              </span>
                            ))}
                          </div>
                        </div>
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
                          <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                            <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase">
                              Squad Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
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
                            {t.eventId && (
                              <DropdownMenuItem asChild className="text-xs cursor-pointer gap-2">
                                <Link href={`/campaigns/${t.eventId}`}>
                                  <Telescope className="size-3.5" />
                                  <span>View Campaign</span>
                                </Link>
                              </DropdownMenuItem>
                            )}
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
                className="h-7 w-7 p-0 shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d] active:translate-y-0.5 cursor-pointer disabled:opacity-40"
                title="First Page"
              >
                <ChevronsLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTeamCurrentPage((p) => Math.max(1, p - 1))}
                disabled={teamCurrentPage === 1}
                className="h-7 w-7 p-0 shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d] active:translate-y-0.5 cursor-pointer disabled:opacity-40"
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
                          ? "bg-primary text-primary-foreground font-bold shadow-[0_2px_0_0_#7c3aed] active:translate-y-0.5"
                          : "shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d] active:translate-y-0.5 text-muted-foreground hover:text-foreground"
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
                className="h-7 w-7 p-0 shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d] active:translate-y-0.5 cursor-pointer disabled:opacity-40"
                title="Next Page"
              >
                <ChevronRight className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTeamCurrentPage(totalTeamPages)}
                disabled={teamCurrentPage === totalTeamPages}
                className="h-7 w-7 p-0 shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d] active:translate-y-0.5 cursor-pointer disabled:opacity-40"
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
