"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DinoLoading } from "@/components/dino-loading";
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
  Users,
  Search,
  RefreshCw,
  HelpCircle,
  Crown,
  Shield,
  Star,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Copy,
  ShieldAlert,
  UserCheck,
  AlertCircle,
  Download,
  Mail,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { UserData, getInitials } from "./types";
import { resolveCountryCode, getCountryFlag } from "@/lib/phone-validation";

interface UsersTabProps {
  users: UserData[];
  filteredUsers: UserData[];
  paginatedUsers: UserData[];
  userSearch: string;
  setUserSearch: (s: string) => void;
  roleFilter: string;
  setRoleFilter: (r: string) => void;
  teamStatusFilter: string;
  setTeamStatusFilter: (s: string) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
  setPageSize: (n: number) => void;
  totalPages: number;
  getPageNumbers: () => (number | string)[];
  adminCount: number;
  staffCount: number;
  leaderCount?: number;
  citizenCount: number;
  unassignedCount: number;
  loading: boolean;
  fetchAdminData: () => void;
  onQuickRoleChange: (userId: string, newRole: string) => void;
  onEditUser: (u: UserData) => void;
  onDeleteUser: (u: UserData) => void;
  onBanUser: (u: UserData, initialAction?: "BAN" | "WARN_NAME" | "UNBAN") => void;
  onSendEmail?: (u: UserData) => void;
  onViewUser?: (u: UserData) => void;
}

export function UsersTab({
  users,
  filteredUsers,
  paginatedUsers,
  userSearch,
  setUserSearch,
  roleFilter,
  setRoleFilter,
  teamStatusFilter,
  setTeamStatusFilter,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalPages,
  getPageNumbers,
  adminCount,
  staffCount,
  leaderCount = 0,
  citizenCount,
  unassignedCount,
  loading,
  fetchAdminData,
  onQuickRoleChange,
  onEditUser,
  onDeleteUser,
  onBanUser,
  onSendEmail,
  onViewUser,
}: UsersTabProps) {
  const bannedCount = users.filter((u) => u.banned).length;
  const activeRegisteredCount = users.filter((u) => !u.banned).length;

  const handleExportActiveUsers = () => {
    const activeUsers = users.filter((u) => !u.banned);

    if (activeUsers.length === 0) {
      toast.info("No active registered users found to export.");
      return;
    }

    const headers = [
      "User ID",
      "Full Name",
      "Email Address",
      "Email Verified",
      "Role",
      "Institution / Organization",
      "Country / Region",
      "Last Logged IP",
      "Last Active Date",
      "WhatsApp / Contact",
      "Tour Completed",
      "Squad Status",
      "Squad Name",
      "Squad Role",
      "Campaign Code",
      "Campaign Title",
      "Registered Date",
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = activeUsers.map((u) => {
      const inTeam = u.teamMembers && u.teamMembers.length > 0;
      const teamMember = inTeam ? u.teamMembers[0] : null;
      const squadName = teamMember?.team?.name || "Unassigned";
      const squadRole = teamMember?.role || "";
      const squadCode = teamMember?.team?.event?.code || "";
      const squadEventTitle = teamMember?.team?.event?.title || "";
      const squadStatus = inTeam ? "In Squad" : "Solo (Unassigned)";
      const latestSession = u.sessions && u.sessions.length > 0 ? u.sessions[0] : null;
      const lastLoggedIp = latestSession?.ipAddress || "";
      const lastActiveDate = latestSession?.updatedAt
        ? new Date(latestSession.updatedAt).toISOString()
        : "";

      return [
        escapeCsv(u.id),
        escapeCsv(u.name),
        escapeCsv(u.email),
        escapeCsv(u.emailVerified ? "Yes" : "No"),
        escapeCsv(u.role),
        escapeCsv(u.institution || ""),
        escapeCsv(u.country || ""),
        escapeCsv(lastLoggedIp),
        escapeCsv(lastActiveDate),
        escapeCsv(u.whatsapp || ""),
        escapeCsv(u.tourCompleted ? "Yes" : "No"),
        escapeCsv(squadStatus),
        escapeCsv(squadName),
        escapeCsv(squadRole),
        escapeCsv(squadCode),
        escapeCsv(squadEventTitle),
        escapeCsv(u.createdAt ? new Date(u.createdAt).toISOString() : ""),
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.map((h) => `"${h}"`).join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `savedino_active_registered_users_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${activeUsers.length} active registered users to CSV.`);
  };

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
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 shadow-xs tracking-wide">
            Citizen
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start w-full">
      {/* Left Role Filter Sidebar */}
      <aside className="w-full md:w-56 shrink-0 bg-card border border-border rounded-xl p-3 shadow-arcade-lg space-y-2.5">
        <div className="px-2 py-1 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-sans">
            Researcher Roles
          </span>
          <Badge
            variant="secondary"
            className="text-[10px] font-mono font-bold px-1.5 py-0 bg-muted text-foreground"
          >
            {users.length}
          </Badge>
        </div>

        <nav className="space-y-1">
          <button
            type="button"
            onClick={() => setRoleFilter("ALL")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              roleFilter === "ALL"
                ? "bg-primary text-primary-foreground shadow-arcade-primary active:translate-y-0.5 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <span>All Roles</span>
            <span className="font-mono text-[11px] font-bold">{users.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter(roleFilter === "admin" ? "ALL" : "admin")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              roleFilter === "admin"
                ? "bg-[#8b5cf6] text-white font-bold shadow-arcade-primary active:translate-y-0.5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <span>Admins</span>
            <span
              className={`font-mono text-[11px] font-bold ${roleFilter === "admin" ? "text-white" : "text-muted-foreground"}`}
            >
              {adminCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter(roleFilter === "staff" ? "ALL" : "staff")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              roleFilter === "staff"
                ? "bg-[#10b981] text-white font-bold shadow-arcade-emerald active:translate-y-0.5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <span>Staff / Ops</span>
            <span
              className={`font-mono text-[11px] font-bold ${roleFilter === "staff" ? "text-white" : "text-muted-foreground"}`}
            >
              {staffCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter(roleFilter === "leader" ? "ALL" : "leader")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              roleFilter === "leader"
                ? "bg-[#f59e0b] text-[#0f172a] font-bold shadow-arcade active:translate-y-0.5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Crown className="size-3.5 text-amber-500" />
              <span>Squad Leaders</span>
            </span>
            <span
              className={`font-mono text-[11px] font-bold ${roleFilter === "leader" ? "text-[#0f172a]" : "text-amber-500"}`}
            >
              {leaderCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter(roleFilter === "user" ? "ALL" : "user")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              roleFilter === "user"
                ? "bg-slate-700 text-white font-bold shadow-arcade active:translate-y-0.5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <span>Citizens</span>
            <span
              className={`font-mono text-[11px] font-bold ${roleFilter === "user" ? "text-white" : "text-muted-foreground"}`}
            >
              {citizenCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter(roleFilter === "banned" ? "ALL" : "banned")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              roleFilter === "banned"
                ? "bg-destructive text-destructive-foreground font-bold shadow-arcade-destructive active:translate-y-0.5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="size-3.5 text-destructive" />
              <span>Suspended</span>
            </span>
            <span
              className={`font-mono text-[11px] font-bold ${
                roleFilter === "banned" ? "text-white" : "text-destructive font-bold"
              }`}
            >
              {bannedCount}
            </span>
          </button>
        </nav>

        {/* Quick Summary Pill */}
        <div className="pt-2.5 border-t border-border space-y-1.5 text-[11px] text-muted-foreground px-1">
          <div className="flex justify-between">
            <span>Squad Leaders:</span>
            <span className="font-bold text-amber-500 font-mono">{leaderCount}</span>
          </div>
          <div className="flex justify-between">
            <span>In Squad:</span>
            <span className="font-bold text-foreground font-mono">
              {users.length - unassignedCount}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Unassigned:</span>
            <span className="font-bold text-amber-500 font-mono">{unassignedCount}</span>
          </div>
        </div>
      </aside>

      {/* Main User Management Table Card - Uncontained Surface with Clean Borders */}
      <Card className="p-0 overflow-hidden flex flex-col border border-border rounded-xl flex-1 min-w-0 w-full bg-card shadow-xs">
        {/* Controls Toolbar */}
        <div className="p-3 border-b border-border shrink-0 bg-card">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search name, email, institution, country..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-8 text-xs h-8 bg-background font-sans"
              />
              {userSearch && (
                <button
                  type="button"
                  onClick={() => setUserSearch("")}
                  className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Role Filter Selector */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-8 text-xs font-sans bg-background w-full sm:w-[130px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles ({users.length})</SelectItem>
                <SelectItem value="leader">Squad Leaders ({leaderCount})</SelectItem>
                <SelectItem value="admin">Admin ({adminCount})</SelectItem>
                <SelectItem value="staff">Staff ({staffCount})</SelectItem>
                <SelectItem value="user">Citizen ({citizenCount})</SelectItem>
              </SelectContent>
            </Select>

            {/* Team Status Filter Selector */}
            <Select value={teamStatusFilter} onValueChange={setTeamStatusFilter}>
              <SelectTrigger className="h-8 text-xs font-sans bg-background w-full sm:w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="LEADER">Squad Leaders ({leaderCount})</SelectItem>
                <SelectItem value="IN_TEAM">In Squad (All)</SelectItem>
                <SelectItem value="MEMBERS_ONLY">Squad Members Only</SelectItem>
                <SelectItem value="UNASSIGNED">Solo / Unassigned ({unassignedCount})</SelectItem>
              </SelectContent>
            </Select>

            {/* Export Active Users Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleExportActiveUsers}
                  className="h-8 text-xs font-semibold gap-1.5 cursor-pointer shadow-arcade active:translate-y-0.5 border-border bg-background hover:bg-muted text-foreground shrink-0"
                >
                  <Download className="size-3.5 text-[#10b981]" />
                  <span className="hidden sm:inline">Export Active Users</span>
                  <span className="sm:hidden">Export</span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    ({activeRegisteredCount})
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs font-sans">
                Export registered users who are not suspended ({activeRegisteredCount}) to CSV
              </TooltipContent>
            </Tooltip>

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
                  aria-label="User & Role guide"
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
                  <span>User &amp; Role Management</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Manage 4-tier platform roles (Admin, Staff, Leader, Citizen), researcher
                  permissions, and team allocations.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Scrollable Table Area (Strict table-fixed layout with bottom border) */}
        <div className="w-full overflow-x-auto min-h-0 relative">
          {loading ? (
            <DinoLoading size="md" text="Loading researchers list..." className="py-16" />
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-foreground space-y-2">
              <Users className="size-8 mx-auto text-muted-foreground/30 mb-1" />
              <div className="font-semibold text-sm text-foreground">
                No matching researchers found
              </div>
              <p className="text-muted-foreground max-w-sm mx-auto">
                No users match your active search and filter criteria. Try clearing filters.
              </p>
              {(userSearch || roleFilter !== "ALL" || teamStatusFilter !== "ALL") && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setUserSearch("");
                    setRoleFilter("ALL");
                    setTeamStatusFilter("ALL");
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
                  <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[32%] border-b border-border shadow-xs">
                    Researcher
                  </TableHead>
                  <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[16%] border-b border-border shadow-xs">
                    Role
                  </TableHead>
                  <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[22%] border-b border-border shadow-xs">
                    Squad Status
                  </TableHead>
                  <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[24%] border-b border-border shadow-xs">
                    Affiliation / Region
                  </TableHead>
                  <TableHead className="sticky top-0 z-20 bg-card text-right text-xs font-bold py-2.5 px-3 w-[6%] border-b border-border shadow-xs"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((u) => {
                  const inTeam = u.teamMembers.length > 0;
                  const currentTeam = inTeam ? u.teamMembers[0].team : null;

                  return (
                    <TableRow key={u.id} className="hover:bg-muted/30 border-b border-border/60">
                      {/* User Avatar, Name & Monospace Email */}
                      <TableCell className="py-2 px-3 w-[32%] min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            type="button"
                            onClick={() => onViewUser && onViewUser(u)}
                            className="size-7 rounded-full bg-muted border border-border flex items-center justify-center font-mono text-[10px] font-bold text-foreground hover:border-primary/60 hover:text-primary transition-colors cursor-pointer shrink-0"
                            title="View user profile"
                          >
                            {getInitials(u.name)}
                          </button>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-xs text-foreground truncate flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onViewUser && onViewUser(u)}
                                className={`truncate text-left hover:text-primary transition-colors cursor-pointer ${
                                  u.banned ? "line-through text-muted-foreground" : ""
                                }`}
                                title="View user profile"
                              >
                                {u.name}
                              </button>
                              {u.banned && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded bg-destructive/15 text-destructive border border-destructive/30 uppercase tracking-wider cursor-help shrink-0">
                                      Suspended
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs max-w-xs font-sans">
                                    <p className="font-bold text-destructive">Account Suspended</p>
                                    <p className="text-muted-foreground">
                                      {u.banReason || "No reason specified"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {u.emailVerified && !u.banned && (
                                <span
                                  title="Email Verified"
                                  className="size-1.5 rounded-full bg-[#10b981] shrink-0"
                                />
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono truncate">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Quick Role Switcher Dropdown */}
                      <TableCell className="py-2 px-3 w-[16%] whitespace-nowrap overflow-hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="focus:outline-hidden hover:opacity-85 transition-opacity cursor-pointer inline-flex items-center"
                            >
                              {renderRoleBadge(u.role)}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48 bg-card border-border">
                            <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase">
                              Change Role
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onQuickRoleChange(u.id, "admin")}
                              className="text-xs cursor-pointer gap-2"
                            >
                              <Crown className="size-3.5 text-[#8b5cf6]" />
                              <span>Administrator</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onQuickRoleChange(u.id, "staff")}
                              className="text-xs cursor-pointer gap-2"
                            >
                              <Shield className="size-3.5 text-[#10b981]" />
                              <span>Staff / Ops</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onQuickRoleChange(u.id, "user")}
                              className="text-xs cursor-pointer gap-2"
                            >
                              <Users className="size-3.5 text-[#38bdf8]" />
                              <span>Citizen Scientist</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>

                      {/* Squad Status Pill */}
                      <TableCell className="py-2 px-3 w-[22%] whitespace-nowrap overflow-hidden text-xs">
                        {inTeam && currentTeam ? (
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="size-2 rounded-full bg-[#10b981] shrink-0" />
                            <span className="font-semibold text-foreground truncate max-w-[120px]">
                              {currentTeam.name}
                            </span>
                            {u.teamMembers.some((tm) => tm.role === "leader") ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                                <Crown className="size-2.5" />
                                <span>Leader</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                                ({currentTeam.event?.code || "AST"})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
                            <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span>Solo (Unassigned)</span>
                          </span>
                        )}
                      </TableCell>

                      {/* Affiliation & Region */}
                      <TableCell className="py-2 px-3 w-[24%] min-w-0 overflow-hidden text-xs text-muted-foreground">
                        <span className="truncate flex items-center gap-1.5 max-w-full">
                          <span className="text-foreground/90 font-sans truncate">
                            {u.institution || "Independent"}
                          </span>
                          <span className="text-muted-foreground shrink-0">&middot;</span>
                          <span className="font-mono text-[11px] text-muted-foreground inline-flex items-center gap-1 shrink-0">
                            {u.country ? (
                              <>
                                <span className="text-xs shrink-0" title={u.country}>
                                  {getCountryFlag(resolveCountryCode(u.country))}
                                </span>
                                <span>{u.country}</span>
                              </>
                            ) : (
                              <span>Global</span>
                            )}
                          </span>
                        </span>
                      </TableCell>

                      {/* Actions Menu */}
                      <TableCell className="py-2 px-3 w-[6%] text-right whitespace-nowrap overflow-hidden">
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
                          <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                            {onViewUser && (
                              <DropdownMenuItem
                                onClick={() => onViewUser(u)}
                                className="gap-2 text-xs cursor-pointer font-semibold text-primary focus:text-primary focus:bg-primary/10"
                              >
                                <Eye className="size-3.5" />
                                <span>View Full Profile</span>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                              onClick={() => onEditUser(u)}
                              className="gap-2 text-xs cursor-pointer"
                            >
                              <Edit2 className="size-3.5 text-muted-foreground" />
                              <span>Edit User Profile</span>
                            </DropdownMenuItem>

                            {onSendEmail && (
                              <DropdownMenuItem
                                onClick={() => onSendEmail(u)}
                                className="gap-2 text-xs cursor-pointer text-violet-400 focus:text-violet-400 focus:bg-violet-500/10"
                              >
                                <Mail className="size-3.5" />
                                <span>Send Custom Email</span>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                              onClick={() => {
                                navigator.clipboard.writeText(u.email);
                                toast.success(`Copied email '${u.email}' to clipboard`);
                              }}
                              className="gap-2 text-xs cursor-pointer"
                            >
                              <Copy className="size-3.5 text-muted-foreground" />
                              <span>Copy Email Address</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {u.banned ? (
                              <DropdownMenuItem
                                onClick={() => onBanUser(u, "UNBAN")}
                                className="gap-2 text-xs cursor-pointer text-emerald-500 focus:text-emerald-500 focus:bg-emerald-500/10"
                              >
                                <UserCheck className="size-3.5" />
                                <span>Reinstate Account</span>
                              </DropdownMenuItem>
                            ) : (
                              <>
                                <DropdownMenuItem
                                  onClick={() => onBanUser(u, "WARN_NAME")}
                                  className="gap-2 text-xs cursor-pointer text-amber-500 focus:text-amber-500 focus:bg-amber-500/10"
                                >
                                  <AlertCircle className="size-3.5" />
                                  <span>Send Name Warning</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => onBanUser(u, "BAN")}
                                  className="gap-2 text-xs cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                >
                                  <ShieldAlert className="size-3.5" />
                                  <span>Ban Account</span>
                                </DropdownMenuItem>
                              </>
                            )}

                            <DropdownMenuItem
                              onClick={() => onDeleteUser(u)}
                              className="gap-2 text-xs cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="size-3.5" />
                              <span>Delete Account</span>
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

        {/* PINNED BOTTOM PAGINATION BAR */}
        <div className="p-2.5 bg-card shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          {/* Items & Rows Info */}
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <span>
              Showing{" "}
              <strong className="text-foreground font-mono">
                {filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </strong>
              &ndash;
              <strong className="text-foreground font-mono">
                {Math.min(currentPage * pageSize, filteredUsers.length)}
              </strong>{" "}
              of <strong className="text-foreground font-mono">{filteredUsers.length}</strong>
            </span>

            {/* Rows selector */}
            <div className="flex items-center gap-1 pl-2 border-l border-border">
              <span className="text-[11px]">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-6.5 px-1.5 rounded border border-border bg-background text-[11px] font-mono text-foreground cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Numbered Page Navigation Controls */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="h-6.5 px-1.5 text-xs shadow-arcade-xs active:translate-y-0.5"
              title="First Page"
            >
              <ChevronsLeft className="size-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-6.5 px-2 text-xs shadow-arcade-xs active:translate-y-0.5"
              title="Previous Page"
            >
              <ChevronLeft className="size-3.5" />
            </Button>

            {/* Numbered Page Buttons */}
            <div className="flex items-center gap-1 mx-1">
              {getPageNumbers().map((pNum, idx) => {
                if (pNum === "...") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1 text-muted-foreground text-xs font-mono"
                    >
                      ...
                    </span>
                  );
                }
                const pageIndex = Number(pNum);
                const isActive = currentPage === pageIndex;
                return (
                  <button
                    key={`page-${pageIndex}`}
                    type="button"
                    onClick={() => setCurrentPage(pageIndex)}
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || filteredUsers.length === 0}
              className="h-6.5 px-2 text-xs shadow-arcade-xs active:translate-y-0.5"
              title="Next Page"
            >
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || filteredUsers.length === 0}
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
