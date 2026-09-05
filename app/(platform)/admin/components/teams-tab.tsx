"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Search, RefreshCw, HelpCircle, Telescope, X } from "lucide-react";
import { TeamData } from "./types";

interface TeamsTabProps {
  filteredTeams: TeamData[];
  teamSearch: string;
  setTeamSearch: (s: string) => void;
  loading: boolean;
  fetchAdminData: () => void;
}

export function TeamsTab({
  filteredTeams,
  teamSearch,
  setTeamSearch,
  loading,
  fetchAdminData,
}: TeamsTabProps) {
  return (
    <Card className="p-3 space-y-3 border border-border rounded-xl bg-card shadow-xs">
      {/* Controls Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search squad name, invite code, campaign code, or member..."
            value={teamSearch}
            onChange={(e) => setTeamSearch(e.target.value)}
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
              <HelpCircle className="size-3.5 text-amber-500" />
              <span>Campaign Squads &amp; Rosters</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Overview of all registered teams, active members, squad invite codes, and team leader assignments.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      {filteredTeams.length === 0 ? (
        <div className="py-12 text-center text-xs text-muted-foreground space-y-1">
          <Telescope className="size-8 mx-auto text-muted-foreground/30 mb-1" />
          <div className="font-semibold text-sm text-foreground">No squads found</div>
          <p>No campaign squads match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredTeams.map((t) => (
            <Card key={t.id} className="p-4 bg-card border-border space-y-3 shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">{t.name}</span>
                <Badge variant="secondary" className="text-xs font-mono bg-muted text-foreground font-bold">
                  {t.members.length}/6 Members
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <div>
                  Invite Code: <span className="font-bold text-primary font-mono">{t.inviteCode}</span>
                </div>
                <div>
                  Campaign: <span className="font-bold text-foreground font-mono">{t.event?.code || "AST"}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <span className="block text-[11px] font-semibold uppercase text-muted-foreground mb-1.5">
                  Roster ({t.members.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {t.members.map((m) => (
                    <span key={m.id} className="text-xs px-2 py-0.5 rounded bg-muted text-foreground font-sans flex items-center gap-1">
                      <span>{m.user.name}</span>
                      {(m.role === "LEADER" || m.role === "leader") && (
                        <span className="text-[10px] text-amber-500 font-bold font-mono">(Lead)</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
}
