"use client";

import { useEffect, useRef } from "react";
import { trackFeedViews } from "@/lib/follow";

interface UseThreadViewTrackerOptions {
  threadId: string;
  delayMs?: number;
  threshold?: number;
}

export function useThreadViewTracker({
  threadId,
  delayMs = 1000,
  threshold = 0.5,
}: UseThreadViewTrackerOptions) {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!threadId) return;
    const element = elementRef.current;
    if (!element) return;

    let timer: NodeJS.Timeout;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            timer = setTimeout(() => {
              trackFeedViews([threadId]);
            }, delayMs);
          } else {
            clearTimeout(timer);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [threadId, delayMs, threshold]);

  return elementRef;
}
