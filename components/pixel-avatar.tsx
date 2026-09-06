"use client";

import React, { useMemo } from "react";
import { generateSeedProfile } from "@/lib/seed-avatar";

interface PixelAvatarProps {
  seed?: string | null;
  size?: number;
  className?: string;
  showBorder?: boolean;
}

/**
 * PixelAvatar - Crisp 8-bit Symmetrical Space Pixel Avatar
 */
export const PixelAvatar: React.FC<PixelAvatarProps> = ({
  seed,
  size = 40,
  className = "",
  showBorder = true,
}) => {
  const profile = useMemo(() => generateSeedProfile(seed), [seed]);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-xl overflow-hidden transition-all duration-300 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: profile.bgHex,
        border: showBorder ? `1.5px solid ${profile.borderColor}` : undefined,
        boxShadow: showBorder ? `0 2px 0 0 ${profile.borderColor}` : undefined,
      }}
      title={`${profile.characterName} • ${profile.colorSchemeName}`}
    >
      <svg
        viewBox="0 0 8 8"
        width="100%"
        height="100%"
        className="w-full h-full p-[10%]"
        style={{
          shapeRendering: "crispEdges",
          imageRendering: "pixelated",
        }}
      >
        {profile.matrix.map((row, rIdx) =>
          row.map((cell, cIdx) => {
            if (cell === 0) return null;
            const fill = cell === 2 ? profile.accentHex : profile.fgHex;
            return (
              <rect
                key={`${rIdx}-${cIdx}`}
                x={cIdx}
                y={rIdx}
                width={1}
                height={1}
                fill={fill}
              />
            );
          })
        )}
      </svg>
    </div>
  );
};

interface PixelBannerProps {
  seed?: string | null;
  className?: string;
  children?: React.ReactNode;
}

/**
 * PixelBanner - Character-driven Arcade Hero Banner
 */
export const PixelBanner: React.FC<PixelBannerProps> = ({
  seed,
  className = "",
  children,
}) => {
  const profile = useMemo(() => generateSeedProfile(seed), [seed]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-border p-6 transition-all duration-500 ${className}`}
      style={{
        background: `linear-gradient(135deg, ${profile.bgGradient[0]} 0%, ${profile.bgGradient[1]} 100%)`,
        borderColor: profile.borderColor,
      }}
    >
      {/* Subtle Background Stars Grid Pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${profile.fgHex} 1px, transparent 1px)`,
          backgroundSize: "16px 16px",
        }}
      />

      {/* Decorative Corner Sparkles */}
      <div
        className="absolute top-3 right-4 size-2 animate-pulse pointer-events-none"
        style={{ backgroundColor: profile.fgHex }}
      />
      <div
        className="absolute top-6 right-10 size-1 pointer-events-none"
        style={{ backgroundColor: profile.accentHex }}
      />
      <div
        className="absolute bottom-4 left-6 size-1.5 pointer-events-none"
        style={{ backgroundColor: profile.fgHex }}
      />

      {/* Content Container */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

interface AvatarTagProps {
  seed?: string | null;
  className?: string;
}

/**
 * AvatarTag - Displays character name and color palette indicator
 */
export const AvatarTag: React.FC<AvatarTagProps> = ({ seed, className = "" }) => {
  const profile = useMemo(() => generateSeedProfile(seed), [seed]);

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-sans font-bold select-none ${className}`}
      style={{
        backgroundColor: profile.bgHex,
        borderColor: profile.borderColor,
        color: "#ffffff",
      }}
      title={`${profile.characterName} • ${profile.colorSchemeName}`}
    >
      <span
        className="size-2 rounded-full inline-block shrink-0"
        style={{ backgroundColor: profile.fgHex }}
      />
      <span className="text-white font-medium">{profile.characterName}</span>
      <span className="text-white/40">•</span>
      <span className="text-white/80 font-normal">{profile.colorSchemeName}</span>
    </div>
  );
};
