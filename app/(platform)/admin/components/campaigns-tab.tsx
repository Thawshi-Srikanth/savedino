"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Rocket,
  PlusCircle,
  Search,
  RefreshCw,
  HelpCircle,
  Calendar,
  ExternalLink,
  MoreHorizontal,
  Edit2,
  Copy,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { toast } from "sonner";
import { EventData } from "./types";

interface CampaignsTabProps {
  events: EventData[];
  filteredCampaigns: EventData[];
  paginatedCampaigns: EventData[];
  campaignSearch: string;
  setCampaignSearch: (s: string) => void;
  campaignStatusFilter: string;
  setCampaignStatusFilter: (s: string) => void;
  campaignCurrentPage: number;
  setCampaignCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  campaignPageSize: number;
  setCampaignPageSize: (n: number) => void;
  totalCampaignPages: number;
  getCampaignPageNumbers: () => (number | string)[];
  activeCampCount: number;
  upcomingCampCount: number;
  subOpenCampCount: number;
  completedCampCount: number;
  loading: boolean;
  fetchAdminData: () => void;
  onQuickStatusChange: (eventId: string, newStatus: string) => void;
  onEditCampaign: (ev: EventData) => void;
  onDeleteCampaign: (ev: EventData) => void;
}

export function CampaignsTab({
  events,
  filteredCampaigns,
  paginatedCampaigns,
  campaignSearch,
  setCampaignSearch,
  campaignStatusFilter,
  setCampaignStatusFilter,
  campaignCurrentPage,
  setCampaignCurrentPage,
  campaignPageSize,
  setCampaignPageSize,
  totalCampaignPages,
  getCampaignPageNumbers,
  activeCampCount,
  upcomingCampCount,
  subOpenCampCount,
  completedCampCount,
  loading,
  fetchAdminData,
  onQuickStatusChange,
  onEditCampaign,
  onDeleteCampaign,
}: CampaignsTabProps) {
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#10b981] text-white shadow-xs tracking-wide">
            Active
          </span>
        );
      case "UPCOMING":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0284c7] dark:bg-[#38bdf8] text-white dark:text-slate-950 shadow-xs tracking-wide">
            Upcoming
          </span>
        );
      case "SUBMISSION_OPEN":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f59e0b] text-[#0f172a] shadow-xs tracking-wide">
            Submissions
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-300 text-slate-800 dark:bg-slate-800 dark:text-slate-300 shadow-xs tracking-wide">
            Completed
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

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start w-full">
      {/* Left Campaign Status Filter Sidebar */}
      <aside className="w-full md:w-56 shrink-0 bg-card border border-border rounded-xl p-3 shadow-arcade-lg space-y-2.5">
        <div className="px-2 py-1 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-sans">
            Campaign Status
          </span>
          <Badge
            variant="secondary"
            className="text-[10px] font-mono font-bold px-1.5 py-0 bg-muted text-foreground"
          >
            {events.length}
          </Badge>
        </div>

        <nav className="space-y-1">
          <button
            type="button"
            onClick={() => setCampaignStatusFilter("ALL")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              campaignStatusFilter === "ALL"
                ? "bg-primary text-primary-foreground shadow-arcade-primary active:translate-y-0.5 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <span>All Campaigns</span>
            <span className="font-mono text-[11px] font-bold">{events.length}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setCampaignStatusFilter(campaignStatusFilter === "ACTIVE" ? "ALL" : "ACTIVE")
            }
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              campaignStatusFilter === "ACTIVE"
                ? "bg-[#10b981] text-white font-bold shadow-arcade-emerald active:translate-y-0.5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <span>Active Now</span>
            <span
              className={`font-mono text-[11px] font-bold ${campaignStatusFilter === "ACTIVE" ? "text-white" : "text-muted-foreground"}`}
            >
              {activeCampCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setCampaignStatusFilter(campaignStatusFilter === "UPCOMING" ? "ALL" : "UPCOMING")
            }
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              campaignStatusFilter === "UPCOMING"
                ? "bg-[#0284c7] dark:bg-[#38bdf8] text-white dark:text-slate-950 font-bold shadow-arcade active:translate-y-0.5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <span>Upcoming</span>
            <span
              className={`font-mono text-[11px] font-bold ${campaignStatusFilter === "UPCOMING" ? "text-white dark:text-slate-950" : "text-muted-foreground"}`}
            >
              {upcomingCampCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setCampaignStatusFilter(
                campaignStatusFilter === "SUBMISSION_OPEN" ? "ALL" : "SUBMISSION_OPEN"
              )
            }
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              campaignStatusFilter === "SUBMISSION_OPEN"
                ? "bg-[#f59e0b] text-[#0f172a] font-bold shadow-arcade-amber active:translate-y-0.5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <span>Submissions</span>
            <span
              className={`font-mono text-[11px] font-bold ${campaignStatusFilter === "SUBMISSION_OPEN" ? "text-[#0f172a]" : "text-muted-foreground"}`}
            >
              {subOpenCampCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setCampaignStatusFilter(campaignStatusFilter === "COMPLETED" ? "ALL" : "COMPLETED")
            }
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              campaignStatusFilter === "COMPLETED"
                ? "bg-slate-700 text-white font-bold shadow-arcade active:translate-y-0.5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <span>Completed</span>
            <span
              className={`font-mono text-[11px] font-bold ${campaignStatusFilter === "COMPLETED" ? "text-white" : "text-muted-foreground"}`}
            >
              {completedCampCount}
            </span>
          </button>
        </nav>

        {/* Create New Campaign Shortcut */}
        <div className="pt-2.5 border-t border-border">
          <Link href="/admin/campaigns/new" className="block w-full">
            <Button
              size="sm"
              className="w-full text-xs font-bold gap-1.5 cursor-pointer bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-arcade-primary active:translate-y-0.5"
            >
              <PlusCircle className="size-3.5" />
              <span>New Campaign</span>
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Campaign Management Table Card - Uncontained Surface with Clean Borders */}
      <Card className="p-0 overflow-hidden flex flex-col border border-border rounded-xl flex-1 min-w-0 w-full bg-card shadow-xs">
        {/* Controls Toolbar */}
        <div className="p-3 border-b border-border shrink-0 bg-card">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search campaign title, code, or description..."
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
                className="pl-8 text-xs h-8 bg-background font-sans"
              />
              {campaignSearch && (
                <button
                  type="button"
                  onClick={() => setCampaignSearch("")}
                  className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Selector */}
            <Select value={campaignStatusFilter} onValueChange={setCampaignStatusFilter}>
              <SelectTrigger className="h-8 text-xs font-sans bg-background w-full sm:w-[160px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses ({events.length})</SelectItem>
                <SelectItem value="ACTIVE">Active Now ({activeCampCount})</SelectItem>
                <SelectItem value="UPCOMING">Upcoming ({upcomingCampCount})</SelectItem>
                <SelectItem value="SUBMISSION_OPEN">Submissions ({subOpenCampCount})</SelectItem>
                <SelectItem value="COMPLETED">Completed ({completedCampCount})</SelectItem>
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
                  aria-label="Campaign events guide"
                >
                  <HelpCircle className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                align="end"
                className="max-w-xs p-3 space-y-1 shadow-lg border border-border bg-popover text-popover-foreground rounded-lg"
              >
                <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <HelpCircle className="size-3.5 text-[#8b5cf6]" />
                  <span>Campaign Events Management</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Configure campaign codes, status stages, milestone schedules, dataset allocations,
                  and squad limits.
                </p>
              </TooltipContent>
            </Tooltip>

            {/* New Campaign Button */}
            <Link href="/admin/campaigns/new">
              <Button
                size="sm"
                variant="default"
                className="h-8 px-3 text-xs font-bold gap-1.5 cursor-pointer bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shrink-0 shadow-arcade-primary active:translate-y-0.5"
              >
                <PlusCircle className="size-3.5" />
                <span>New Campaign</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Scrollable Table Area */}
        <div className="w-full overflow-x-auto min-h-0 relative">
          {loading ? (
            <div className="py-16 text-center text-xs text-muted-foreground animate-pulse">
              Loading campaigns list...
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-foreground space-y-2">
              <Rocket className="size-8 mx-auto text-muted-foreground/30 mb-1" />
              <div className="font-semibold text-sm text-foreground">
                No matching campaigns found
              </div>
              <p className="text-muted-foreground max-w-sm mx-auto">
                No campaigns match your active search and status filter criteria. Try clearing
                filters.
              </p>
              {(campaignSearch || campaignStatusFilter !== "ALL") && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCampaignSearch("");
                    setCampaignStatusFilter("ALL");
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
                  <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[30%] border-b border-border shadow-xs">
                    Campaign &amp; Code
                  </TableHead>
                  <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[16%] border-b border-border shadow-xs">
                    Status
                  </TableHead>
                  <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[12%] border-b border-border shadow-xs">
                    Squads
                  </TableHead>
                  <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[36%] border-b border-border shadow-xs">
                    Milestone Schedule
                  </TableHead>
                  <TableHead className="sticky top-0 z-20 bg-card text-right text-xs font-bold py-2.5 px-3 w-[6%] border-b border-border shadow-xs"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCampaigns.map((ev) => (
                  <TableRow key={ev.id} className="hover:bg-muted/30 border-b border-border/60">
                    {/* Title & Code */}
                    <TableCell className="py-2.5 px-3 w-[30%] min-w-0 overflow-hidden">
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-semibold text-xs text-foreground truncate flex items-center gap-1.5">
                          <span className="truncate">{ev.title}</span>
                          <Link
                            href={`/campaigns/${ev.id}`}
                            className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                            title="View Public Campaign Page"
                          >
                            <ExternalLink className="size-3" />
                          </Link>
                        </div>
                        <div className="font-mono text-[11px] font-bold text-primary">
                          {ev.code}
                        </div>
                      </div>
                    </TableCell>

                    {/* Quick Status Switcher Dropdown */}
                    <TableCell className="py-2.5 px-3 w-[16%] whitespace-nowrap overflow-hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="focus:outline-hidden hover:opacity-85 transition-opacity cursor-pointer inline-flex items-center"
                          >
                            {renderStatusBadge(ev.status)}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48 bg-card border-border">
                          <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase">
                            Set Campaign Status
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onQuickStatusChange(ev.id, "ACTIVE")}
                            className="text-xs cursor-pointer"
                          >
                            <span>Active (Ongoing)</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onQuickStatusChange(ev.id, "UPCOMING")}
                            className="text-xs cursor-pointer"
                          >
                            <span>Upcoming</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onQuickStatusChange(ev.id, "SUBMISSION_OPEN")}
                            className="text-xs cursor-pointer"
                          >
                            <span>Submissions Open</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onQuickStatusChange(ev.id, "COMPLETED")}
                            className="text-xs cursor-pointer"
                          >
                            <span>Completed</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                    {/* Squad Count & Max Squad Size */}
                    <TableCell className="py-2.5 px-3 w-[12%] whitespace-nowrap overflow-hidden">
                      <div className="space-y-0.5">
                        <div className="font-mono text-xs font-bold text-foreground">
                          {ev._count?.teams || 0} squads
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground">
                          Max: {ev.maxTeamSize || 6}/squad
                        </div>
                      </div>
                    </TableCell>

                    {/* Timeline Schedules */}
                    <TableCell className="py-2.5 px-3 w-[36%] min-w-0 overflow-hidden text-xs text-muted-foreground">
                      <div className="space-y-1 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5 truncate">
                          <Calendar className="size-3 text-muted-foreground shrink-0" />
                          <span className="text-foreground/90 truncate">
                            {new Date(ev.startDate).toLocaleDateString()} &ndash;{" "}
                            {new Date(ev.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        {ev.submissionEnd && (
                          <div className="text-[10px] text-amber-500 font-medium truncate">
                            Report Deadline: {new Date(ev.submissionEnd).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Row Actions Menu */}
                    <TableCell className="py-2.5 px-3 w-[6%] text-right whitespace-nowrap overflow-hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer rounded-md"
                          >
                            <MoreHorizontal className="size-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 bg-card border-border">
                          <DropdownMenuItem
                            onClick={() => onEditCampaign(ev)}
                            className="gap-2 text-xs cursor-pointer"
                          >
                            <Edit2 className="size-3.5 text-primary" />
                            <span>Edit Campaign</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(ev.code);
                              toast.success(`Copied campaign code '${ev.code}' to clipboard`);
                            }}
                            className="gap-2 text-xs cursor-pointer"
                          >
                            <Copy className="size-3.5 text-muted-foreground" />
                            <span>Copy Campaign Code</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => onDeleteCampaign(ev)}
                            className="gap-2 text-xs cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="size-3.5" />
                            <span>Delete Campaign</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* PINNED BOTTOM PAGINATION BAR */}
        <div className="p-2.5 bg-card shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          {/* Items & Rows Info */}
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <span>
              Showing{" "}
              <strong className="text-foreground font-mono">
                {filteredCampaigns.length === 0
                  ? 0
                  : (campaignCurrentPage - 1) * campaignPageSize + 1}
              </strong>
              &ndash;
              <strong className="text-foreground font-mono">
                {Math.min(campaignCurrentPage * campaignPageSize, filteredCampaigns.length)}
              </strong>{" "}
              of <strong className="text-foreground font-mono">{filteredCampaigns.length}</strong>
            </span>

            {/* Rows selector */}
            <div className="flex items-center gap-1 pl-2 border-l border-border">
              <span className="text-[11px]">Rows:</span>
              <select
                value={campaignPageSize}
                onChange={(e) => setCampaignPageSize(Number(e.target.value))}
                className="h-6.5 px-1.5 rounded border border-border bg-background text-[11px] font-mono text-foreground cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Numbered Page Navigation Controls */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCampaignCurrentPage(1)}
              disabled={campaignCurrentPage === 1}
              className="h-6.5 px-1.5 text-xs shadow-arcade-xs active:translate-y-0.5"
              title="First Page"
            >
              <ChevronsLeft className="size-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCampaignCurrentPage((p) => Math.max(1, p - 1))}
              disabled={campaignCurrentPage === 1}
              className="h-6.5 px-2 text-xs shadow-arcade-xs active:translate-y-0.5"
              title="Previous Page"
            >
              <ChevronLeft className="size-3.5" />
            </Button>

            {/* Numbered Page Buttons */}
            <div className="flex items-center gap-1 mx-1">
              {getCampaignPageNumbers().map((pNum, idx) => {
                if (pNum === "...") {
                  return (
                    <span
                      key={`camp-ellipsis-${idx}`}
                      className="px-1 text-muted-foreground text-xs font-mono"
                    >
                      ...
                    </span>
                  );
                }
                const pageIndex = Number(pNum);
                const isActive = campaignCurrentPage === pageIndex;
                return (
                  <button
                    key={`camp-page-${pageIndex}`}
                    type="button"
                    onClick={() => setCampaignCurrentPage(pageIndex)}
                    className={`h-6.5 min-w-[26px] px-1.5 rounded text-xs font-mono font-semibold cursor-pointer transition-all border ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-arcade-xs"
                        : "bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {pageIndex}
                  </button>
                );
              })}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setCampaignCurrentPage((p) => Math.min(totalCampaignPages, p + 1))}
              disabled={
                campaignCurrentPage === totalCampaignPages || filteredCampaigns.length === 0
              }
              className="h-6.5 px-2 text-xs shadow-arcade-xs active:translate-y-0.5"
              title="Next Page"
            >
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCampaignCurrentPage(totalCampaignPages)}
              disabled={
                campaignCurrentPage === totalCampaignPages || filteredCampaigns.length === 0
              }
              className="h-6.5 px-1.5 text-xs shadow-arcade-xs active:translate-y-0.5"
              title="Last Page"
            >
              <ChevronsRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
