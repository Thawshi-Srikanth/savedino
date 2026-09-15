"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function TopLoadingBarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const trickleRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (trickleRef.current) clearInterval(trickleRef.current);

    setVisible(true);
    setProgress(20);

    // Trickle progress while waiting for Next.js to load the page chunk
    trickleRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const diff = Math.max(1, (90 - prev) * 0.15);
        return Math.min(90, prev + diff);
      });
    }, 200);
  };

  const complete = () => {
    if (trickleRef.current) clearInterval(trickleRef.current);
    setProgress(100);

    // Fade out after reaching 100%
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setProgress(0);
      }, 250);
    }, 200);
  };

  // Complete progress on route change
  useEffect(() => {
    complete();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (trickleRef.current) clearInterval(trickleRef.current);
    };
  }, [pathname, searchParams]);

  // Intercept link clicks to start loading immediately
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore external links, new tabs, downloads, hashes, or modified clicks
      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      try {
        const url = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Only trigger for same-origin internal navigations to different URLs
        if (url.origin === currentUrl.origin) {
          if (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search) {
            start();
          }
        }
      } catch (e) {
        // Ignore invalid URLs
      }
    };

    const handlePopState = () => {
      start();
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-label="Page navigation loading"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 left-0 right-0 z-[99999] h-[2.5px] pointer-events-none transition-opacity duration-200"
      style={{
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        className="h-full bg-primary transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}

export function TopLoadingBar() {
  return (
    <Suspense fallback={null}>
      <TopLoadingBarContent />
    </Suspense>
  );
}
