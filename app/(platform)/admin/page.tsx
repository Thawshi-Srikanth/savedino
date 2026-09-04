"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  ShieldAlert,
  Users,
  Telescope,
  PlusCircle,
  Rocket,
  UserPlus,
  RefreshCw,
  Search,
  Crown,
  Shield,
  Star,
  Edit2,
  Trash2,
  UserMinus,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

interface EventData {
  id: string;
  title: string;
  code: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface TeamData {
  id: string;
  name: string;
  inviteCode: string;
  status: string;
  eventId: string;
  event: {
    title: string;
    code: string;
  };
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
      country?: string;
    };
  }>;
  _count?: {
    candidates: number;
    imageSets: number;
  };
}

interface UserData {
  id: string;
  name: string;
  email: string;
  institution?: string | null;
  country?: string | null;
  role: "admin" | "staff" | "leader" | "user" | string;
  emailVerified?: boolean;
  createdAt: string;
  teamMembers: Array<{
    id: string;
    role: string;
    team: {
      id: string;
      name: string;
      event: {
        id: string;
        title: string;
        code?: string;
      };
    };
  }>;
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"USERS" | "MATCHMAKING" | "TEAMS" | "EVENTS">("USERS");

  // Data States
  const [events, setEvents] = useState<EventData[]>([]);
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // User Management Filters & Pagination
  const [userSearch, setUserSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [teamStatusFilter, setTeamStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Matchmaking Assign Modal State
  const [assigningUser, setAssigningUser] = useState<UserData | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [assignLoading, setAssignLoading] = useState<boolean>(false);

  // Edit User / Role Modal State
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editRole, setEditRole] = useState<string>("user");
  const [editInstitution, setEditInstitution] = useState<string>("");
  const [editCountry, setEditCountry] = useState<string>("");
  const [editVerified, setEditVerified] = useState<boolean>(false);
  const [editLoading, setEditLoading] = useState<boolean>(false);

  // Delete User Modal State
  const [deletingUser, setDeletingUser] = useState<UserData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [resEvents, resTeams, resUsers] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/teams"),
        fetch("/api/admin/users"),
      ]);

      if (resEvents.ok) {
        const d = await resEvents.json();
        if (d.success) setEvents(d.events || []);
      }

      if (resTeams.ok) {
        const d = await resTeams.json();
        if (d.success) setTeams(d.teams || []);
      }

      if (resUsers.ok) {
        const d = await resUsers.json();
        if (d.success) setUsers(d.users || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [userSearch, roleFilter, teamStatusFilter, pageSize]);

  // Open Edit User Modal
  const handleOpenEditUser = (user: UserData) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditRole(user.role || "user");
    setEditInstitution(user.institution || "");
    setEditCountry(user.country || "");
    setEditVerified(Boolean(user.emailVerified));
  };

  // Save User & Role Changes
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setEditLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          role: editRole,
          institution: editInstitution,
          country: editCountry,
          emailVerified: editVerified,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "Failed to update user.");
      } else {
        toast.success(`Updated ${editName}'s profile and role.`);
        setEditingUser(null);
        fetchAdminData();
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setEditLoading(false);
    }
  };

  // Delete User Account
  const handleConfirmDeleteUser = async () => {
    if (!deletingUser) return;

    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "Failed to delete user.");
      } else {
        toast.success(`User ${deletingUser.name} deleted successfully.`);
        setDeletingUser(null);
        fetchAdminData();
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Remove User from Team
  const handleRemoveFromTeam = async (userId: string, userName: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/team`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "Failed to remove user from team.");
      } else {
        toast.success(`Removed ${userName} from squad.`);
        fetchAdminData();
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    }
  };

  // Assign Student to Team (Matchmaking)
  const handleAssignStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningUser || !selectedTeamId) return;

    setAssignLoading(true);

    try {
      const res = await fetch("/api/admin/matchmaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: assigningUser.id,
          teamId: selectedTeamId,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.error || "Failed to assign student.");
      } else {
        toast.success(`Assigned ${assigningUser.name} to team successfully!`);
        fetchAdminData();
        setAssigningUser(null);
        setSelectedTeamId("");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setAssignLoading(false);
    }
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !userSearch.trim() ||
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.institution && u.institution.toLowerCase().includes(userSearch.toLowerCase())) ||
        (u.country && u.country.toLowerCase().includes(userSearch.toLowerCase()));

      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

      const isUnassigned = u.teamMembers.length === 0;
      const matchesTeam =
        teamStatusFilter === "ALL" ||
        (teamStatusFilter === "UNASSIGNED" && isUnassigned) ||
        (teamStatusFilter === "IN_TEAM" && !isUnassigned);

      return matchesSearch && matchesRole && matchesTeam;
    });
  }, [users, userSearch, roleFilter, teamStatusFilter]);

  // Paginated Sliced Users
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Derived Role Distribution Stats
  const adminCount = useMemo(() => users.filter((u) => u.role === "admin").length, [users]);
  const staffCount = useMemo(() => users.filter((u) => u.role === "staff").length, [users]);
  const leaderCount = useMemo(() => users.filter((u) => u.role === "leader").length, [users]);
  const citizenCount = useMemo(() => users.filter((u) => u.role === "user" || !u.role).length, [users]);
  const unassignedCount = useMemo(() => users.filter((u) => u.teamMembers.length === 0).length, [users]);

  // Helper to get initials
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Helper to generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  // Helper to render role badge
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/30">
            <Crown className="size-3" />
            <span>Admin</span>
          </span>
        );
      case "staff":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
            <Shield className="size-3" />
            <span>Staff</span>
          </span>
        );
      case "leader":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
            <Star className="size-3" />
            <span>Leader</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
            <Users className="size-3" />
            <span>Citizen</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 items-start font-sans">
      {/* 1. ADMIN SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 flex-shrink-0 bg-card border border-border rounded-xl p-4 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#27282d] space-y-6">
        <div>
          <div className="flex items-center gap-2 px-2 py-1">
            <ShieldAlert className="size-4 text-[#8b5cf6]" />
            <span className="font-bold text-xs uppercase tracking-wider text-foreground">
              ADMIN CONSOLE
            </span>
          </div>
          <p className="text-xs text-muted-foreground px-2 mt-0.5">
            IASC Operations &amp; Governance
          </p>
        </div>

        {/* Sidebar Nav Buttons */}
        <nav className="space-y-1.5">
          <Button
            type="button"
            variant={activeTab === "USERS" ? "default" : "outline"}
            onClick={() => setActiveTab("USERS")}
            className="w-full justify-between h-10 px-3 text-xs font-bold cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Users className="size-4" />
              <span>User &amp; Roles</span>
            </div>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-semibold font-mono">
              {users.length}
            </Badge>
          </Button>

          <Button
            type="button"
            variant={activeTab === "MATCHMAKING" ? "default" : "outline"}
            onClick={() => setActiveTab("MATCHMAKING")}
            className="w-full justify-between h-10 px-3 text-xs font-bold cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <UserPlus className="size-4" />
              <span>Solo Matchmaking</span>
            </div>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-semibold font-mono">
              {unassignedCount}
            </Badge>
          </Button>

          <Button
            type="button"
            variant={activeTab === "TEAMS" ? "default" : "outline"}
            onClick={() => setActiveTab("TEAMS")}
            className="w-full justify-between h-10 px-3 text-xs font-bold cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Telescope className="size-4" />
              <span>Squads &amp; Rosters</span>
            </div>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-semibold font-mono">
              {teams.length}
            </Badge>
          </Button>

          <Button
            type="button"
            variant={activeTab === "EVENTS" ? "default" : "outline"}
            onClick={() => setActiveTab("EVENTS")}
            className="w-full justify-between h-10 px-3 text-xs font-bold cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Rocket className="size-4" />
              <span>Campaign Events</span>
            </div>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-semibold font-mono">
              {events.length}
            </Badge>
          </Button>
        </nav>

        {/* Quick Campaign Action */}
        <div className="pt-2 border-t border-border space-y-3">
          <Link href="/admin/campaigns/new" className="block w-full">
            <Button
              variant="default"
              size="sm"
              className="w-full text-xs font-bold py-2.5 flex items-center justify-center gap-2 cursor-pointer bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
            >
              <PlusCircle className="size-3.5" />
              <span>New Campaign</span>
            </Button>
          </Link>

          {/* Quick System Stats */}
          <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-1.5 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Total Accounts:</span>
              <span className="font-bold text-foreground font-mono">{users.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Staff &amp; Admins:</span>
              <span className="font-bold text-[#8b5cf6] font-mono">{adminCount + staffCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Squads:</span>
              <span className="font-bold text-foreground font-mono">{teams.length}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE (Locked min-w-0 to prevent width jumping) */}
      <div className="flex-1 w-full min-w-0 space-y-4">
        {/* TAB 1: USER & ROLE MANAGEMENT */}
        {activeTab === "USERS" && (
          <div className="space-y-4 w-full">
            {/* Interactive Role Distribution Stat Cards (Clickable quick filters) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setRoleFilter(roleFilter === "admin" ? "ALL" : "admin")}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  roleFilter === "admin"
                    ? "bg-[#8b5cf6]/10 border-[#8b5cf6] shadow-sm"
                    : "bg-card border-border hover:border-muted-foreground/40 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#27282d]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Crown className="size-3.5 text-[#8b5cf6]" />
                    <span>Admins</span>
                  </span>
                  {roleFilter === "admin" && (
                    <span className="text-[9px] font-bold text-[#8b5cf6] uppercase">Active</span>
                  )}
                </div>
                <div className="text-xl font-bold font-mono text-[#8b5cf6] mt-1.5">{adminCount}</div>
              </button>

              <button
                type="button"
                onClick={() => setRoleFilter(roleFilter === "staff" ? "ALL" : "staff")}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  roleFilter === "staff"
                    ? "bg-[#10b981]/10 border-[#10b981] shadow-sm"
                    : "bg-card border-border hover:border-muted-foreground/40 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#27282d]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Shield className="size-3.5 text-[#10b981]" />
                    <span>Staff / Ops</span>
                  </span>
                  {roleFilter === "staff" && (
                    <span className="text-[9px] font-bold text-[#10b981] uppercase">Active</span>
                  )}
                </div>
                <div className="text-xl font-bold font-mono text-[#10b981] mt-1.5">{staffCount}</div>
              </button>

              <button
                type="button"
                onClick={() => setRoleFilter(roleFilter === "leader" ? "ALL" : "leader")}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  roleFilter === "leader"
                    ? "bg-amber-500/10 border-amber-500 shadow-sm"
                    : "bg-card border-border hover:border-muted-foreground/40 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#27282d]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Star className="size-3.5 text-amber-500" />
                    <span>Leaders</span>
                  </span>
                  {roleFilter === "leader" && (
                    <span className="text-[9px] font-bold text-amber-500 uppercase">Active</span>
                  )}
                </div>
                <div className="text-xl font-bold font-mono text-amber-500 mt-1.5">{leaderCount}</div>
              </button>

              <button
                type="button"
                onClick={() => setRoleFilter(roleFilter === "user" ? "ALL" : "user")}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  roleFilter === "user"
                    ? "bg-[#38bdf8]/10 border-[#38bdf8] shadow-sm"
                    : "bg-card border-border hover:border-muted-foreground/40 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#27282d]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Users className="size-3.5 text-[#38bdf8]" />
                    <span>Citizens</span>
                  </span>
                  {roleFilter === "user" && (
                    <span className="text-[9px] font-bold text-[#38bdf8] uppercase">Active</span>
                  )}
                </div>
                <div className="text-xl font-bold font-mono text-foreground mt-1.5">{citizenCount}</div>
              </button>
            </div>

            {/* Main User Management Table Card - Fixed Height Container with Pinned Header & Pinned Pagination */}
            <Card className="p-0 overflow-hidden flex flex-col h-[560px] border border-border w-full">
              {/* Header & Controls Toolbar */}
              <div className="p-3.5 border-b border-border space-y-3 shrink-0 bg-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-foreground">User &amp; Role Management</h2>
                      <Badge variant="outline" className="text-[10px] font-mono font-medium">
                        {filteredUsers.length} total
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Manage 4-tier roles, researcher permissions, and team allocations.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchAdminData}
                    className="h-7 px-2.5 text-xs gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </Button>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search name, email, institution, country..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-8 text-xs h-7.5 bg-background font-sans"
                    />
                    {userSearch && (
                      <button
                        type="button"
                        onClick={() => setUserSearch("")}
                        className="absolute right-2.5 top-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Role Filter Selector */}
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="h-7.5 text-xs font-sans bg-background w-full sm:w-[140px]">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Roles ({users.length})</SelectItem>
                      <SelectItem value="admin">Admin ({adminCount})</SelectItem>
                      <SelectItem value="staff">Staff ({staffCount})</SelectItem>
                      <SelectItem value="leader">Leader ({leaderCount})</SelectItem>
                      <SelectItem value="user">Citizen ({citizenCount})</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Team Status Filter Selector */}
                  <Select value={teamStatusFilter} onValueChange={setTeamStatusFilter}>
                    <SelectTrigger className="h-7.5 text-xs font-sans bg-background w-full sm:w-[150px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="IN_TEAM">In Squad ({users.length - unassignedCount})</SelectItem>
                      <SelectItem value="UNASSIGNED">Unassigned Solo ({unassignedCount})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Scrollable Table Area (Strict table-fixed layout to prevent width jumping) */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 relative">
                {filteredUsers.length === 0 ? (
                  <div className="py-16 text-center text-xs text-muted-foreground space-y-2">
                    <Users className="size-8 mx-auto text-muted-foreground/30 mb-1" />
                    <div className="font-semibold text-sm text-foreground">No matching researchers found</div>
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
                        className="h-7 text-xs mt-2"
                      >
                        Reset All Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <Table className="w-full table-fixed">
                    <TableHeader className="sticky top-0 z-20 bg-card">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[32%] border-b border-border shadow-xs">Researcher</TableHead>
                        <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[16%] border-b border-border shadow-xs">Role</TableHead>
                        <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[22%] border-b border-border shadow-xs">Squad Status</TableHead>
                        <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[24%] border-b border-border shadow-xs">Affiliation / Region</TableHead>
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

                            {/* Role Badge */}
                            <TableCell className="py-2 px-3 w-[16%] whitespace-nowrap overflow-hidden">
                              {renderRoleBadge(u.role)}
                            </TableCell>

                            {/* Squad Status */}
                            <TableCell className="py-2 px-3 w-[22%] min-w-0 overflow-hidden">
                              {currentTeam ? (
                                <Link
                                  href={`/team/${currentTeam.id}`}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline truncate max-w-full"
                                  title={`Squad: ${currentTeam.name}`}
                                >
                                  <span className="truncate">{currentTeam.name}</span>
                                  {currentTeam.event?.code && (
                                    <span className="text-[10px] font-mono text-muted-foreground font-normal shrink-0">
                                      ({currentTeam.event.code})
                                    </span>
                                  )}
                                </Link>
                              ) : (
                                <span className="inline-flex items-center text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                                  Unassigned Solo
                                </span>
                              )}
                            </TableCell>

                            {/* Affiliation & Region */}
                            <TableCell className="py-2 px-3 w-[24%] min-w-0 overflow-hidden text-xs text-muted-foreground">
                              <span className="truncate block max-w-full" title={`${u.institution || "Independent"} · ${u.country || "Global"}`}>
                                <span className="text-foreground/90">{u.institution || "Independent"}</span>
                                <span className="text-muted-foreground mx-1">&middot;</span>
                                <span className="font-mono text-[11px] text-muted-foreground">{u.country || "Global"}</span>
                              </span>
                            </TableCell>

                            {/* 3-Dot Actions Menu */}
                            <TableCell className="py-2 px-3 w-[6%] text-right whitespace-nowrap overflow-hidden">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                                    title="Open user actions"
                                  >
                                    <MoreHorizontal className="size-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-md">
                                  <DropdownMenuLabel className="text-[10px] uppercase font-mono text-muted-foreground tracking-wider">
                                    User Actions
                                  </DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => handleOpenEditUser(u)}
                                    className="gap-2 text-xs cursor-pointer"
                                  >
                                    <Edit2 className="size-3.5 text-primary" />
                                    <span>Edit Role &amp; Profile</span>
                                  </DropdownMenuItem>

                                  {inTeam ? (
                                    <DropdownMenuItem
                                      onClick={() => handleRemoveFromTeam(u.id, u.name)}
                                      className="gap-2 text-xs cursor-pointer text-amber-500 focus:text-amber-500"
                                    >
                                      <UserMinus className="size-3.5" />
                                      <span>Remove from Squad</span>
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setAssigningUser(u);
                                        setSelectedTeamId("");
                                      }}
                                      className="gap-2 text-xs cursor-pointer text-[#10b981] focus:text-[#10b981]"
                                    >
                                      <UserPlus className="size-3.5" />
                                      <span>Assign to Squad</span>
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuItem
                                    onClick={() => {
                                      navigator.clipboard.writeText(u.email);
                                      toast.success(`Copied ${u.email} to clipboard`);
                                    }}
                                    className="gap-2 text-xs cursor-pointer"
                                  >
                                    <Copy className="size-3.5 text-muted-foreground" />
                                    <span>Copy Email</span>
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    onClick={() => setDeletingUser(u)}
                                    disabled={session?.user?.id === u.id}
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

              {/* 3. PINNED BOTTOM PAGINATION BAR */}
              <div className="p-2.5 border-t border-border bg-card shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
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
                    className="h-6.5 px-1.5 text-xs"
                    title="First Page"
                  >
                    <ChevronsLeft className="size-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-6.5 px-2 text-xs"
                    title="Previous Page"
                  >
                    <ChevronLeft className="size-3.5" />
                  </Button>

                  {/* Numbered Page Buttons */}
                  <div className="flex items-center gap-1 mx-1">
                    {getPageNumbers().map((pNum, idx) => {
                      if (pNum === "...") {
                        return (
                          <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground text-xs font-mono">
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
                          className={`h-6.5 min-w-[26px] px-1.5 text-[11px] font-mono font-semibold rounded border cursor-pointer transition-colors ${
                            isActive
                              ? "bg-primary text-primary-foreground border-primary"
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
                    className="h-6.5 px-2 text-xs"
                    title="Next Page"
                  >
                    <ChevronRight className="size-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || filteredUsers.length === 0}
                    className="h-6.5 px-1.5 text-xs"
                    title="Last Page"
                  >
                    <ChevronsRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: SOLO MATCHMAKING */}
        {activeTab === "MATCHMAKING" && (
          <Card className="p-0 overflow-hidden flex flex-col h-[560px] border border-border w-full">
            <CardHeader className="p-3.5 border-b border-border shrink-0 bg-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-bold text-foreground">
                      Solo Researcher Matchmaking
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px] font-mono font-bold">
                      {unassignedCount} Solo
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Match unassigned citizen scientists and students into active research squads with open slots.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 relative">
              {users.filter((u) => u.teamMembers.length === 0).length === 0 ? (
                <div className="py-16 text-center text-xs text-muted-foreground space-y-1">
                  <Users className="size-8 mx-auto text-muted-foreground/30 mb-1" />
                  <div className="font-semibold text-sm text-foreground">All researchers are assigned!</div>
                  <p>There are no unassigned solo students at this moment.</p>
                </div>
              ) : (
                <Table className="w-full table-fixed">
                  <TableHeader className="sticky top-0 z-20 bg-card">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[35%] border-b border-border shadow-xs">Researcher</TableHead>
                      <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[18%] border-b border-border shadow-xs">Role</TableHead>
                      <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[27%] border-b border-border shadow-xs">Affiliation / Region</TableHead>
                      <TableHead className="sticky top-0 z-20 bg-card text-right text-xs font-bold py-2.5 px-3 w-[20%] border-b border-border shadow-xs">Match Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users
                      .filter((u) => u.teamMembers.length === 0)
                      .map((u) => (
                        <TableRow key={u.id} className="hover:bg-muted/30 border-b border-border/60">
                          <TableCell className="py-2 px-3 w-[35%] min-w-0 overflow-hidden">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="size-7 rounded-full bg-muted border border-border flex items-center justify-center font-mono text-[10px] font-bold text-foreground shrink-0">
                                {getInitials(u.name)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-xs text-foreground truncate">{u.name}</div>
                                <div className="text-[11px] text-muted-foreground font-mono truncate">{u.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2 px-3 w-[18%] whitespace-nowrap overflow-hidden">{renderRoleBadge(u.role)}</TableCell>
                          <TableCell className="py-2 px-3 w-[27%] min-w-0 overflow-hidden text-xs text-muted-foreground">
                            <span className="truncate block max-w-full">
                              <span className="text-foreground/90">{u.institution || "Independent"}</span>
                              <span className="text-muted-foreground mx-1">&middot;</span>
                              <span className="font-mono text-[11px] text-muted-foreground">{u.country || "Global"}</span>
                            </span>
                          </TableCell>
                          <TableCell className="py-2 px-3 w-[20%] text-right whitespace-nowrap overflow-hidden">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                assigningUser ? null : setAssigningUser(u);
                                setSelectedTeamId("");
                              }}
                              className="h-6.5 text-[11px] font-semibold gap-1.5 cursor-pointer bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20 border-[#10b981]/30"
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
        )}

        {/* TAB 3: TEAMS & ROSTERS */}
        {activeTab === "TEAMS" && (
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">Campaign Squads &amp; Rosters</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Overview of all registered teams, active members, and leader assignments.
                </p>
              </div>
              <Badge variant="secondary" className="font-mono text-xs font-bold">
                {teams.length} Squads
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {teams.map((t) => (
                <Card key={t.id} className="p-4 bg-card border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">{t.name}</span>
                    <Badge variant="secondary" className="text-xs font-mono">
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
          </Card>
        )}

        {/* TAB 4: CAMPAIGN EVENTS */}
        {activeTab === "EVENTS" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">Campaign Events ({events.length})</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage active IASC search campaigns and registration schedules.
                </p>
              </div>

              <Link href="/admin/campaigns/new">
                <Button size="sm" variant="default" className="text-xs font-bold flex items-center gap-1.5 cursor-pointer bg-[#8b5cf6] hover:bg-[#7c3aed] text-white">
                  <PlusCircle className="size-3.5" />
                  <span>New Campaign</span>
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {events.map((ev) => (
                <Card key={ev.id} className="p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs text-primary font-bold uppercase font-mono">
                        {ev.code}
                      </span>
                      <Badge variant={ev.status === "ACTIVE" ? "default" : "outline"}>
                        {ev.status}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-base text-foreground">{ev.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {ev.description || "International Asteroid Search Collaboration campaign."}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border text-xs text-muted-foreground space-y-1 font-mono">
                    <div>Start Date: {new Date(ev.startDate).toLocaleDateString()}</div>
                    <div>End Date: {new Date(ev.endDate).toLocaleDateString()}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* EDIT USER & ROLE MODAL */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Edit User &amp; Platform Role
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update platform access level, contact information, and role for <strong className="text-foreground">{editingUser?.email}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveUser} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Full Name</label>
              <Input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-9 text-xs bg-background font-sans"
              />
            </div>

            {/* 4-Tier Platform Role Select */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Platform Role (4 Tiers)</label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger className="h-9 text-xs font-sans bg-background">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator (Full Platform Control)</SelectItem>
                  <SelectItem value="staff">Staff (Moderator &amp; Campaign Operations)</SelectItem>
                  <SelectItem value="leader">Squad Leader (Squad &amp; Data Analysis Lead)</SelectItem>
                  <SelectItem value="user">Citizen Scientist (General Participant)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Institution & Country */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Institution / School</label>
                <Input
                  type="text"
                  placeholder="e.g. MIT, Cambridge"
                  value={editInstitution}
                  onChange={(e) => setEditInstitution(e.target.value)}
                  className="h-9 text-xs bg-background font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Country</label>
                <Input
                  type="text"
                  placeholder="e.g. United States, Japan"
                  value={editCountry}
                  onChange={(e) => setEditCountry(e.target.value)}
                  className="h-9 text-xs bg-background font-sans"
                />
              </div>
            </div>

            {/* Email Verified Checkbox */}
            <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-background">
              <input
                type="checkbox"
                id="editVerifiedCheckbox"
                checked={editVerified}
                onChange={(e) => setEditVerified(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-primary"
              />
              <label htmlFor="editVerifiedCheckbox" className="text-xs font-medium cursor-pointer text-foreground">
                Email Verified / Active Account
              </label>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingUser(null)} disabled={editLoading}>
                Cancel
              </Button>
              <Button type="submit" variant="default" size="sm" disabled={editLoading} className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold">
                {editLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MATCHMAKING ASSIGN MODAL */}
      <Dialog open={!!assigningUser} onOpenChange={() => setAssigningUser(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Assign Solo Student to Squad
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Assigning <strong className="text-foreground">{assigningUser?.name}</strong> ({assigningUser?.email}) into an open team slot.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAssignStudent} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-foreground">Select Open Squad</label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden font-sans"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                required
              >
                <option value="">-- Choose a Squad --</option>
                {teams
                  .filter((t) => t.members.length < 6)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.event?.code || "AST"}) &bull; {t.members.length}/6 Members
                    </option>
                  ))}
              </select>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" size="sm" onClick={() => setAssigningUser(null)} disabled={assignLoading}>
                Cancel
              </Button>
              <Button type="submit" variant="default" size="sm" disabled={!selectedTeamId || assignLoading} className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold">
                {assignLoading ? "Assigning..." : "Confirm Assignment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE USER CONFIRMATION DIALOG */}
      <Dialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="size-4" />
              <span>Delete Account</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete <strong className="text-foreground">{deletingUser?.name}</strong> ({deletingUser?.email})? This action cannot be undone and will remove all their squad memberships and submissions.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" onClick={() => setDeletingUser(null)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDeleteUser}
              disabled={deleteLoading}
              className="font-bold"
            >
              {deleteLoading ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
