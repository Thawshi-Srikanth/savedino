"use client";

import React from "react";

interface HeaderProps {
  onOpenHelp: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHelp,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="w-full relative px-6 py-6 sm:px-12 sm:py-8 flex flex-col items-center select-none">
      {/* Top Navigation Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between">
        {/* Top Left Badge - Custom Project Branding */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-sans font-bold text-xs tracking-wider uppercase text-[#535353]">
            {/* Dino Egg / Beaker Icon */}
            <svg
              className="w-4 h-4 fill-current text-[#535353]"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C8 2 4 7 4 13c0 5 3.5 9 8 9s8-4 8-9c0-6-4-11-8-11zm0 18c-3.3 0-6-3.1-6-7 0-4.2 2.7-8.7 6-8.9 3.3.2 6 4.7 6 8.9 0 3.9-2.7 7-6 7z" />
            </svg>
            <span>SAVE DINO</span>
          </div>
          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 border border-[#535353] rounded-full text-[#535353] font-mono">
            EXPERIMENT
          </span>
        </div>

        {/* Top Right Help Icon */}
        <button
          onClick={onOpenHelp}
          className="w-7 h-7 rounded-full border border-[#535353] flex items-center justify-center text-xs font-bold text-[#535353] hover:bg-gray-300 transition-colors focus:outline-hidden"
          title="Help / How to Play"
        >
          ?
        </button>
      </div>

      {/* Floating Sound Controls Container (Matching .sound-controls-container in exact CSS!) */}
      <div className="sound-controls-container fixed bottom-6 right-6 z-50">
        <button
          onClick={onToggleMute}
          className="w-10 h-10 rounded-full border-2 border-[#535353] bg-[#e5e7eb] flex items-center justify-center text-[#535353] shadow-md hover:scale-105 active:scale-95 transition-all focus:outline-hidden"
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? (
            <svg className="w-5 h-5 fill-current text-red-500" viewBox="0 0 24 24">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 fill-current text-[#535353]" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};
