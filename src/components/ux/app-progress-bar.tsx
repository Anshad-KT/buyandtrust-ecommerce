"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const PROGRESS_START_EVENT = "ux:progress:start";
const PROGRESS_DONE_EVENT = "ux:progress:done";

function isInternalNavigableLink(anchor: HTMLAnchorElement): boolean {
  const href = anchor.getAttribute("href");
  if (!href) return false;
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;

  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  if (url.pathname === window.location.pathname && url.search === window.location.search) return false;
  return true;
}

export function AppProgressBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const activeRequestsRef = useRef(0);
  const routePendingRef = useRef(false);
  const trickleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousRouteRef = useRef("");

  const clearTimers = () => {
    if (trickleIntervalRef.current) {
      clearInterval(trickleIntervalRef.current);
      trickleIntervalRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const startBar = () => {
    clearTimers();
    setVisible(true);
    setProgress((current) => (current < 12 ? 12 : current));

    trickleIntervalRef.current = setInterval(() => {
      setProgress((current) => {
        if (current >= 82) return current;
        const delta = Math.max((82 - current) * 0.22, 1.8);
        return Math.min(82, current + delta);
      });
    }, 120);
  };

  const completeBar = () => {
    clearTimers();
    setProgress(100);

    hideTimeoutRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 180);
  };

  useEffect(() => {
    const handleProgressStart = () => {
      activeRequestsRef.current += 1;
      startBar();
    };

    const handleProgressDone = () => {
      activeRequestsRef.current = Math.max(0, activeRequestsRef.current - 1);
      if (activeRequestsRef.current === 0 && !routePendingRef.current) {
        completeBar();
      }
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (!isInternalNavigableLink(anchor)) return;

      routePendingRef.current = true;
      startBar();
    };

    window.addEventListener(PROGRESS_START_EVENT, handleProgressStart);
    window.addEventListener(PROGRESS_DONE_EVENT, handleProgressDone);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      clearTimers();
      window.removeEventListener(PROGRESS_START_EVENT, handleProgressStart);
      window.removeEventListener(PROGRESS_DONE_EVENT, handleProgressDone);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, []);

  useEffect(() => {
    const currentRoute = `${pathname || ""}`;
    const isInitialMount = previousRouteRef.current === "";
    const hasRouteChanged = !isInitialMount && previousRouteRef.current !== currentRoute;
    previousRouteRef.current = currentRoute;

    if (isInitialMount) return;

    if (routePendingRef.current) {
      routePendingRef.current = false;
      if (activeRequestsRef.current === 0) {
        completeBar();
      }
      return;
    }

    if (hasRouteChanged && activeRequestsRef.current === 0) {
      startBar();
      requestAnimationFrame(() => completeBar());
    }
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[1200] h-[3px] transition-opacity duration-150 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full rounded-r-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 shadow-[0_0_22px_rgba(249,115,22,0.8)] transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
