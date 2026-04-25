"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TocProps {
  headings: Heading[];
  variant: "inline" | "sidebar";
}

export default function TocSidebar({ headings, variant }: TocProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first heading that is intersecting
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      },
    );

    // Observe all heading elements
    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (variant === "inline") {
    return (
      <nav className="mb-8 rounded-lg border bg-muted/30 p-4 xl:hidden">
        <div className="flex items-center gap-2 mb-3">
          <List className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold">On this page</p>
        </div>
        <ul className="space-y-1">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={`block text-sm transition-colors leading-relaxed ${
                  heading.level === 3 ? "pl-4" : "pl-0"
                } ${
                  activeId === heading.id
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  // Sidebar variant (desktop fixed)
  return (
    <nav
      className="hidden xl:block fixed top-24 w-48 z-20"
      style={{ left: "calc(50% + 384px + 2rem)" }}
    >
      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
        <List className="h-4 w-4 text-muted-foreground" />
        On this page
      </p>
      <ul className="space-y-1.5 border-l border-border pl-3">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={`block text-xs transition-colors leading-relaxed ${
                heading.level === 3 ? "pl-3" : ""
              } ${
                activeId === heading.id
                  ? "text-primary font-medium border-l-2 border-primary -ml-[calc(0.75rem+1px)] pl-[calc(0.75rem-1px)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
