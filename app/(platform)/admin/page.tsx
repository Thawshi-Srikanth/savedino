"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  Calendar,
  Clock,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Tag,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface EventData {
  id: string;
  title: string;
  code: string;
  description?: string;
  regStart?: string;
  regEnd?: string;
  teamFormationStart?: string;
  teamFormationEnd?: string;
  startDate: string;
  endDate: string;
  submissionStart?: string;
  submissionEnd?: string;
  status: string;
  _count?: {
    teams: number;
    imageSets?: number;
  };
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

  // Campaign Management State
  const [campaignSearch, setCampaignSearch] = useState<string>("");
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<string>("ALL");
  const [campaignCurrentPage, setCampaignCurrentPage] = useState<number>(1);
  const [campaignPageSize, setCampaignPageSize] = useState<number>(10);
  const [editingCampaign, setEditingCampaign] = useState<EventData | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<EventData | null>(null);

  // Edit Campaign Form State
  const [editCampTitle, setEditCampTitle] = useState<string>("");
  const [editCampCode, setEditCampCode] = useState<string>("");
  const [editCampDesc, setEditCampDesc] = useState<string>("");
  const [editCampStatus, setEditCampStatus] = useState<string>("ACTIVE");
  const [editCampRegStart, setEditCampRegStart] = useState<string>("");
  const [editCampRegEnd, setEditCampRegEnd] = useState<string>("");
  const [editCampTeamStart, setEditCampTeamStart] = useState<string>("");
  const [editCampTeamEnd, setEditCampTeamEnd] = useState<string>("");
  const [editCampStart, setEditCampStart] = useState<string>("");
  const [editCampEnd, setEditCampEnd] = useState<string>("");
  const [editCampSubStart, setEditCampSubStart] = useState<string>("");
  const [editCampSubEnd, setEditCampSubEnd] = useState<string>("");
  const [editCampTab, setEditCampTab] = useState<string>("overview");
  const [editCampLoading, setEditCampLoading] = useState<boolean>(false);
  const [deleteCampLoading, setDeleteCampLoading] = useState<boolean>(false);

  // Helper date conversions
  const toLocalInput = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, "0");
    const YYYY = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const DD = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
  };

  const formatAdminDate = (dateStr?: string) => {
    if (!dateStr) return "TBA";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "TBA";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Open Edit Campaign Modal
  const handleOpenEditCampaign = (ev: EventData) => {
    setEditingCampaign(ev);
    setEditCampTitle(ev.title);
    setEditCampCode(ev.code);
    setEditCampDesc(ev.description || "");
    setEditCampStatus(ev.status || "ACTIVE");
    setEditCampRegStart(toLocalInput(ev.regStart));
    setEditCampRegEnd(toLocalInput(ev.regEnd));
    setEditCampTeamStart(toLocalInput(ev.teamFormationStart));
    setEditCampTeamEnd(toLocalInput(ev.teamFormationEnd));
    setEditCampStart(toLocalInput(ev.startDate));
    setEditCampEnd(toLocalInput(ev.endDate));
    setEditCampSubStart(toLocalInput(ev.submissionStart));
    setEditCampSubEnd(toLocalInput(ev.submissionEnd));
    setEditCampTab("overview");
  };

  // Save Campaign Changes
  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;

    setEditCampLoading(true);

    try {
      const res = await fetch(`/api/events/${editingCampaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editCampTitle,
          code: editCampCode.toUpperCase().trim(),
          description: editCampDesc,
          status: editCampStatus,
          regStart: editCampRegStart ? new Date(editCampRegStart).toISOString() : undefined,
          regEnd: editCampRegEnd ? new Date(editCampRegEnd).toISOString() : undefined,
          teamFormationStart: editCampTeamStart ? new Date(editCampTeamStart).toISOString() : undefined,
          teamFormationEnd: editCampTeamEnd ? new Date(editCampTeamEnd).toISOString() : undefined,
          startDate: editCampStart ? new Date(editCampStart).toISOString() : undefined,
          endDate: editCampEnd ? new Date(editCampEnd).toISOString() : undefined,
          submissionStart: editCampSubStart ? new Date(editCampSubStart).toISOString() : undefined,
          submissionEnd: editCampSubEnd ? new Date(editCampSubEnd).toISOString() : undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "Failed to update campaign.");
      } else {
        toast.success(`Campaign '${data.event.title}' updated successfully.`);
        setEditingCampaign(null);
        fetchAdminData();
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setEditCampLoading(false);
    }
  };

  // Quick Status Switcher for Campaigns
  const handleQuickCampaignStatus = async (eventId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "Failed to update status.");
      } else {
        toast.success(`Status updated to ${newStatus}.`);
        fetchAdminData();
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    }
  };

  // Delete Campaign
  const handleDeleteCampaign = async () => {
    if (!deletingCampaign) return;

    setDeleteCampLoading(true);

    try {
      const res = await fetch(`/api/events/${deletingCampaign.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "Failed to delete campaign.");
      } else {
        toast.success(data.message || `Campaign '${deletingCampaign.title}' deleted.`);
        setDeletingCampaign(null);
        fetchAdminData();
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setDeleteCampLoading(false);
    }
  };

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

  useEffect(() => {
    setCampaignCurrentPage(1);
  }, [campaignSearch, campaignStatusFilter, campaignPageSize]);

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

  // Derived Campaign Stats
  const activeCampCount = useMemo(() => events.filter((e) => e.status === "ACTIVE").length, [events]);
  const upcomingCampCount = useMemo(() => events.filter((e) => e.status === "UPCOMING").length, [events]);
  const subOpenCampCount = useMemo(() => events.filter((e) => e.status === "SUBMISSION_OPEN").length, [events]);
  const completedCampCount = useMemo(() => events.filter((e) => e.status === "COMPLETED").length, [events]);

  // Filtered Campaigns List
  const filteredCampaigns = useMemo(() => {
    return events.filter((ev) => {
      const matchesSearch =
        !campaignSearch.trim() ||
        ev.title.toLowerCase().includes(campaignSearch.toLowerCase()) ||
        ev.code.toLowerCase().includes(campaignSearch.toLowerCase()) ||
        (ev.description && ev.description.toLowerCase().includes(campaignSearch.toLowerCase()));

      const matchesStatus =
        campaignStatusFilter === "ALL" || ev.status === campaignStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, campaignSearch, campaignStatusFilter]);

  // Paginated Sliced Campaigns
  const totalCampaignPages = Math.max(1, Math.ceil(filteredCampaigns.length / campaignPageSize));
  const paginatedCampaigns = useMemo(() => {
    const start = (campaignCurrentPage - 1) * campaignPageSize;
    return filteredCampaigns.slice(start, start + campaignPageSize);
  }, [filteredCampaigns, campaignCurrentPage, campaignPageSize]);

  // Helper to generate campaign page numbers
  const getCampaignPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalCampaignPages <= 5) {
      for (let i = 1; i <= totalCampaignPages; i++) pages.push(i);
    } else {
      if (campaignCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalCampaignPages);
      } else if (campaignCurrentPage >= totalCampaignPages - 2) {
        pages.push(1, "...", totalCampaignPages - 3, totalCampaignPages - 2, totalCampaignPages - 1, totalCampaignPages);
      } else {
        pages.push(1, "...", campaignCurrentPage - 1, campaignCurrentPage, campaignCurrentPage + 1, "...", totalCampaignPages);
      }
    }
    return pages;
  };

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
    <div className="w-full space-y-4 font-sans">
      {/* TABS NAVIGATION & WORKSPACE */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as any)}
        className="w-full space-y-4"
      >
        <div className="overflow-x-auto pb-1 scrollbar-none">
          <TabsList className="h-11 p-1 bg-muted/60 border border-border rounded-xl inline-flex min-w-full sm:min-w-0 sm:w-auto shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d] gap-1">
            <TabsTrigger
              value="USERS"
              className="h-9 px-3.5 text-xs font-bold gap-2 cursor-pointer data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-[0_2px_0_0_#e2e8f0] dark:data-[state=active]:shadow-[0_2px_0_0_#27282d] data-[state=active]:border-border border border-transparent rounded-lg"
            >
              <Users className="size-3.5" />
              <span>Users &amp; Roles</span>
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 font-semibold font-mono"
              >
                {users.length}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="MATCHMAKING"
              className="h-9 px-3.5 text-xs font-bold gap-2 cursor-pointer data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-[0_2px_0_0_#e2e8f0] dark:data-[state=active]:shadow-[0_2px_0_0_#27282d] data-[state=active]:border-border border border-transparent rounded-lg"
            >
              <UserPlus className="size-3.5" />
              <span>Solo Matchmaking</span>
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 font-semibold font-mono"
              >
                {unassignedCount}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="TEAMS"
              className="h-9 px-3.5 text-xs font-bold gap-2 cursor-pointer data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-[0_2px_0_0_#e2e8f0] dark:data-[state=active]:shadow-[0_2px_0_0_#27282d] data-[state=active]:border-border border border-transparent rounded-lg"
            >
              <Telescope className="size-3.5" />
              <span>Squads &amp; Rosters</span>
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 font-semibold font-mono"
              >
                {teams.length}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="EVENTS"
              className="h-9 px-3.5 text-xs font-bold gap-2 cursor-pointer data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-[0_2px_0_0_#e2e8f0] dark:data-[state=active]:shadow-[0_2px_0_0_#27282d] data-[state=active]:border-border border border-transparent rounded-lg"
            >
              <Rocket className="size-3.5" />
              <span>Campaign Events</span>
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 font-semibold font-mono"
              >
                {events.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: USER & ROLE MANAGEMENT */}
        <TabsContent value="USERS" className="mt-0 focus-visible:outline-none space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start w-full">
            {/* Left Role Filter Sidebar */}
            <aside className="w-full md:w-56 shrink-0 bg-card border border-border rounded-xl p-3 shadow-[0_3px_0_0_#e2e8f0] dark:shadow-[0_3px_0_0_#27282d] space-y-2.5">
              <div className="px-2 py-1 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-sans">
                  Researcher Roles
                </span>
                <Badge variant="secondary" className="text-[10px] font-mono font-bold px-1.5 py-0">
                  {users.length}
                </Badge>
              </div>

              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => setRoleFilter("ALL")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    roleFilter === "ALL"
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="size-3.5" />
                    <span>All Roles</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold">
                    {users.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRoleFilter(roleFilter === "admin" ? "ALL" : "admin")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    roleFilter === "admin"
                      ? "bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/40 font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Crown className="size-3.5 text-[#8b5cf6]" />
                    <span>Admins</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-[#8b5cf6]">
                    {adminCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRoleFilter(roleFilter === "staff" ? "ALL" : "staff")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    roleFilter === "staff"
                      ? "bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/40 font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="size-3.5 text-[#10b981]" />
                    <span>Staff / Ops</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-[#10b981]">
                    {staffCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRoleFilter(roleFilter === "leader" ? "ALL" : "leader")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    roleFilter === "leader"
                      ? "bg-amber-500/15 text-amber-500 border border-amber-500/40 font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Star className="size-3.5 text-amber-500" />
                    <span>Leaders</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-amber-500">
                    {leaderCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRoleFilter(roleFilter === "user" ? "ALL" : "user")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    roleFilter === "user"
                      ? "bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/40 font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="size-3.5 text-[#38bdf8]" />
                    <span>Citizens</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-[#38bdf8]">
                    {citizenCount}
                  </span>
                </button>
              </nav>

              {/* Quick Summary Pill */}
              <div className="pt-2.5 border-t border-border space-y-1.5 text-[11px] text-muted-foreground px-1">
                <div className="flex justify-between">
                  <span>In Squad:</span>
                  <span className="font-bold text-foreground font-mono">{users.length - unassignedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unassigned:</span>
                  <span className="font-bold text-amber-500 font-mono">{unassignedCount}</span>
                </div>
              </div>
            </aside>

            {/* Main User Management Table Card - Fixed Height Container with Pinned Header & Pinned Pagination */}
            <Card className="p-0 overflow-hidden flex flex-col h-[560px] border border-border flex-1 min-w-0 w-full">
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
        </TabsContent>

        {/* TAB 2: SOLO MATCHMAKING */}
        <TabsContent value="MATCHMAKING" className="mt-0 focus-visible:outline-none space-y-4">
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
        </TabsContent>

        {/* TAB 3: TEAMS & ROSTERS */}
        <TabsContent value="TEAMS" className="mt-0 focus-visible:outline-none space-y-4">
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
        </TabsContent>

        {/* TAB 4: CAMPAIGN EVENTS (Full Admin Management) */}
        <TabsContent value="EVENTS" className="mt-0 focus-visible:outline-none space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start w-full">
            {/* Left Campaign Status Filter Sidebar */}
            <aside className="w-full md:w-56 shrink-0 bg-card border border-border rounded-xl p-3 shadow-[0_3px_0_0_#e2e8f0] dark:shadow-[0_3px_0_0_#27282d] space-y-2.5">
              <div className="px-2 py-1 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-sans">
                  Campaign Status
                </span>
                <Badge variant="secondary" className="text-[10px] font-mono font-bold px-1.5 py-0">
                  {events.length}
                </Badge>
              </div>

              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => setCampaignStatusFilter("ALL")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    campaignStatusFilter === "ALL"
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Rocket className="size-3.5" />
                    <span>All Campaigns</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold">
                    {events.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCampaignStatusFilter(
                      campaignStatusFilter === "ACTIVE" ? "ALL" : "ACTIVE"
                    )
                  }
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    campaignStatusFilter === "ACTIVE"
                      ? "bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/40 font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#10b981] animate-pulse" />
                    <span>Active Now</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-[#10b981]">
                    {activeCampCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCampaignStatusFilter(
                      campaignStatusFilter === "UPCOMING" ? "ALL" : "UPCOMING"
                    )
                  }
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    campaignStatusFilter === "UPCOMING"
                      ? "bg-sky-500/15 text-sky-500 border border-sky-500/40 font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5 text-sky-500" />
                    <span>Upcoming</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-sky-500">
                    {upcomingCampCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCampaignStatusFilter(
                      campaignStatusFilter === "SUBMISSION_OPEN"
                        ? "ALL"
                        : "SUBMISSION_OPEN"
                    )
                  }
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    campaignStatusFilter === "SUBMISSION_OPEN"
                      ? "bg-amber-500/15 text-amber-500 border border-amber-500/40 font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-3.5 text-amber-500" />
                    <span>Submissions</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-amber-500">
                    {subOpenCampCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCampaignStatusFilter(
                      campaignStatusFilter === "COMPLETED" ? "ALL" : "COMPLETED"
                    )
                  }
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    campaignStatusFilter === "COMPLETED"
                      ? "bg-slate-700/20 text-slate-400 border border-slate-600/40 font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-slate-500" />
                    <span>Completed</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-slate-400">
                    {completedCampCount}
                  </span>
                </button>
              </nav>

              {/* Create New Campaign Shortcut */}
              <div className="pt-2.5 border-t border-border">
                <Link href="/admin/campaigns/new" className="block w-full">
                  <Button
                    size="sm"
                    className="w-full text-xs font-bold gap-1.5 cursor-pointer bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
                  >
                    <PlusCircle className="size-3.5" />
                    <span>New Campaign</span>
                  </Button>
                </Link>
              </div>
            </aside>

            {/* Main Campaign Management Table Card - Fixed Height Container with Pinned Header & Pinned Pagination */}
            <Card className="p-0 overflow-hidden flex flex-col h-[560px] border border-border flex-1 min-w-0 w-full">
              {/* Header & Controls Toolbar */}
              <div className="p-3.5 border-b border-border space-y-3 shrink-0 bg-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-foreground">Campaign Events Management</h2>
                      <Badge variant="outline" className="text-[10px] font-mono font-medium">
                        {filteredCampaigns.length} total
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Configure campaign codes, status states, milestone schedules, and squads.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={fetchAdminData}
                      className="h-7 px-2.5 text-xs gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
                      <span>Refresh</span>
                    </Button>

                    <Link href="/admin/campaigns/new">
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 px-3 text-xs font-bold gap-1.5 cursor-pointer bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
                      >
                        <PlusCircle className="size-3.5" />
                        <span>New Campaign</span>
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search campaign title, code, or description..."
                      value={campaignSearch}
                      onChange={(e) => setCampaignSearch(e.target.value)}
                      className="pl-8 text-xs h-7.5 bg-background font-sans"
                    />
                    {campaignSearch && (
                      <button
                        type="button"
                        onClick={() => setCampaignSearch("")}
                        className="absolute right-2.5 top-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Status Filter Selector */}
                  <Select value={campaignStatusFilter} onValueChange={setCampaignStatusFilter}>
                    <SelectTrigger className="h-7.5 text-xs font-sans bg-background w-full sm:w-[170px]">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses ({events.length})</SelectItem>
                      <SelectItem value="ACTIVE">Active ({activeCampCount})</SelectItem>
                      <SelectItem value="UPCOMING">Upcoming ({upcomingCampCount})</SelectItem>
                      <SelectItem value="SUBMISSION_OPEN">Submissions Open ({subOpenCampCount})</SelectItem>
                      <SelectItem value="COMPLETED">Completed ({completedCampCount})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Scrollable Table Area */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 relative">
                {loading ? (
                  <div className="py-16 text-center text-xs text-muted-foreground animate-pulse">
                    Loading campaigns list...
                  </div>
                ) : filteredCampaigns.length === 0 ? (
                  <div className="py-16 text-center text-xs text-muted-foreground space-y-2">
                    <Rocket className="size-8 mx-auto text-muted-foreground/30 mb-1" />
                    <div className="font-semibold text-sm text-foreground">No matching campaigns found</div>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      No campaigns match your active search and status filter criteria. Try clearing filters.
                    </p>
                    {(campaignSearch || campaignStatusFilter !== "ALL") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCampaignSearch("");
                          setCampaignStatusFilter("ALL");
                        }}
                        className="h-7 text-xs mt-2"
                      >
                        Reset Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <Table className="w-full table-fixed">
                    <TableHeader className="sticky top-0 z-20 bg-card">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[33%] border-b border-border shadow-xs">Campaign</TableHead>
                        <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[17%] border-b border-border shadow-xs">Status</TableHead>
                        <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[12%] border-b border-border shadow-xs">Squads</TableHead>
                        <TableHead className="sticky top-0 z-20 bg-card text-xs font-bold py-2.5 px-3 w-[32%] border-b border-border shadow-xs">Milestone Schedules</TableHead>
                        <TableHead className="sticky top-0 z-20 bg-card text-right text-xs font-bold py-2.5 px-3 w-[6%] border-b border-border shadow-xs"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCampaigns.map((ev) => (
                        <TableRow key={ev.id} className="hover:bg-muted/30 border-b border-border/60">
                          {/* Campaign Code & Title */}
                          <TableCell className="py-2.5 px-3 w-[33%] min-w-0 overflow-hidden">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-[10px] font-mono font-bold text-foreground px-1.5 py-0.5 rounded bg-muted border border-border shrink-0">
                                  {ev.code}
                                </span>
                                <Link
                                  href={`/campaigns/${ev.id}`}
                                  className="font-bold text-xs text-foreground hover:text-primary transition-colors truncate block"
                                  title={ev.title}
                                >
                                  {ev.title}
                                </Link>
                              </div>
                              <div className="text-[11px] text-muted-foreground truncate leading-tight">
                                {ev.description || "International Asteroid Search Collaboration campaign."}
                              </div>
                            </div>
                          </TableCell>

                          {/* Quick Status Switcher Dropdown in Table Cell */}
                          <TableCell className="py-2.5 px-3 w-[17%] whitespace-nowrap overflow-hidden">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="cursor-pointer focus:outline-hidden inline-flex items-center"
                                  title="Click to change status"
                                >
                                  {ev.status === "ACTIVE" ? (
                                    <Badge className="bg-[#10b981] hover:bg-[#059669] text-white border-0 font-sans font-bold text-[10px] px-2 py-0.5 shadow-[0_2px_0_0_#059669] rounded-md gap-1">
                                      <span className="size-1.5 rounded-full bg-white animate-pulse" />
                                      <span>Active</span>
                                    </Badge>
                                  ) : ev.status === "UPCOMING" ? (
                                    <Badge className="bg-sky-500 hover:bg-sky-600 text-white border-0 font-sans font-bold text-[10px] px-2 py-0.5 shadow-[0_2px_0_0_#0284c7] rounded-md">
                                      Upcoming
                                    </Badge>
                                  ) : ev.status === "SUBMISSION_OPEN" ? (
                                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 font-sans font-bold text-[10px] px-2 py-0.5 shadow-[0_2px_0_0_#d97706] rounded-md">
                                      Submissions Open
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-slate-700 hover:bg-slate-800 text-white border-0 font-sans font-bold text-[10px] px-2 py-0.5 shadow-[0_2px_0_0_#334155] rounded-md">
                                      {ev.status}
                                    </Badge>
                                  )}
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="text-xs font-sans bg-card border-border">
                                <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-wider">
                                  Change Status
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleQuickCampaignStatus(ev.id, "ACTIVE")}
                                  className="cursor-pointer text-xs"
                                >
                                  Set Active
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleQuickCampaignStatus(ev.id, "UPCOMING")}
                                  className="cursor-pointer text-xs"
                                >
                                  Set Upcoming
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleQuickCampaignStatus(ev.id, "SUBMISSION_OPEN")}
                                  className="cursor-pointer text-xs"
                                >
                                  Set Submissions Open
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleQuickCampaignStatus(ev.id, "COMPLETED")}
                                  className="cursor-pointer text-xs"
                                >
                                  Set Completed
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>

                          {/* Squads Count */}
                          <TableCell className="py-2.5 px-3 w-[12%] whitespace-nowrap overflow-hidden">
                            <span className="font-mono font-bold text-xs text-foreground">
                              {ev._count?.teams || 0}
                            </span>
                          </TableCell>

                          {/* Milestone Schedules */}
                          <TableCell className="py-2.5 px-3 w-[32%] min-w-0 overflow-hidden text-xs">
                            <div className="space-y-0.5 text-[11px] font-mono leading-tight">
                              <div className="truncate text-muted-foreground">
                                <span className="text-foreground font-sans font-semibold text-[10px] uppercase mr-1">Reg:</span>
                                <span>{formatAdminDate(ev.regStart)} &ndash; {formatAdminDate(ev.regEnd)}</span>
                              </div>
                              <div className="truncate text-muted-foreground">
                                <span className="text-foreground font-sans font-semibold text-[10px] uppercase mr-1">Search:</span>
                                <span>{formatAdminDate(ev.startDate)} &ndash; {formatAdminDate(ev.endDate)}</span>
                              </div>
                            </div>
                          </TableCell>

                          {/* 3-Dot Actions Menu */}
                          <TableCell className="py-2.5 px-3 w-[6%] text-right whitespace-nowrap overflow-hidden">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                                  title="Campaign actions"
                                >
                                  <MoreHorizontal className="size-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-md">
                                <DropdownMenuLabel className="text-[10px] uppercase font-mono text-muted-foreground tracking-wider">
                                  Campaign Actions
                                </DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/campaigns/${ev.id}`}
                                    className="flex items-center gap-2 text-xs cursor-pointer"
                                  >
                                    <ExternalLink className="size-3.5 text-muted-foreground" />
                                    <span>View Public Page</span>
                                  </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => handleOpenEditCampaign(ev)}
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
                                  onClick={() => setDeletingCampaign(ev)}
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
              <div className="p-2.5 border-t border-border bg-card shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
                {/* Items & Rows Info */}
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <span>
                    Showing{" "}
                    <strong className="text-foreground font-mono">
                      {filteredCampaigns.length === 0 ? 0 : (campaignCurrentPage - 1) * campaignPageSize + 1}
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
                      <option value={100}>100</option>
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
                    className="h-6.5 px-1.5 text-xs"
                    title="First Page"
                  >
                    <ChevronsLeft className="size-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCampaignCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={campaignCurrentPage === 1}
                    className="h-6.5 px-2 text-xs"
                    title="Previous Page"
                  >
                    <ChevronLeft className="size-3.5" />
                  </Button>

                  {/* Numbered Page Buttons */}
                  <div className="flex items-center gap-1 mx-1">
                    {getCampaignPageNumbers().map((pNum, idx) => {
                      if (pNum === "...") {
                        return (
                          <span key={`camp-ellipsis-${idx}`} className="px-1 text-muted-foreground text-xs font-mono">
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
                    onClick={() => setCampaignCurrentPage((p) => Math.min(totalCampaignPages, p + 1))}
                    disabled={campaignCurrentPage === totalCampaignPages || filteredCampaigns.length === 0}
                    className="h-6.5 px-2 text-xs"
                    title="Next Page"
                  >
                    <ChevronRight className="size-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCampaignCurrentPage(totalCampaignPages)}
                    disabled={campaignCurrentPage === totalCampaignPages || filteredCampaigns.length === 0}
                    className="h-6.5 px-1.5 text-xs"
                    title="Last Page"
                  >
                    <ChevronsRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

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

      {/* EDIT CAMPAIGN MODAL */}
      <Dialog
        open={!!editingCampaign}
        onOpenChange={(open) => !open && setEditingCampaign(null)}
      >
        <DialogContent className="sm:max-w-2xl bg-card border-border font-sans max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Edit2 className="size-4 text-primary" />
              <span>Edit Campaign &bull; {editingCampaign?.code}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify campaign metadata, public descriptions, and timeline milestone dates.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCampaign} className="space-y-4 pt-1">
            {/* Nav Tabs for Edit Modal */}
            <div className="flex border-b border-border text-xs">
              <button
                type="button"
                onClick={() => setEditCampTab("overview")}
                className={`pb-2 px-3 font-bold border-b-2 transition-colors cursor-pointer ${
                  editCampTab === "overview"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Overview &amp; Identity
              </button>
              <button
                type="button"
                onClick={() => setEditCampTab("schedule")}
                className={`pb-2 px-3 font-bold border-b-2 transition-colors cursor-pointer ${
                  editCampTab === "schedule"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Timeline &amp; Milestone Schedules
              </button>
            </div>

            {editCampTab === "overview" ? (
              <div className="space-y-3.5">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Campaign Title</label>
                  <Input
                    required
                    value={editCampTitle}
                    onChange={(e) => setEditCampTitle(e.target.value)}
                    placeholder="e.g. IASC Pan-STARRS Campaign 2026-A"
                    className="h-9 text-xs bg-background"
                  />
                </div>

                {/* Code & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Campaign Code</label>
                    <Input
                      required
                      value={editCampCode}
                      onChange={(e) => setEditCampCode(e.target.value.toUpperCase())}
                      placeholder="e.g. IASC-2026-A"
                      className="h-9 text-xs font-mono font-bold bg-background"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Status</label>
                    <Select value={editCampStatus} onValueChange={setEditCampStatus}>
                      <SelectTrigger className="h-9 text-xs bg-background">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active (Ongoing)</SelectItem>
                        <SelectItem value="UPCOMING">Upcoming</SelectItem>
                        <SelectItem value="SUBMISSION_OPEN">Submissions Open</SelectItem>
                        <SelectItem value="COMPLETED">Completed / Concluded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Description</label>
                  <textarea
                    value={editCampDesc}
                    onChange={(e) => setEditCampDesc(e.target.value)}
                    rows={3}
                    placeholder="Campaign details, telescope source, and research objective..."
                    className="w-full p-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden leading-relaxed font-sans"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* 1. Registration Window */}
                <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-primary" />
                    <span>Stage 1: Student Registration Window</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Registration Opens</label>
                      <Input
                        type="datetime-local"
                        value={editCampRegStart}
                        onChange={(e) => setEditCampRegStart(e.target.value)}
                        className="h-8 text-xs bg-background font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Registration Closes</label>
                      <Input
                        type="datetime-local"
                        value={editCampRegEnd}
                        onChange={(e) => setEditCampRegEnd(e.target.value)}
                        className="h-8 text-xs bg-background font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Team Formation Window */}
                <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Users className="size-3.5 text-primary" />
                    <span>Stage 2: Team Formation Window</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Team Setup Opens</label>
                      <Input
                        type="datetime-local"
                        value={editCampTeamStart}
                        onChange={(e) => setEditCampTeamStart(e.target.value)}
                        className="h-8 text-xs bg-background font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Team Setup Closes</label>
                      <Input
                        type="datetime-local"
                        value={editCampTeamEnd}
                        onChange={(e) => setEditCampTeamEnd(e.target.value)}
                        className="h-8 text-xs bg-background font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Image Search Window */}
                <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Telescope className="size-3.5 text-[#8b5cf6]" />
                    <span>Stage 3: Telescope Image Search Window</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Campaign Starts</label>
                      <Input
                        type="datetime-local"
                        required
                        value={editCampStart}
                        onChange={(e) => setEditCampStart(e.target.value)}
                        className="h-8 text-xs bg-background font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Campaign Ends</label>
                      <Input
                        type="datetime-local"
                        required
                        value={editCampEnd}
                        onChange={(e) => setEditCampEnd(e.target.value)}
                        className="h-8 text-xs bg-background font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Submission Window */}
                <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <FileCode className="size-3.5 text-emerald-500" />
                    <span>Stage 4: Report Submission Window</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Submissions Open</label>
                      <Input
                        type="datetime-local"
                        value={editCampSubStart}
                        onChange={(e) => setEditCampSubStart(e.target.value)}
                        className="h-8 text-xs bg-background font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Submissions Deadline</label>
                      <Input
                        type="datetime-local"
                        value={editCampSubEnd}
                        onChange={(e) => setEditCampSubEnd(e.target.value)}
                        className="h-8 text-xs bg-background font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingCampaign(null)}
                disabled={editCampLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={editCampLoading}
                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold"
              >
                {editCampLoading ? "Saving Changes..." : "Save Campaign"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CAMPAIGN CONFIRMATION DIALOG */}
      <Dialog
        open={!!deletingCampaign}
        onOpenChange={(open) => !open && setDeletingCampaign(null)}
      >
        <DialogContent className="sm:max-w-md bg-card border-border font-sans">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="size-4" />
              <span>Delete Campaign Event</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground space-y-2">
              <span>
                Are you sure you want to permanently delete{" "}
                <strong className="text-foreground">{deletingCampaign?.title}</strong> (
                <span className="font-mono font-bold text-foreground">
                  {deletingCampaign?.code}
                </span>
                )?
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="size-3.5 shrink-0" />
              <span>Permanent Deletion Warning</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              This will permanently delete this campaign event along with all associated teams, squad memberships, and image set observation logs.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeletingCampaign(null)}
              disabled={deleteCampLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteCampaign}
              disabled={deleteCampLoading}
              className="font-bold"
            >
              {deleteCampLoading ? "Deleting..." : "Delete Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
