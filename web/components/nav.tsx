"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ModeToggle } from "./mode-toggle"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "home" },
  { href: "/projects", label: "projects" },
  { href: "/blog", label: "blog" },
  { href: "/contact", label: "contact" },
]

export function Nav({ className = "" }: { className?: string }) {
  const pathname = usePathname() || "/"

  return (
    <header className={cn("sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="flex h-16 items-center justify-between">
        <div className="w-14" aria-hidden="true" />
        <nav aria-label="Primary" className="flex items-center gap-3 text-sm text-muted-foreground">
          {links.map((l, i) => (
            <span key={l.href} className="inline-flex items-center">
              <Link
                href={l.href}
                prefetch
                className={cn("px-2 py-1 transition-colors hover:text-foreground",
                  pathname === l.href && "text-foreground")}
                aria-current={pathname === l.href ? "page" : undefined}
              >
                {l.label}
              </Link>
              {i < links.length - 1 && <span className="text-muted-foreground/50">·</span>}
            </span>
          ))}
        </nav>
        <div className="flex w-14 items-center justify-end gap-2">
          <ModeToggle />
        </div>
      </div>
      <div className="h-px w-full bg-border" />
    </header>
  )
}
