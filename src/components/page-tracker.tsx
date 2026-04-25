"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function PageTracker() {
  const pathname = usePathname();
  const tracked = useRef<string>("");

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith("/admin")) return;

    // Don't double-track same path
    if (tracked.current === pathname) return;
    tracked.current = pathname;

    // Fire and forget
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {
      // Silently ignore tracking errors
    });
  }, [pathname]);

  return null;
}
