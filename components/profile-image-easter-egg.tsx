"use client"

import Image from "next/image"
import { useState, useCallback } from "react"

const FUNNY_MESSAGES = [
    "okay that's enough clicking",
    "seriously, stop it",
    "are we really doing this again?",
    "I'm not playing this game anymore",
    "fine, you asked for it...",
    "last warning!",
    "you're really persistent aren't you?",
    "this is getting ridiculous",
    "I give up...",
    "enjoy your rickroll! 🎵"
]

export function ProfileImageWithEasterEgg() {
    const [clickCount, setClickCount] = useState(0)
    const [showRickRoll, setShowRickRoll] = useState(false)
    const [funnyMessage, setFunnyMessage] = useState("")
    const [isHovering, setIsHovering] = useState(false)

    const handleImageClick = useCallback(() => {
        const newCount = clickCount + 1
        setClickCount(newCount)

        if (newCount >= 50) {
        setShowRickRoll(true)
        setFunnyMessage("you asked for this! 🎶")
        } else if (newCount >= 10 && (newCount - 10) % 5 === 0) {
        const messageIndex = Math.min(Math.floor((newCount - 10) / 5), FUNNY_MESSAGES.length - 1)
        setFunnyMessage(FUNNY_MESSAGES[messageIndex])
        
        setTimeout(() => setFunnyMessage(""), 5000)
        }
    }, [clickCount])

    const getHoverMessage = () => {
        if (clickCount === 0) return "click me!"
        if (clickCount <= 9) return "click me more!"
        return ""
    }

    return (
        <div className="md:col-span-2">
            <div className="relative mx-auto aspect-square w-56 overflow-hidden rounded-xl border sm:w-72 md:w-80">
                <Image
                    src="/images/profile.webp?height=640&width=640"
                    alt="profile"
                    fill
                    className="object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 14rem, 20rem"
                    priority
                    onClick={handleImageClick}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                />
                
                {/* Hover message - appears on hover for first two states */}
                {isHovering && getHoverMessage() && !funnyMessage && (
                    <div className="absolute top-2 left-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md z-10 animate-pulse">
                        {getHoverMessage()}
                    </div>
                )}
                
                {/* Existing funny messages from easter egg */}
                {funnyMessage && (
                    <div className="absolute top-2 left-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md animate-pulse z-10">
                        {funnyMessage}
                    </div>
                )}
                
                {showRickRoll && (
                    <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-20">
                        <div className="text-white text-center mb-4">
                            <div className="text-sm">You clicked {clickCount} times... really?</div>
                        </div>
                        <iframe
                            className="w-full h-full max-w-sm max-h-64 rounded-md"
                            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&start=43"
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        />
                        <button 
                            onClick={() => {setShowRickRoll(false); setClickCount(0); setFunnyMessage("")}}
                            className="mt-2 text-white text-xs hover:text-gray-300"
                        >
                            Click to close (and reset)
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
