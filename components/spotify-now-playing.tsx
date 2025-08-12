"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FaSpotify } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

type SpotifyTrack = {
    isPlaying: boolean
    title: string
    artist: string
    album: string
    albumImageUrl: string
    songUrl: string
    duration: number
    progress: number
    explicit: boolean
    message?: string
}

export function SpotifyNowPlaying() {
    const [track, setTrack] = useState<SpotifyTrack | null>(null)
    const [loading, setLoading] = useState(true)
    const [clientProgress, setClientProgress] = useState(0)
    const [lastFetchTime, setLastFetchTime] = useState(Date.now())

    const fetchNowPlaying = async () => {
        try {
            const response = await fetch('/api/spotify/')
            const data = await response.json()
            setTrack(data)
            setLastFetchTime(Date.now())
            
            if (data && data.isPlaying) {
                setClientProgress(data.progress)
            }
        } catch (error) {
            console.error('Error fetching now playing:', error)
            setTrack(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!track || !track.isPlaying) return

        const interval = setInterval(async () => {
            const timeSinceLastFetch = Date.now() - lastFetchTime
            const estimatedProgress = track.progress + timeSinceLastFetch
            
            if (estimatedProgress < track.duration) {
                setClientProgress(estimatedProgress)
            } else if (estimatedProgress >= track.duration) {
                await fetchNowPlaying()
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [track, lastFetchTime])

    useEffect(() => {
        fetchNowPlaying()
        const interval = setInterval(fetchNowPlaying, 15000)
        return () => clearInterval(interval)
    }, [])


    const formatTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000)
        const seconds = Math.floor((ms % 60000) / 1000)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    if (loading) {
        return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-card rounded-lg border"
        >
            <div className="w-16 h-16 bg-muted rounded-md animate-pulse" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
            </div>
            <FaSpotify className="text-[#1DB954] text-xl" />
        </motion.div>
        )
    }

    if (!track || !track.isPlaying) {
        return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-card rounded-lg border opacity-60"
        >
            <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                <FaSpotify className="text-muted-foreground text-2xl" />
            </div>
            <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                    {track?.message || "Not currently listening to anything"}
                </p>
            </div>
            <FaSpotify className="text-muted-foreground text-xl" />
        </motion.div>
        )
    }

    const progressPercentage = (clientProgress / track.duration) * 100

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={track.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative overflow-hidden rounded-lg border border-[#1DB954]/20 p-2 sm:p-4 bg-gradient-to-br from-[#1DB954]/20 to-card dark:from-[#1DB954]/30 dark:to-background bg-black/30 dark:bg-transparent"
            >
                <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-3">
                    <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#1DB954] rounded-full animate-pulse" />
                        <span className="text-xs text-muted-foreground font-medium">
                        Currently listening to
                        </span>
                    </div>
                    <FaSpotify className="text-[#1DB954] text-sm sm:text-lg ml-auto" />
                </div>

                <div className="flex gap-1.5 sm:gap-4">
                    <div className="relative group">
                        <div className="w-10 h-10 sm:w-16 sm:h-16 relative rounded-md overflow-hidden shadow-lg">
                            <Image
                                src={track.albumImageUrl}
                                alt={`${track.album} cover`}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                                sizes="(max-width: 640px) 40px, 64px"
                            />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                                <Link
                                    href={track.songUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group"
                                >
                                <h3 className="font-semibold text-xs sm:text-sm truncate group-hover:text-[#1DB954] transition-colors">
                                    {track.title}
                                    {track.explicit && (
                                        <span className="ml-1 text-xs bg-muted px-1 rounded">E</span>
                                    )}
                                </h3>
                                </Link>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                    by {track.artist}
                                </p>
                                <p className="text-xs text-muted-foreground truncate hidden sm:block">
                                    on {track.album}
                                </p>
                            </div>
                        </div>

                        <div className="mt-1 sm:mt-3 space-y-0.5 sm:space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{formatTime(clientProgress)}</span>
                                <span>{formatTime(track.duration)}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1 sm:h-1.5 overflow-hidden">
                                <motion.div
                                    className="h-full bg-[#1DB954] rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercentage}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
