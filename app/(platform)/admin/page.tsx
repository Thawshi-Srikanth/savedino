"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { ShieldAlert, Users, Telescope, PlusCircle, Rocket, UserPlus, RefreshCw, CheckCircle2 } from "lucide-react";
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
  institution?: string;
  country?: string;
  role: string;
  createdAt: string;
  teamMembers: Array<{
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

  const [activeTab, setActiveTab] = useState<"MATCHMAKING" | "TEAMS" | "EVENTS">("MATCHMAKING");
  const [filterMode, setFilterMode] = useState<"UNASSIGNED" | "ALL">("UNASSIGNED");
  const [events, setEvents] = useState<EventData[]>([]);
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Matchmaking Modal State
  const [assigningUser, setAssigningUser] = useState<UserData | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [assignLoading, setAssignLoading] = useState<boolean>(false);

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
      toast.error("Failed to load admin operations data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

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

  const unassignedStudents = users.filter((u) => u.teamMembers.length === 0);
  const displayedUsers = filterMode === "UNASSIGNED" ? unassignedStudents : users;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-6 items-start font-sans">
      {/* Admin Sidebar Navigation Panel */}
      <aside className="w-full md:w-64 flex-shrink-0 bg-card border border-border rounded-xl p-4 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#27282d] space-y-6">
        <div>
          <div className="flex items-center gap-2 px-2 py-1">
            <ShieldAlert className="size-4 text-[#8b5cf6]" />
            <span className="font-bold text-xs uppercase tracking-wider text-foreground">
              ADMIN CONSOLE
            </span>
          </div>
          <p className="text-xs text-muted-foreground px-2 mt-0.5">
            IASC Operations &amp; Roster Management
          </p>
        </div>

        {/* Sidebar Nav Buttons */}
        <nav className="space-y-2">
          <Button
            type="button"
            variant={activeTab === "MATCHMAKING" ? "default" : "outline"}
            onClick={() => setActiveTab("MATCHMAKING")}
            className="w-full justify-between h-10 px-3 text-xs font-bold cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Users className="size-4" />
              <span>Unassigned Solo</span>
            </div>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-semibold">
              {unassignedStudents.length}
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
              <span>Teams</span>
            </div>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-semibold">
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
              <span>Campaigns</span>
            </div>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-semibold">
              {events.length}
            </Badge>
          </Button>
        </nav>

        {/* Dedicated Page Action Link Button */}
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
              <span>Total Researchers:</span>
              <span className="font-bold text-foreground font-mono">{users.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Unassigned:</span>
              <span className="font-bold text-[#10b981] font-mono">{unassignedStudents.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Events:</span>
              <span className="font-bold text-foreground font-mono">
                {events.filter((e) => e.status === "ACTIVE").length}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace Area */}
      <main className="flex-1 w-full space-y-6">
        {/* TAB 1: UNASSIGNED RESEARCHERS / MATCHMAKING */}
        {activeTab === "MATCHMAKING" && (
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">
                    Solo Researchers &amp; Matchmaking
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Assign solo students and researchers without a squad into active teams with open slots.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-1.5 bg-muted p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setFilterMode("UNASSIGNED")}
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors font-semibold ${
                      filterMode === "UNASSIGNED"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Unassigned ({unassignedStudents.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode("ALL")}
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors font-semibold ${
                      filterMode === "ALL"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All Users ({users.length})
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {displayedUsers.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground space-y-1">
                  <Users className="size-8 mx-auto text-muted-foreground/40 mb-2" />
                  <div className="font-semibold text-foreground">No unassigned researchers found</div>
                  <p>All registered students are currently assigned to teams.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-bold">Researcher Name</TableHead>
                      <TableHead className="text-xs font-bold">Email</TableHead>
                      <TableHead className="text-xs font-bold">Institution / Country</TableHead>
                      <TableHead className="text-xs font-bold">Status</TableHead>
                      <TableHead className="text-right text-xs font-bold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedUsers.map((u) => {
                      const isSolo = u.teamMembers.length === 0;
                      return (
                        <TableRow key={u.id} className="hover:bg-muted/30">
                          <TableCell className="font-semibold text-xs text-foreground">
                            {u.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs font-mono">
                            {u.email}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {u.institution || "Independent"} {u.country ? `(${u.country})` : ""}
                          </TableCell>
                          <TableCell>
                            {isSolo ? (
                              <span className="text-[10px] font-semibold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-full">
                                Unassigned
                              </span>
                            ) : (
                              <Badge variant="secondary" className="text-[10px]">
                                {u.teamMembers[0]?.team.name}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setAssigningUser(u);
                                setSelectedTeamId("");
                              }}
                              className="text-xs font-semibold gap-1 cursor-pointer bg-card hover:bg-accent"
                            >
                              <UserPlus className="size-3.5 text-primary" />
                              <span>Assign to Team</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 2: TEAMS */}
        {activeTab === "TEAMS" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-foreground">Campaign Teams &amp; Rosters</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Overview of all registered teams and their current member capacity.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {teams.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No teams registered yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teams.map((t) => (
                    <Card
                      key={t.id}
                      className="p-4 bg-card border-border space-y-3"
                    >
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
                            <span key={m.id} className="text-xs px-2 py-0.5 rounded bg-muted text-foreground font-sans">
                              {m.user.name} {m.role === "LEADER" || m.role === "leader" ? "👑" : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 3: CAMPAIGN EVENTS */}
        {activeTab === "EVENTS" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Campaign Events ({events.length})
                </h2>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </main>

      {/* Matchmaking Assign Modal */}
      <Dialog open={!!assigningUser} onOpenChange={() => setAssigningUser(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Assign Student to Team
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Assigning <strong className="text-foreground">{assigningUser?.name}</strong> ({assigningUser?.email}) into an open squad slot.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAssignStudent} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 text-foreground">Select Open Team</label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden font-sans"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                required
              >
                <option value="">-- Choose a Team --</option>
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
    </div>
  );
}
