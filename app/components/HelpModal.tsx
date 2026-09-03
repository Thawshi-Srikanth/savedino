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
          className="absolute top-4 right-4 text-xl font-bold hover:opacity-70 focus:outline-hidden"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-gray-700">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
            <span className="font-pixel text-xs">🦖</span>
          </div>
          <div>
            <h2 className="font-pixel text-sm uppercase tracking-wide text-gray-900 dark:text-gray-100">
              Save Dino: Asteroid Challenge
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              How to Play & Survival Guide
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="mt-4 space-y-4 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
          <div>
            <h3 className="font-pixel text-[11px] font-bold uppercase text-gray-900 dark:text-gray-100 mb-1">
              🎯 Objective
            </h3>
            <p>
              An extinction level meteorite event is hitting earth! Help Save the Dino by dodging incoming sky meteorites, ground craters, cacti, and flying pterodactyls. Reach the highest score possible!
            </p>
          </div>

          <div>
            <h3 className="font-pixel text-[11px] font-bold uppercase text-gray-900 dark:text-gray-100 mb-1">
              🎮 Controls
            </h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="rounded-md bg-gray-100 p-2.5 dark:bg-gray-800">
                <span className="font-pixel text-[10px] block font-bold text-gray-900 dark:text-gray-100">SPACE / UP ARROW</span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">Jump / Start Game</span>
              </div>
              <div className="rounded-md bg-gray-100 p-2.5 dark:bg-gray-800">
                <span className="font-pixel text-[10px] block font-bold text-gray-900 dark:text-gray-100">DOWN ARROW</span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">Crouch / Fast Drop</span>
              </div>
              <div className="rounded-md bg-gray-100 p-2.5 dark:bg-gray-800 col-span-2">
                <span className="font-pixel text-[10px] block font-bold text-gray-900 dark:text-gray-100">MOBILE / TOUCH</span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">Tap screen or on-screen touch buttons for jump and crouch.</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-pixel text-[11px] font-bold uppercase text-gray-900 dark:text-gray-100 mb-1">
              ☄️ Asteroid Hazards
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li><strong>Diagonal Meteors:</strong> Descend from the sky. Jump or duck depending on meteor trajectory!</li>
              <li><strong>Impact Craters:</strong> Watch for red target markers on land 1 second before meteor impact.</li>
              <li><strong>Pterodactyls & Cacti:</strong> Classic obstacles appear alongside meteorite showers.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 text-center border-t border-gray-200 pt-4 dark:border-gray-700">
          <button
            onClick={onClose}
            className="rounded-md border-2 border-[#535353] bg-black px-6 py-2 font-pixel text-xs text-white hover:bg-gray-800 active:translate-y-0.5 transition-transform dark:border-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            SAVE THE DINO
          </button>
        </div>
      </div>
    </div>
  );
};
