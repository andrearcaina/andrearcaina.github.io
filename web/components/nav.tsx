"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ModeToggle } from "./mode-toggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "home" },
  { href: "/projects", label: "projects" },
  { href: "/blog", label: "notes" },
  { href: "/gallery", label: "gallery" },
  { href: "/contact", label: "contact" },
];

export function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn("site-nav", isScrolled && "site-nav-scrolled")}
    >
      <div className="flex min-h-16 items-center justify-between gap-4 py-3">
        <Link className="site-home-mark" href="/" aria-label="home">
          🐟
        </Link>
        <nav
          aria-label="Primary"
          className="flex items-center gap-1 overflow-x-auto text-xs text-muted-foreground sm:gap-2 sm:text-sm"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              prefetch
              className="site-nav-link"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center justify-end">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
