"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaSpotify } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://api.localhost:8080"
    : "https://api.andrearcaina.ca");

type SpotifyTrack = {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  songUrl: string;
  duration: number;
  progress: number;
  explicit: boolean;
  message?: string;
};

export function SpotifyNowPlaying() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientProgress, setClientProgress] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(Date.now());

  const fetchNowPlaying = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/spotify/now-playing`);
      const data = await response.json();
      setTrack(data);
      setLastFetchTime(Date.now());

      if (data && data.isPlaying) {
        setClientProgress(data.progress);
      }
    } catch (error) {
      console.error("Error fetching now playing:", error);
      setTrack(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!track || !track.isPlaying) return;

    const interval = setInterval(async () => {
      const timeSinceLastFetch = Date.now() - lastFetchTime;
      const estimatedProgress = track.progress + timeSinceLastFetch;

      if (estimatedProgress < track.duration) {
        setClientProgress(estimatedProgress);
      } else if (estimatedProgress >= track.duration) {
        await fetchNowPlaying();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [track, lastFetchTime]);

  useEffect(() => {
    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 15000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex h-24 items-center gap-3 rounded-lg border bg-card p-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
      >
        <div className="h-12 w-12 animate-pulse rounded-md bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
        </div>
        <FaSpotify className="text-[#1DB954] text-xl" />
      </motion.div>
    );
  }

  if (!track || !track.isPlaying) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex h-24 items-center gap-3 rounded-lg border bg-card p-3 opacity-60 transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
          <FaSpotify className="text-muted-foreground text-2xl" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            {track?.message || "Not currently listening to anything"}
          </p>
        </div>
        <FaSpotify className="text-muted-foreground text-xl" />
      </motion.div>
    );
  }

  const progressPercentage = (clientProgress / track.duration) * 100;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={track.title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative min-w-0 h-24 overflow-hidden rounded-lg border border-[#1DB954]/20 bg-gradient-to-br from-[#1DB954]/20 to-card p-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-md dark:from-[#1DB954]/30 dark:to-background dark:bg-transparent"
      >
        <div className="mb-1 flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#1DB954]" />
            <span className="text-xs font-medium text-muted-foreground">
              Currently listening to
            </span>
          </div>
          <FaSpotify className="ml-auto text-lg text-[#1DB954]" />
        </div>

        <div className="flex gap-3">
          <div className="relative group">
            <div className="relative h-9 w-9 overflow-hidden rounded-md shadow-lg">
              <Image
                src={track.albumImageUrl}
                alt={`${track.album} cover`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="36px"
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
                  <h3 className="truncate text-xs font-semibold transition-colors group-hover:text-[#1DB954]">
                    {track.title}
                    {track.explicit && (
                      <span className="ml-1 text-xs bg-muted px-1 rounded">
                        E
                      </span>
                    )}
                  </h3>
                </Link>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  by {track.artist}
                </p>
              </div>
            </div>

            <div className="mt-1 space-y-0.5">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{formatTime(clientProgress)}</span>
                <span>{formatTime(track.duration)}</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
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
  );
}
