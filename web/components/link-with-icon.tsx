import Link from "next/link"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface LinkWithIconProps {
  href: string
  position: "left" | "right"
  icon: ReactNode
  text: string
  className?: string
}

export function LinkWithIcon({ 
  href, 
  position, 
  icon, 
  text, 
  className 
}: LinkWithIconProps) {
  return (
    <Link 
      href={href}
      className={cn(
        "inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
    >
      {position === "left" && icon}
      {text}
      {position === "right" && icon}
    </Link>
  )
}
