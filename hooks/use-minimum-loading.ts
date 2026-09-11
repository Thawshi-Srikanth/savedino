"use client";

import { useState, useEffect, useRef } from "react";

/**
 * useMinimumLoading
 * Ensures a loading state stays visible for at least `minDuration` ms (default: 1000ms),
 * preventing instant flicker and ensuring animations are seen smoothly.
 *
 * @param loading Boolean representing current actual loading status
 * @param minDuration Minimum milliseconds to display the loading state (default 1000ms)
 * @returns Boolean representing display loading status
 */
export function useMinimumLoading(loading: boolean, minDuration: number = 1000): boolean {
  const [displayLoading, setDisplayLoading] = useState<boolean>(loading);
  const startTimeRef = useRef<number>(loading ? Date.now() : 0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (loading) {
      startTimeRef.current = Date.now();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setDisplayLoading(true);
    } else {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = minDuration - elapsed;

      if (remaining > 0) {
        timerRef.current = setTimeout(() => {
          setDisplayLoading(false);
          timerRef.current = null;
        }, remaining);
      } else {
        setDisplayLoading(false);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [loading, minDuration]);

  return displayLoading;
}
