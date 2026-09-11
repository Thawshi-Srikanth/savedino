"use client";

import React from "react";
import Link from "next/link";
import { X } from "lucide-react";

interface LogoProps {
  className?: string;
  href?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo: React.FC<LogoProps> = ({ className = "", href = "/", size = "md" }) => {
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

  const content = (
    <div className={`inline-flex items-center gap-1.5 sm:gap-2 select-none ${className}`}>
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
