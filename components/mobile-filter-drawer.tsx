"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, RotateCcw, Check, X } from "lucide-react";

interface MobileFilterDrawerProps {
  title?: string;
  description?: string;
  activeCount?: number;
  totalResults?: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReset?: () => void;
  children: React.ReactNode;
}

export function MobileFilterDrawer({
  title = "Filters",
  description = "Refine and search results",
  activeCount = 0,
  totalResults,
  isOpen,
  onOpenChange,
  onReset,
  children,
}: MobileFilterDrawerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent background scrolling ONLY when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Touch handlers for pull tab
  const handleTabTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTabTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartRef.current.x;
    const deltaY = endY - touchStartRef.current.y;

    if (deltaX < -15 || (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10)) {
      onOpenChange(true);
    }
  };

  // Touch handlers for swiping card closed (swipe right)
  const handleDrawerTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleDrawerTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - touchStartRef.current.x;
    if (deltaX > 40) {
      onOpenChange(false);
    }
  };

  if (!isMounted) return null;

  const drawerContent = (
    <div
      className={`fixed inset-0 z-50 lg:hidden transition-[visibility] duration-300 ${
        isOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
      }`}
    >
      {/* Backdrop with smooth fade transition */}
      <div
        onClick={() => onOpenChange(false)}
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Floating Card Drawer (Theme standard shadow-2xl, no colored glow) */}
      <div
        onTouchStart={handleDrawerTouchStart}
        onTouchEnd={handleDrawerTouchEnd}
        className={`fixed right-3 top-1/2 -translate-y-1/2 w-[305px] max-w-[calc(100vw-24px)] max-h-[82vh] bg-card text-card-foreground border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 transition-all duration-300 ease-out transform ${
          isOpen
            ? "translate-x-0 opacity-100 scale-100 pointer-events-auto"
            : "translate-x-[calc(100%+24px)] opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-border bg-muted/40 flex items-center justify-between shrink-0">
          <div className="space-y-0.5 pr-2">
            <div className="text-sm font-bold text-foreground flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-primary" />
              <span>{title}</span>
              {activeCount > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                  {activeCount}
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">{description}</p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="size-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Close filters"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 font-sans min-h-0">
          {children}
        </div>

        {/* Action Footer */}
        <div className="p-3 border-t border-border bg-card/95 backdrop-blur-xs shrink-0">
          <div className="flex items-center gap-2">
            {onReset && activeCount > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onReset}
                className="h-8.5 text-xs font-bold gap-1.5 cursor-pointer border-border shadow-[0_2px_0_0_#e2e8f0] dark:shadow-[0_2px_0_0_#27282d] active:translate-y-0.5 shrink-0"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset</span>
              </Button>
            )}
            <Button
              type="button"
              className="flex-1 h-8.5 text-xs font-bold cursor-pointer gap-1.5 bg-primary text-primary-foreground shadow-[0_2px_0_0_#6d28d9] dark:shadow-[0_2px_0_0_#5b21b6] active:translate-y-0.5"
              onClick={() => onOpenChange(false)}
            >
              <Check className="size-3.5" />
              <span>
                {typeof totalResults === "number"
                  ? `Show ${totalResults} ${totalResults === 1 ? "Result" : "Results"}`
                  : "Apply"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. MINIMAL PULLABLE FILTER ICON TAB (Theme 3D button shadow, no glow) */}
      {!isOpen && (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 lg:hidden flex items-center select-none animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => onOpenChange(true)}
            onTouchStart={handleTabTouchStart}
            onTouchEnd={handleTabTouchEnd}
            className="relative size-11 rounded-l-2xl bg-primary text-primary-foreground border-y border-l border-primary/40 shadow-[0_3px_0_0_#6d28d9] dark:shadow-[0_3px_0_0_#5b21b6] active:translate-y-0.5 flex items-center justify-center cursor-pointer transition-transform hover:bg-primary/95"
            aria-label="Open filter drawer"
          >
            <SlidersHorizontal className="size-5" />
            {activeCount > 0 && (
              <span className="absolute -top-1 -left-1 size-4.5 rounded-full bg-white text-primary text-[10px] font-extrabold flex items-center justify-center border border-primary/20 shadow-xs">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* 2. SMOOTH ANIMATED FLOATING PORTAL CARD */}
      {typeof document !== "undefined" && createPortal(drawerContent, document.body)}
    </>
  );
}
