"use client";

import React, { useEffect, useRef } from "react";
import lottie, { AnimationItem } from "lottie-web";

export const LottieSplash: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load exact Gen Dino Lottie animation from public/Splash_20240424a.json
    animRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "/Splash_20240424a.json",
    });

    return () => {
      if (animRef.current) {
        animRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="w-full max-w-4xl flex items-center justify-center py-4 select-none">
      <div
        ref={containerRef}
        className="w-full max-w-[850px] aspect-[2314/698] min-h-[160px] sm:min-h-[240px] pointer-events-none"
      />
    </div>
  );
};
