"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./mode-toggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/projects", label: "projects" },
  { href: "/blog", label: "notes" },
  { href: "/gallery", label: "gallery" },
  { href: "/contact", label: "contact" },
];

export function Nav({ className = "" }: { className?: string }) {
  const pathname = usePathname() || "/";

  return (
    <header
      className={cn(
        "site-nav",
        className,
      )}
    >
      <div className="flex min-h-16 items-center justify-between gap-4 py-3">
        <Link
          href="/"
          className="site-wordmark shrink-0"
          aria-label="andre arcaina — home"
        >
          <span className="hidden sm:inline">andre arcaina</span>
          <span className="sm:hidden">aa.</span>
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
              className={cn(
                "site-nav-link",
                pathname === l.href && "site-nav-link-active",
              )}
              aria-current={pathname === l.href ? "page" : undefined}
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
