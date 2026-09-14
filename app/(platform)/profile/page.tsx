"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, invalidateSessionCache, authClient } from "@/lib/auth-client";
import { PixelAvatar } from "@/components/pixel-avatar";
import { getRandomSeed, generateSeedProfile } from "@/lib/seed-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DinoLoading } from "@/components/dino-loading";
import { useMinimumLoading } from "@/hooks/use-minimum-loading";
import { validatePhoneNumber, getCountryName } from "@/lib/phone-validation";
import { PhoneInput } from "@/components/ui/phone-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Sparkles,
  Dices,
  Telescope,
  Users,
  Calendar,
  Building2,
  Globe,
  Phone,
  Mail,
  ShieldCheck,
  Check,
  ArrowRight,
  ExternalLink,
  Copy,
  FolderSearch,
  Send,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  institution?: string | null;
  country?: string | null;
  whatsapp?: string | null;
  createdAt: string;
  discordConnected?: boolean;
  connectedProviders?: string[];
}

interface CampaignHistoryItem {
  event: {
    id: string;
    title: string;
    code: string;
    status: string;
    startDate: string;
    endDate: string;
    regStart: string;
    regEnd: string;
  };
  team: {
    id: string;
    name: string;
    inviteCode?: string | null;
    status: string;
    role: string;
    memberCount: number;
    imageSetsCount: number;
    joinedAt: string;
  };
}

interface TeamHistoryItem {
  id: string;
  name: string;
  inviteCode?: string | null;
  status: string;
  role: string;
  memberCount: number;
  imageSetsCount: number;
  joinedAt: string;
  event: {
    id: string;
    title: string;
    code: string;
    status: string;
  };
}

interface ClaimedSetItem {
  id: string;
  name: string;
  status: string;
  isClean: boolean;
  submittedAt?: string | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
    code: string;
  };
}

interface JoinRequestItem {
  id: string;
  status: string;
  message?: string | null;
  createdAt: string;
  team: {
    id: string;
    name: string;
    inviteCode: string;
    event: {
      id: string;
      title: string;
      code: string;
    };
  };
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const { data: session, isPending: isSessionLoading } = useSession();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isDisplayLoading = useMinimumLoading(isSessionLoading || isLoading, 1000);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Profile data from server
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignHistoryItem[]>([]);
  const [teams, setTeams] = useState<TeamHistoryItem[]>([]);
  const [claimedSets, setClaimedSets] = useState<ClaimedSetItem[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequestItem[]>([]);
  const [stats, setStats] = useState({
    campaignsCount: 0,
    teamsCount: 0,
    squadsLeadCount: 0,
    claimedSetsCount: 0,
    submittedSetsCount: 0,
  });

  // Edit Form state (Client-side only until user clicks Save)
  const [formName, setFormName] = useState<string>("");
  const [formWhatsapp, setFormWhatsapp] = useState<string>("");
  const [formInstitution, setFormInstitution] = useState<string>("");
  const [formCountry, setFormCountry] = useState<string>("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");

  const [activeTab, setActiveTab] = useState<string>(
    tabParam && ["edit", "history", "teams", "activity"].includes(tabParam) ? tabParam : "edit"
  );
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (tabParam && ["edit", "history", "teams", "activity"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Fetch profile details
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/user/profile", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        setCampaigns(data.campaigns || []);
        setTeams(data.teams || []);
        setClaimedSets(data.claimedSets || []);
        setJoinRequests(data.joinRequests || []);
        setStats(
          data.stats || {
            campaignsCount: 0,
            teamsCount: 0,
            squadsLeadCount: 0,
            claimedSetsCount: 0,
            submittedSetsCount: 0,
          }
        );

        // Initialize local form fields
        setFormName(data.user.name || "");
        setFormWhatsapp(data.user.whatsapp || "");
        setFormInstitution(data.user.institution || "");
        setFormCountry(data.user.country || "");
        setSelectedAvatar(data.user.image || data.user.id || "Astro-Dino-101");
      } else {
        toast.error(data.error || "Failed to load profile.");
      }
    } catch (err) {
      toast.error("Failed to load profile details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isSessionLoading) {
      if (!session?.user) {
        router.push("/login?callbackUrl=/profile");
      } else {
        fetchProfile();

        // If returned from Discord OAuth linking, automatically sync server roles & channels
        if (searchParams.get("discord_connected") === "true") {
          fetch("/api/user/sync-discord", { method: "POST" })
            .then((res) => res.json())
            .then((res) => {
              if (res.success) {
                toast.success("Discord account connected! Roles and channels synced.");
              }
              // Clean up query param
              router.replace("/profile", { scroll: false });
            })
            .catch(() => {
              toast.success("Discord account connected!");
              router.replace("/profile", { scroll: false });
            });
        }
      }
    }
  }, [session, isSessionLoading, searchParams]);

  // Handle Save Profile (Only sends request when user explicitly clicks Save Profile)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Please provide your name.");
      return;
    }

    let formattedWhatsapp: string | null = null;
    if (formWhatsapp.trim()) {
      const phoneValidation = validatePhoneNumber(formWhatsapp, formCountry || "Sri Lanka");
      if (!phoneValidation.isValid) {
        toast.error(phoneValidation.error || "Please enter a valid phone number.");
        return;
      }
      formattedWhatsapp = phoneValidation.formatted || formWhatsapp.trim();
    }

    try {
      setIsSaving(true);
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          whatsapp: formattedWhatsapp,
          institution: formInstitution.trim() || null,
          country: formCountry.trim() || null,
          image: selectedAvatar.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Profile changes saved successfully!");
        if (formattedWhatsapp) setFormWhatsapp(formattedWhatsapp);
        setUser((prev) => (prev ? { ...prev, ...data.user } : data.user));
        invalidateSessionCache();
      } else {
        toast.error(data.error || "Failed to save profile changes.");
      }
    } catch (err) {
      toast.error("An error occurred while saving profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // Roll another avatar (Client-side preview only, NO backend save)
  const handleRollAvatar = () => {
    const nextAvatar = getRandomSeed();
    setSelectedAvatar(nextAvatar);
  };

  // Reset avatar preview back to saved state
  const handleResetAvatar = () => {
    if (user) {
      setSelectedAvatar(user.image || user.id || "Astro-Dino-101");
      toast.info("Avatar reset to saved appearance.");
    }
  };

  // Copy invite code helper
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Invite code copied to clipboard!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Live profile of the selected avatar preview
  const liveAvatarProfile = generateSeedProfile(selectedAvatar || user?.image || user?.id);

  if (isDisplayLoading) {
    return <DinoLoading size="lg" text="Loading citizen profile..." fullScreen />;
  }

  const savedAvatarSeed = user?.image || user?.id || "Astro-Dino-101";
  const hasUnsavedChanges =
    (formName || "").trim() !== (user?.name || "").trim() ||
    (formWhatsapp || "").trim() !== (user?.whatsapp || "").trim() ||
    (formInstitution || "").trim() !== (user?.institution || "").trim() ||
    (formCountry || "").trim() !== (user?.country || "").trim() ||
    selectedAvatar !== savedAvatarSeed;

  const handleDiscardChanges = () => {
    if (user) {
      setFormName(user.name || "");
      setFormWhatsapp(user.whatsapp || "");
      setFormInstitution(user.institution || "");
      setFormCountry(user.country || "");
      setSelectedAvatar(user.image || user.id || "Astro-Dino-101");
      toast.info("Unsaved changes discarded.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. CLEAN PROFILE HEADER CARD */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-arcade flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Avatar & Identity Details */}
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <PixelAvatar
            seed={savedAvatarSeed}
            size={56}
            className="shadow-md shrink-0 ring-2 ring-primary/20"
          />

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-foreground truncate">
                {user?.name || "Citizen Scientist"}
              </h1>

              {user?.role === "admin" ? (
                <Badge className="bg-[#8b5cf6] text-white border-0 text-[10px] font-bold px-1.5 py-0 shadow-arcade-primary">
                  <ShieldCheck className="size-3 mr-0.5" />
                  Admin
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0"
                >
                  Citizen Scientist
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span>
                Joined{" "}
                {new Date(user?.createdAt || Date.now()).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Stats Pills */}
        <div className="flex items-center gap-2 sm:gap-2.5 self-start sm:self-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-border/60">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/80 text-xs">
            <span className="font-mono font-bold text-foreground">{stats.campaignsCount}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-medium">
              Campaigns
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/80 text-xs">
            <span className="font-mono font-bold text-foreground">{stats.teamsCount}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-medium">Squads</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/80 text-xs">
            <span className="font-mono font-bold text-[#38bdf8]">{stats.claimedSetsCount}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-medium">
              Analyzed
            </span>
          </div>
        </div>
      </div>

      {/* 2. TABBED CONTENT: EDIT PROFILE, CAMPAIGNS, SQUADS, ACTIVITY */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="border-b border-border">
          <div className="overflow-x-auto scrollbar-none flex items-center">
            <TabsList className="h-10 bg-transparent p-0 flex min-w-full sm:min-w-0 sm:w-auto gap-1 border-0 rounded-none">
              <TabsTrigger
                value="edit"
                className="h-10 px-2.5 sm:px-4 text-xs font-semibold gap-1.5 sm:gap-2 cursor-pointer rounded-t-lg rounded-b-none border-b-2 border-transparent transition-all data-[state=active]:border-b-[#8b5cf6] data-[state=active]:text-foreground data-[state=active]:bg-card data-[state=active]:font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 shadow-none shrink-0"
              >
                <User className="size-3.5 shrink-0" />
                <span className={activeTab === "edit" ? "inline" : "hidden sm:inline"}>
                  Edit Profile
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="history"
                className="h-10 px-2.5 sm:px-4 text-xs font-semibold gap-1.5 sm:gap-2 cursor-pointer rounded-t-lg rounded-b-none border-b-2 border-transparent transition-all data-[state=active]:border-b-[#8b5cf6] data-[state=active]:text-foreground data-[state=active]:bg-card data-[state=active]:font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 shadow-none shrink-0"
              >
                <Telescope className="size-3.5 shrink-0" />
                <span className={activeTab === "history" ? "inline" : "hidden sm:inline"}>
                  Campaigns
                </span>
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-1.5 py-0 font-semibold font-mono transition-colors ${
                    activeTab === "history"
                      ? "bg-[#8b5cf6] text-white"
                      : "text-muted-foreground bg-muted"
                  }`}
                >
                  {stats.campaignsCount}
                </Badge>
              </TabsTrigger>

              <TabsTrigger
                value="teams"
                className="h-10 px-2.5 sm:px-4 text-xs font-semibold gap-1.5 sm:gap-2 cursor-pointer rounded-t-lg rounded-b-none border-b-2 border-transparent transition-all data-[state=active]:border-b-[#8b5cf6] data-[state=active]:text-foreground data-[state=active]:bg-card data-[state=active]:font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 shadow-none shrink-0"
              >
                <Users className="size-3.5 shrink-0" />
                <span className={activeTab === "teams" ? "inline" : "hidden sm:inline"}>
                  Squads
                </span>
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-1.5 py-0 font-semibold font-mono transition-colors ${
                    activeTab === "teams"
                      ? "bg-[#8b5cf6] text-white"
                      : "text-muted-foreground bg-muted"
                  }`}
                >
                  {stats.teamsCount}
                </Badge>
              </TabsTrigger>

              <TabsTrigger
                value="activity"
                className="h-10 px-2.5 sm:px-4 text-xs font-semibold gap-1.5 sm:gap-2 cursor-pointer rounded-t-lg rounded-b-none border-b-2 border-transparent transition-all data-[state=active]:border-b-[#8b5cf6] data-[state=active]:text-foreground data-[state=active]:bg-card data-[state=active]:font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 shadow-none shrink-0"
              >
                <FolderSearch className="size-3.5 shrink-0" />
                <span className={activeTab === "activity" ? "inline" : "hidden sm:inline"}>
                  Activity
                </span>
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-1.5 py-0 font-semibold font-mono transition-colors ${
                    activeTab === "activity"
                      ? "bg-[#8b5cf6] text-white"
                      : "text-muted-foreground bg-muted"
                  }`}
                >
                  {stats.claimedSetsCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: EDIT PROFILE & AVATAR STUDIO */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="edit" className="space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Personal Information Form */}
              <Card className="md:col-span-7 border-border shadow-arcade rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <User className="size-4 text-primary" />
                    <span>Personal Details</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Update your public display name, WhatsApp number, affiliation, and country.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-bold">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Alex Hunter"
                      className="h-9 text-xs rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="h-9 text-xs rounded-xl bg-muted text-muted-foreground cursor-not-allowed"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Managed by your authentication account.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="whatsapp"
                      className="text-xs font-bold flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-3.5 text-primary" />
                        <span>WhatsApp Number</span>
                      </span>
                      <span className="text-[11px] font-normal text-muted-foreground">
                        squad &amp; campaign coordination
                      </span>
                    </Label>
                    <PhoneInput
                      id="whatsapp"
                      value={formWhatsapp}
                      defaultCountry={formCountry || "Sri Lanka"}
                      onChange={(val, meta) => {
                        setFormWhatsapp(val);
                        if (meta?.country && !formCountry) {
                          setFormCountry(getCountryName(meta.country));
                        }
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="institution" className="text-xs font-bold">
                        School / Organization
                      </Label>
                      <Input
                        id="institution"
                        value={formInstitution}
                        onChange={(e) => setFormInstitution(e.target.value)}
                        placeholder="e.g. Astro Club, Stanford"
                        className="h-9 text-xs rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="country" className="text-xs font-bold">
                        Country / Region
                      </Label>
                      <Input
                        id="country"
                        value={formCountry}
                        onChange={(e) => setFormCountry(e.target.value)}
                        placeholder="Sri Lanka"
                        className="h-9 text-xs rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Connected Community Section */}
                  <div className="pt-3 border-t border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <span>Community Access</span>
                        </span>
                        <p className="text-[11px] text-muted-foreground">
                          Connect your Discord account to join campaign chats and squad voice labs.
                        </p>
                      </div>

                      {user?.discordConnected ? (
                        <div className="flex items-center gap-1.5 bg-[#10b981]/10 text-[#10b981] px-2.5 py-1 rounded-lg text-xs font-semibold">
                          <Check className="size-3.5" />
                          <span>Connected</span>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await authClient.linkSocial({
                                provider: "discord",
                                callbackURL: "/profile?discord_connected=true",
                              });
                            } catch (err: any) {
                              toast.error(err.message || "Failed to link Discord account.");
                            }
                          }}
                          className="h-8 text-xs font-bold rounded-xl border-[#5865F2]/40 text-[#5865F2] hover:bg-[#5865F2]/10 shadow-arcade active:translate-y-0.5 cursor-pointer"
                        >
                          <svg className="size-3.5 fill-current mr-1" viewBox="0 0 24 24">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                          </svg>
                          <span>Connect Discord</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column: Space Character Avatar Preview & Selector */}
              <Card className="md:col-span-5 border-border shadow-arcade rounded-2xl flex flex-col justify-between">
                <div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Sparkles className="size-4 text-[#8b5cf6]" />
                      <span>Space Avatar</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Pick a space character and color palette for your citizen scientist profile.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Character Preview Canvas Box */}
                    <div className="flex flex-col items-center justify-center p-5 rounded-xl border border-border bg-muted/40 gap-3">
                      <PixelAvatar
                        seed={selectedAvatar}
                        size={96}
                        className="shadow-xl ring-2 ring-primary/30"
                      />

                      <div className="flex items-center gap-1.5" title="Palette Colors">
                        <span
                          className="size-3 rounded-full border border-border shadow-sm"
                          style={{ backgroundColor: liveAvatarProfile.bgHex }}
                          title="Background Tone"
                        />
                        <span
                          className="size-3 rounded-full border border-border shadow-sm"
                          style={{ backgroundColor: liveAvatarProfile.fgHex }}
                          title="Primary Character Color"
                        />
                        <span
                          className="size-3 rounded-full border border-border shadow-sm"
                          style={{ backgroundColor: liveAvatarProfile.accentHex }}
                          title="Accent Tone"
                        />
                      </div>
                    </div>

                    {/* Roll Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRollAvatar}
                        className="flex-1 h-9 text-xs font-bold rounded-xl cursor-pointer shadow-arcade active:translate-y-0.5 flex items-center justify-center gap-1.5"
                      >
                        <Dices className="size-3.5 text-primary" />
                        <span>Roll Next Avatar</span>
                      </Button>

                      {selectedAvatar !== savedAvatarSeed && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleResetAvatar}
                          className="h-9 px-3 text-xs font-medium rounded-xl text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
                          title="Reset to saved avatar"
                        >
                          <RotateCcw className="size-3.5" />
                          <span>Reset</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </div>

                <div className="px-6 pb-4">
                  <p className="text-[11px] text-muted-foreground">
                    Avatars and details are previewed instantly. Use the floating bar to save your
                    changes.
                  </p>
                </div>
              </Card>
            </div>
          </form>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: CAMPAIGN & EVENT HISTORY */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-foreground">Campaign History</h2>
              <p className="text-xs text-muted-foreground">
                All asteroid search campaigns you have participated in.
              </p>
            </div>
            <Link href="/campaigns" prefetch={false}>
              <Button
                size="sm"
                variant="outline"
                className="text-xs font-bold h-8 rounded-xl shadow-arcade active:translate-y-0.5 gap-1 self-start sm:self-auto"
              >
                <Telescope className="size-3.5" />
                <span>Explore Campaigns</span>
              </Button>
            </Link>
          </div>

          {campaigns.length === 0 ? (
            <Card className="border-border rounded-2xl p-8 text-center space-y-3">
              <Telescope className="size-10 mx-auto text-muted-foreground opacity-50" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">No Campaign History Yet</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  You haven&apos;t joined any asteroid search campaigns yet. Browse available
                  campaigns and form a squad to get started!
                </p>
              </div>
              <Link href="/campaigns" prefetch={false}>
                <Button
                  size="sm"
                  className="h-9 px-4 text-xs font-bold rounded-xl bg-primary text-primary-foreground shadow-arcade-primary"
                >
                  Browse Campaigns
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {campaigns.map(({ event, team }) => {
                const isCompleted = event.status === "COMPLETED";
                const isActive = event.status === "ACTIVE" || event.status === "SUBMISSION_OPEN";

                return (
                  <Card
                    key={event.id}
                    className="border-border shadow-arcade rounded-2xl hover:border-primary/40 transition-all"
                  >
                    <CardContent className="p-4 sm:p-5 flex flex-col gap-3.5">
                      {/* Top Row: Badges & Timeline */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-mono font-bold">
                            {event.code}
                          </Badge>

                          {isActive ? (
                            <Badge className="bg-[#10b981] text-white border-0 text-[10px] font-bold">
                              Active Now
                            </Badge>
                          ) : isCompleted ? (
                            <Badge variant="secondary" className="text-[10px] font-medium">
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">
                              Upcoming
                            </Badge>
                          )}
                        </div>

                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                          <Calendar className="size-3.5 opacity-75" />
                          <span>
                            {new Date(event.startDate).toLocaleDateString()} &ndash;{" "}
                            {new Date(event.endDate).toLocaleDateString()}
                          </span>
                        </span>
                      </div>

                      {/* Main Title & Squad Details */}
                      <div className="space-y-2">
                        <Link
                          href={`/campaigns/${event.id}`}
                          prefetch={false}
                          className="block group"
                        >
                          <h3 className="text-base sm:text-lg font-bold text-foreground break-words group-hover:text-primary transition-colors">
                            {event.title}
                          </h3>
                        </Link>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground font-sans">
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="size-3.5 text-primary shrink-0" />
                            <span>
                              Squad: <strong className="text-foreground">{team.name}</strong>
                            </span>
                            {team.role === "leader" ? (
                              <Badge className="bg-[#8b5cf6] text-white border-0 text-[10px] font-bold py-0 px-1.5 shadow-arcade-primary">
                                Leader
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-600 text-white border-0 text-[10px] font-bold py-0 px-1.5">
                                Member
                              </Badge>
                            )}
                          </span>

                          <span className="inline-flex items-center gap-1 text-[11px] font-mono">
                            <span className="opacity-40">•</span>
                            <span>
                              Sets Analyzed:{" "}
                              <strong className="text-foreground">{team.imageSetsCount}</strong>
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Bottom Action Buttons Row */}
                      <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 pt-2 border-t border-border/60">
                        <Link
                          href={`/campaigns/${event.id}`}
                          prefetch={false}
                          className="w-full sm:w-auto"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto h-8.5 px-3 text-xs font-bold rounded-xl shadow-arcade active:translate-y-0.5 flex items-center justify-center gap-1"
                          >
                            <span>Campaign View</span>
                            <ArrowRight className="size-3" />
                          </Button>
                        </Link>

                        <Link
                          href={`/team/${team.id}`}
                          prefetch={false}
                          className="w-full sm:w-auto"
                        >
                          <Button
                            size="sm"
                            variant="default"
                            className="w-full sm:w-auto h-8.5 px-3 text-xs font-bold rounded-xl bg-primary text-primary-foreground shadow-arcade-primary active:translate-y-0.5 flex items-center justify-center gap-1.5"
                          >
                            <Users className="size-3.5" />
                            <span>Squad Workspace</span>
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: SQUAD MEMBERSHIPS */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="teams" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-foreground">Your Squad Memberships</h2>
              <p className="text-xs text-muted-foreground">
                Teams you have formed or joined across campaigns.
              </p>
            </div>
            <Link href="/teams" prefetch={false}>
              <Button
                size="sm"
                variant="outline"
                className="text-xs font-bold h-8 rounded-xl shadow-arcade active:translate-y-0.5 gap-1 self-start sm:self-auto"
              >
                <Users className="size-3.5" />
                <span>Squad Directory</span>
              </Button>
            </Link>
          </div>

          {teams.length === 0 ? (
            <Card className="border-border rounded-2xl p-8 text-center space-y-3">
              <Users className="size-10 mx-auto text-muted-foreground opacity-50" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">No Squads Found</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  You are not currently a member of any squads. Join an existing team or create one
                  for an upcoming campaign!
                </p>
              </div>
              <Link href="/teams" prefetch={false}>
                <Button
                  size="sm"
                  className="h-9 px-4 text-xs font-bold rounded-xl bg-primary text-primary-foreground shadow-arcade-primary"
                >
                  Find or Create Squad
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teams.map((team) => (
                <Card
                  key={team.id}
                  className="border-border shadow-arcade rounded-2xl flex flex-col justify-between"
                >
                  <CardHeader className="pb-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono font-bold">
                        {team.event.code}
                      </Badge>
                      <Badge
                        className={
                          team.role === "leader"
                            ? "bg-[#8b5cf6] text-white border-0 text-[10px] font-bold shadow-arcade-primary"
                            : "bg-muted text-muted-foreground border-border text-[10px]"
                        }
                      >
                        {team.role === "leader" ? "Squad Leader" : "Member"}
                      </Badge>
                    </div>

                    <CardTitle className="text-base font-bold text-foreground break-words">
                      {team.name}
                    </CardTitle>
                    <CardDescription className="text-xs break-words">
                      Campaign: {team.event.title}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-3">
                    {team.inviteCode && (
                      <div className="flex items-center justify-between text-xs py-2 border-t border-border font-mono">
                        <span className="text-muted-foreground">Invite Code:</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(team.inviteCode!)}
                          className="inline-flex items-center gap-1 font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                          title="Copy Invite Code"
                        >
                          <span>{team.inviteCode}</span>
                          {copiedCode === team.inviteCode ? (
                            <Check className="size-3 text-[#10b981]" />
                          ) : (
                            <Copy className="size-3 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{team.memberCount} Members</span>
                      <span>{team.imageSetsCount} Image Sets</span>
                    </div>

                    <Link href={`/team/${team.id}`} prefetch={false} className="block w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs font-bold h-8.5 rounded-xl shadow-arcade active:translate-y-0.5 flex items-center justify-center gap-1.5"
                      >
                        <span>Open Workspace</span>
                        <ExternalLink className="size-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: DISCOVERY & ACTIVITY */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="activity" className="space-y-6">
          {/* Claimed Telescope Image Sets */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FolderSearch className="size-4 text-primary" />
              <span>Claimed Telescope Image Sets</span>
            </h2>

            {claimedSets.length === 0 ? (
              <Card className="border-border rounded-2xl p-6 text-center text-xs text-muted-foreground">
                No telescope image sets claimed yet. Claim image sets during active campaign phases
                to search for asteroids.
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {claimedSets.map((set) => (
                  <Card key={set.id} className="border-border rounded-xl p-3.5 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {set.name}
                      </span>
                      <Badge
                        className={`text-[10px] font-mono ${
                          set.status === "SUBMITTED"
                            ? "bg-[#10b981] text-white border-0"
                            : "bg-[#f59e0b] text-slate-950 border-0"
                        }`}
                      >
                        {set.status}
                      </Badge>
                    </div>

                    <div className="text-[11px] text-muted-foreground space-y-0.5">
                      <div className="truncate">Event: {set.event.title}</div>
                      <div>Claimed: {new Date(set.createdAt).toLocaleDateString()}</div>
                      {set.submittedAt && (
                        <div className="text-[#10b981] font-medium">
                          Submitted: {new Date(set.submittedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Join Requests */}
          <div className="space-y-3 pt-2">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Send className="size-4 text-[#8b5cf6]" />
              <span>Team Join Requests</span>
            </h2>

            {joinRequests.length === 0 ? (
              <Card className="border-border rounded-2xl p-6 text-center text-xs text-muted-foreground">
                No pending or past join requests.
              </Card>
            ) : (
              <div className="space-y-2">
                {joinRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-card text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-foreground">{req.team.name}</span>
                      <span className="text-muted-foreground ml-2">({req.team.event.title})</span>
                      {req.message && (
                        <p className="text-muted-foreground italic text-[11px]">
                          &quot;{req.message}&quot;
                        </p>
                      )}
                    </div>

                    <Badge
                      className={`text-[10px] font-bold ${
                        req.status === "ACCEPTED"
                          ? "bg-[#10b981] text-white border-0"
                          : req.status === "REJECTED"
                            ? "bg-destructive text-destructive-foreground border-0"
                            : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {req.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* FIXED FLOATING SAVE / DISCARD ACTION BAR */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-xl bg-card/95 dark:bg-[#1c1d21]/95 backdrop-blur-md border border-border p-3.5 sm:p-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Top text block on mobile, left on desktop */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <p className="text-xs font-bold text-foreground">Unsaved changes detected</p>
              <span className="text-[11px] text-muted-foreground hidden sm:inline">•</span>
              <p className="text-[11px] text-muted-foreground hidden sm:inline">
                Click save to apply your updates
              </p>
            </div>
          </div>

          {/* Action buttons (grid 2 columns on mobile, inline on desktop) */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDiscardChanges}
              disabled={isSaving}
              className="h-9 px-3 text-xs font-semibold rounded-xl cursor-pointer shadow-arcade active:translate-y-0.5 flex items-center justify-center gap-1"
            >
              <RotateCcw className="size-3.5" />
              <span>Discard</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="h-9 px-4 text-xs font-bold rounded-xl bg-primary text-primary-foreground shadow-arcade-primary active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<DinoLoading size="lg" text="Loading Profile..." fullScreen />}>
      <ProfileContent />
    </Suspense>
  );
}
