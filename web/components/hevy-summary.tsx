"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://api.localhost:8080"
    : "https://api.andrearcaina.ca");

type WorkoutSummary = {
  month: string;
  year: number;
  monthNumber: number;
  workouts: number;
  durationSeconds: number;
  volumeLbs: number;
  workoutDays: number[];
  recentWorkout?: {
    date: string;
    title: string;
    url: string;
    durationSeconds: number;
    volumeLbs: number;
    sets: number;
    records: number;
  };
};

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function HevySummary() {
  const [summary, setSummary] = useState<WorkoutSummary | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/v1/hevy/summary`)
      .then((response) =>
        response.ok ? response.json() : Promise.reject(response.status),
      )
      .then(setSummary)
      .catch(() => setSummary(null));
  }, []);

  return (
    <div className="flex min-h-[220px] h-full flex-col rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <span className="text-lg font-semibold">
          {summary ? `${summary.month} ${summary.year}` : "Hevy"}
        </span>
        <Link
          href="https://hevy.com/user/andre331"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          from Hevy ↗
        </Link>
      </div>
      {summary ? (
        <>
          <div className="mt-6 grid flex-1 grid-cols-[1fr_auto] items-center gap-6">
            <div>
              <div className="mb-2 grid grid-cols-7 text-center text-[10px] font-medium text-muted-foreground">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                  <span key={day + index}>{day}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
                {Array.from({
                  length: new Date(
                    summary.year,
                    summary.monthNumber - 1,
                    1,
                  ).getDay(),
                }).map((_, index) => (
                  <span key={`empty-${index}`} />
                ))}
                {Array.from({
                  length: new Date(
                    summary.year,
                    summary.monthNumber,
                    0,
                  ).getDate(),
                }).map((_, index) => {
                  const day = index + 1;
                  const isWorkoutDay = summary.workoutDays.includes(day);
                  return (
                    <span
                      key={day}
                      className={
                        "mx-auto flex h-6 w-6 items-center justify-center rounded-full " +
                        (isWorkoutDay
                          ? "bg-primary font-semibold text-primary-foreground"
                          : "text-muted-foreground")
                      }
                    >
                      {day}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-semibold">{summary.workouts}</p>
                <p className="text-sm text-muted-foreground">Workouts</p>
              </div>
              <div>
                <p className="text-xl font-semibold">
                  {formatDuration(summary.durationSeconds)}
                </p>
                <p className="text-sm text-muted-foreground">Duration</p>
              </div>
              <div>
                <p className="text-xl font-semibold">
                  {summary.volumeLbs.toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  lbs
                </p>
                <p className="text-sm text-muted-foreground">Volume</p>
              </div>
            </div>
          </div>
          {summary.recentWorkout && (
            <div className="mt-auto border-t border-border pt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground">
                    {summary.recentWorkout.date}
                  </p>
                  <p className="truncate text-base font-semibold">
                    {summary.recentWorkout.title || "Recent workout"}
                  </p>
                </div>
                <Link
                  href={summary.recentWorkout.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-muted-foreground transition-colors hover:text-primary"
                >
                  recent workout ↗
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <p className="font-medium">
                    {formatDuration(summary.recentWorkout.durationSeconds)}
                  </p>
                  <p className="text-muted-foreground">Duration</p>
                </div>
                <div>
                  <p className="font-medium">
                    {summary.recentWorkout.volumeLbs.toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    lbs
                  </p>
                  <p className="text-muted-foreground">Volume</p>
                </div>
                <div>
                  <p className="font-medium">{summary.recentWorkout.sets}</p>
                  <p className="text-muted-foreground">Sets</p>
                </div>
                <div>
                  <p className="font-medium">{summary.recentWorkout.records}</p>
                  <p className="text-muted-foreground">Records</p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Workout stats coming soon
        </p>
      )}
    </div>
  );
}
