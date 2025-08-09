import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FiStar, FiGitBranch, FiEye, FiExternalLink } from 'react-icons/fi'
import Link from "next/link"
import type { GitHubRepo } from "@/lib/github"

export function GitHubRepoCards({ repos = [] as GitHubRepo[] }) {
  if (!repos.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Couldn{"'"}t load repositories right now. Try again later.
      </p>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {repos.map((r) => (
        <Card key={r.id} className="group border border-border bg-card transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-muted-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Link
                href={r.html_url}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label={`Open ${r.name} on GitHub`}
              >
                <span className="font-semibold">{r.name}</span>
              </Link>
              <Link
                href={r.html_url}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label={`Open ${r.name} on GitHub`}
              >
                <FiExternalLink className="h-4 w-4" />
              </Link>
            </CardTitle>
            {r.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{r.description}</p>
            )}
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <FiStar className="h-3.5 w-3.5" /> {r.stargazers_count}
              </span>
              <span className="inline-flex items-center gap-1">
                <FiGitBranch className="h-3.5 w-3.5" /> {r.forks_count}
              </span>
              <span className="inline-flex items-center gap-1">
                <FiEye className="h-3.5 w-3.5" /> {r.watchers_count}
              </span>
            </div>
            {r.language && (!r.topics || r.topics.length < 1) && (
              <Badge variant="secondary">{r.language}</Badge>
            )}

            {r.topics && r.topics.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {r.topics.map((topic, index) => (
                  <Badge key={index} variant="secondary" className="px-2 py-0 text-[10px]">
                    {topic}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
