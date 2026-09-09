"use client";

import React from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { UserData, getInitials } from "./types";

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
  citizenCount: number;
  unassignedCount: number;
  loading: boolean;
  fetchAdminData: () => void;
  onQuickRoleChange: (userId: string, newRole: string) => void;
  onEditUser: (u: UserData) => void;
  onDeleteUser: (u: UserData) => void;
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
  citizenCount,
  unassignedCount,
  loading,
  fetchAdminData,
  onQuickRoleChange,
  onEditUser,
  onDeleteUser,
}: UsersTabProps) {
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
        </nav>

        {/* Quick Summary Pill */}
        <div className="pt-2.5 border-t border-border space-y-1.5 text-[11px] text-muted-foreground px-1">
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
                <SelectItem value="admin">Admin ({adminCount})</SelectItem>
                <SelectItem value="staff">Staff ({staffCount})</SelectItem>
                <SelectItem value="user">Citizen ({citizenCount})</SelectItem>
              </SelectContent>
            </Select>

            {/* Team Status Filter Selector */}
            <Select value={teamStatusFilter} onValueChange={setTeamStatusFilter}>
              <SelectTrigger className="h-8 text-xs font-sans bg-background w-full sm:w-[130px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="IN_TEAM">In Squad ({users.length - unassignedCount})</SelectItem>
                <SelectItem value="UNASSIGNED">Unassigned ({unassignedCount})</SelectItem>
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
          {filteredUsers.length === 0 ? (
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
                          <div className="size-7 rounded-full bg-muted border border-border flex items-center justify-center font-mono text-[10px] font-bold text-foreground shrink-0">
                            {getInitials(u.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-xs text-foreground truncate flex items-center gap-1.5">
                              <span className="truncate">{u.name}</span>
                              {u.emailVerified && (
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
                            <span className="font-semibold text-foreground truncate max-w-[130px]">
                              {currentTeam.name}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                              ({currentTeam.event?.code || "AST"})
                            </span>
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
                        <span className="truncate block max-w-full">
                          <span className="text-foreground/90 font-sans">
                            {u.institution || "Independent"}
                          </span>
                          <span className="text-muted-foreground mx-1">&middot;</span>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {u.country || "Global"}
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
                          <DropdownMenuContent align="end" className="w-44 bg-card border-border">
                            <DropdownMenuItem
                              onClick={() => onEditUser(u)}
                              className="gap-2 text-xs cursor-pointer"
                            >
                              <Edit2 className="size-3.5 text-primary" />
                              <span>Edit User Profile</span>
                            </DropdownMenuItem>

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
