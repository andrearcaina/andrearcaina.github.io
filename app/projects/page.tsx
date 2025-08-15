import { fetchRecentRepos } from "@/lib/github"
import { GitHubRepoCards } from "@/components/github-repo-cards"
import { FadeInUp, TextShimmer, PageTransition } from "@/components/motion-components"

export const metadata = { 
  title: "andre arcaina's projects",
  description: "a showcase of my projects and github repositories"
}

export default async function ProjectsPage() {
  const repos = await fetchRecentRepos("andrearcaina", 11, 11)
  return (
    <PageTransition>
      <div className="py-8 md:py-12 space-y-6">
        <FadeInUp>
          <h1 className="mb-2 text-xl font-semibold">projects</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Here are some of my <TextShimmer>featured projects</TextShimmer> and repositories I've been currently working on.
          </p>
        </FadeInUp>
        <FadeInUp delay={0.2}>
          <GitHubRepoCards repos={repos} />
        </FadeInUp>
      </div>
    </PageTransition>
  )
}
