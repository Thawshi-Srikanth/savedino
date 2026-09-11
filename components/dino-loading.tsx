"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface DinoLoadingProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeMap = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

export const DinoLoading: React.FC<DinoLoadingProps> = ({
  size = "md",
  text,
  className,
  fullScreen = false,
}) => {
  const sizeClass = sizeMap[size] || sizeMap.md;

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 select-none bg-[#f8fafc] dark:bg-[#121315]",
        fullScreen ? "py-24 min-h-[60vh] w-full" : "py-6",
        className
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0 bg-[#f8fafc] dark:bg-[#121315]",
          sizeClass
        )}
      >
        {/* Light Mode Dino Animation (matches #f8fafc canvas) */}
        <img
          src="/light-dyno.gif"
          alt="Loading..."
          className="w-full h-full object-contain light-logo dark:hidden block select-none pointer-events-none"
        />
        {/* Dark Mode Dino Animation (matches #121315 canvas) */}
        <img
          src="/dark-dyno.gif"
          alt="Loading..."
          className="w-full h-full object-contain dark-logo dark:block hidden select-none pointer-events-none"
        />
      </div>

      {text && (
        <span className="text-xs font-mono text-muted-foreground text-center animate-pulse">
          {text}
        </span>
      )}
    </div>
  );

  return content;
};
