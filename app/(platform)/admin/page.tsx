"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { ShieldAlert, Users, Telescope, PlusCircle, Rocket } from "lucide-react";

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
      };
    };
  }>;
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<string>("MATCHMAKING");
  const [events, setEvents] = useState<EventData[]>([]);
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Matchmaking Modal State
  const [assigningUser, setAssigningUser] = useState<UserData | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

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

    setAssignError(null);
    setAssignSuccess(null);

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
        setAssignError(data.error || "Failed to assign student.");
      } else {
        setAssignSuccess("Assigned successfully.");
        fetchAdminData();
        setTimeout(() => {
          setAssigningUser(null);
          setSelectedTeamId("");
          setAssignSuccess(null);
        }, 1200);
      }
    } catch (err: any) {
      setAssignError(err.message || "An error occurred.");
    }
  };

  const unassignedStudents = users.filter((u) => u.teamMembers.length === 0);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-6 items-start font-sans">
      {/* Admin Sidebar Navigation Panel (Clean PostHog 3D Style) */}
      <aside className="w-full md:w-64 flex-shrink-0 bg-card border border-border rounded-xl p-4 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 px-2 py-1">
            <ShieldAlert className="size-4 text-[#8b5cf6]" />
            <span className="font-bold text-xs uppercase tracking-wider text-foreground">
              ADMIN CONSOLE
            </span>
          </div>
          <p className="text-xs text-muted-foreground px-2 mt-0.5">
            IASC Operations & Roster Management
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
              <span>Unassigned</span>
            </div>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-semibold">
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
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-semibold">
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
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-semibold">
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
              className="w-full text-xs font-bold py-2.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="size-3.5" />
              <span>New Campaign</span>
            </Button>
          </Link>

          {/* Quick System Stats */}
          <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-1.5 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Total Students:</span>
              <span className="font-bold text-foreground">{users.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Events:</span>
              <span className="font-bold text-emerald-500">
                {events.filter((e) => e.status === "ACTIVE").length}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace Area */}
      <main className="flex-1 w-full space-y-6">
        {/* TAB 1: UNASSIGNED STUDENTS */}
        {activeTab === "MATCHMAKING" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">Unassigned Students</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Assign registered students without a team into teams with open slots.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-semibold">
                  {unassignedStudents.length} Solo Students
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-bold">Student Name</TableHead>
                    <TableHead className="text-xs font-bold">Email</TableHead>
                    <TableHead className="text-xs font-bold">Country / Institution</TableHead>
                    <TableHead className="text-xs font-bold">Status</TableHead>
                    <TableHead className="text-right text-xs font-bold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => {
                    const isSolo = u.teamMembers.length === 0;
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-semibold text-xs">{u.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{u.email}</TableCell>
                        <TableCell className="text-xs">
                          {u.country || "Global"} {u.institution ? `(${u.institution})` : ""}
                        </TableCell>
                        <TableCell>
                          {isSolo ? (
                            <Badge variant="secondary">Unassigned</Badge>
                          ) : (
                            <Badge variant="default">In {u.teamMembers[0]?.team.name}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAssigningUser(u);
                              setSelectedTeamId("");
                              setAssignError(null);
                              setAssignSuccess(null);
                            }}
                            className="text-xs font-semibold cursor-pointer"
                          >
                            Assign to Team
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* TAB 2: TEAMS */}
        {activeTab === "TEAMS" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-foreground">Campaign Teams & Members</CardTitle>
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
                    <div
                      key={t.id}
                      className="p-4 rounded-lg border border-border bg-card space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-primary font-bold">{t.name}</span>
                        <Badge variant="outline">{t.members.length}/6 Members</Badge>
                      </div>

                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>
                          Invite Code: <span className="font-bold text-foreground font-mono">{t.inviteCode}</span>
                        </div>
                        <div>
                          Campaign: <span className="font-bold text-foreground">{t.event?.code || "AST"}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border">
                        <span className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                          Roster ({t.members.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {t.members.map((m) => (
                            <Badge key={m.id} variant="secondary" className="text-xs">
                              {m.user.name} {m.role === "leader" ? "👑" : ""}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
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
                <Button size="sm" variant="default" className="text-xs font-bold flex items-center gap-1.5 cursor-pointer">
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

                  <div className="pt-2 border-t border-border text-xs text-muted-foreground space-y-1">
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Assign Student to Team
            </DialogTitle>
            <DialogDescription className="text-xs">
              Assigning {assigningUser?.name} ({assigningUser?.email}) into an open team slot.
            </DialogDescription>
          </DialogHeader>

          {assignError && <div className="text-xs text-destructive">{assignError}</div>}
          {assignSuccess && <div className="text-xs text-emerald-500">{assignSuccess}</div>}

          <form onSubmit={handleAssignStudent} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Select Open Team</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-border bg-card text-xs text-foreground focus:outline-hidden"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                required
              >
                <option value="">-- Choose a Team --</option>
                {teams
                  .filter((t) => t.members.length < 6)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.event?.code || "AST"}) - {t.members.length}/6 Members
                    </option>
                  ))}
              </select>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setAssigningUser(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="default" disabled={!selectedTeamId}>
                Confirm Assignment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
