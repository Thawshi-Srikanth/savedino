"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

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

  // New Event Modal
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newRegStart, setNewRegStart] = useState("");
  const [newRegEnd, setNewRegEnd] = useState("");
  const [newTeamStart, setNewTeamStart] = useState("");
  const [newTeamEnd, setNewTeamEnd] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newSubStart, setNewSubStart] = useState("");
  const [newSubEnd, setNewSubEnd] = useState("");
  const [eventError, setEventError] = useState<string | null>(null);

  // Matchmaking Modal State
  const [assigningUser, setAssigningUser] = useState<UserData | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const res = await fetch("/api/admin/matchmaking");
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
        setTeams(data.teams || []);
        setUsers(data.users || []);
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

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEventError(null);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          code: newCode.trim(),
          description: newDesc.trim(),
          regStart: newRegStart,
          regEnd: newRegEnd,
          teamFormationStart: newTeamStart,
          teamFormationEnd: newTeamEnd,
          startDate: newStart,
          endDate: newEnd,
          submissionStart: newSubStart,
          submissionEnd: newSubEnd,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setEventError(data.error || "Failed to create event.");
      } else {
        setShowEventModal(false);
        setNewTitle("");
        setNewCode("");
        setNewDesc("");
        fetchAdminData();
      }
    } catch (err: any) {
      setEventError(err.message || "An error occurred.");
    }
  };

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
        setAssignSuccess("Assigned successfully!");
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

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="MATCHMAKING">
            👥 Solo Matchmaking ({users.filter((u) => u.teamMembers.length === 0).length} Unassigned)
          </TabsTrigger>
          <TabsTrigger value="TEAMS">
            🚀 Teams Roster ({teams.length})
          </TabsTrigger>
          <TabsTrigger value="EVENTS">
            🪐 Campaigns ({events.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: MATCHMAKING */}
        <TabsContent value="MATCHMAKING">
          <Card>
            <CardHeader>
              <CardTitle>Solo Students / Free Agent Pool</CardTitle>
              <CardDescription>
                Assign registered students who do not have a squad yet into teams with available slots (&lt; 6 members).
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Country / Institution</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => {
                    const isSolo = u.teamMembers.length === 0;
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-semibold">{u.name}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell>
                          {u.country || "Global"} {u.institution ? `(${u.institution})` : ""}
                        </TableCell>
                        <TableCell>
                          {isSolo ? (
                            <Badge variant="secondary">Looking for Team</Badge>
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
                          >
                            + Assign to Team
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: TEAMS ROSTER */}
        <TabsContent value="TEAMS">
          <Card>
            <CardHeader>
              <CardTitle>All Registered Campaign Teams</CardTitle>
              <CardDescription>Inspect member rosters and campaign activity.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {teams.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 border border-border rounded-md bg-card flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-primary">{t.event.code}</span>
                        <Badge variant={t.members.length < 2 ? "secondary" : "default"}>
                          {t.members.length < 2 ? "NEEDS 2" : `${t.members.length}/6 READY`}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-sm mb-1">{t.name}</h3>
                      <div className="text-xs text-muted-foreground mb-3">Invite Code: {t.inviteCode}</div>

                      <div className="text-xs text-muted-foreground mb-4 space-y-1">
                        <div>Roster: {t.members.map((m) => m.user.name).join(", ")}</div>
                      </div>
                    </div>

                    <Link href={`/team/${t.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Open Team Workspace &gt;
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: EVENTS */}
        <TabsContent value="EVENTS">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Campaign Events Management</CardTitle>
                <CardDescription>Create and publish multi-phase asteroid search events.</CardDescription>
              </div>
              <Button variant="default" size="sm" onClick={() => setShowEventModal(true)}>
                + Create New Event
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 border border-border rounded-md bg-card flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-primary uppercase">
                      {ev.code}
                    </div>
                    <div className="font-bold text-sm mt-0.5">{ev.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(ev.startDate).toLocaleDateString()} to {new Date(ev.endDate).toLocaleDateString()}
                    </div>
                  </div>

                  <Badge variant={ev.status === "ACTIVE" ? "default" : "outline"}>{ev.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Matchmaking Modal */}
      <Dialog open={!!assigningUser} onOpenChange={(open) => !open && setAssigningUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Match Student to Team</DialogTitle>
            <DialogDescription>
              Assigning: <strong>{assigningUser?.name}</strong> ({assigningUser?.email})
            </DialogDescription>
          </DialogHeader>

          {assignError && (
            <div className="p-2 border border-destructive/50 bg-destructive/10 text-destructive text-xs mb-3">
              ! {assignError}
            </div>
          )}
          {assignSuccess && (
            <div className="p-2 border border-emerald-500 bg-emerald-500/10 text-emerald-600 text-xs mb-3">
              ✓ {assignSuccess}
            </div>
          )}

          <form onSubmit={handleAssignStudent} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">
                Select Target Team (&lt; 6 members):
              </label>
              <select
                required
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full p-2 text-xs bg-card border border-border rounded-md"
              >
                <option value="">-- Choose Target Team --</option>
                {teams
                  .filter((t) => t.members.length < 6)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.members.length}/6 members) — {t.event.code}
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

      {/* Create Event Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Campaign Event</DialogTitle>
            <DialogDescription>Configure 4 distinct campaign date phases.</DialogDescription>
          </DialogHeader>

          {eventError && (
            <div className="p-2 border border-destructive/50 bg-destructive/10 text-destructive text-xs mb-3">
              ! {eventError}
            </div>
          )}

          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1">Campaign Title</label>
              <Input
                type="text"
                required
                placeholder="e.g. Pan-STARRS Fall Search 2026"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Campaign Code</label>
              <Input
                type="text"
                required
                placeholder="e.g. IASC-2026-FALL"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              />
            </div>

            <div className="space-y-3 p-3 border border-border rounded-md bg-accent/20">
              <span className="block text-xs font-semibold text-primary uppercase">
                1. User Registration Phase
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  required
                  value={newRegStart}
                  onChange={(e) => setNewRegStart(e.target.value)}
                />
                <Input
                  type="date"
                  required
                  value={newRegEnd}
                  onChange={(e) => setNewRegEnd(e.target.value)}
                />
              </div>

              <span className="block text-xs font-semibold text-primary uppercase pt-1">
                2. Team Formation Phase
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  required
                  value={newTeamStart}
                  onChange={(e) => setNewTeamStart(e.target.value)}
                />
                <Input
                  type="date"
                  required
                  value={newTeamEnd}
                  onChange={(e) => setNewTeamEnd(e.target.value)}
                />
              </div>

              <span className="block text-xs font-semibold text-primary uppercase pt-1">
                3. Campaign Observation Phase
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  required
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                />
                <Input
                  type="date"
                  required
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                />
              </div>

              <span className="block text-xs font-semibold text-primary uppercase pt-1">
                4. Report Submission Phase
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  required
                  value={newSubStart}
                  onChange={(e) => setNewSubStart(e.target.value)}
                />
                <Input
                  type="date"
                  required
                  value={newSubEnd}
                  onChange={(e) => setNewSubEnd(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Description</label>
              <Textarea
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Campaign details and instructions..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowEventModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="default">
                Publish Campaign &gt;
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
