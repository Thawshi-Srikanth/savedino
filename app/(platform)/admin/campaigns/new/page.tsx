"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DateTimeRangePicker } from "@/components/date-time-range-picker";
import { DateTimeInput } from "@/components/date-time-input";
import { ArrowLeft, ArrowRight, Calendar, FileText, Telescope, CheckCircle, ShieldAlert, Rocket } from "lucide-react";

export default function CreateCampaignPage() {
  const router = useRouter();

  // Active Wizard Tab
  const [wizardTab, setWizardTab] = useState<string>("overview");

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newMaxTeamSize, setNewMaxTeamSize] = useState<number>(6);
  const [newRegStart, setNewRegStart] = useState("");
  const [newRegEnd, setNewRegEnd] = useState("");
  const [newTeamStart, setNewTeamStart] = useState("");
  const [newTeamEnd, setNewTeamEnd] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newSubStart, setNewSubStart] = useState("");
  const [newSubEnd, setNewSubEnd] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEventError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          code: newCode.toUpperCase(),
          description: newDesc,
          maxTeamSize: newMaxTeamSize,
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
        setEventError(data.error || "Failed to create campaign event.");
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      setEventError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 font-sans py-4">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link href="/admin">
          <Button variant="outline" size="sm" className="text-xs font-semibold cursor-pointer flex items-center gap-2">
            <ArrowLeft className="size-4" />
            <span>Back to Admin Console</span>
          </Button>
        </Link>

        <Badge variant="default" className="text-xs font-mono font-bold uppercase tracking-wider">
          CAMPAIGN BUILDER
        </Badge>
      </div>

      {/* Page Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
          <Rocket className="size-6 text-[#8b5cf6]" />
          <span>Create Campaign Event</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure search campaign parameters, student registration windows, and Minor Planet Center (MPC) candidate submission schedules.
        </p>
      </div>

      {eventError && (
        <div className="p-4 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive text-xs font-mono">
          {eventError}
        </div>
      )}

      {/* Main Campaign Builder Card */}
      <Card className="border border-border shadow-xl rounded-2xl p-6">
        <Tabs value={wizardTab} onValueChange={setWizardTab} className="w-full space-y-6">
          {/* Shadcn UI Tabs List Header */}
          <TabsList className="w-full grid grid-cols-4 font-mono text-xs h-11 p-1 bg-muted/60">
            <TabsTrigger value="overview" className="flex items-center gap-2 cursor-pointer font-bold">
              <FileText className="size-4 text-[#8b5cf6]" />
              <span className="hidden sm:inline">1. Overview</span>
            </TabsTrigger>
            <TabsTrigger value="registration" className="flex items-center gap-2 cursor-pointer font-bold">
              <Calendar className="size-4 text-[#8b5cf6]" />
              <span className="hidden sm:inline">2. Registration</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2 cursor-pointer font-bold">
              <Telescope className="size-4 text-[#8b5cf6]" />
              <span className="hidden sm:inline">3. Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="review" className="flex items-center gap-2 cursor-pointer font-bold">
              <CheckCircle className="size-4 text-emerald-500" />
              <span className="hidden sm:inline">4. Review</span>
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleCreateEvent} className="space-y-6 pt-2">
            {/* TAB 1: OVERVIEW */}
            <TabsContent value="overview" className="space-y-5 text-xs mt-0">
              <div className="p-3.5 rounded-lg border border-border bg-muted/30 text-muted-foreground text-xs font-mono">
                Define the primary campaign identity, official campaign code, and participant guidelines.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-foreground">
                    Campaign Title *
                  </label>
                  <Input
                    required
                    placeholder="e.g. All-India Asteroid Search Campaign"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="h-10 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-foreground">
                    Campaign Code *
                  </label>
                  <Input
                    required
                    placeholder="AST-2026-A"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    className="h-10 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-foreground">
                    Max Members Per Squad *
                  </label>
                  <Input
                    type="number"
                    min={2}
                    max={30}
                    required
                    value={newMaxTeamSize}
                    onChange={(e) => setNewMaxTeamSize(Math.max(2, Math.min(30, parseInt(e.target.value) || 6)))}
                    className="h-10 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-foreground">
                  Campaign Description
                </label>
                <Textarea
                  rows={5}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe campaign objectives, student eligibility, telescope image sources (Pan-STARRS / Catalina), and Minor Planet Center protocols..."
                  className="text-xs font-mono"
                />
              </div>
            </TabsContent>

            {/* TAB 2: REGISTRATION & TEAM FORMATION WINDOWS */}
            <TabsContent value="registration" className="space-y-6 text-xs mt-0">
              <div className="p-3.5 rounded-lg border border-border bg-muted/30 text-muted-foreground text-xs font-mono">
                Configure student registration and team formation schedules using separate start and end DateTimeInput fields.
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-foreground mb-3">
                    Student Registration Window
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Registration Start *</label>
                      <DateTimeInput
                        value={newRegStart}
                        onChange={setNewRegStart}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Registration End *</label>
                      <DateTimeInput
                        value={newRegEnd}
                        onChange={setNewRegEnd}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-foreground mb-3">
                    Team Formation Window
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Team Formation Start *</label>
                      <DateTimeInput
                        value={newTeamStart}
                        onChange={setNewTeamStart}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Team Formation End *</label>
                      <DateTimeInput
                        value={newTeamEnd}
                        onChange={setNewTeamEnd}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: EXECUTION & MPC SUBMISSION SCHEDULE */}
            <TabsContent value="schedule" className="space-y-6 text-xs mt-0">
              <div className="p-3.5 rounded-lg border border-border bg-muted/30 text-muted-foreground text-xs font-mono">
                Set campaign observation dates and Minor Planet Center (MPC) candidate submission windows.
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-foreground mb-3">
                    Campaign Observation Schedule
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Campaign Start Date *</label>
                      <DateTimeInput
                        value={newStart}
                        onChange={setNewStart}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Campaign End Date *</label>
                      <DateTimeInput
                        value={newEnd}
                        onChange={setNewEnd}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-foreground mb-3">
                    MPC Candidate Submission Window
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Submission Window Start *</label>
                      <DateTimeInput
                        value={newSubStart}
                        onChange={setNewSubStart}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Submission Window End *</label>
                      <DateTimeInput
                        value={newSubEnd}
                        onChange={setNewSubEnd}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: REVIEW & PUBLISH */}
            <TabsContent value="review" className="space-y-5 text-xs mt-0">
              <div className="p-5 rounded-xl border border-[#8b5cf6]/30 bg-[#8b5cf6]/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary font-bold font-mono">{newCode || "CODE-MISSING"}</span>
                  <Badge variant="default">READY TO PUBLISH</Badge>
                </div>
                <h4 className="font-bold text-lg text-foreground">{newTitle || "Untitled Campaign"}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{newDesc || "No description provided."}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-border font-mono text-xs">
                  <div className="p-3 bg-card rounded-lg border border-border space-y-1">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Student Registration</span>
                    <span className="font-bold text-foreground">
                      {newRegStart ? new Date(newRegStart).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"} → {newRegEnd ? new Date(newRegEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}
                    </span>
                  </div>

                  <div className="p-3 bg-card rounded-lg border border-border space-y-1">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Observation Campaign</span>
                    <span className="font-bold text-foreground">
                      {newStart ? new Date(newStart).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"} → {newEnd ? new Date(newEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}
                    </span>
                  </div>

                  <div className="p-3 bg-card rounded-lg border border-border space-y-1">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Max Squad Size</span>
                    <span className="font-bold text-foreground">
                      {newMaxTeamSize} Members / Squad
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Form Footer Action Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              {wizardTab !== "overview" ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (wizardTab === "registration") setWizardTab("overview");
                    if (wizardTab === "schedule") setWizardTab("registration");
                    if (wizardTab === "review") setWizardTab("schedule");
                  }}
                  className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="size-4" />
                  <span>Previous Tab</span>
                </Button>
              ) : (
                <Link href="/admin">
                  <Button type="button" variant="ghost" className="text-xs text-muted-foreground cursor-pointer">
                    Cancel
                  </Button>
                </Link>
              )}

              {wizardTab !== "review" ? (
                <Button
                  type="button"
                  variant="default"
                  onClick={() => {
                    if (wizardTab === "overview") {
                      if (!newTitle || !newCode) {
                        setEventError("Please fill in Campaign Title and Campaign Code.");
                        return;
                      }
                      setEventError(null);
                      setWizardTab("registration");
                    } else if (wizardTab === "registration") {
                      setWizardTab("schedule");
                    } else if (wizardTab === "schedule") {
                      setWizardTab("review");
                    }
                  }}
                  className="text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Next Tab</span>
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button type="submit" variant="default" disabled={submitting} className="text-xs uppercase font-bold cursor-pointer">
                  {submitting ? "Publishing Event..." : "Publish Campaign Event"}
                </Button>
              )}
            </div>
          </form>
        </Tabs>
      </Card>
    </div>
  );
}
