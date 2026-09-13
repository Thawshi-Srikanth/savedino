"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { X, ShieldAlert, Rocket, Target } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-fade-in select-none">
      <div className="relative w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-xl border border-border bg-card p-4 sm:p-6 shadow-2xl text-card-foreground">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Close modal"
        >
          <X className="size-4" />
        </Button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8b5cf6] text-white">
            <Rocket className="size-5" />
          </div>
          <div>
            <h2 className="font-pixel text-xs sm:text-sm uppercase tracking-wide text-foreground">
              Save Dino: Asteroid Defense
            </h2>
            <p className="font-mono text-xs text-muted-foreground mt-0.5">
              Mission Guide & Tactics
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="mt-4 space-y-4 text-xs font-mono leading-relaxed text-foreground">
          <div>
            <h3 className="font-pixel text-[10px] font-bold uppercase text-[#8b5cf6] mb-1">
              [+] Mission Objective
            </h3>
            <p className="text-muted-foreground">
              Meteors are plunging into Earth! Help Save the Dino by blasting falling asteroids with
              your Laser Cannon or leaping over them to survive.
            </p>
          </div>

          <div>
            <h3 className="font-pixel text-[10px] font-bold uppercase text-[#8b5cf6] mb-1">
              [&gt;] Controls
            </h3>
            <div className="grid grid-cols-2 gap-2.5 mt-2">
              <div className="rounded-xl border border-border bg-muted/40 p-3 flex items-center justify-between">
                <div>
                  <span className="font-sans text-xs block font-bold text-foreground">
                    SPACEBAR
                  </span>
                  <span className="text-[11px] text-muted-foreground font-sans">Laser Cannon</span>
                </div>
                <kbd className="px-2 py-1 text-[11px] font-mono font-bold bg-card text-foreground border border-border rounded shadow-arcade-xs select-none">
                  SPACE
                </kbd>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-3 flex items-center justify-between">
                <div>
                  <span className="font-sans text-xs block font-bold text-foreground">
                    UP ARROW (x2)
                  </span>
                  <span className="text-[11px] text-muted-foreground font-sans">
                    Jump / Double Jump
                  </span>
                </div>
                <kbd className="px-2 py-1 text-[11px] font-mono font-bold bg-card text-foreground border border-border rounded shadow-arcade-xs select-none">
                  &uarr; UP
                </kbd>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-3 col-span-2">
                <span className="font-sans text-xs block font-bold text-foreground">
                  TOUCH CONTROLS (MOBILE)
                </span>
                <span className="text-[11px] text-muted-foreground font-sans">
                  Tap JUMP button (tap again in air for Double Jump) and BLAST button, or tap
                  left/right canvas sides.
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-pixel text-[10px] font-bold uppercase text-[#8b5cf6] mb-1">
              [!] Asteroid Classes
            </h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>
                <strong className="text-foreground">Small Meteors:</strong> Fast and agile (+50
                pts).
              </li>
              <li>
                <strong className="text-foreground">Medium Meteors:</strong> Standard pace and
                weight (+40 pts).
              </li>
              <li>
                <strong className="text-foreground">Giant Meteors:</strong> Slow, massive craters
                with heavy screen tremors (+30 pts).
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 text-center border-t border-border pt-4 flex justify-center">
          <Button
            onClick={onClose}
            size="default"
            variant="default"
            className="font-sans text-xs font-bold uppercase tracking-wider px-6 h-9 shadow-arcade-primary active:translate-y-0.5 cursor-pointer"
          >
            Start Mission
          </Button>
        </div>
      </div>
    </div>
  );
};
