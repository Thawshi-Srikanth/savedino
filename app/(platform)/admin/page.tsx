"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Users, Telescope, Rocket, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { EventData, TeamData, UserData, toLocalInput } from "./components/types";
import { UsersTab } from "./components/users-tab";
import { MatchmakingTab } from "./components/matchmaking-tab";
import { TeamsTab } from "./components/teams-tab";
import { CampaignsTab } from "./components/campaigns-tab";
import { EditUserModal } from "./components/edit-user-modal";
import { DeleteUserDialog } from "./components/delete-user-dialog";
import { AssignUserModal } from "./components/assign-user-modal";
import { EditCampaignModal } from "./components/edit-campaign-modal";
import { DeleteCampaignDialog } from "./components/delete-campaign-dialog";
import { EditTeamModal } from "./components/edit-team-modal";
import { DeleteTeamDialog } from "./components/delete-team-dialog";
import { ReportTeamModal } from "./components/report-team-modal";

type AdminTab = "USERS" | "MATCHMAKING" | "TEAMS" | "EVENTS";

function parseTabQuery(tabQuery: string | null): AdminTab {
  if (!tabQuery) return "USERS";
  const upper = tabQuery.toUpperCase();
  if (upper === "USERS" || upper === "MATCHMAKING" || upper === "TEAMS" || upper === "EVENTS") {
    return upper as AdminTab;
  }
  if (upper === "CAMPAIGNS") return "EVENTS";
  if (upper === "SQUADS") return "TEAMS";
  return "USERS";
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Navigation Tabs synchronized with URL query (?tab=users, etc.)
  const [activeTab, setActiveTab] = useState<AdminTab>(() => parseTabQuery(searchParams.get("tab")));

  // Synchronize state when URL query changes (e.g. Back/Forward button)
  useEffect(() => {
    const tabFromUrl = parseTabQuery(searchParams.get("tab"));
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Tab switch handler that updates the URL query string
  const handleTabChange = (newTab: AdminTab) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab.toLowerCase());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

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

  // Solo Matchmaking Filter
  const [soloSearch, setSoloSearch] = useState<string>("");

  // Teams & Squads State
  const [teamSearch, setTeamSearch] = useState<string>("");
  const [teamCapacityFilter, setTeamCapacityFilter] = useState<string>("ALL");
  const [teamCampaignFilter, setTeamCampaignFilter] = useState<string>("ALL");
  const [teamCurrentPage, setTeamCurrentPage] = useState<number>(1);
  const [teamPageSize, setTeamPageSize] = useState<number>(10);

  // Matchmaking Assign Modal State
  const [assigningUser, setAssigningUser] = useState<UserData | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [assignLoading, setAssignLoading] = useState<boolean>(false);

  // Edit Squad Modal State
  const [editingTeam, setEditingTeam] = useState<TeamData | null>(null);
  const [editTeamName, setEditTeamName] = useState<string>("");
  const [editTeamInviteCode, setEditTeamInviteCode] = useState<string>("");
  const [editTeamStatus, setEditTeamStatus] = useState<string>("ACTIVE");
  const [editTeamIsRecruiting, setEditTeamIsRecruiting] = useState<boolean>(true);
  const [editTeamRecruitmentNotes, setEditTeamRecruitmentNotes] = useState<string>("");
  const [editTeamDisqualificationReason, setEditTeamDisqualificationReason] = useState<string>("");
  const [editTeamLeaderId, setEditTeamLeaderId] = useState<string>("");
  const [editTeamLoading, setEditTeamLoading] = useState<boolean>(false);

  // Delete Squad Dialog State
  const [deletingTeam, setDeletingTeam] = useState<TeamData | null>(null);
  const [deleteTeamLoading, setDeleteTeamLoading] = useState<boolean>(false);

  // Report Squad Modal State
  const [reportingTeam, setReportingTeam] = useState<TeamData | null>(null);
  const [reportTeamLoading, setReportTeamLoading] = useState<boolean>(false);

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

  // Data Fetcher
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [evRes, tmRes, usRes] = await Promise.all([
        fetch("/api/events", { cache: "no-store", headers: { "Cache-Control": "no-cache" } }),
        fetch("/api/teams?includeDisqualified=true", { cache: "no-store", headers: { "Cache-Control": "no-cache" } }),
        fetch("/api/admin/users", { cache: "no-store", headers: { "Cache-Control": "no-cache" } }),
      ]);

      if (evRes.ok) {
        const evData = await evRes.json();
        setEvents(Array.isArray(evData) ? evData : evData.events || []);
      }
      if (tmRes.ok) {
        const tmData = await tmRes.json();
        setTeams(Array.isArray(tmData) ? tmData : tmData.teams || []);
      }
      if (usRes.ok) {
        const usData = await usRes.json();
        setUsers(usData.users || []);
      }
    } catch (err) {
      console.error("Admin data fetch error:", err);
      toast.error("Failed to load operations data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

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
  const citizenCount = useMemo(() => users.filter((u) => u.role === "user" || !u.role).length, [users]);
  const unassignedCount = useMemo(() => users.filter((u) => u.teamMembers.length === 0).length, [users]);

  // Derived Campaign Stats
  const activeCampCount = useMemo(() => events.filter((e) => e.status === "ACTIVE").length, [events]);
  const upcomingCampCount = useMemo(() => events.filter((e) => e.status === "UPCOMING").length, [events]);
  const subOpenCampCount = useMemo(() => events.filter((e) => e.status === "SUBMISSION_OPEN").length, [events]);
  const completedCampCount = useMemo(() => events.filter((e) => e.status === "COMPLETED").length, [events]);

  // Solo Matchmaking Filtered List
  const unassignedSoloUsers = useMemo(() => {
    return users
      .filter((u) => u.teamMembers.length === 0)
      .filter((u) => {
        if (!soloSearch.trim()) return true;
        const q = soloSearch.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.institution && u.institution.toLowerCase().includes(q)) ||
          (u.country && u.country.toLowerCase().includes(q))
        );
      });
  }, [users, soloSearch]);

  // Derived Squad Stats
  const openSquadsCount = useMemo(() => teams.filter((t) => t.members.length < 6).length, [teams]);
  const fullSquadsCount = useMemo(() => teams.filter((t) => t.members.length >= 6).length, [teams]);
  const totalSquadMembers = useMemo(() => teams.reduce((acc, t) => acc + t.members.length, 0), [teams]);
  const totalOpenSlots = useMemo(() => teams.reduce((acc, t) => acc + Math.max(0, 6 - t.members.length), 0), [teams]);

  // Squads Filtered List
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const q = teamSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.inviteCode.toLowerCase().includes(q) ||
        (t.event?.code && t.event.code.toLowerCase().includes(q)) ||
        (t.event?.title && t.event.title.toLowerCase().includes(q)) ||
        t.members.some(
          (m) =>
            m.user?.name?.toLowerCase().includes(q) ||
            m.user?.email?.toLowerCase().includes(q)
        );

      const matchesCapacity =
        teamCapacityFilter === "ALL" ||
        (teamCapacityFilter === "OPEN" && t.members.length < 6) ||
        (teamCapacityFilter === "FULL" && t.members.length >= 6);

      const matchesCampaign =
        teamCampaignFilter === "ALL" ||
        t.eventId === teamCampaignFilter ||
        t.event?.code === teamCampaignFilter;

      return matchesSearch && matchesCapacity && matchesCampaign;
    });
  }, [teams, teamSearch, teamCapacityFilter, teamCampaignFilter]);

  // Paginated Sliced Squads
  const totalTeamPages = Math.max(1, Math.ceil(filteredTeams.length / teamPageSize));
  const paginatedTeams = useMemo(() => {
    const start = (teamCurrentPage - 1) * teamPageSize;
    return filteredTeams.slice(start, start + teamPageSize);
  }, [filteredTeams, teamCurrentPage, teamPageSize]);

  // Pagination page numbers helper for teams
  const getTeamPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalTeamPages <= 7) {
      for (let i = 1; i <= totalTeamPages; i++) pages.push(i);
    } else {
      if (teamCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalTeamPages);
      } else if (teamCurrentPage >= totalTeamPages - 3) {
        pages.push(1, "...", totalTeamPages - 4, totalTeamPages - 3, totalTeamPages - 2, totalTeamPages - 1, totalTeamPages);
      } else {
        pages.push(1, "...", teamCurrentPage - 1, teamCurrentPage, teamCurrentPage + 1, "...", totalTeamPages);
      }
    }
    return pages;
  };

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

  // Pagination page numbers helper
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const getCampaignPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalCampaignPages <= 7) {
      for (let i = 1; i <= totalCampaignPages; i++) pages.push(i);
    } else {
      if (campaignCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalCampaignPages);
      } else if (campaignCurrentPage >= totalCampaignPages - 3) {
        pages.push(1, "...", totalCampaignPages - 4, totalCampaignPages - 3, totalCampaignPages - 2, totalCampaignPages - 1, totalCampaignPages);
      } else {
        pages.push(1, "...", campaignCurrentPage - 1, campaignCurrentPage, campaignCurrentPage + 1, "...", totalCampaignPages);
      }
    }
    return pages;
  };

  // Quick Role Change Action
  const handleQuickRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast.success(`Role updated to ${newRole.toUpperCase()}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update role.");
    }
  };

  // Edit User Modal Handlers
  const handleOpenEditUser = (user: UserData) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditRole(user.role || "user");
    setEditInstitution(user.institution || "");
    setEditCountry(user.country || "");
    setEditVerified(user.emailVerified || false);
  };

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
          institution: editInstitution || null,
          country: editCountry || null,
          emailVerified: editVerified,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save user profile");
      }
      const updatedUser = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...updatedUser.user } : u))
      );
      toast.success("User profile updated successfully.");
      setEditingUser(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update user.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete account");
      }
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      toast.success(`Account for ${deletingUser.name} deleted.`);
      setDeletingUser(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Matchmaking Assign Action
  const handleAssignStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningUser || !selectedTeamId) return;
    setAssignLoading(true);
    try {
      const res = await fetch("/api/admin/matchmaking/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: assigningUser.id,
          teamId: selectedTeamId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to assign student to team.");
      } else {
        toast.success(`Assigned ${assigningUser.name} to team!`);
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

  // Quick Squad Status Action (Toggle Active / Disqualified / Forming)
  const handleQuickTeamStatus = async (teamId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update squad status");
      }
      const data = await res.json();
      setTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, ...data.team } : t))
      );
      toast.success(`Squad status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update squad status.");
    }
  };

  // Quick Squad Rotate Invite Code Action
  const handleRotateInviteCode = async (teamId: string) => {
    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rotateInviteCode: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to rotate invite code");
      }
      const data = await res.json();
      setTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, ...data.team } : t))
      );
      toast.success(`Generated new invite code: ${data.team.inviteCode}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to rotate invite code.");
    }
  };

  // Squad Edit Handlers
  const handleOpenEditTeam = (team: TeamData) => {
    setEditingTeam(team);
    setEditTeamName(team.name);
    setEditTeamInviteCode(team.inviteCode);
    setEditTeamStatus(team.status || "ACTIVE");
    setEditTeamIsRecruiting(team.isRecruiting ?? true);
    setEditTeamRecruitmentNotes(team.recruitmentNotes || "");
    setEditTeamDisqualificationReason(team.disqualificationReason || "");
    const leaderMember = team.members.find((m) => m.role === "LEADER" || m.role === "leader");
    setEditTeamLeaderId(team.leaderId || (leaderMember ? leaderMember.user.id : ""));
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    setEditTeamLoading(true);
    try {
      const res = await fetch(`/api/teams/${editingTeam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editTeamName,
          inviteCode: editTeamInviteCode,
          status: editTeamStatus,
          isRecruiting: editTeamIsRecruiting,
          recruitmentNotes: editTeamRecruitmentNotes,
          disqualificationReason: editTeamStatus === "DISQUALIFIED" ? editTeamDisqualificationReason : null,
          leaderId: editTeamLeaderId,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save squad");
      }
      const data = await res.json();
      setTeams((prev) =>
        prev.map((t) => (t.id === editingTeam.id ? { ...t, ...data.team } : t))
      );
      toast.success("Squad details updated successfully.");
      setEditingTeam(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update squad.");
    } finally {
      setEditTeamLoading(false);
    }
  };

  // Squad Moderation / Report Handlers
  const handleConfirmReportTeam = async (teamId: string, action: "DISQUALIFY" | "WARN", reason: string) => {
    setReportTeamLoading(true);
    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action === "DISQUALIFY" ? "DISQUALIFIED" : undefined,
          disqualificationReason: action === "DISQUALIFY" ? reason : undefined,
          recruitmentNotes: action === "WARN" ? `[ADMIN WARNING ${new Date().toLocaleDateString()}]: ${reason}` : undefined,
          isRecruiting: action === "DISQUALIFY" ? false : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to process squad report");
      }
      const data = await res.json();
      setTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, ...data.team } : t))
      );
      toast.success(action === "DISQUALIFY" ? "Squad has been disqualified and disabled." : "Report logged.");
      setReportingTeam(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to report squad.");
    } finally {
      setReportTeamLoading(false);
    }
  };

  // Squad Delete Handlers
  const handleConfirmDeleteTeam = async () => {
    if (!deletingTeam) return;
    setDeleteTeamLoading(true);
    try {
      const res = await fetch(`/api/teams/${deletingTeam.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete squad");
      }
      setTeams((prev) => prev.filter((t) => t.id !== deletingTeam.id));
      toast.success(`Squad '${deletingTeam.name}' deleted.`);
      setDeletingTeam(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete squad.");
    } finally {
      setDeleteTeamLoading(false);
    }
  };

  // Quick Campaign Status Action
  const handleQuickCampaignStatus = async (eventId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update campaign status");
      }
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e))
      );
      toast.success(`Campaign status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status.");
    }
  };

  // Campaign Edit Modal Handlers
  const handleOpenEditCampaign = (ev: EventData) => {
    setEditingCampaign(ev);
    setEditCampTitle(ev.title);
    setEditCampCode(ev.code);
    setEditCampDesc(ev.description || "");
    setEditCampStatus(ev.status);
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

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;
    setEditCampLoading(true);
    try {
      const payload: any = {
        title: editCampTitle,
        code: editCampCode.trim().toUpperCase(),
        description: editCampDesc || null,
        status: editCampStatus,
        startDate: new Date(editCampStart).toISOString(),
        endDate: new Date(editCampEnd).toISOString(),
        regStart: editCampRegStart ? new Date(editCampRegStart).toISOString() : null,
        regEnd: editCampRegEnd ? new Date(editCampRegEnd).toISOString() : null,
        teamFormationStart: editCampTeamStart ? new Date(editCampTeamStart).toISOString() : null,
        teamFormationEnd: editCampTeamEnd ? new Date(editCampTeamEnd).toISOString() : null,
        submissionStart: editCampSubStart ? new Date(editCampSubStart).toISOString() : null,
        submissionEnd: editCampSubEnd ? new Date(editCampSubEnd).toISOString() : null,
      };

      const res = await fetch(`/api/events/${editingCampaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update campaign");
      }

      const updated = await res.json();
      setEvents((prev) =>
        prev.map((e) => (e.id === editingCampaign.id ? { ...e, ...updated.event } : e))
      );
      toast.success(`Campaign '${payload.code}' updated successfully.`);
      setEditingCampaign(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to save campaign.");
    } finally {
      setEditCampLoading(false);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!deletingCampaign) return;
    setDeleteCampLoading(true);
    try {
      const res = await fetch(`/api/events/${deletingCampaign.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete campaign");
      }
      setEvents((prev) => prev.filter((e) => e.id !== deletingCampaign.id));
      toast.success(`Campaign '${deletingCampaign.code}' deleted.`);
      setDeletingCampaign(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete campaign.");
    } finally {
      setDeleteCampLoading(false);
    }
  };

  return (
    <TooltipProvider delayDuration={50}>
      <div className="w-full space-y-4 font-sans">
        {/* TABS NAVIGATION & WORKSPACE */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => handleTabChange(val as AdminTab)}
          className="w-full space-y-4"
        >
          {/* STICKY TABS HEADER (sticks directly below the h-16 navbar) */}
          <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-2 border-b border-border">
            <div className="overflow-x-auto scrollbar-none flex items-center">
              <TabsList className="h-10 bg-transparent p-0 flex min-w-full sm:min-w-0 sm:w-auto gap-1 border-0 rounded-none">
                <TabsTrigger
                  value="USERS"
                  className="h-10 px-4 text-xs font-semibold gap-2 cursor-pointer rounded-t-lg rounded-b-none border-b-2 border-transparent transition-all data-[state=active]:border-b-[#8b5cf6] data-[state=active]:text-foreground data-[state=active]:bg-card data-[state=active]:font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 shadow-none"
                >
                  <span>Users &amp; Roles</span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 font-semibold font-mono transition-colors ${
                      activeTab === "USERS"
                        ? "bg-[#8b5cf6] text-white"
                        : "text-muted-foreground bg-muted"
                    }`}
                  >
                    {users.length}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger
                  value="MATCHMAKING"
                  className="h-10 px-4 text-xs font-semibold gap-2 cursor-pointer rounded-t-lg rounded-b-none border-b-2 border-transparent transition-all data-[state=active]:border-b-[#8b5cf6] data-[state=active]:text-foreground data-[state=active]:bg-card data-[state=active]:font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 shadow-none"
                >
                  <span>Solo Matchmaking</span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 font-semibold font-mono transition-colors ${
                      activeTab === "MATCHMAKING"
                        ? "bg-[#8b5cf6] text-white"
                        : "text-muted-foreground bg-muted"
                    }`}
                  >
                    {unassignedCount}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger
                  value="TEAMS"
                  className="h-10 px-4 text-xs font-semibold gap-2 cursor-pointer rounded-t-lg rounded-b-none border-b-2 border-transparent transition-all data-[state=active]:border-b-[#8b5cf6] data-[state=active]:text-foreground data-[state=active]:bg-card data-[state=active]:font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 shadow-none"
                >
                  <span>Squads &amp; Rosters</span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 font-semibold font-mono transition-colors ${
                      activeTab === "TEAMS"
                        ? "bg-[#8b5cf6] text-white"
                        : "text-muted-foreground bg-muted"
                    }`}
                  >
                    {teams.length}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger
                  value="EVENTS"
                  className="h-10 px-4 text-xs font-semibold gap-2 cursor-pointer rounded-t-lg rounded-b-none border-b-2 border-transparent transition-all data-[state=active]:border-b-[#8b5cf6] data-[state=active]:text-foreground data-[state=active]:bg-card data-[state=active]:font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 shadow-none"
                >
                  <span>Campaign Events</span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 font-semibold font-mono transition-colors ${
                      activeTab === "EVENTS"
                        ? "bg-[#8b5cf6] text-white"
                        : "text-muted-foreground bg-muted"
                    }`}
                  >
                    {events.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* TAB 1: USER & ROLE MANAGEMENT */}
          <TabsContent value="USERS" className="mt-0 focus-visible:outline-none space-y-4">
            <UsersTab
              users={users}
              filteredUsers={filteredUsers}
              paginatedUsers={paginatedUsers}
              userSearch={userSearch}
              setUserSearch={setUserSearch}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              teamStatusFilter={teamStatusFilter}
              setTeamStatusFilter={setTeamStatusFilter}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
              totalPages={totalPages}
              getPageNumbers={getPageNumbers}
              adminCount={adminCount}
              staffCount={staffCount}
              citizenCount={citizenCount}
              unassignedCount={unassignedCount}
              loading={loading}
              fetchAdminData={fetchAdminData}
              onQuickRoleChange={handleQuickRoleChange}
              onEditUser={handleOpenEditUser}
              onDeleteUser={setDeletingUser}
            />
          </TabsContent>

          {/* TAB 2: SOLO MATCHMAKING */}
          <TabsContent value="MATCHMAKING" className="mt-0 focus-visible:outline-none space-y-4">
            <MatchmakingTab
              users={users}
              unassignedSoloUsers={unassignedSoloUsers}
              soloSearch={soloSearch}
              setSoloSearch={setSoloSearch}
              loading={loading}
              fetchAdminData={fetchAdminData}
              onAssignClick={(u) => {
                setAssigningUser(u);
                setSelectedTeamId("");
              }}
            />
          </TabsContent>

          {/* TAB 3: TEAMS & ROSTERS */}
          <TabsContent value="TEAMS" className="mt-0 focus-visible:outline-none space-y-4">
            <TeamsTab
              teams={teams}
              events={events}
              filteredTeams={filteredTeams}
              paginatedTeams={paginatedTeams}
              teamSearch={teamSearch}
              setTeamSearch={setTeamSearch}
              teamCapacityFilter={teamCapacityFilter}
              setTeamCapacityFilter={setTeamCapacityFilter}
              teamCampaignFilter={teamCampaignFilter}
              setTeamCampaignFilter={setTeamCampaignFilter}
              teamCurrentPage={teamCurrentPage}
              setTeamCurrentPage={setTeamCurrentPage}
              teamPageSize={teamPageSize}
              setTeamPageSize={setTeamPageSize}
              totalTeamPages={totalTeamPages}
              getTeamPageNumbers={getTeamPageNumbers}
              openSquadsCount={openSquadsCount}
              fullSquadsCount={fullSquadsCount}
              totalSquadMembers={totalSquadMembers}
              totalOpenSlots={totalOpenSlots}
              loading={loading}
              fetchAdminData={fetchAdminData}
              onQuickStatusChange={handleQuickTeamStatus}
              onRotateInviteCode={handleRotateInviteCode}
              onEditTeam={handleOpenEditTeam}
              onReportTeam={setReportingTeam}
              onDeleteTeam={setDeletingTeam}
            />
          </TabsContent>

          {/* TAB 4: CAMPAIGN EVENTS */}
          <TabsContent value="EVENTS" className="mt-0 focus-visible:outline-none space-y-4">
            <CampaignsTab
              events={events}
              filteredCampaigns={filteredCampaigns}
              paginatedCampaigns={paginatedCampaigns}
              campaignSearch={campaignSearch}
              setCampaignSearch={setCampaignSearch}
              campaignStatusFilter={campaignStatusFilter}
              setCampaignStatusFilter={setCampaignStatusFilter}
              campaignCurrentPage={campaignCurrentPage}
              setCampaignCurrentPage={setCampaignCurrentPage}
              campaignPageSize={campaignPageSize}
              setCampaignPageSize={setCampaignPageSize}
              totalCampaignPages={totalCampaignPages}
              getCampaignPageNumbers={getCampaignPageNumbers}
              activeCampCount={activeCampCount}
              upcomingCampCount={upcomingCampCount}
              subOpenCampCount={subOpenCampCount}
              completedCampCount={completedCampCount}
              loading={loading}
              fetchAdminData={fetchAdminData}
              onQuickStatusChange={handleQuickCampaignStatus}
              onEditCampaign={handleOpenEditCampaign}
              onDeleteCampaign={setDeletingCampaign}
            />
          </TabsContent>
        </Tabs>

        {/* MODALS & DIALOGS */}
        <EditUserModal
          editingUser={editingUser}
          setEditingUser={setEditingUser}
          editName={editName}
          setEditName={setEditName}
          editRole={editRole}
          setEditRole={setEditRole}
          editInstitution={editInstitution}
          setEditInstitution={setEditInstitution}
          editCountry={editCountry}
          setEditCountry={setEditCountry}
          editVerified={editVerified}
          setEditVerified={setEditVerified}
          editLoading={editLoading}
          onSave={handleSaveUser}
        />

        <DeleteUserDialog
          deletingUser={deletingUser}
          setDeletingUser={setDeletingUser}
          deleteLoading={deleteLoading}
          onConfirmDelete={handleConfirmDeleteUser}
        />

        <AssignUserModal
          assigningUser={assigningUser}
          setAssigningUser={setAssigningUser}
          teams={teams}
          selectedTeamId={selectedTeamId}
          setSelectedTeamId={setSelectedTeamId}
          assignLoading={assignLoading}
          onAssign={handleAssignStudent}
        />

        <EditCampaignModal
          editingCampaign={editingCampaign}
          setEditingCampaign={setEditingCampaign}
          editCampTab={editCampTab}
          setEditCampTab={setEditCampTab}
          editCampTitle={editCampTitle}
          setEditCampTitle={setEditCampTitle}
          editCampCode={editCampCode}
          setEditCampCode={setEditCampCode}
          editCampStatus={editCampStatus}
          setEditCampStatus={setEditCampStatus}
          editCampDesc={editCampDesc}
          setEditCampDesc={setEditCampDesc}
          editCampRegStart={editCampRegStart}
          setEditCampRegStart={setEditCampRegStart}
          editCampRegEnd={editCampRegEnd}
          setEditCampRegEnd={setEditCampRegEnd}
          editCampTeamStart={editCampTeamStart}
          setEditCampTeamStart={setEditCampTeamStart}
          editCampTeamEnd={editCampTeamEnd}
          setEditCampTeamEnd={setEditCampTeamEnd}
          editCampStart={editCampStart}
          setEditCampStart={setEditCampStart}
          editCampEnd={editCampEnd}
          setEditCampEnd={setEditCampEnd}
          editCampSubStart={editCampSubStart}
          setEditCampSubStart={setEditCampSubStart}
          editCampSubEnd={editCampSubEnd}
          setEditCampSubEnd={setEditCampSubEnd}
          editCampLoading={editCampLoading}
          onSave={handleSaveCampaign}
        />

        <DeleteCampaignDialog
          deletingCampaign={deletingCampaign}
          setDeletingCampaign={setDeletingCampaign}
          deleteCampLoading={deleteCampLoading}
          onConfirmDelete={handleDeleteCampaign}
        />

        {/* SQUAD MODALS & DIALOGS */}
        <EditTeamModal
          editingTeam={editingTeam}
          setEditingTeam={setEditingTeam}
          editName={editTeamName}
          setEditName={setEditTeamName}
          editInviteCode={editTeamInviteCode}
          setEditInviteCode={setEditTeamInviteCode}
          editStatus={editTeamStatus}
          setEditStatus={setEditTeamStatus}
          editIsRecruiting={editTeamIsRecruiting}
          setEditIsRecruiting={setEditTeamIsRecruiting}
          editRecruitmentNotes={editTeamRecruitmentNotes}
          setEditRecruitmentNotes={setEditTeamRecruitmentNotes}
          editDisqualificationReason={editTeamDisqualificationReason}
          setEditDisqualificationReason={setEditTeamDisqualificationReason}
          editLeaderId={editTeamLeaderId}
          setEditLeaderId={setEditTeamLeaderId}
          editLoading={editTeamLoading}
          onSave={handleSaveTeam}
        />

        <DeleteTeamDialog
          deletingTeam={deletingTeam}
          setDeletingTeam={setDeletingTeam}
          deleteLoading={deleteTeamLoading}
          onConfirmDelete={handleConfirmDeleteTeam}
        />

        <ReportTeamModal
          reportingTeam={reportingTeam}
          setReportingTeam={setReportingTeam}
          reportLoading={reportTeamLoading}
          onConfirmReport={handleConfirmReportTeam}
        />
      </div>
    </TooltipProvider>
  );
}
