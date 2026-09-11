"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DateTimeInputProps {
  value?: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export const DateTimeInput: React.FC<DateTimeInputProps> = ({
  value = "",
  onChange,
  disabled = false,
  className,
  label,
}) => {
  return (
    <div className={cn("flex flex-col space-y-1.5 w-full font-mono text-xs", className)}>
      {label && <span className="text-xs font-bold text-foreground">{label}</span>}
      <input
        type="datetime-local"
        value={value || ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-xs font-mono text-foreground shadow-arcade transition-all cursor-pointer",
          "hover:border-[#8b5cf6]/60 focus:border-[#8b5cf6] focus:outline-hidden focus:ring-2 focus:ring-[#8b5cf6]/30",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      />
    </div>
  );
};

DateTimeInput.displayName = "DateTimeInput";
