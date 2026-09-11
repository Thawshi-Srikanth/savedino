"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2 } from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton
      icons={{
        success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
        info: <Info className="w-4 h-4 text-sky-400 shrink-0" />,
        warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
        error: <AlertCircle className="w-4 h-4 text-destructive shrink-0" />,
        loading: <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl font-sans text-xs select-none p-4 gap-3",
          title: "font-sans font-semibold text-xs text-foreground",
          description:
            "group-[.toast]:text-muted-foreground font-sans text-[11px] mt-0.5 leading-relaxed",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-sans font-bold text-xs rounded-lg px-3 py-1.5 shadow-arcade-primary active:translate-y-0.5 transition-transform",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-sans text-xs rounded-lg px-3 py-1.5",
          closeButton:
            "group-[.toast]:bg-card group-[.toast]:text-muted-foreground group-[.toast]:hover:text-foreground group-[.toast]:border-border group-[.toast]:rounded-lg",
          success: "group-[.toaster]:border-emerald-500/30 group-[.toaster]:bg-card",
          error: "group-[.toaster]:border-destructive/30 group-[.toaster]:bg-card",
          info: "group-[.toaster]:border-sky-500/30 group-[.toaster]:bg-card",
          warning: "group-[.toaster]:border-amber-500/30 group-[.toaster]:bg-card",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
