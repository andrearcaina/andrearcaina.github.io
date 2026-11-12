"use client";

import { useEffect, useState } from "react";
import { FiEye, FiGitBranch, FiStar } from "react-icons/fi";

type GitHubRepo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  topics?: string[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://api.localhost:8080"
    : "https://api.andrearcaina.ca");

export function GitHubRepoCards({ limit = 20 }: { limit?: number }) {
  const [repos, setRepos] = useState<GitHubRepo[] | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/v1/github/repos?limit=${limit}`)
      .then((response) =>
        response.ok ? response.json() : Promise.reject(response.status),
      )
      .then(setRepos)
      .catch(() => setRepos([]));
  }, [limit]);

  if (repos === null) {
    return <p className="text-sm text-muted-foreground">loading projects…</p>;
  }

  if (!repos.length) {
    return (
      <p className="text-sm text-muted-foreground">
        projects are taking a minute. GitHub is probably fine.
      </p>
    );
  }

  return (
    <div className="repo-grid">
      {repos.map((repo, index) => (
        <a
          key={repo.id}
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
          className="repo-card"
          aria-label={`Open ${repo.name} on GitHub`}
        >
          <div>
            <p className="repo-index">{String(index).padStart(2, "0")}</p>
            <h3 className="repo-name mt-6">{repo.name}</h3>
            {repo.description && (
              <p className="repo-description">{repo.description}</p>
            )}
          </div>
          <div className="repo-details">
            {repo.topics && repo.topics.length > 0 && (
              <div className="repo-topics" aria-label="Repository topics">
                {repo.topics.map((topic) => (
                  <span key={topic}>#{topic}</span>
                ))}
              </div>
            )}
            <div className="repo-footer">
              <span className="repo-language">
                {repo.language || "repository"}
              </span>
              <span className="repo-stats" aria-label="Repository statistics">
                <span title="Stars">
                  <FiStar aria-hidden="true" /> {repo.stargazers_count}
                </span>
                <span title="Forks">
                  <FiGitBranch aria-hidden="true" /> {repo.forks_count}
                </span>
                <span title="Watchers">
                  <FiEye aria-hidden="true" /> {repo.watchers_count}
                </span>
              </span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
