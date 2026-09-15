"use client";

import React from "react";
import Link from "next/link";
import { X } from "lucide-react";

interface LogoProps {
  className?: string;
  href?: string;
  size?: "sm" | "md" | "lg";
  showEarlyAccess?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  href = "/",
  size = "md",
  showEarlyAccess = false,
}) => {
  const sizeClasses = {
    sm: "h-6 sm:h-7",
    md: "h-7 sm:h-8",
    lg: "h-9 sm:h-10",
  }[size];

  const sedsSizeClasses = {
    sm: "h-5 sm:h-6",
    md: "h-6 sm:h-7",
    lg: "h-8 sm:h-9",
  }[size];

  const xIconSizes = {
    sm: "size-2.5",
    md: "size-3 sm:size-3.5",
    lg: "size-3.5 sm:size-4",
  }[size];

  const badgePosition = {
    sm: "-bottom-3.5 left-0.5 text-[7.5px] sm:text-[8px] px-1.5 py-[1px]",
    md: "-bottom-4 left-0.5 text-[8px] sm:text-[8.5px] px-1.5 py-[1px]",
    lg: "-bottom-5 left-1 text-[9px] sm:text-[10px] px-2 py-0.5",
  }[size];

  const content = (
    <div className={`relative inline-flex flex-col items-start select-none ${className}`}>
      {/* Logos Row */}
      <div className="inline-flex items-center gap-1.5 sm:gap-2">
        {/* SaveDino Main Logo */}
        <div className="inline-flex items-center">
          {/* Light Mode Logo */}
          <img
            src="/light-mode.png"
            alt="SaveDino"
            className={`${sizeClasses} w-auto object-contain light-logo`}
          />
          {/* Dark Mode Logo */}
          <img
            src="/dark-mode.png"
            alt="SaveDino"
            className={`${sizeClasses} w-auto object-contain dark-logo`}
          />
        </div>

        {/* Collaboration 'X' Mark */}
        <X className={`${xIconSizes} text-muted-foreground/60 shrink-0`} strokeWidth={2.5} />

        {/* SEDS Logo */}
        <div className="inline-flex items-center">
          {/* Light Mode SEDS Logo */}
          <img
            src="/seds-light.png"
            alt="SEDS"
            className={`${sedsSizeClasses} w-auto object-contain light-logo`}
          />
          {/* Dark Mode SEDS Logo */}
          <img
            src="/seds-dark.png"
            alt="SEDS"
            className={`${sedsSizeClasses} w-auto object-contain dark-logo`}
          />
        </div>
      </div>

      {/* Floating Early Access Sub-Badge attached directly below the Logo */}
      {showEarlyAccess && (
        <span
          className={`absolute ${badgePosition} inline-flex items-center gap-1 rounded-full font-sans font-bold bg-primary text-primary-foreground shadow-xs tracking-wider uppercase whitespace-nowrap pointer-events-none select-none`}
        >
          <span className="size-1 sm:size-1.5 rounded-full bg-primary-foreground animate-pulse" />
          Early Access
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        prefetch={false}
        className="inline-flex items-center group cursor-pointer focus:outline-hidden"
      >
        {content}
      </Link>
    );
  }

  return content;
};
