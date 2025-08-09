"use client"

import * as React from "react"
import { FiSun, FiMoon } from 'react-icons/fi'
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export function ModeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  
  const toggle = React.useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
  }, [theme, setTheme])

  return (
    <div className="relative isolate">
      <Button
        variant="ghost"
        size="icon"
        className={`${className} relative overflow-hidden cursor-pointer`}
        aria-label="Toggle theme"
        onClick={toggle}
      >
        <div className="relative z-10 flex items-center justify-center">
          <FiSun className="h-4 w-4 absolute dark:opacity-0 opacity-100 transition-opacity duration-300" />
          <FiMoon className="h-4 w-4 absolute dark:opacity-100 opacity-0 transition-opacity duration-300" />
        </div>
      </Button>
    </div>
  )
}