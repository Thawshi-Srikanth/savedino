"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Shield,
  Crown,
  UserCheck,
  Clock,
  User,
  LogOut,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Sparkles,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { authClient, signOut } from "@/lib/auth-client";
import { PixelAvatar } from "@/components/pixel-avatar";

interface Persona {
  id: string;
  name: string;
  email: string;
  role: string;
  institution?: string;
  category: "admin" | "staff" | "leader" | "member" | "applicant" | "solo";
  contextLabel: string;
  isCurrent: boolean;
  order: number;
}

export function DevPersonaSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchPersonas = async () => {
    try {
      const res = await fetch("/api/dev/personas");
      if (res.ok) {
        const data = await res.json();
        setPersonas(data.personas || []);
        setCurrentSession(data.currentSession || null);
      }
    } catch (err) {
      console.error("Failed to load dev personas", err);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  const handleSwitch = async (email: string, name: string) => {
    setLoading(true);
    try {
      const currentPath = window.location.pathname + window.location.search;
      const res = await fetch("/api/dev/switch-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, callbackURL: currentPath }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to switch persona");
      }

      const data = await res.json();
      toast.success(`Switched active persona to ${name}`);

      if (data.verifyUrl) {
        window.location.href = data.verifyUrl;
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to switch persona");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      toast.info("Logged out to Guest Mode");
      window.location.href = "/";
    } catch (err: any) {
      toast.error("Failed to logout");
      setLoading(false);
    }
  };

  const handleResetDb = async () => {
    if (!confirm("Reset and re-seed database with clean test data?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/dev/seed", { method: "POST" });
      if (!res.ok) throw new Error("Seed failed");
      toast.success("Database reset and re-seeded successfully!");
      await fetchPersonas();
      window.location.reload();
    } catch (e: any) {
      toast.error(e.message || "Failed to reset database");
    } finally {
      setLoading(false);
    }
  };

  const currentPersona = personas.find((p) => p.isCurrent);

  const getCategoryTheme = (category: Persona["category"]) => {
    switch (category) {
      case "admin":
        return {
          icon: <ShieldCheck className="w-3.5 h-3.5 text-violet-500" />,
          badge: "bg-[#8b5cf6] text-white border border-[#7c3aed] font-bold shadow-xs",
          ring: "ring-violet-500",
        };
      case "staff":
        return {
          icon: <Shield className="w-3.5 h-3.5 text-sky-500" />,
          badge: "bg-[#0284c7] text-white border border-[#0369a1] font-bold shadow-xs",
          ring: "ring-sky-500",
        };
      case "leader":
        return {
          icon: <Crown className="w-3.5 h-3.5 text-emerald-500" />,
          badge: "bg-[#10b981] text-white border border-[#059669] font-bold shadow-xs",
          ring: "ring-emerald-500",
        };
      case "member":
        return {
          icon: <UserCheck className="w-3.5 h-3.5 text-indigo-500" />,
          badge: "bg-[#6366f1] text-white border border-[#4f46e5] font-bold shadow-xs",
          ring: "ring-indigo-500",
        };
      case "applicant":
        return {
          icon: <Clock className="w-3.5 h-3.5 text-amber-500" />,
          badge: "bg-[#f59e0b] text-slate-950 border border-[#d97706] font-bold shadow-xs",
          ring: "ring-amber-500",
        };
      default:
        return {
          icon: <User className="w-3.5 h-3.5 text-slate-400" />,
          badge: "bg-[#475569] text-white border border-[#334155] font-bold shadow-xs",
          ring: "ring-slate-500",
        };
    }
  };

  const renderPersonaRow = (persona: Persona) => {
    const isActive = persona.isCurrent;
    const theme = getCategoryTheme(persona.category);

    return (
      <button
        key={persona.id}
        disabled={loading}
        onClick={() => handleSwitch(persona.email, persona.name)}
        className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between cursor-pointer group ${
          isActive
            ? "bg-violet-500/10 dark:bg-violet-500/15 border border-violet-500/30 shadow-arcade-primary"
            : "hover:bg-muted/70 border border-transparent hover:border-border active:translate-y-0.5"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div className="relative shrink-0">
            <PixelAvatar
              seed={(persona as any).image || persona.name || persona.email}
              size={28}
              showBorder={false}
            />
            {isActive && (
              <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center">
                <CheckCircle2 className="w-2 h-2 text-white" />
              </span>
            )}
          </div>
          <div className="min-w-0 truncate">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-foreground truncate">{persona.name}</span>
            </div>
            <div className="text-[10px] font-mono text-muted-foreground truncate">
              {persona.email}
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1.5">
          <span
            className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-md border whitespace-nowrap ${theme.badge}`}
          >
            {persona.contextLabel}
          </span>
        </div>
      </button>
    );
  };

  return (
    <aside
      aria-label="Dev Persona Switcher"
      className="fixed bottom-4 left-4 z-50 font-sans select-none"
    >
      {/* Expanded Switcher Card */}
      {isOpen && (
        <div className="mb-2.5 w-88 bg-white dark:bg-[#1c1d21] border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
          {/* Header Bar */}
          <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-[#16171a] border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20">
                <Zap className="w-3 h-3" />
              </div>
              <span className="text-xs font-bold tracking-tight text-foreground">
                Role Persona Switcher
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#8b5cf6] text-white border border-[#7c3aed] shadow-xs">
              DEV MODE
            </span>
          </div>

          {/* Personas List */}
          <div className="max-h-76 overflow-y-auto p-2 space-y-1.5">
            {personas.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No personas found. Click Reset DB below.
              </div>
            ) : (
              personas.map(renderPersonaRow)
            )}
          </div>

          {/* Action Toolbar */}
          <div className="p-2 border-t border-border bg-slate-50/50 dark:bg-[#16171a]/50 flex gap-2">
            <button
              onClick={handleLogout}
              disabled={loading || !currentSession}
              className="flex-1 h-8 px-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border shadow-arcade-xs active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
            <button
              onClick={handleResetDb}
              disabled={loading}
              title="Wipe and re-seed clean test data"
              className="h-8 px-3 rounded-xl text-xs font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 border border-violet-500/20 shadow-arcade-xs active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Reset DB</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Pill Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-2 bg-white/95 dark:bg-[#1c1d21]/95 hover:bg-white dark:hover:bg-[#1c1d21] backdrop-blur-md border border-border rounded-2xl shadow-lg hover:shadow-xl active:translate-y-0.5 transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
          </div>

          {currentPersona ? (
            <div className="flex items-center gap-2 max-w-[210px] truncate">
              <PixelAvatar
                seed={(currentPersona as any).image || currentPersona.name || currentPersona.email}
                size={20}
                showBorder={false}
              />
              <span className="font-bold text-xs text-foreground truncate">
                {currentPersona.name}
              </span>
              <span
                className={`text-[9px] font-sans font-bold px-2 py-0.5 rounded-md border truncate ${
                  getCategoryTheme(currentPersona.category).badge
                }`}
              >
                {currentPersona.contextLabel}
              </span>
            </div>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">
              Guest Mode (Logged Out)
            </span>
          )}
        </div>

        <div className="pl-1 border-l border-border text-muted-foreground group-hover:text-foreground">
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </div>
      </button>
    </aside>
  );
}
