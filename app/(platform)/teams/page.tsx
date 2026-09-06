"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MobileFilterDrawer } from "@/components/mobile-filter-drawer";
import {
  Search,
  User,
  Users,
  UserPlus,
  RefreshCw,
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    institution?: string | null;
    country?: string | null;
  };
}

interface TeamEvent {
  id: string;
  title: string;
  code: string;
  status: string;
}

interface Team {
  id: string;
  name: string;
  inviteCode: string;
  status: "FORMING" | "ACTIVE" | "SUBMITTED" | "DISQUALIFIED" | string;
  isRecruiting: boolean;
  recruitmentNotes?: string | null;
  disqualificationReason?: string | null;
  createdAt: string;
  event: TeamEvent;
  members: TeamMember[];
  _count?: {
    members: number;
    joinRequests: number;
  };
}

interface CampaignEvent {
  id: string;
  title: string;
  code: string;
  status: string;
}

function TeamsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlEventId = searchParams.get("eventId") || searchParams.get("event");
  const urlJoinCode = searchParams.get("join");
  const { data: session } = useSession();

  // Data State
  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<CampaignEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEventId, setSelectedEventId] = useState<string>(urlEventId || "ALL");
  const [activeTabFilter, setActiveTabFilter] = useState<"ALL" | "RECRUITING" | "FORMING" | "FULL" | "MY_SQUADS">("ALL");

  // Pagination & Load More State
  const [paginationMode, setPaginationMode] = useState<"LOAD_MORE" | "PAGINATED">("LOAD_MORE");
  const [pageSize, setPageSize] = useState<number>(6);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [visibleCount, setVisibleCount] = useState<number>(6);

  // Join by Invite Code
  const [joinCodeInput, setJoinCodeInput] = useState<string>(urlJoinCode || "");
  const [joinCodeLoading, setJoinCodeLoading] = useState<boolean>(false);

  // Join Request Modal State
  const [requestTeam, setRequestTeam] = useState<Team | null>(null);
  const [requestMsg, setRequestMsg] = useState<string>("");
  const [requestLoading, setRequestLoading] = useState<boolean>(false);

  useEffect(() => {
    if (urlEventId) {
      setSelectedEventId(urlEventId);
    }
  }, [urlEventId]);

  useEffect(() => {
    if (urlJoinCode) {
      setJoinCodeInput(urlJoinCode.toUpperCase());
    }
  }, [urlJoinCode]);

  // Reset pagination on filter or batch size changes
  useEffect(() => {
    setVisibleCount(pageSize);
    setCurrentPage(1);
  }, [searchQuery, selectedEventId, activeTabFilter, pageSize]);

  // Fetch campaign events for filter dropdown
  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error("Failed to load campaign events:", err);
    }
  }, []);

  // Fetch teams with search and filters
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (selectedEventId !== "ALL") params.set("eventId", selectedEventId);

      const res = await fetch(`/api/teams?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTeams(data.teams || []);
      }
    } catch (err) {
      console.error("Failed to fetch teams:", err);
      toast.error("Failed to load teams. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedEventId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // STRICT GUARD: Exclude all DISQUALIFIED squads completely from public directory
  const validTeams = useMemo(() => {
    return teams.filter((t) => t.status !== "DISQUALIFIED");
  }, [teams]);

  // Filtered teams list based on active tab & query
  const filteredTeams = useMemo(() => {
    return validTeams.filter((t) => {
      const memberCount = t.members?.length || 0;
      const isUserMember = session?.user?.id
        ? t.members?.some((m) => m.user?.id === session.user.id)
        : false;

      if (activeTabFilter === "RECRUITING") {
        return t.isRecruiting && memberCount < 6;
      }
      if (activeTabFilter === "FORMING") {
        return memberCount < 2 || t.status === "FORMING";
      }
      if (activeTabFilter === "FULL") {
        return memberCount >= 6;
      }
      if (activeTabFilter === "MY_SQUADS") {
        return isUserMember;
      }
      return true;
    });
  }, [validTeams, activeTabFilter, session]);

  // Total Pages Calculation
  const totalPages = Math.max(1, Math.ceil(filteredTeams.length / pageSize));

  // Paginated/Sliced Teams for Load More vs Paginated Mode
  const displayedTeams = useMemo(() => {
    if (paginationMode === "LOAD_MORE") {
      return filteredTeams.slice(0, visibleCount);
    }
    const startIdx = (currentPage - 1) * pageSize;
    return filteredTeams.slice(startIdx, startIdx + pageSize);
  }, [filteredTeams, paginationMode, visibleCount, currentPage, pageSize]);

  const hasMore = visibleCount < filteredTeams.length;
  const remainingCount = Math.max(0, filteredTeams.length - visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(filteredTeams.length, prev + pageSize));
  };

  const handleShowAll = () => {
    setVisibleCount(filteredTeams.length);
  };

  // Derived Counts
  const countAll = validTeams.length;
  const countRecruiting = useMemo(() => validTeams.filter((t) => t.isRecruiting && (t.members?.length || 0) < 6).length, [validTeams]);
  const countForming = useMemo(() => validTeams.filter((t) => (t.members?.length || 0) < 2 || t.status === "FORMING").length, [validTeams]);
  const countFull = useMemo(() => validTeams.filter((t) => (t.members?.length || 0) >= 6).length, [validTeams]);
  const countMySquads = useMemo(() => {
    if (!session?.user?.id) return 0;
    return validTeams.filter((t) => t.members?.some((m) => m.user?.id === session.user.id)).length;
  }, [validTeams, session]);

  // Submit Join Request
  const handleSendJoinRequest = async () => {
    if (!requestTeam || !session) return;
    setRequestLoading(true);

    try {
      const res = await fetch(`/api/teams/${requestTeam.id}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: requestMsg.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Join request sent! The team leader will review your request.");
        setRequestTeam(null);
        setRequestMsg("");
        fetchTeams();
      } else {
        toast.error(data.error || "Failed to send join request.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setRequestLoading(false);
    }
  };

  // Join by Invite Code Handler
  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    if (!session) {
      router.push("/login");
      return;
    }

    setJoinCodeLoading(true);

    try {
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: joinCodeInput.trim().toUpperCase() }),
      });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.error || "Invalid invite code or squad is full.");
      } else {
        toast.success("Joined research squad successfully!");
        setJoinCodeInput("");
        router.push(`/team/${data.teamId || data.team?.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to join team.");
    } finally {
      setJoinCodeLoading(false);
    }
  };

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const hasActiveFilters = searchQuery.trim() !== "" || selectedEventId !== "ALL" || activeTabFilter !== "ALL";
  const activeFilterCount = (searchQuery.trim() ? 1 : 0) + (activeTabFilter !== "ALL" ? 1 : 0) + (selectedEventId !== "ALL" ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedEventId("ALL");
    setActiveTabFilter("ALL");
  };

  const renderJoinCodeCard = (
    <Card className="p-3.5 bg-[#8b5cf6] text-white border-[#7c3aed] shadow-[0_4px_0_0_#6d28d9] dark:shadow-[0_4px_0_0_#5b21b6] space-y-2.5">
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs font-bold text-white tracking-wide">Join with Code</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-white/80 hover:text-white transition-colors cursor-pointer p-0.5 rounded hover:bg-white/10"
                aria-label="Invite code help"
              >
                <HelpCircle className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs max-w-xs bg-slate-900 text-white border-slate-700 shadow-lg">
              Have a code from a team leader? Enter it here to join directly.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <form onSubmit={handleJoinByCode} className="flex items-center gap-1.5">
        <Input
          type="text"
          placeholder="AST-XXXX"
          value={joinCodeInput}
          onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
          className="flex-1 uppercase text-xs h-8 font-mono font-bold tracking-wider bg-white text-slate-950 placeholder:text-slate-400 border-none shadow-inner min-w-0"
        />
        <Button
          type="submit"
          disabled={joinCodeLoading || !joinCodeInput.trim()}
          size="sm"
          className="h-8 px-2.5 text-xs font-bold cursor-pointer bg-[#facc15] text-slate-950 hover:bg-[#eab308] shadow-[0_2px_0_0_#ca8a04] active:translate-y-0.5 transition-transform shrink-0 flex items-center gap-1"
          title="Join Team"
        >
          {joinCodeLoading ? (
            <RefreshCw className="size-3.5 animate-spin" />
          ) : (
            <>
              <span>Join</span>
              <ArrowRight className="size-3.5" />
            </>
          )}
        </Button>
      </form>
    </Card>
  );

  const renderFilterControls = (
    <Card className="p-4 space-y-4 bg-card border-border">
      {/* Search Input */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
          Search Teams
        </span>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Name, member, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-7 text-xs h-8 font-sans bg-background"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            Status Filter
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[10px] text-primary hover:underline font-bold cursor-pointer"
            >
              Reset All
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setActiveTabFilter("ALL")}
            className={`w-full px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
              activeTabFilter === "ALL"
                ? "bg-[#8b5cf6] text-white font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <span>All Teams</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              activeTabFilter === "ALL" ? "bg-white/20 text-white" : "bg-muted text-foreground"
            }`}>
              {countAll}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabFilter("RECRUITING")}
            className={`w-full px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
              activeTabFilter === "RECRUITING"
                ? "bg-[#8b5cf6] text-white font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <span>Open to Join</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              activeTabFilter === "RECRUITING" ? "bg-white/20 text-white" : "bg-muted text-foreground"
            }`}>
              {countRecruiting}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabFilter("FORMING")}
            className={`w-full px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
              activeTabFilter === "FORMING"
                ? "bg-[#8b5cf6] text-white font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <span>Forming</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              activeTabFilter === "FORMING" ? "bg-white/20 text-white" : "bg-muted text-foreground"
            }`}>
              {countForming}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabFilter("FULL")}
            className={`w-full px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
              activeTabFilter === "FULL"
                ? "bg-[#8b5cf6] text-white font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <span>Full Teams</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              activeTabFilter === "FULL" ? "bg-white/20 text-white" : "bg-muted text-foreground"
            }`}>
              {countFull}
            </span>
          </button>

          {session && (
            <button
              type="button"
              onClick={() => setActiveTabFilter("MY_SQUADS")}
              className={`w-full px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                activeTabFilter === "MY_SQUADS"
                  ? "bg-[#8b5cf6] text-white font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span>My Squads</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                activeTabFilter === "MY_SQUADS" ? "bg-white/20 text-white" : "bg-muted text-foreground"
              }`}>
                {countMySquads}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Campaign Select Filter */}
      <div className="space-y-1.5 pt-2 border-t border-border">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
          Campaign Filter
        </span>
        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
          <SelectTrigger className="h-8 text-xs font-sans bg-background">
            <SelectValue placeholder="All Campaigns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Campaigns ({events.length})</SelectItem>
            {events.map((ev) => (
              <SelectItem key={ev.id} value={ev.id}>
                {ev.code} ({ev.title.slice(0, 14)}...)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );

  return (
    <div className="w-full space-y-6 font-sans max-w-6xl mx-auto py-2">
      {/* Mobile Draggable Filter Trigger + Drawer */}
      <MobileFilterDrawer
        title="Filter Teams"
        description="Search and filter citizen teams"
        activeCount={activeFilterCount}
        totalResults={filteredTeams.length}
        isOpen={isMobileFilterOpen}
        onOpenChange={setIsMobileFilterOpen}
        onReset={handleResetFilters}
      >
        {renderFilterControls}
      </MobileFilterDrawer>

      {/* 1. TOP HEADER (Sticky) */}
      <div className="sticky top-16 z-30 -mt-2 py-3 bg-background/95 dark:bg-background/95 backdrop-blur-md border-b border-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <span>Citizen Teams</span>
          </h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="size-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="About Citizen Teams"
                >
                  <HelpCircle className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="text-xs max-w-xs bg-card text-card-foreground border-border shadow-lg p-3 space-y-1">
                <div className="font-bold text-foreground">About Citizen Teams</div>
                <p className="text-muted-foreground leading-relaxed">
                  Collaborative groups of researchers, students, and enthusiasts. Join or form a team to analyze sky survey images and discover asteroids together.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Link href="/campaigns" className="hidden sm:inline-flex">
          <Button
            variant="outline"
            className="h-9 px-3.5 text-xs font-bold gap-2 cursor-pointer border-border hover:bg-muted shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d] active:translate-y-0.5 rounded-xl shrink-0"
          >
            <span>Explore Campaigns</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>

      {/* 2. MAIN LAYOUT: SIDEBAR FILTER + TEAMS CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* === LEFT COLUMN: SIDEBAR FILTERS (Sticky on Desktop, Hidden on Mobile) === */}
        <aside className="hidden lg:block lg:col-span-1 space-y-4 lg:sticky lg:top-36 z-20">
          {renderJoinCodeCard}
          {renderFilterControls}
        </aside>

        {/* RIGHT MAIN CONTENT AREA: TEAMS GRID */}
        <main className="lg:col-span-3 min-w-0 space-y-4 min-h-[calc(100vh-10rem)]">
          {/* Mobile Join with Code Card (Shown only on mobile above listing) */}
          <div className="lg:hidden">
            {renderJoinCodeCard}
          </div>
          {/* Results Counter & Listing Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {paginationMode === "LOAD_MORE" ? (
                  <>
                    Showing <strong className="text-foreground">{displayedTeams.length}</strong> of{" "}
                    <strong className="text-foreground">{filteredTeams.length}</strong> {filteredTeams.length === 1 ? "team" : "teams"}
                  </>
                ) : (
                  <>
                    Page <strong className="text-foreground">{currentPage}</strong> of{" "}
                    <strong className="text-foreground">{totalPages}</strong> ({filteredTeams.length} total {filteredTeams.length === 1 ? "team" : "teams"})
                  </>
                )}
              </span>
              {hasActiveFilters && (
                <>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-primary hover:underline font-semibold cursor-pointer text-xs"
                  >
                    Clear all filters
                  </button>
                </>
              )}
            </div>

            {/* Listing Controls: Browsing Mode + Batch Size */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {/* Browsing Mode */}
              <div className="flex items-center bg-muted/60 p-0.5 rounded border border-border h-7">
                <button
                  type="button"
                  onClick={() => {
                    setPaginationMode("LOAD_MORE");
                    setVisibleCount(pageSize);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-sans font-medium cursor-pointer transition-colors ${
                    paginationMode === "LOAD_MORE"
                      ? "bg-[#8b5cf6] text-white font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Load More
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaginationMode("PAGINATED");
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-sans font-medium cursor-pointer transition-colors ${
                    paginationMode === "PAGINATED"
                      ? "bg-[#8b5cf6] text-white font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Pages
                </button>
              </div>

              {/* Batch Size Selector */}
              <div className="flex items-center bg-muted/60 p-0.5 rounded border border-border h-7 gap-0.5">
                {[6, 12, 24].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setPageSize(size);
                      setVisibleCount(size);
                      setCurrentPage(1);
                    }}
                    className={`px-2 py-0.5 rounded font-mono text-[10px] cursor-pointer transition-colors ${
                      pageSize === size
                        ? "bg-[#8b5cf6] text-white font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Squad Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: pageSize }).map((_, idx) => (
                <Card key={idx} className="p-4 space-y-3 bg-card border-border animate-pulse">
                  <div className="h-4 w-20 bg-muted rounded" />
                  <div className="h-5 w-3/4 bg-muted rounded" />
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="size-6 rounded bg-muted" />
                      ))}
                    </div>
                    <div className="h-3 w-10 bg-muted rounded" />
                  </div>
                  <div className="h-8 w-full bg-muted/60 rounded" />
                  <div className="h-8 w-full bg-muted rounded mt-2" />
                </Card>
              ))}
            </div>
          ) : filteredTeams.length === 0 ? (
            <Card className="p-12 text-center text-sm text-muted-foreground space-y-2 border-dashed min-h-[280px] flex flex-col items-center justify-center">
              <div className="font-sans font-bold text-foreground text-sm">No Matching Citizen Teams Found</div>
              <p className="max-w-md mx-auto text-xs leading-relaxed text-muted-foreground">
                No citizen teams match your current search and filter criteria. Try adjusting your filters or enter an invite code on the sidebar.
              </p>
              {hasActiveFilters && (
                <Button onClick={handleResetFilters} variant="outline" size="sm" className="mt-2 text-xs">
                  Reset Filters
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedTeams.map((team) => {
                  const memberCount = team.members?.length || 0;
                  const isFull = memberCount >= 6;

                  const isUserMember = session?.user?.id
                    ? team.members?.some((m) => m.user?.id === session.user.id)
                    : false;

                  return (
                    <Card
                      key={team.id}
                      className="p-4 flex flex-col justify-between space-y-3 bg-card border-border hover:border-primary/40 hover:shadow-[0_2px_0_0_#8b5cf6]/20 transition-all"
                    >
                      <div className="space-y-2.5">
                        {/* Top: Campaign Code */}
                        <div>
                          <span className="text-xs font-mono font-bold text-primary truncate">
                            {team.event?.code || "CAMPAIGN"}
                          </span>
                        </div>

                        {/* Squad Name */}
                        <h3 className="font-sans font-bold text-sm text-foreground leading-snug truncate">
                          {team.name}
                        </h3>

                        {/* Member Slots: 6 Colored User Icons */}
                        <div className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-1.5">
                            {Array.from({ length: 6 }).map((_, i) => {
                              const isFilled = i < memberCount;
                              return (
                                <div
                                  key={i}
                                  className={`size-6 rounded flex items-center justify-center transition-colors ${
                                    isFilled
                                      ? "bg-[#8b5cf6] text-white shadow-xs"
                                      : "bg-muted/50 text-muted-foreground/30 border border-border/70 border-dashed"
                                  }`}
                                  title={isFilled ? `Member slot ${i + 1} (Filled)` : `Slot ${i + 1} (Available)`}
                                >
                                  <User className="size-3.5" />
                                </div>
                              );
                            })}
                          </div>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            <strong className="text-foreground">{memberCount}</strong>/6
                          </span>
                        </div>

                        {/* Recruitment Notes */}
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 min-h-[32px]">
                          {team.recruitmentNotes || "Active asteroid search squad analyzing telescope image sets."}
                        </p>
                      </div>

                      {/* Card Bottom Action Button */}
                      <div className="pt-2 border-t border-border/60">
                        {isUserMember ? (
                          <Link href={`/team/${team.id}`} className="block w-full">
                            <Button
                              size="sm"
                              className="w-full h-8 text-xs font-bold gap-1.5 cursor-pointer bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-[0_2px_0_0_#7c3aed] active:translate-y-0.5"
                            >
                              <span>Open Workspace</span>
                              <ArrowRight className="size-3.5" />
                            </Button>
                          </Link>
                        ) : team.isRecruiting && !isFull ? (
                          <Button
                            onClick={() => {
                              if (!session) {
                                router.push("/login");
                                return;
                              }
                              setRequestTeam(team);
                              setRequestMsg("");
                            }}
                            size="sm"
                            variant="outline"
                            className="w-full h-8 text-xs font-bold gap-1.5 text-foreground hover:bg-accent cursor-pointer shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d] active:translate-y-0.5"
                          >
                            <UserPlus className="size-3.5 text-[#10b981]" />
                            <span>Request to Join</span>
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled className="w-full h-8 text-xs opacity-50 cursor-not-allowed">
                            Recruitment Closed
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* PAGINATION / LOAD MORE FOOTER */}
              {filteredTeams.length > 0 && (
                <div className="pt-3 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60">
                  {paginationMode === "LOAD_MORE" ? (
                    <>
                      <div className="text-xs text-muted-foreground font-mono">
                        Showing <strong className="text-foreground">{displayedTeams.length}</strong> of{" "}
                        <strong className="text-foreground">{filteredTeams.length}</strong> squads
                      </div>

                      {hasMore ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Button
                            onClick={handleLoadMore}
                            variant="outline"
                            className="h-8 px-3.5 text-xs font-bold gap-1.5 cursor-pointer bg-background hover:bg-accent text-foreground shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d] active:translate-y-0.5 flex-1 sm:flex-initial"
                          >
                            <span>Load More Squads (+{Math.min(pageSize, remainingCount)})</span>
                          </Button>

                          <Button
                            onClick={handleShowAll}
                            variant="ghost"
                            className="h-8 px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <span>Show All</span>
                          </Button>
                        </div>
                      ) : filteredTeams.length > pageSize ? (
                        <div className="text-xs text-muted-foreground font-sans flex items-center gap-2">
                          <span>All matching squads loaded</span>
                          <Button
                            onClick={() => setVisibleCount(pageSize)}
                            variant="ghost"
                            className="h-7 px-2 text-xs text-primary hover:underline font-semibold cursor-pointer"
                          >
                            Collapse to {pageSize}
                          </Button>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <div className="text-xs text-muted-foreground font-mono">
                        Page <strong className="text-foreground">{currentPage}</strong> of{" "}
                        <strong className="text-foreground">{totalPages}</strong> ({filteredTeams.length} squads)
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage <= 1}
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-xs gap-1 cursor-pointer disabled:cursor-not-allowed shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d] active:translate-y-0.5"
                        >
                          <ChevronLeft className="size-3.5" />
                          <span>Prev</span>
                        </Button>

                        {Array.from({ length: totalPages }).map((_, idx) => {
                          const pageNum = idx + 1;
                          if (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={pageNum}
                                type="button"
                                onClick={() => setCurrentPage(pageNum)}
                                className={`size-8 rounded text-xs font-mono font-bold cursor-pointer transition-colors ${
                                  currentPage === pageNum
                                    ? "bg-[#8b5cf6] text-white shadow-xs"
                                    : "bg-muted text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                          if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                            return (
                              <span key={pageNum} className="text-xs text-muted-foreground px-0.5 font-mono">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}

                        <Button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage >= totalPages}
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-xs gap-1 cursor-pointer disabled:cursor-not-allowed shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d] active:translate-y-0.5"
                        >
                          <span>Next</span>
                          <ChevronRight className="size-3.5" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 3. JOIN REQUEST MODAL */}
      <Dialog open={!!requestTeam} onOpenChange={(open) => !open && setRequestTeam(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border font-sans">
          <DialogHeader>
            <DialogTitle className="font-bold text-base text-foreground">
              Join Request: {requestTeam?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Send a request to join campaign squad <strong className="text-foreground font-mono">{requestTeam?.event?.code}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="text-xs font-semibold text-foreground">
              Message to Squad Leader (Optional)
            </label>
            <Textarea
              placeholder="Hi! I am active daily and ready to analyze image sets with your team."
              value={requestMsg}
              onChange={(e) => setRequestMsg(e.target.value)}
              rows={3}
              className="text-xs font-sans bg-background resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setRequestTeam(null)} disabled={requestLoading}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSendJoinRequest}
              disabled={requestLoading}
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold text-xs shadow-[0_2px_0_0_#7c3aed] active:translate-y-0.5 cursor-pointer"
            >
              {requestLoading ? "Sending..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TeamsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs font-mono text-muted-foreground">
          Loading citizen teams...
        </div>
      }
    >
      <TeamsContent />
    </Suspense>
  );
}
