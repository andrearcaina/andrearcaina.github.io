"use client"

import { useScramble } from 'use-scramble'

interface TextScrambleProps {
    text: string
    className?: string
}

export function TextScramble({ text, className = "" }: TextScrambleProps) {
    const { ref, replay } = useScramble({
        text,
        speed: 0.6,
        tick: 1,
        step: 1,
        scramble: 8,
        seed: 2,
    })

    return (
        <span 
            ref={ref}
            className={className}
            onMouseEnter={replay}
            style={{ cursor: 'pointer' }}
        />
    )
}
