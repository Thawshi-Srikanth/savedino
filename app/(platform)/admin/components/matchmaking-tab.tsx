"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Users,
  Search,
  RefreshCw,
  HelpCircle,
  Crown,
  Shield,
  Star,
  UserPlus,
  X,
} from "lucide-react";
import { UserData, getInitials } from "./types";

interface MatchmakingTabProps {
  users: UserData[];
  unassignedSoloUsers: UserData[];
  soloSearch: string;
  setSoloSearch: (s: string) => void;
  loading: boolean;
  fetchAdminData: () => void;
  onAssignClick: (u: UserData) => void;
}

export function MatchmakingTab({
  users,
  unassignedSoloUsers,
  soloSearch,
  setSoloSearch,
  loading,
  fetchAdminData,
  onAssignClick,
}: MatchmakingTabProps) {
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#8b5cf6] text-white shadow-xs tracking-wide">
            Admin
          </span>
        );
      case "staff":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#10b981] text-white shadow-xs tracking-wide">
            Staff
          </span>
        );
      case "leader":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f59e0b] text-[#0f172a] shadow-xs tracking-wide">
            Leader
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 shadow-xs tracking-wide">
            Citizen
          </span>
        );
    }
  };

  return (
    <Card className="p-0 overflow-hidden flex flex-col border border-border rounded-xl w-full bg-card shadow-xs">
      {/* Controls Toolbar */}
      <div className="p-3 border-b border-border shrink-0 bg-card">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search unassigned researcher by name, email, institution, country..."
              value={soloSearch}
              onChange={(e) => setSoloSearch(e.target.value)}
              className="pl-8 text-xs h-8 bg-background font-sans"
            />
            {soloSearch && (
              <button
                type="button"
                onClick={() => setSoloSearch("")}
                className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

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
                aria-label="Matchmaking guide"
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
                <HelpCircle className="size-3.5 text-[#10b981]" />
                <span>Solo Researcher Matchmaking</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Match unassigned citizen scientists and solo students into active research squads
                with available slots.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="w-full overflow-x-auto min-h-0 relative">
        {users.filter((u) => u.teamMembers.length === 0).length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-foreground space-y-1">
            <Users className="size-8 mx-auto text-muted-foreground/30 mb-1" />
            <div className="font-semibold text-sm text-foreground">
              All researchers are assigned!
            </div>
            <p>There are no unassigned solo students at this moment.</p>
          </div>
        ) : unassignedSoloUsers.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-foreground space-y-1">
            <Search className="size-8 mx-auto text-muted-foreground/30 mb-1" />
            <div className="font-semibold text-sm text-foreground">No matching researchers</div>
            <p>No unassigned researchers match your search term.</p>
          </div>
        ) : (
          <Table className="w-full table-fixed border-b border-border">
            <TableHeader className="sticky top-0 z-20 bg-card">
              <TableRow className="hover:bg-transparent">
                <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[35%] border-b border-border shadow-xs">
                  Researcher
                </TableHead>
                <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[18%] border-b border-border shadow-xs">
                  Role
                </TableHead>
                <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[27%] border-b border-border shadow-xs">
                  Affiliation / Region
                </TableHead>
                <TableHead className="sticky top-0 z-20 bg-card text-right text-xs font-bold py-2.5 px-3 w-[20%] border-b border-border shadow-xs">
                  Match Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unassignedSoloUsers.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/30 border-b border-border/60">
                  <TableCell className="py-2 px-3 w-[35%] min-w-0 overflow-hidden">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-7 rounded-full bg-muted border border-border flex items-center justify-center font-mono text-[10px] font-bold text-foreground shrink-0">
                        {getInitials(u.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-xs text-foreground truncate">
                          {u.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono truncate">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-3 w-[18%] whitespace-nowrap overflow-hidden">
                    {renderRoleBadge(u.role)}
                  </TableCell>
                  <TableCell className="py-2 px-3 w-[27%] min-w-0 overflow-hidden text-xs text-muted-foreground">
                    <span className="truncate block max-w-full">
                      <span className="text-foreground/90">{u.institution || "Independent"}</span>
                      <span className="text-muted-foreground mx-1">&middot;</span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {u.country || "Global"}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="py-2 px-3 w-[20%] text-right whitespace-nowrap overflow-hidden">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAssignClick(u)}
                      className="h-6.5 text-[11px] font-semibold gap-1.5 cursor-pointer bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20 border-[#10b981]/30 shadow-arcade-emerald active:translate-y-0.5"
                    >
                      <UserPlus className="size-3" />
                      <span>Assign to Squad</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  );
}
