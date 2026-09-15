"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MarqueeTextProps {
  text: string;
  className?: string;
  title?: string;
}

export const MarqueeText: React.FC<MarqueeTextProps> = ({ text, className, title }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const textWidth = textRef.current.scrollWidth;
        if (textWidth > containerWidth) {
          setIsOverflowing(true);
          setDistance(textWidth - containerWidth + 8);
        } else {
          setIsOverflowing(false);
          setDistance(0);
        }
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [text]);

  return (
    <div
      ref={containerRef}
      title={title || text}
      className={cn("relative overflow-hidden whitespace-nowrap select-none w-full", className)}
    >
      <span
        ref={textRef}
        style={
          isOverflowing
            ? ({
                "--marquee-dist": `-${distance}px`,
              } as React.CSSProperties)
            : undefined
        }
        className={cn(
          "inline-block",
          isOverflowing && "animate-marquee-pingpong hover:[animation-play-state:paused]"
        )}
      >
        {text}
      </span>
    </div>
  );
};
