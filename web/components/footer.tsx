"use client"

import { useState } from "react"
import { SocialIcons } from "./social-icons"

export function Footer() {
  const [showEasterEgg, setShowEasterEgg] = useState(false)
  const [clickCount, setClickCount] = useState(0)

  const handleCopyrightClick = () => {
    const newCount = clickCount + 1
    setClickCount(newCount)
    setShowEasterEgg(true)
    
    // Hide the message after 5 seconds
    setTimeout(() => {
      setShowEasterEgg(false)
    }, 5000)
  }

  return (
    <footer className="flex flex-col items-center justify-between gap-4 py-12 md:flex-row">
      <div className="relative">
        <p 
          className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
          onClick={handleCopyrightClick}
        >
          © {new Date().getFullYear()} Andre Arcaina
        </p>
        
        {showEasterEgg && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-primary text-primary-foreground text-xs px-3 py-2 rounded-md whitespace-nowrap z-10 animate-pulse">
            {clickCount === 1 
              ? "Psst... this site is open source! No license = free inspo 🤫" 
              : `Still digging around? ${clickCount} clicks and counting! 😄`
            }
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary"></div>
          </div>
        )}
      </div>
      <SocialIcons />
    </footer>
  )
}
