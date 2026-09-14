"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, X, HelpCircle, Check } from "lucide-react";

export interface TourStep {
  desktopTargetId: string;
  mobileTargetId: string;
  title: string;
  description: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    desktopTargetId: "tour-desktop-campaigns",
    mobileTargetId: "tour-mobile-campaigns",
    title: "Campaigns",
    description:
      "This is where active and upcoming asteroid search campaigns are listed. You can view schedules, image sets, and open registration windows.",
  },
  {
    desktopTargetId: "tour-desktop-teams",
    mobileTargetId: "tour-mobile-teams",
    title: "Squads",
    description:
      "Join or create a discovery squad with your friends. You can also match with other citizen scientists looking for teammates.",
  },
  {
    desktopTargetId: "tour-desktop-profile",
    mobileTargetId: "tour-mobile-profile",
    title: "Profile & Certificates",
    description:
      "View your discovery stats, track submitted observation reports, and download your official participation certificates.",
  },
  {
    desktopTargetId: "tour-desktop-arcade",
    mobileTargetId: "tour-mobile-arcade",
    title: "Arcade Game",
    description:
      "Test your reflexes dodging and blasting meteors in the retro SaveDino arcade game whenever you want a quick break.",
  },
];

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  isBottomDocked?: boolean;
}

export function PlatformTourGuide({
  isOpenOverride,
  onCloseOverride,
}: {
  isOpenOverride?: boolean;
  onCloseOverride?: () => void;
}) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Auto-launch tour once for new users
  useEffect(() => {
    if (typeof isOpenOverride === "boolean") {
      setIsOpen(isOpenOverride);
      return;
    }

    if (!session?.user?.id) return;

    const storageKey = `savedino_tour_seen_${session.user.id}`;
    const hasSeen = localStorage.getItem(storageKey);

    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [session?.user?.id, isOpenOverride]);

  const updatePosition = useCallback(() => {
    if (!isOpen) return;

    const step = TOUR_STEPS[currentStep];
    if (!step) return;

    const isMobile = window.innerWidth < 768;
    const targetId = isMobile ? step.mobileTargetId : step.desktopTargetId;

    let el = document.getElementById(targetId);

    // Fallback if mobile/desktop ID not found
    if (!el) {
      el =
        document.getElementById(step.desktopTargetId) ||
        document.getElementById(step.mobileTargetId);
    }

    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          isBottomDocked: isMobile || targetId === "tour-desktop-arcade",
        });
        return;
      }
    }

    setTargetRect(null);
  }, [isOpen, currentStep]);

  useEffect(() => {
    updatePosition();

    const handleResize = () => updatePosition();
    const handleScroll = () => updatePosition();

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [updatePosition]);

  const handleClose = () => {
    if (session?.user?.id) {
      localStorage.setItem(`savedino_tour_seen_${session.user.id}`, "true");
    }
    setIsOpen(false);
    setCurrentStep(0);
    if (onCloseOverride) {
      onCloseOverride();
    }
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Keyboard support (Escape / Arrow keys)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  // Responsive Box Positioning
  let popoverStyle: React.CSSProperties = {};
  let pointerPosition: { side: "top" | "bottom"; arrowLeft: number } | null = null;

  if (targetRect) {
    const popoverWidth =
      typeof window !== "undefined" && window.innerWidth < 400 ? window.innerWidth - 32 : 310;
    const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
    const windowHeight = typeof window !== "undefined" ? window.innerHeight : 768;

    const targetCenterX = targetRect.left + targetRect.width / 2;
    const isTargetInBottomHalf = targetRect.top > windowHeight / 2;

    let left = targetCenterX - popoverWidth / 2;
    left = Math.max(16, Math.min(left, windowWidth - popoverWidth - 16));

    if (isTargetInBottomHalf) {
      // Place box ABOVE target element
      const bottom = windowHeight - targetRect.top + 12;
      popoverStyle = {
        position: "fixed",
        bottom: `${bottom}px`,
        left: `${left}px`,
        width: `${popoverWidth}px`,
      };
      pointerPosition = {
        side: "bottom",
        arrowLeft: Math.max(16, Math.min(popoverWidth - 16, targetCenterX - left)),
      };
    } else {
      // Place box BELOW target element
      const top = targetRect.top + targetRect.height + 12;
      popoverStyle = {
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        width: `${popoverWidth}px`,
      };
      pointerPosition = {
        side: "top",
        arrowLeft: Math.max(16, Math.min(popoverWidth - 16, targetCenterX - left)),
      };
    }
  } else {
    // Center fallback if no element found
    popoverStyle = {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "300px",
    };
  }

  const padding = 5;

  return (
    <div className="fixed inset-0 z-[100] select-none pointer-events-auto">
      {/* 1. Backdrop with spotlight cutout */}
      {targetRect ? (
        <div
          className="fixed transition-all duration-250 ease-out pointer-events-none rounded-xl ring-4 ring-[#8b5cf6]/35"
          style={{
            top: `${Math.max(0, targetRect.top - padding)}px`,
            left: `${Math.max(0, targetRect.left - padding)}px`,
            width: `${targetRect.width + padding * 2}px`,
            height: `${targetRect.height + padding * 2}px`,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.7)",
            border: "2px solid #8b5cf6",
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-200" />
      )}

      {/* 2. Sleek Floating Tooltip Box */}
      <div
        ref={popoverRef}
        style={popoverStyle}
        className="z-[101] bg-card text-card-foreground border border-border shadow-2xl rounded-xl p-4 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Pointer Arrow pointing toward target */}
        {pointerPosition && pointerPosition.side === "top" && (
          <div
            className="absolute -top-1.5 w-3 h-3 bg-card border-t border-l border-border rotate-45"
            style={{ left: `${pointerPosition.arrowLeft - 6}px` }}
          />
        )}
        {pointerPosition && pointerPosition.side === "bottom" && (
          <div
            className="absolute -bottom-1.5 w-3 h-3 bg-card border-b border-r border-border rotate-45"
            style={{ left: `${pointerPosition.arrowLeft - 6}px` }}
          />
        )}

        {/* Header: Title, Step Counter, and Close */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-sans font-bold text-sm text-foreground leading-tight">
            {step.title}
          </h3>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-mono text-muted-foreground">
              {currentStep + 1} of {TOUR_STEPS.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer rounded p-0"
              title="Skip"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Clean Description */}
        <p className="text-xs text-muted-foreground font-sans leading-relaxed mb-3">
          {step.description}
        </p>

        {/* Footer: Progress Dots, Skip & Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          {/* Progress dots & Skip */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              {TOUR_STEPS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentStep(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === currentStep
                      ? "w-3.5 bg-[#8b5cf6]"
                      : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`}
                  aria-label={`Step ${i + 1}`}
                />
              ))}
            </div>
            {!isLastStep && (
              <button
                type="button"
                onClick={handleClose}
                className="text-[11px] font-sans text-muted-foreground hover:text-foreground underline-offset-2 hover:underline cursor-pointer transition-colors"
              >
                Skip
              </button>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-1.5">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="h-7 px-2 text-xs font-semibold gap-1 rounded-lg cursor-pointer"
              >
                <ArrowLeft className="size-3" />
                <span>Back</span>
              </Button>
            )}

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleNext}
              className="h-7 px-2.5 text-xs font-bold gap-1 rounded-lg bg-primary text-primary-foreground shadow-arcade-primary active:translate-y-0.5 cursor-pointer"
            >
              <span>{isLastStep ? "Done" : "Next"}</span>
              {isLastStep ? <Check className="size-3" /> : <ArrowRight className="size-3" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Clean trigger button for header
 */
export function PlatformTourTriggerButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-9 px-2.5 sm:px-3 text-xs font-bold rounded-xl border-border hover:bg-muted shadow-arcade-sm active:translate-y-0.5 flex items-center gap-1.5 cursor-pointer"
        title="Quick Tour"
      >
        <HelpCircle className="size-3.5 text-[#8b5cf6]" />
        <span className="hidden sm:inline">Tour</span>
      </Button>

      {isOpen && (
        <PlatformTourGuide isOpenOverride={isOpen} onCloseOverride={() => setIsOpen(false)} />
      )}
    </>
  );
}
