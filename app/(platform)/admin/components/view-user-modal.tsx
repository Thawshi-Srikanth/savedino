"use client";

import React from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Building2,
  Globe,
  Phone,
  Calendar,
  Shield,
  Crown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  Edit2,
  Send,
  UserPlus,
  ShieldAlert,
  UserCheck,
  Compass,
  Telescope,
  KeyRound,
  Laptop,
  Clock,
  Network,
  Activity,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { UserData, getInitials, isUserSquadLeader } from "./types";
import { resolveCountryCode, getCountryFlag } from "@/lib/phone-validation";

interface ViewUserModalProps {
  user: UserData | null;
  onClose: () => void;
  onEditUser?: (u: UserData) => void;
  onSendEmail?: (u: UserData) => void;
  onBanUser?: (u: UserData, action: "BAN" | "WARN_NAME" | "UNBAN") => void;
  onAssignUser?: (u: UserData) => void;
}

function getProviderLabel(providerId?: string): string {
  if (!providerId) return "Email / Magic Link";
  switch (providerId.toLowerCase()) {
    case "credential":
    case "password":
      return "Email & Password";
    case "magic-link":
    case "email":
      return "Email Sign-In";
    case "google":
      return "Google OAuth";
    case "discord":
      return "Discord OAuth";
    case "github":
      return "GitHub OAuth";
    default:
      return providerId.charAt(0).toUpperCase() + providerId.slice(1);
  }
}

export function ViewUserModal({
  user,
  onClose,
  onEditUser,
  onSendEmail,
  onBanUser,
  onAssignUser,
}: ViewUserModalProps) {
  if (!user) return null;

  const inTeam = user.teamMembers && user.teamMembers.length > 0;
  const isBanned = Boolean(user.banned);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  const cleanWhatsappNumber = user.whatsapp ? user.whatsapp.replace(/[^0-9]/g, "") : null;

  // Determine login method
  const primaryProvider =
    user.accounts && user.accounts.length > 0 ? user.accounts[0].providerId : "email";
  const loginMethodLabel = getProviderLabel(primaryProvider);

  // Latest session info
  const latestSession = user.sessions && user.sessions.length > 0 ? user.sessions[0] : null;
  const userIp = latestSession?.ipAddress;

  // IP Geolocation & Country state
  const [ipGeo, setIpGeo] = React.useState<{
    country?: string;
    countryCode?: string;
    city?: string;
    region?: string;
    flagEmoji?: string;
    flagUrl?: string;
    isPrivate?: boolean;
    loading?: boolean;
  }>({});

  React.useEffect(() => {
    if (!userIp) {
      setIpGeo({});
      return;
    }

    let isMounted = true;
    setIpGeo({ loading: true });

    fetch(`/api/admin/ip-lookup?ip=${encodeURIComponent(userIp)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success) {
          setIpGeo({
            country: data.country,
            countryCode: data.countryCode,
            city: data.city,
            region: data.region,
            flagEmoji: data.flagEmoji,
            flagUrl: data.flagUrl,
            isPrivate: data.isPrivate,
            loading: false,
          });
        } else if (isMounted) {
          setIpGeo({ loading: false });
        }
      })
      .catch(() => {
        if (isMounted) setIpGeo({ loading: false });
      });

    return () => {
      isMounted = false;
    };
  }, [userIp]);

  // Declared profile country flag
  const declaredCountryCode = resolveCountryCode(user.country);
  const declaredFlagUrl = `https://flagcdn.com/w40/${declaredCountryCode.toLowerCase()}.png`;

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-card border-border font-sans p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header Hero Area */}
        <div className="p-6 pb-4 border-b border-border bg-gradient-to-b from-muted/30 to-card space-y-3">
          <DialogHeader>
            <div className="flex items-center gap-3.5">
              {/* Avatar Badge */}
              <div className="size-13 rounded-xl bg-gradient-to-br from-primary/25 via-primary/10 to-transparent border border-primary/30 flex items-center justify-center text-lg font-bold font-mono text-primary shadow-xs shrink-0">
                {getInitials(user.name)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-lg font-bold text-foreground truncate">
                    {user.name}
                  </DialogTitle>
                </div>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap font-mono">
                  <span>ID: {user.id}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(user.id, "User ID")}
                    className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    title="Copy User ID"
                  >
                    <Copy className="size-3" />
                  </button>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* ALL BADGES & STATUS TAGS IN ONE UNIFIED ROW */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {/* 1. Role Tag */}
            {user.role === "admin" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#8b5cf6] text-white shadow-xs tracking-wide">
                <Shield className="size-2.5" />
                <span>Admin</span>
              </span>
            )}
            {user.role === "staff" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#10b981] text-white shadow-xs tracking-wide">
                <Shield className="size-2.5" />
                <span>Staff</span>
              </span>
            )}
            {user.role === "leader" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#f59e0b] text-[#0f172a] shadow-xs tracking-wide">
                <Crown className="size-2.5" />
                <span>Squad Leader</span>
              </span>
            )}
            {user.role === "user" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                <User className="size-2.5 text-muted-foreground" />
                <span>Citizen Scientist</span>
              </span>
            )}

            {/* 2. Account Status Tag */}
            {isBanned ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-destructive text-destructive-foreground uppercase tracking-wider">
                <ShieldAlert className="size-2.5" />
                <span>Suspended</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle2 className="size-2.5" />
                <span>Active</span>
              </span>
            )}

            {/* 3. Email Verification Tag */}
            {user.emailVerified ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <Mail className="size-2.5" />
                <span>Email Verified</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <AlertTriangle className="size-2.5" />
                <span>Email Unverified</span>
              </span>
            )}

            {/* 4. Login Method / Auth Tag */}
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              <KeyRound className="size-2.5" />
              <span>Login: {loginMethodLabel}</span>
            </span>

            {/* 5. Squad Status Tag */}
            {inTeam ? (
              isUserSquadLeader(user) ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  <Crown className="size-2.5" />
                  <span>Squad Leader</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                  <Telescope className="size-2.5" />
                  <span>In Squad ({user.teamMembers.length})</span>
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <Compass className="size-2.5" />
                <span>Solo / Matchmaking</span>
              </span>
            )}

            {/* 6. Onboarding Tour Tag */}
            {user.tourCompleted ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                <CheckCircle2 className="size-2.5 text-emerald-500" />
                <span>Tour Done</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                <Clock className="size-2.5 text-muted-foreground" />
                <span>Tour Pending</span>
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Moderation Warning Banner (if banned) */}
          {isBanned && (
            <div className="p-3.5 rounded-lg border border-destructive/30 bg-destructive/10 text-xs space-y-1 text-destructive">
              <div className="flex items-center gap-2 font-bold">
                <ShieldAlert className="size-4 shrink-0" />
                <span>Account Suspended</span>
              </div>
              <p className="text-foreground/90 pl-6">
                <strong>Reason:</strong> {user.banReason || "Administrative suspension"}
              </p>
              {user.bannedAt && (
                <p className="text-muted-foreground pl-6 font-mono text-[11px]">
                  Banned on: {new Date(user.bannedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* User Details Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5">
              <User className="size-3.5 text-primary" />
              <span>Contact &amp; Account Information</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Email Address */}
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                  <Mail className="size-3 text-muted-foreground" />
                  <span>Email Address</span>
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-foreground font-semibold truncate select-all">
                    {user.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(user.email, "Email Address")}
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                    title="Copy Email"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Login Method / Auth Provider */}
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                  <KeyRound className="size-3 text-muted-foreground" />
                  <span>Authentication Method</span>
                </span>
                <div className="text-xs font-semibold text-foreground truncate flex items-center gap-1.5">
                  <span>{loginMethodLabel}</span>
                  {user.accounts && user.accounts.length > 0 && (
                    <span className="font-mono text-[10px] text-muted-foreground">
                      ({user.accounts.length} linked account{user.accounts.length > 1 ? "s" : ""})
                    </span>
                  )}
                </div>
              </div>

              {/* Institution */}
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                  <Building2 className="size-3 text-muted-foreground" />
                  <span>Institution / School</span>
                </span>
                <div className="text-xs font-semibold text-foreground truncate">
                  {user.institution || "Independent Researcher"}
                </div>
              </div>

              {/* Country */}
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                  <Globe className="size-3 text-muted-foreground" />
                  <span>Profile Country / Region</span>
                </span>
                <div className="text-xs font-semibold text-foreground truncate flex items-center gap-2">
                  {user.country ? (
                    <>
                      <img
                        src={declaredFlagUrl}
                        alt={user.country}
                        className="w-4 h-3 object-cover rounded-xs border border-border/80 shadow-2xs shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <span>{user.country}</span>
                      <span className="text-muted-foreground font-mono text-[10px]">
                        ({declaredCountryCode})
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Global / Unspecified</span>
                  )}
                </div>
              </div>

              {/* WhatsApp Contact */}
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                  <Phone className="size-3 text-muted-foreground" />
                  <span>WhatsApp / Contact</span>
                </span>
                <div className="flex items-center justify-between gap-2">
                  {user.whatsapp ? (
                    <>
                      <span className="font-mono text-xs text-foreground font-semibold truncate">
                        {user.whatsapp}
                      </span>
                      {cleanWhatsappNumber && (
                        <a
                          href={`https://wa.me/${cleanWhatsappNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-sans font-semibold"
                        >
                          <span>Chat</span>
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Not provided</span>
                  )}
                </div>
              </div>

              {/* Registration Date */}
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                  <Calendar className="size-3 text-muted-foreground" />
                  <span>Account Created</span>
                </span>
                <div className="font-mono text-xs text-foreground font-semibold">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                  <span className="text-muted-foreground font-normal ml-1 text-[11px]">
                    (
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                    )
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Last Activity & Network IP Logs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5">
              <Activity className="size-3.5 text-primary" />
              <span>Activity &amp; Logged IP Address</span>
            </h4>
            <div className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* IP Address & Country Flag Logo */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                    <Network className="size-3 text-muted-foreground" />
                    <span>Last Logged IP &amp; Country</span>
                  </span>
                  {latestSession?.ipAddress ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Country Flag Logo / Image */}
                        {ipGeo.flagUrl ? (
                          <img
                            src={ipGeo.flagUrl}
                            alt={ipGeo.countryCode || "Country Flag"}
                            className="w-5 h-3.5 object-cover rounded-xs border border-border/80 shadow-2xs shrink-0"
                            title={`${ipGeo.country || ipGeo.countryCode} (${ipGeo.countryCode})`}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : ipGeo.flagEmoji ? (
                          <span className="text-sm shrink-0" title={ipGeo.country || "Country"}>
                            {ipGeo.flagEmoji}
                          </span>
                        ) : null}

                        <span className="font-mono text-xs text-foreground font-bold bg-background px-2.5 py-1 rounded border border-border select-all shadow-xs">
                          {latestSession.ipAddress}
                        </span>

                        <button
                          type="button"
                          onClick={() => copyToClipboard(latestSession.ipAddress!, "IP Address")}
                          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                          title="Copy IP Address"
                        >
                          <Copy className="size-3.5" />
                        </button>

                        <a
                          href={`https://ipinfo.io/${latestSession.ipAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 px-2 py-0.5 rounded border border-sky-500/20 transition-colors"
                          title="Lookup IP details on ipinfo.io"
                        >
                          <Globe className="size-3" />
                          <span>Lookup</span>
                          <ExternalLink className="size-2.5" />
                        </a>
                      </div>

                      {/* Resolved Country Info Pill / Warning */}
                      {ipGeo.country && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                              ipGeo.countryCode === "IN"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold"
                                : "bg-muted text-foreground border-border"
                            }`}
                          >
                            <span>{ipGeo.country}</span>
                            {ipGeo.city && (
                              <span className="text-muted-foreground font-normal">
                                &middot; {ipGeo.city}
                              </span>
                            )}
                            {ipGeo.countryCode && ipGeo.countryCode !== "LOC" && (
                              <span className="font-mono text-[10px] text-muted-foreground">
                                ({ipGeo.countryCode})
                              </span>
                            )}
                          </span>

                          {ipGeo.countryCode === "IN" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-destructive text-destructive-foreground">
                              <ShieldAlert className="size-2.5" />
                              <span>Restricted Region (India)</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs font-mono text-muted-foreground italic py-1">
                      No IP address logged yet
                    </div>
                  )}
                </div>

                {/* Last Active Timestamp */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                    <Clock className="size-3 text-muted-foreground" />
                    <span>Last Active Session</span>
                  </span>
                  <div className="font-mono text-xs text-foreground font-semibold py-1">
                    {latestSession?.updatedAt
                      ? new Date(latestSession.updatedAt).toLocaleString()
                      : user.createdAt
                        ? `Registered on ${new Date(user.createdAt).toLocaleDateString()}`
                        : "No active session"}
                  </div>
                </div>
              </div>

              {/* User Agent / Client Details */}
              {latestSession?.userAgent && (
                <div className="pt-2.5 border-t border-border/60 flex items-start gap-2 text-[11px] text-muted-foreground">
                  <Laptop className="size-3 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="font-mono text-[10px] break-all text-muted-foreground">
                    {latestSession.userAgent}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Research Squad & Campaign Section */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Telescope className="size-3.5 text-primary" />
                <span>Squad &amp; Campaign Memberships</span>
              </h4>
              <Badge variant="outline" className="text-[10px] font-mono">
                {user.teamMembers?.length || 0} squad(s)
              </Badge>
            </div>

            {inTeam ? (
              <div className="space-y-2">
                {user.teamMembers.map((tm) => (
                  <div
                    key={tm.id}
                    className="p-3.5 rounded-lg border border-border bg-card/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-foreground">{tm.team.name}</span>
                        {tm.role?.toLowerCase() === "leader" || tm.team?.leaderId === user.id ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Crown className="size-2.5" />
                            Leader
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            Member
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
                        <span>
                          Campaign:{" "}
                          <strong className="text-foreground/90">
                            {tm.team.event?.title || "Asteroid Search"}
                          </strong>
                        </span>
                        {tm.team.event?.code && (
                          <span className="font-mono text-[10px] text-primary">
                            ({tm.team.event.code})
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/team/${tm.team.id}`}
                      target="_blank"
                      className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors self-start sm:self-auto"
                    >
                      <span>Open Workspace</span>
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-dashed border-border bg-muted/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-semibold text-foreground">
                    This user is currently not assigned to any research squad.
                  </p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    They are available in the Solo Matchmaking Pool and can be assigned to open
                    squad slots.
                  </p>
                </div>
                {onAssignUser && !isBanned && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onAssignUser(user);
                    }}
                    className="gap-1.5 text-xs font-bold bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-arcade cursor-pointer shrink-0"
                  >
                    <UserPlus className="size-3.5" />
                    <span>Assign to Squad</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Quick Action Toolbar */}
        <DialogFooter className="p-4 border-t border-border bg-card flex flex-wrap items-center justify-between gap-2 sm:justify-between">
          {/* Moderation Quick Actions */}
          <div className="flex items-center gap-1.5">
            {onBanUser && (
              <>
                {isBanned ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onBanUser(user, "UNBAN");
                    }}
                    className="h-8 text-xs font-semibold gap-1.5 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
                  >
                    <UserCheck className="size-3.5" />
                    <span>Reinstate Account</span>
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onBanUser(user, "WARN_NAME");
                      }}
                      className="h-8 text-xs font-semibold gap-1.5 text-amber-500 border-amber-500/30 hover:bg-amber-500/10 cursor-pointer"
                    >
                      <AlertTriangle className="size-3.5" />
                      <span>Warn Name</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onBanUser(user, "BAN");
                      }}
                      className="h-8 text-xs font-semibold gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 cursor-pointer"
                    >
                      <ShieldAlert className="size-3.5" />
                      <span>Ban User</span>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>

          {/* User Management Actions */}
          <div className="flex items-center gap-2">
            {onSendEmail && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onSendEmail(user);
                }}
                className="h-8 text-xs font-semibold gap-1.5 text-primary border-primary/30 hover:bg-primary/10 cursor-pointer"
              >
                <Send className="size-3.5" />
                <span>Send Email</span>
              </Button>
            )}

            {onEditUser && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEditUser(user);
                }}
                className="h-8 text-xs font-semibold gap-1.5 cursor-pointer shadow-arcade active:translate-y-0.5"
              >
                <Edit2 className="size-3.5" />
                <span>Edit Profile</span>
              </Button>
            )}

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs font-semibold cursor-pointer"
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
