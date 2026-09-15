"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface ArcadeMetricProps {
  label: string;
  value: number;
  type: "score" | "asteroids";
  className?: string;
  align?: "center" | "right" | "left";
  size?: "sm" | "md" | "lg";
}

export const ArcadeMetric: React.FC<ArcadeMetricProps> = ({
  label,
  value,
  type,
  className,
  align = "center",
  size = "md",
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const prevValueRef = useRef<number>(value);
  const prevTypeRef = useRef<string>(type);

  useEffect(() => {
    if (prevValueRef.current !== value || prevTypeRef.current !== type) {
      const start = displayValue;
      const end = value;
      prevValueRef.current = value;
      prevTypeRef.current = type;
      setIsRolling(true);

      const duration = 300;
      const startTime = performance.now();

      const animateRoll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Exponential ease-out for classic punchy arcade counter
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.round(start + (end - start) * ease);
        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(animateRoll);
        } else {
          setDisplayValue(end);
          setTimeout(() => setIsRolling(false), 50);
        }
      };

      requestAnimationFrame(animateRoll);
    } else {
      setDisplayValue(value);
    }
  }, [value, type]);

  const alignClass =
    align === "right"
      ? "items-end text-right"
      : align === "left"
        ? "items-start text-left"
        : "items-center text-center";

  const sizeClass =
    size === "lg"
      ? "text-sm sm:text-base"
      : size === "sm"
        ? "text-[11px] sm:text-xs"
        : "text-xs sm:text-sm";

  return (
    <div
      key={`${type}-${align}`}
      className={cn(
        "flex flex-col justify-center min-h-[34px] animate-arcade-pop select-none",
        alignClass,
        className
      )}
    >
      <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-muted-foreground leading-none">
        {label}
      </span>
      <span
        className={cn(
          "font-mono font-extrabold leading-tight mt-0.5 transition-all duration-200",
          sizeClass,
          isRolling ? "text-primary scale-105" : "text-foreground scale-100"
        )}
      >
        {displayValue.toLocaleString()}
      </span>
    </div>
  );
};
