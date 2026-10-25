"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://api.localhost:8080"
    : "https://api.andrearcaina.ca");

type ActivityDay = { date: string; count: number; level: number };
type PullRequest = {
  title: string;
  url: string;
  repository: string;
  occurredAt: string;
};
type Activity = {
  total: number;
  days: ActivityDay[];
  pullRequests: PullRequest[];
};

export function GitHubActivity() {
  const [activity, setActivity] = useState<Activity | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/v1/github/activity`)
      .then((response) =>
        response.ok ? response.json() : Promise.reject(response.status),
      )
      .then(setActivity)
      .catch(() => setActivity(null));
  }, []);

  useEffect(() => {
    if (activity && calendarRef.current) {
      calendarRef.current.scrollLeft = calendarRef.current.scrollWidth;
    }
  }, [activity]);

  if (!activity) {
    return (
      <div
        className="h-[108px] animate-pulse rounded-lg border border-border bg-card"
        aria-label="Loading GitHub activity"
      />
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-md sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Link
          href="https://github.com/andrearcaina"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <FaGithub className="h-4 w-4" /> GitHub contributions
        </Link>
        <span className="text-xs text-primary">
          {activity.total.toLocaleString()} contributions in the last year
        </span>
      </div>
      <div ref={calendarRef} className="overflow-x-auto pb-1">
        <div className="grid min-w-[360px] grid-flow-col grid-rows-7 gap-[2px] sm:min-w-[430px] sm:gap-[3px]">
          {activity.days.slice(-371).map((day) => (
            <span
              key={day.date}
              title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
              className={`h-[5px] w-[5px] rounded-[1px] activity-level-${day.level} sm:h-2.5 sm:w-2.5 sm:rounded-[2px]`}
            />
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={`h-[5px] w-[5px] rounded-[1px] activity-level-${level} sm:h-2.5 sm:w-2.5 sm:rounded-[2px]`}
          />
        ))}
        <span>More</span>
      </div>
      {activity.pullRequests.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="mb-2 text-xs font-medium text-foreground">
            recent OSS pull requests
          </p>
          <div className="space-y-1.5">
            {activity.pullRequests.slice(0, 3).map((pullRequest) => (
              <Link
                key={pullRequest.url}
                href={pullRequest.url}
                target="_blank"
                rel="noreferrer"
                className="block truncate text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                {pullRequest.title}{" "}
                <span className="text-[10px] text-primary/80">
                  · {pullRequest.repository}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
