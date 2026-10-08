"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Send,
  Eye,
  Edit3,
  Sparkles,
  Link as LinkIcon,
  Tag,
  User,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { UserData } from "./types";
import { renderCustomAdminEmail } from "@/lib/email-templates/custom-admin-email";

interface SendEmailModalProps {
  user: UserData | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface EmailPreset {
  id: string;
  name: string;
  badge: string;
  badgeColor: "violet" | "emerald" | "amber" | "sky" | "rose";
  subject: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  senderType: "default" | "campaigns" | "squads";
}

const EMAIL_PRESETS: EmailPreset[] = [
  {
    id: "general",
    name: "General Announcement",
    badge: "Official Announcement",
    badgeColor: "violet",
    subject: "Important update from the SaveDino team",
    message:
      "We are reaching out to share an important update regarding your participation on the SaveDino platform.\n\nPlease review your active workspace and make sure your team information is up to date.",
    actionLabel: "Open Dashboard",
    actionUrl: "https://savedino.sedssl.org/dashboard",
    senderType: "default",
  },
  {
    id: "campaign",
    name: "Campaign Reminder",
    badge: "Campaign Advisory",
    badgeColor: "emerald",
    subject: "Asteroid Search Campaign: Next Steps & Schedule",
    message:
      "Your registered campaign is progressing. Please ensure you and your squad members check the latest image sets and submit reports on time.\n\nIf you have any questions or need assistance with analysis, reach out through our community channels.",
    actionLabel: "View Squads & Campaigns",
    actionUrl: "https://savedino.sedssl.org/squads",
    senderType: "campaigns",
  },
  {
    id: "name_reminder",
    name: "Full Name Verification",
    badge: "Action Required",
    badgeColor: "amber",
    subject: "Action Required: Verify Your Full Legal Name",
    message:
      "Our organizers noticed that the name registered on your profile is incomplete or uses a nickname.\n\nNASA and IASC require verified full legal names for discovery recognition and official certificates. Please update your name in your profile settings as soon as possible.",
    actionLabel: "Update Profile Name",
    actionUrl: "https://savedino.sedssl.org/profile",
    senderType: "default",
  },
  {
    id: "squad_advisory",
    name: "Squad Roster Advisory",
    badge: "Squad Update",
    badgeColor: "sky",
    subject: "Squad Formation & Roster Advisory",
    message:
      "We have an update regarding your research squad roster. Please coordinate with your squad leader to confirm member slots and ensure all members are ready for data processing.\n\nOpen slots should be filled before campaign registration closes.",
    actionLabel: "Open Squad Workspace",
    actionUrl: "https://savedino.sedssl.org/squads",
    senderType: "squads",
  },
];

export function SendEmailModal({ user, onClose, onSuccess }: SendEmailModalProps) {
  const [activeTab, setActiveTab] = useState<"compose" | "preview">("compose");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("custom");

  const [subject, setSubject] = useState<string>("");
  const [badgeText, setBadgeText] = useState<string>("Direct Message");
  const [badgeColor, setBadgeColor] = useState<"violet" | "emerald" | "amber" | "sky" | "rose">(
    "violet"
  );
  const [senderType, setSenderType] = useState<"default" | "campaigns" | "squads">("default");
  const [message, setMessage] = useState<string>("");
  const [actionLabel, setActionLabel] = useState<string>("");
  const [actionUrl, setActionUrl] = useState<string>("");
  const [showActionFields, setShowActionFields] = useState<boolean>(false);

  const [sending, setSending] = useState<boolean>(false);

  // Initialize or reset when user changes
  useEffect(() => {
    if (user) {
      setActiveTab("compose");
      setSelectedPresetId("custom");
      setSubject(`Important message from SaveDino`);
      setBadgeText("Direct Message");
      setBadgeColor("violet");
      setSenderType("default");
      setMessage(
        `Hello ${user.name},\n\nWe are writing to you regarding your SaveDino account and asteroid search activities.\n\nPlease let us know if you have any questions or need assistance.`
      );
      setActionLabel("Open SaveDino Dashboard");
      setActionUrl("https://savedino.sedssl.org/dashboard");
      setShowActionFields(true);
    }
  }, [user]);

  const handleApplyPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (presetId === "custom") return;

    const preset = EMAIL_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSubject(preset.subject);
    setBadgeText(preset.badge);
    setBadgeColor(preset.badgeColor);
    setSenderType(preset.senderType);
    setMessage(preset.message);
    if (preset.actionLabel && preset.actionUrl) {
      setShowActionFields(true);
      setActionLabel(preset.actionLabel);
      setActionUrl(preset.actionUrl);
    }
  };

  // Generate live email preview HTML
  const previewHtml = useMemo(() => {
    if (!user) return "";
    try {
      const { html } = renderCustomAdminEmail({
        name: user.name,
        email: user.email,
        subject: subject.trim() || "Email Subject Preview",
        message: message.trim() || "Email message body preview will appear here...",
        badgeText: badgeText.trim() || null,
        badgeColor,
        actionLabel: showActionFields && actionLabel.trim() ? actionLabel.trim() : null,
        actionUrl: showActionFields && actionUrl.trim() ? actionUrl.trim() : null,
        senderName: "SaveDino Platform Admin",
      });
      return html;
    } catch {
      return "<p style='color:red;'>Failed to render preview</p>";
    }
  }, [user, subject, message, badgeText, badgeColor, showActionFields, actionLabel, actionUrl]);

  if (!user) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      toast.error("Please provide an email subject.");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter an email message body.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          badgeText: badgeText.trim() || undefined,
          badgeColor,
          senderType,
          actionLabel: showActionFields && actionLabel.trim() ? actionLabel.trim() : undefined,
          actionUrl: showActionFields && actionUrl.trim() ? actionUrl.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send email");
      }

      toast.success(data.message || `Custom email sent to ${user.name} (${user.email})!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to send custom email:", err);
      toast.error(err.message || "Failed to dispatch email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-card border-border font-sans p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-border bg-card">
          <DialogHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Mail className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <span>Send Custom Email</span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <span>Recipient:</span>
                    <strong className="text-foreground font-semibold">{user.name}</strong>
                    <span className="font-mono text-[11px] text-muted-foreground">({user.email})</span>
                  </DialogDescription>
                </div>
              </div>

              {/* Mode Switcher */}
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as "compose" | "preview")}
                className="w-auto"
              >
                <TabsList className="bg-muted/80 p-0.5 h-8">
                  <TabsTrigger
                    value="compose"
                    className="text-xs px-3 h-7 gap-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground"
                  >
                    <Edit3 className="size-3.5" />
                    <span>Compose</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className="text-xs px-3 h-7 gap-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground"
                  >
                    <Eye className="size-3.5" />
                    <span>Live Preview</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </DialogHeader>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "compose" ? (
            <form id="send-email-form" onSubmit={handleSend} className="space-y-4">
              {/* Presets & Sender Selector Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Preset Templates */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-primary" />
                    <span>Template Preset</span>
                  </label>
                  <Select value={selectedPresetId} onValueChange={handleApplyPreset}>
                    <SelectTrigger className="h-9 text-xs bg-muted/40 border-border">
                      <SelectValue placeholder="Select a preset..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="custom" className="text-xs">
                        Custom Message (Blank)
                      </SelectItem>
                      {EMAIL_PRESETS.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sender Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <User className="size-3.5 text-muted-foreground" />
                    <span>Sender Channel</span>
                  </label>
                  <Select
                    value={senderType}
                    onValueChange={(v) => setSenderType(v as "default" | "campaigns" | "squads")}
                  >
                    <SelectTrigger className="h-9 text-xs bg-muted/40 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="default" className="text-xs">
                        SaveDino General (login@savedino.sedssl.org)
                      </SelectItem>
                      <SelectItem value="campaigns" className="text-xs">
                        SaveDino Campaigns (campaigns@savedino.sedssl.org)
                      </SelectItem>
                      <SelectItem value="squads" className="text-xs">
                        SaveDino Squads (squads@savedino.sedssl.org)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subject Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Email Subject <span className="text-destructive">*</span>
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Important update regarding your research session"
                  required
                  className="h-9 text-xs bg-muted/40 border-border"
                />
              </div>

              {/* Badge Tag & Color Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Tag className="size-3.5 text-muted-foreground" />
                    <span>Header Badge Pill (Optional)</span>
                  </label>
                  <Input
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. Direct Message, Advisory, Notice"
                    className="h-9 text-xs bg-muted/40 border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Badge Accent Color</label>
                  <Select
                    value={badgeColor}
                    onValueChange={(v) =>
                      setBadgeColor(v as "violet" | "emerald" | "amber" | "sky" | "rose")
                    }
                  >
                    <SelectTrigger className="h-9 text-xs bg-muted/40 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="violet" className="text-xs">
                        Electric Violet (Default)
                      </SelectItem>
                      <SelectItem value="emerald" className="text-xs">
                        Emerald Green (Success / Active)
                      </SelectItem>
                      <SelectItem value="amber" className="text-xs">
                        Amber / Yellow (Action Required)
                      </SelectItem>
                      <SelectItem value="sky" className="text-xs">
                        Sky Blue (Info / Squad)
                      </SelectItem>
                      <SelectItem value="rose" className="text-xs">
                        Rose Red (Urgent / Warning)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Editable Message Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Email Message Body <span className="text-destructive">*</span>
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Separate paragraphs with a blank line
                  </span>
                </div>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your email body here..."
                  rows={7}
                  required
                  className="text-xs leading-relaxed bg-muted/40 border-border font-sans resize-y min-h-[140px]"
                />
              </div>

              {/* Optional Call to Action Button Toggle & Fields */}
              <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="size-3.5 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      Action Button Link
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowActionFields(!showActionFields)}
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    {showActionFields ? "Disable button" : "Add call to action button"}
                  </button>
                </div>

                {showActionFields && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Button Text
                      </label>
                      <Input
                        value={actionLabel}
                        onChange={(e) => setActionLabel(e.target.value)}
                        placeholder="e.g., Open Squad Workspace &rarr;"
                        className="h-8 text-xs bg-muted/40 border-border"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Destination URL
                      </label>
                      <Input
                        value={actionUrl}
                        onChange={(e) => setActionUrl(e.target.value)}
                        placeholder="https://savedino.sedssl.org/..."
                        className="h-8 text-xs bg-muted/40 border-border"
                      />
                    </div>
                  </div>
                )}
              </div>
            </form>
          ) : (
            /* Live Email Preview */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground pb-1">
                <span>Real-time preview rendered under official SaveDino Dark Theme</span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {user.email}
                </Badge>
              </div>
              <div className="rounded-lg border border-border overflow-hidden bg-[#121315] shadow-inner">
                <iframe
                  title="Email Preview"
                  srcDoc={previewHtml}
                  className="w-full h-[460px] border-none bg-[#121315]"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-border bg-card flex items-center justify-between sm:justify-between">
          <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>Sends via configured provider with Brevo failover</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={sending}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="send-email-form"
              size="sm"
              disabled={sending || !subject.trim() || !message.trim()}
              onClick={activeTab === "preview" ? handleSend : undefined}
              className="text-xs font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-arcade-primary cursor-pointer"
            >
              {sending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Dispatching Email...</span>
                </>
              ) : (
                <>
                  <Send className="size-3.5" />
                  <span>Send Custom Email</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
