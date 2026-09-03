"use client";

import React from "react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in select-none">
      <div className="relative w-full max-w-lg rounded-xl border-2 border-[#535353] bg-white p-6 shadow-[6px_6px_0px_#535353] dark:bg-[#1e1e1e] dark:border-[#888] dark:shadow-[6px_6px_0px_#888]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-sm font-pixel font-bold hover:opacity-70 focus:outline-hidden"
          aria-label="Close modal"
        >
          [X]
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-gray-700">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
            {/* Pixel Dino Beaker Icon */}
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              shapeRendering="crispEdges"
            >
              <path d="M12 2C8 2 4 7 4 13c0 5 3.5 9 8 9s8-4 8-9c0-6-4-11-8-11zm0 18c-3.3 0-6-3.1-6-7 0-4.2 2.7-8.7 6-8.9 3.3.2 6 4.7 6 8.9 0 3.9-2.7 7-6 7z" />
            </svg>
          </div>
          <div>
            <h2 className="font-pixel text-xs sm:text-sm uppercase tracking-wide text-gray-900 dark:text-gray-100">
              Save Dino: Asteroid Defense
            </h2>
            <p className="font-tech text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Mission Guide & Tactics
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="mt-4 space-y-4 text-xs font-tech leading-relaxed text-gray-700 dark:text-gray-300">
          <div>
            <h3 className="font-pixel text-[10px] font-bold uppercase text-gray-900 dark:text-gray-100 mb-1">
              [+] Mission Objective
            </h3>
            <p>
              Meteors are plunging into Earth! Help Save the Dino by blasting falling asteroids with your Laser Cannon or leaping over them to survive.
            </p>
          </div>

          <div>
            <h3 className="font-pixel text-[10px] font-bold uppercase text-gray-900 dark:text-gray-100 mb-1">
              [&gt;] Controls
            </h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="rounded-md bg-gray-100 p-2.5 dark:bg-gray-800 flex items-center justify-between">
                <div>
                  <span className="font-pixel text-[9px] block font-bold text-gray-900 dark:text-gray-100">SPACEBAR</span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">Laser</span>
                </div>
                <span
                  className="inline-block flex-shrink-0"
                  style={{
                    width: "32px",
                    height: "16px",
                    backgroundImage: "url('/Keyboard-Extras.png')",
                    backgroundPosition: "-64px -32px",
                    backgroundRepeat: "no-repeat",
                    imageRendering: "pixelated",
                  }}
                  title="SPACEBAR"
                />
              </div>
              <div className="rounded-md bg-gray-100 p-2.5 dark:bg-gray-800 flex items-center justify-between">
                <div>
                  <span className="font-pixel text-[9px] block font-bold text-gray-900 dark:text-gray-100">UP ARROW</span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">Jump / Mid-air</span>
                </div>
                <span
                  className="inline-block flex-shrink-0"
                  style={{
                    width: "16px",
                    height: "16px",
                    backgroundImage: "url('/Keyboard-Letter.png')",
                    backgroundPosition: "0px 0px",
                    backgroundRepeat: "no-repeat",
                    imageRendering: "pixelated",
                  }}
                  title="UP ARROW"
                />
              </div>
              <div className="rounded-md bg-gray-100 p-2.5 dark:bg-gray-800 col-span-2">
                <span className="font-pixel text-[9px] block font-bold text-gray-900 dark:text-gray-100">TOUCH CONTROLS</span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">Tap on-screen JUMP and BLAST buttons.</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-pixel text-[10px] font-bold uppercase text-gray-900 dark:text-gray-100 mb-1">
              [!] Asteroid Classes
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li><strong>Small Meteors:</strong> Fast and agile. Requires sharp reaction timing (+50 pts).</li>
              <li><strong>Medium Meteors:</strong> Standard pace and weight (+40 pts).</li>
              <li><strong>Giant Meteors:</strong> Slow, massive craters with heavy screen tremors (+30 pts).</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 text-center border-t border-gray-200 pt-4 dark:border-gray-700">
          <button
            onClick={onClose}
            className="rounded-md border-2 border-[#535353] bg-black px-6 py-2 font-pixel text-xs text-white hover:bg-gray-800 active:translate-y-0.5 transition-transform dark:border-white dark:bg-white dark:text-black dark:hover:bg-gray-200 cursor-pointer"
          >
            START MISSION
          </button>
        </div>
      </div>
    </div>
  );
};
