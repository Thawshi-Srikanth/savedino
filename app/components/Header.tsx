"use client";

import React from "react";

interface HeaderProps {
  onOpenHelp: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isNight?: boolean;
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHelp,
  isMuted,
  onToggleMute,
  isNight = false,
  onToggleTheme,
}) => {
  const textColor = isNight ? "text-[#e8eaed]" : "text-[#535353]";
  const borderColor = isNight ? "border-[#80868b]" : "border-[#535353]";

  return (
    <header className="w-full relative px-3 py-2 sm:px-12 sm:py-6 flex flex-col items-center select-none transition-colors duration-700">
      {/* Top Navigation Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between">
        {/* Top Left Badge - Custom Project Branding */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 font-sans font-bold text-xs tracking-wider uppercase transition-colors duration-700 ${textColor}`}>
            {/* Dino Egg / Beaker Icon */}
            <svg
              className="w-4 h-4 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C8 2 4 7 4 13c0 5 3.5 9 8 9s8-4 8-9c0-6-4-11-8-11zm0 18c-3.3 0-6-3.1-6-7 0-4.2 2.7-8.7 6-8.9 3.3.2 6 4.7 6 8.9 0 3.9-2.7 7-6 7z" />
            </svg>
            <span>SAVE DINO</span>
          </div>
          <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 border rounded-full font-mono transition-colors duration-700 ${borderColor} ${textColor}`}>
            EXPERIMENT
          </span>
        </div>

        {/* Top Right Controls: Theme Toggle, Sound Toggle & Help */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button (Icon only) */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors duration-700 focus:outline-hidden cursor-pointer ${borderColor} ${textColor} ${
                isNight ? "hover:bg-[#333]" : "hover:bg-gray-200"
              }`}
              title={isNight ? "Switch to Day Mode" : "Switch to Night Mode"}
            >
              {isNight ? (
                /* Pixel Moon Icon */
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16" shapeRendering="crispEdges">
                  <path d="M6 1h2v1H6V1zm2 1h2v2H8V2zm2 2h1v2h-1V4zm1 2h1v4h-1V6zm-1 4h-1v2h1v-2zm-2 2H6v-1h2v1zm-2 0H4v-1h2v1zm-2-1H3v-2h1v2zm-1-2H1V7h1v2zm0-2h1V4H2v1z" />
                </svg>
              ) : (
                /* Pixel Sun Icon */
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16" shapeRendering="crispEdges">
                  <path d="M7 0h2v2H7V0zm0 14h2v2H7v-2zM0 7h2v2H0V7zm14 0h2v2h-2V7zm-2-5h2v2h-2V2zM2 12h2v2H2v-2zm10 0h2v2h-2v-2zM2 2h2v2H2V2zm3 3h6v6H5V5z" />
                </svg>
              )}
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="p-1.5 bg-transparent border-0 shadow-none hover:opacity-75 active:scale-90 transition-all focus:outline-hidden cursor-pointer"
            title={isMuted ? "Unmute Music & Sound" : "Mute Music & Sound"}
          >
            <img
              src={isMuted ? "/sound-off.png" : "/sound-on.png"}
              alt={isMuted ? "Sound Off" : "Sound On"}
              className="w-5 h-5 object-contain"
            />
          </button>

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold transition-colors duration-700 focus:outline-hidden cursor-pointer ${borderColor} ${textColor} ${
              isNight ? "hover:bg-[#333]" : "hover:bg-gray-200"
            }`}
            title="Help / How to Play"
          >
            ?
          </button>
        </div>
      </div>

      {/* Floating Sound Controls Container (Desktop only to prevent cluttering mobile gameplay) */}
      <div className="sound-controls-container hidden md:block fixed bottom-6 right-6 z-50">
        <button
          onClick={onToggleMute}
          className="p-2 bg-transparent border-0 shadow-none hover:scale-110 active:scale-90 transition-all focus:outline-hidden cursor-pointer"
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          <img
            src={isMuted ? "/sound-off.png" : "/sound-on.png"}
            alt={isMuted ? "Sound Off" : "Sound On"}
            className="w-8 h-8 object-contain"
          />
        </button>
      </div>
    </header>
  );
};
