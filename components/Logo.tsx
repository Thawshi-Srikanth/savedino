"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  href?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  href = "/",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-6 sm:h-7",
    md: "h-7 sm:h-8",
    lg: "h-9 sm:h-10",
  }[size];

  const content = (
    <div className={`inline-flex items-center select-none ${className}`}>
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
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center group cursor-pointer focus:outline-hidden">
        {content}
      </Link>
    );
  }

  return content;
};
