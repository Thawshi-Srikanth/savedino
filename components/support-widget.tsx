"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  MessageSquare,
  X,
  Send,
  LifeBuoy,
  RotateCcw,
  History,
  Plus,
  ChevronRight,
  Loader2,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { ChatMessageContent } from "@/components/chat-message-content";

interface ConversationMessage {
  id: string;
  content: string;
  author_type: "customer" | "AI" | "human";
  author_name?: string;
  created_at: string;
  is_private?: boolean;
}

interface SupportTicket {
  id: string;
  status: string;
  last_message?: string;
  last_message_at?: string;
  message_count?: number;
  created_at: string;
  unread_count?: number;
}

const QUICK_TOPICS = [
  "How to link Discord account",
  "Submitting asteroid observations",
  "Joining a research squad",
  "Pan-STARRS data questions",
];

export function SupportWidget() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "tickets" | "restore">("chat");

  // Chat State
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Tickets List State
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Email restore state
  const [restoreEmail, setRestoreEmail] = useState("");
  const [restoring, setRestoring] = useState(false);
  const [restoreSent, setRestoreSent] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isFetchingRef = useRef(false);
  const lastFetchRef = useRef(0);
  const isThrottledRef = useRef(false);

  // Check PostHog Conversations availability and hide default widget
  useEffect(() => {
    let checkInterval: NodeJS.Timeout | null = null;
    let attempts = 0;

    const checkAvailability = async () => {
      attempts++;
      const conv = (posthog as any)?.conversations;
      if (conv && typeof conv.isAvailable === "function" && conv.isAvailable()) {
        if (checkInterval) {
          clearInterval(checkInterval);
          checkInterval = null;
        }
        setIsAvailable(true);

        // Suppress default widget
        if (typeof conv.hide === "function") {
          try {
            conv.hide();
          } catch (e) {
            console.debug("[SupportWidget] conv.hide error:", e);
          }
        }

        // Check for URL restore token
        try {
          if (typeof conv.restoreFromUrlToken === "function") {
            const res = await conv.restoreFromUrlToken();
            if (res?.status === "success" && res.migrated_ticket_ids?.length) {
              toast.success("Restored previous support conversations");
            }
          }
        } catch (e) {
          console.debug("[SupportWidget] restore token check:", e);
        }

        refreshTicketState();
      } else if (attempts > 30) {
        if (checkInterval) {
          clearInterval(checkInterval);
          checkInterval = null;
        }
      }
    };

    checkAvailability();
    checkInterval = setInterval(checkAvailability, 1000);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, []);

  const [emailSaved, setEmailSaved] = useState(false);

  // Sync user info from session or localStorage
  useEffect(() => {
    if (session?.user) {
      setUserEmail(session.user.email || "");
      setUserName(session.user.name || "");
      setEmailSaved(true);
    } else {
      const stored = localStorage.getItem("savedino_support_email");
      if (stored) {
        setUserEmail(stored);
        setEmailSaved(true);
      }
    }
  }, [session?.user]);

  const handleSaveEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = userEmail.trim();
    if (!clean || !clean.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    localStorage.setItem("savedino_support_email", clean);
    setEmailSaved(true);
    toast.success("Email saved for reply notifications!");

    // If active ticket exists, update traits in PostHog
    const conv = (posthog as any)?.conversations;
    if (conv && typeof conv.sendMessage === "function" && currentTicketId) {
      conv.sendMessage("", { email: clean, name: userName.trim() || undefined }).catch(() => {});
    }
  };

  // Scroll messages to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, []);

  // Fetch current ticket messages with rate limit protection
  const fetchMessages = useCallback(async (ticketId?: string) => {
    const conv = (posthog as any)?.conversations;
    if (!conv) return;

    // Throttle / debounce guard (minimum 5s between calls)
    const now = Date.now();
    if (isFetchingRef.current || now - lastFetchRef.current < 5000 || isThrottledRef.current) {
      return;
    }

    isFetchingRef.current = true;
    lastFetchRef.current = now;

    try {
      const response = await conv.getMessages(ticketId);
      if (response && Array.isArray(response.messages)) {
        const publicMessages: ConversationMessage[] = response.messages.filter(
          (m: ConversationMessage) => !m.is_private
        );
        setMessages((prev) => {
          const autoReplies = prev.filter((m) => m.id.startsWith("auto-reply-"));
          const serverHasNonCustomer = publicMessages.some((m) => m.author_type !== "customer");
          if (serverHasNonCustomer || autoReplies.length === 0) {
            return publicMessages;
          }
          return [...publicMessages, ...autoReplies];
        });
        if (response.ticket_id) {
          setCurrentTicketId(response.ticket_id);
        }
        if (typeof response.unread_count === "number") {
          setUnreadCount(response.unread_count);
        }
      }
    } catch (err: any) {
      if (
        err?.message?.includes("429") ||
        err?.message?.includes("throttled") ||
        err?.message?.includes("Too many")
      ) {
        isThrottledRef.current = true;
        // Reset throttle backoff after 30 seconds
        setTimeout(() => {
          isThrottledRef.current = false;
        }, 30000);
      }
      console.debug("[SupportWidget] fetchMessages error:", err);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // Refresh current ticket state
  const refreshTicketState = useCallback(async () => {
    const conv = (posthog as any)?.conversations;
    if (!conv) return;

    try {
      const activeId =
        typeof conv.getCurrentTicketId === "function" ? conv.getCurrentTicketId() : null;
      if (activeId) {
        setCurrentTicketId(activeId);
        await fetchMessages(activeId);
      }
    } catch (e) {
      console.debug("[SupportWidget] Refresh error:", e);
    }
  }, [fetchMessages]);

  // Gentle polling only when widget is open and has an active ticket
  useEffect(() => {
    if (!isOpen || activeTab !== "chat" || !currentTicketId) return;

    fetchMessages(currentTicketId);

    const conv = (posthog as any)?.conversations;
    if (conv && typeof conv.markAsRead === "function") {
      conv.markAsRead(currentTicketId).catch(() => {});
      setUnreadCount(0);
    }

    const interval = setInterval(() => {
      if (!document.hidden && !isThrottledRef.current) {
        fetchMessages(currentTicketId);
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [isOpen, activeTab, currentTicketId, fetchMessages]);

  // Fetch tickets list when opening tickets tab
  const loadTickets = async () => {
    const conv = (posthog as any)?.conversations;
    if (!conv || typeof conv.getTickets !== "function") return;

    setLoadingTickets(true);
    try {
      const res = await conv.getTickets({ limit: 20 });
      if (res && Array.isArray(res.results)) {
        setTickets(res.results);
      }
    } catch (err) {
      console.debug("[SupportWidget] Error loading tickets:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    scrollToBottom();
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || sending) return;

    const conv = (posthog as any)?.conversations;
    if (!conv) {
      toast.error("Support service is connecting. Please try again.");
      return;
    }

    setSending(true);
    const effectiveEmail = session?.user?.email || userEmail.trim();
    const effectiveName = session?.user?.name || userName.trim();

    const userTraits =
      effectiveEmail || effectiveName
        ? {
            email: effectiveEmail || undefined,
            name: effectiveName || undefined,
          }
        : undefined;

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ConversationMessage = {
      id: tempId,
      content: messageContent,
      author_type: "customer",
      author_name: effectiveName || "You",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText("");
    scrollToBottom();

    const isNewConversation = !currentTicketId || messages.length === 0;

    try {
      const response = await conv.sendMessage(messageContent, userTraits);
      if (response?.ticket_id) {
        setCurrentTicketId(response.ticket_id);
      }
      await fetchMessages(response?.ticket_id || currentTicketId || undefined);
      scrollToBottom();

      // Instant automated reassurance from SaveDino Team
      if (isNewConversation) {
        setTimeout(() => {
          setMessages((prev) => {
            const hasAutoReply = prev.some((m) => m.id.startsWith("auto-reply-"));
            if (hasAutoReply) return prev;
            return [
              ...prev,
              {
                id: `auto-reply-${Date.now()}`,
                content: "Thanks for reaching out! Someone from our team will respond to you soon.",
                author_type: "human",
                author_name: "SaveDino Team",
                created_at: new Date().toISOString(),
              },
            ];
          });
          scrollToBottom();
        }, 600);
      }
    } catch (err: any) {
      console.error("[SupportWidget] Error sending message:", err);
      // Remove temporary optimistic message on failure and restore typed message
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInputText(messageContent);

      if (
        err?.message?.includes("429") ||
        err?.message?.includes("throttled") ||
        err?.message?.includes("Too many")
      ) {
        toast.error("PostHog rate limit reached. Please wait ~30 seconds before sending.");
      } else {
        toast.error(err.message || "Failed to send message.");
      }
    } finally {
      setSending(false);
    }
  };

  // Start new conversation
  const handleStartNewTicket = async () => {
    setCurrentTicketId(null);
    setMessages([]);
    setActiveTab("chat");
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  // Select existing ticket
  const handleSelectTicket = async (ticketId: string) => {
    setCurrentTicketId(ticketId);
    setActiveTab("chat");
    setLoadingMessages(true);
    await fetchMessages(ticketId);
    setLoadingMessages(false);
    scrollToBottom();
  };

  // Send restore email link
  const handleRequestRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreEmail.trim() || restoring) return;

    const conv = (posthog as any)?.conversations;
    if (!conv || typeof conv.requestRestoreLink !== "function") {
      toast.error("Restore service unavailable.");
      return;
    }

    setRestoring(true);
    try {
      await conv.requestRestoreLink(restoreEmail.trim());
      setRestoreSent(true);
      toast.success("Recovery link sent to your email.");
    } catch (err: any) {
      if (err.message?.includes("429") || err.message?.includes("Too many")) {
        toast.error("Too many recovery requests. Please wait a few minutes.");
      } else {
        toast.error(err.message || "Failed to send recovery link.");
      }
    } finally {
      setRestoring(false);
    }
  };

  // Don't show on full-screen auth / onboarding flows
  const isExcludedPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/verify" ||
    pathname === "/onboarding" ||
    pathname === "/create";

  if (!isAvailable || isExcludedPage) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <div className="fixed bottom-[8.5rem] right-4 md:bottom-[8.25rem] md:right-6 z-40 select-none font-sans">
          <button
            onClick={handleOpen}
            aria-label="Open support"
            title="Help & Support"
            className="group relative flex items-center justify-center size-11 sm:size-12 rounded-xl bg-card hover:bg-muted text-foreground border border-border hover:border-primary shadow-arcade active:translate-y-[2px] active:shadow-none transition-all duration-200 cursor-pointer"
          >
            {/* Solid Support Badge */}
            <span className="absolute -top-2.5 right-1/2 translate-x-1/2 px-1.5 py-0.5 bg-primary text-primary-foreground text-[8px] font-bold uppercase tracking-wider rounded-full shadow-xs whitespace-nowrap pointer-events-none ring-2 ring-background font-sans">
              Support
            </span>

            <div className="relative flex items-center justify-center">
              <LifeBuoy className="size-5.5 text-foreground group-hover:text-primary group-hover:scale-105 transition-all duration-200" />
              {unreadCount > 0 && (
                <span className="absolute -top-2.5 -right-2.5 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-background font-mono">
                  {unreadCount}
                </span>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Support Modal Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[60] font-sans">
          <div className="w-[360px] sm:w-[390px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-5rem)] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden origin-bottom-right animate-in fade-in-0 zoom-in-90 slide-in-from-bottom-5 duration-200 ease-out">
            {/* Flat Theme Header */}
            <div className="px-4 py-3 bg-card border-b border-border flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-2">
                <LifeBuoy className="size-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground tracking-tight">
                  Help & Support
                </h2>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (activeTab === "tickets") {
                      setActiveTab("chat");
                    } else {
                      setActiveTab("tickets");
                      loadTickets();
                    }
                  }}
                  title="Ticket History"
                  className={`size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${
                    activeTab === "tickets" ? "bg-muted text-foreground" : ""
                  }`}
                >
                  <History className="size-3.5" />
                </button>
                <button
                  onClick={handleStartNewTicket}
                  title="New Conversation"
                  className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Plus className="size-4" />
                </button>
                <button
                  onClick={handleClose}
                  title="Close"
                  className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-0.5"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Sub-bar for Tab Switching */}
            {activeTab !== "chat" && (
              <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border text-xs shrink-0 select-none">
                <button
                  onClick={() => setActiveTab("chat")}
                  className="text-primary hover:underline font-medium text-xs flex items-center gap-1"
                >
                  &larr; Back to Chat
                </button>
                <button
                  onClick={() => setActiveTab(activeTab === "tickets" ? "restore" : "tickets")}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  {activeTab === "tickets" ? "Restore by Email" : "All Tickets"}
                </button>
              </div>
            )}

            {/* TAB: TICKETS LIST */}
            {activeTab === "tickets" && (
              <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 bg-background">
                <div className="flex items-center justify-between px-1 pb-1 select-none">
                  <span className="text-xs font-medium text-muted-foreground">Your Tickets</span>
                  <button
                    onClick={loadTickets}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="size-3" /> Refresh
                  </button>
                </div>

                {loadingTickets ? (
                  <div className="h-40 flex items-center justify-center">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-12 px-4 space-y-3">
                    <MessageSquare className="size-8 text-muted-foreground/30 mx-auto" />
                    <p className="text-xs text-muted-foreground">No conversations yet.</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveTab("restore")}
                      className="text-xs rounded-lg"
                    >
                      <Mail className="size-3.5 mr-1.5" /> Restore Previous Tickets
                    </Button>
                  </div>
                ) : (
                  tickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleSelectTicket(t.id)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                        currentTicketId === t.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-semibold text-foreground">
                          #{t.id.slice(0, 8)}
                        </span>
                        <span className="text-[11px] text-muted-foreground capitalize">
                          {t.status}
                        </span>
                      </div>
                      <p className="text-xs text-foreground line-clamp-1 break-words [overflow-wrap:anywhere]">
                        {t.last_message || "No messages yet"}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2 font-mono">
                        <span>{new Date(t.created_at).toLocaleDateString()}</span>
                        <span>{t.message_count || 0} msgs</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: RESTORE TICKETS */}
            {activeTab === "restore" && (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-background">
                <div className="text-center space-y-1 pt-2">
                  <Mail className="size-8 text-muted-foreground/50 mx-auto" />
                  <h3 className="text-sm font-semibold text-foreground">Restore Tickets</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Enter the email address you used previously to receive a link restoring your
                    ticket history on this device.
                  </p>
                </div>

                {restoreSent ? (
                  <div className="p-4 rounded-lg bg-card border border-border text-center space-y-2">
                    <CheckCircle2 className="size-5 text-primary mx-auto" />
                    <p className="text-xs font-medium text-foreground">Link Sent</p>
                    <p className="text-xs text-muted-foreground">
                      Check your inbox at <strong>{restoreEmail}</strong> and click the link to
                      continue.
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setRestoreSent(false)}
                      className="text-xs mt-2"
                    >
                      Send another link
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleRequestRestore} className="space-y-3 pt-2">
                    <Input
                      type="email"
                      required
                      placeholder="Your email address"
                      value={restoreEmail}
                      onChange={(e) => setRestoreEmail(e.target.value)}
                      className="text-xs rounded-lg"
                    />
                    <Button
                      type="submit"
                      disabled={restoring || !restoreEmail.trim()}
                      className="w-full text-xs font-medium rounded-lg"
                    >
                      {restoring ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
                      Send Restore Link
                    </Button>
                  </form>
                )}
              </div>
            )}

            {/* TAB: ACTIVE CHAT */}
            {activeTab === "chat" && (
              <>
                {/* Messages Feed */}
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3.5 sm:p-4 space-y-3.5 bg-background">
                  {loadingMessages ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="space-y-4 py-2">
                      <div className="p-3.5 rounded-xl bg-card border border-border space-y-1.5 shadow-xs">
                        <p className="text-xs font-semibold text-foreground">
                          How can we help you today?
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Ask a question or report an issue. We will respond right here.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[11px] font-medium text-muted-foreground px-0.5">
                          Common Topics
                        </span>
                        <div className="space-y-1.5">
                          {QUICK_TOPICS.map((topic, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleSendMessage(topic)}
                              className="w-full text-left px-3 py-2.5 rounded-xl bg-card hover:bg-muted border border-border text-xs text-foreground font-normal transition-colors flex items-center justify-between cursor-pointer gap-2"
                            >
                              <span className="break-words [overflow-wrap:anywhere]">{topic}</span>
                              <ChevronRight className="size-3 text-muted-foreground shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isCustomer = msg.author_type === "customer";

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isCustomer ? "items-end" : "items-start"} space-y-1 w-full`}
                        >
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground px-1 max-w-full">
                            <span className="font-medium truncate">
                              {isCustomer ? "You" : msg.author_name || "Support"}
                            </span>
                            <span className="shrink-0">•</span>
                            <span className="font-mono text-[10px] shrink-0">
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div
                            className={`max-w-[85%] sm:max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed break-words [overflow-wrap:anywhere] select-text shadow-xs ${
                              isCustomer
                                ? "bg-primary text-primary-foreground rounded-br-xs font-sans"
                                : "bg-card border border-border text-foreground rounded-bl-xs font-sans"
                            }`}
                          >
                            <ChatMessageContent content={msg.content} isCustomer={isCustomer} />
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Inline Email Collection Prompt for Guest Users */}
                  {!session?.user?.email && messages.length > 0 && !emailSaved && (
                    <div className="p-3 rounded-lg bg-card border border-border space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">
                          Get replies by email
                        </span>
                        <button
                          type="button"
                          onClick={() => setEmailSaved(true)}
                          className="text-[10px] text-muted-foreground hover:text-foreground"
                        >
                          Dismiss
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Enter your email so our team can follow up even after you leave.
                      </p>
                      <form onSubmit={handleSaveEmail} className="flex items-center gap-1.5 pt-0.5">
                        <Input
                          type="email"
                          required
                          placeholder="your@email.com"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="h-7 text-xs bg-background rounded-lg"
                        />
                        <Button
                          type="submit"
                          size="sm"
                          className="h-7 text-xs px-3 rounded-lg font-medium"
                        >
                          Save
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* Confirmed notification chip */}
                  {!session?.user?.email && messages.length > 0 && emailSaved && userEmail && (
                    <div className="px-3 py-1.5 rounded-lg bg-muted/40 border border-border/50 text-[10px] text-muted-foreground flex items-center justify-between mt-1">
                      <span>
                        Email notifications:{" "}
                        <strong className="text-foreground">{userEmail}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setEmailSaved(false)}
                        className="text-primary hover:underline text-[10px]"
                      >
                        Change
                      </button>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Guest Email Field */}
                {!session?.user && messages.length === 0 && (
                  <div className="px-3 py-2 bg-card border-t border-border grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Name (Optional)"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="h-7 text-xs rounded-lg"
                    />
                    <Input
                      type="email"
                      placeholder="Email (Optional)"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="h-7 text-xs rounded-lg"
                    />
                  </div>
                )}

                {/* Input Area */}
                <div className="p-3 bg-card border-t border-border shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="relative flex items-center gap-2"
                  >
                    <Textarea
                      ref={textareaRef}
                      rows={1}
                      value={inputText}
                      placeholder="Type a message..."
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="min-h-[38px] max-h-[80px] resize-none text-xs py-2 px-3 rounded-lg bg-background border-border focus-visible:ring-1 focus-visible:ring-primary font-sans"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!inputText.trim() || sending}
                      className="size-8 rounded-lg bg-primary text-primary-foreground shrink-0 shadow-sm cursor-pointer"
                    >
                      {sending ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Send className="size-3.5" />
                      )}
                    </Button>
                  </form>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1.5 px-0.5">
                    <span>Enter to send</span>
                    {currentTicketId && (
                      <span className="font-mono">#{currentTicketId.slice(0, 8)}</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
