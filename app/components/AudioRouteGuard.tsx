"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { audioSynth } from "./AudioSynthesizer";

export function AudioRouteGuard() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") {
      audioSynth.pauseMusic();
    }
  }, [pathname]);

  return null;
}
