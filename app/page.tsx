import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { profile, experiences } from "@/data/me"
import { ExperienceTimeline } from "@/components/experience-timeline"
import { Education } from "@/components/education"
import { getAllPosts } from "@/lib/posts"
import { fetchRecentRepos } from "@/lib/github"
import { GitHubRepoCards } from "@/components/github-repo-cards"
import { PostList } from "@/components/post-list"
import { TechStackScroll } from "@/components/tech-stack-scroll"
import { SpotifyNowPlaying } from "@/components/spotify-now-playing"
import { Button } from "@/components/ui/button"
import { FaLinkedin, FaGithub } from 'react-icons/fa'
import { MdMail, MdDescription } from 'react-icons/md'
import { ProfileImageWithEasterEgg } from "@/components/profile-image-easter-egg"
import { 
  FadeInUp, 
  StaggerContainer, 
  StaggerItem, 
  TextShimmer, 
  NameHover, 
  ButtonMotion,
  PageTransition 
} from "@/components/motion-components"

export default async function HomePage() {
  const [posts, repos] = await Promise.all([
    getAllPosts().then((p) => p.slice(0, 3)),
    fetchRecentRepos(4),
  ])

  return (
    <PageTransition>
      <div className="space-y-12 py-8 md:py-12">
        <FadeInUp>
          <section className="grid items-center gap-8 md:grid-cols-5">
            <div className="md:col-span-3 space-y-6">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                <NameHover>{profile.name}</NameHover>{" "}
                <span className="italic text-muted-foreground">, a software and cloud engineer</span>
              </h1>
              <FadeInUp delay={0.2}>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Currently focused on <TextShimmer>full‑stack platforms</TextShimmer>, building infrastructure, and microservices. Developing at{" "}
                  <span className="font-medium">Environment and Climate Change Canada</span> (as an intern) and{" "}
                  <span className="font-medium">USSTM</span>.
                </p>
              </FadeInUp>

              <StaggerContainer>
                <div className="flex flex-wrap gap-3">
                  <StaggerItem>
                    <ButtonMotion>
                      <Button asChild variant="secondary" className="button-hover-fix">
                        <Link href={profile.links.resume} target="_blank" rel="noreferrer">
                          <MdDescription className="mr-2 h-4 w-4" /> resume
                        </Link>
                      </Button>
                    </ButtonMotion>
                  </StaggerItem>
                  <StaggerItem>
                    <ButtonMotion>
                      <Button asChild variant="outline" className="button-hover-fix">
                        <Link href={profile.links.linkedin} target="_blank" rel="noreferrer">
                          <FaLinkedin className="mr-2 h-4 w-4" /> linkedin
                        </Link>
                      </Button>
                    </ButtonMotion>
                  </StaggerItem>
                  <StaggerItem>
                    <ButtonMotion>
                      <Button asChild variant="outline" className="button-hover-fix">
                        <Link href={profile.links.github} target="_blank" rel="noreferrer">
                          <FaGithub className="mr-2 h-4 w-4" /> github
                        </Link>
                      </Button>
                    </ButtonMotion>
                  </StaggerItem>
                  <StaggerItem>
                    <ButtonMotion>
                      <Button asChild variant="outline" className="button-hover-fix">
                        <Link href={profile.links.contact}>
                          <MdMail className="mr-2 h-4 w-4" /> contact
                        </Link>
                      </Button>
                    </ButtonMotion>
                  </StaggerItem>
                </div>
              </StaggerContainer>

              <FadeInUp delay={0.6}>
                <SpotifyNowPlaying />
              </FadeInUp>
            </div>

            <FadeInUp delay={0.4}>
              <ProfileImageWithEasterEgg />
            </FadeInUp>
          </section>
        </FadeInUp>

        <Separator />

        <FadeInUp delay={0.6}>
          <section>
            <h2 className="text-lg font-medium mb-5">
              current <TextShimmer>tech</TextShimmer> i work with
            </h2>
            <TechStackScroll />
          </section>
        </FadeInUp>

        <Separator />

        <FadeInUp delay={0.8}>
          <section>
            <Education />
          </section>
        </FadeInUp>

        <Separator />

        <FadeInUp delay={1.0}>
          <section>
            <ExperienceTimeline items={experiences} />
          </section>
        </FadeInUp>

        <Separator />

        <FadeInUp delay={1.2}>
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">my most <TextShimmer>coveted projects</TextShimmer> goes in the home page :P</h2>
              <Link href="/projects" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
                all projects →
              </Link>
            </div>
            <GitHubRepoCards repos={repos} />
          </section>
        </FadeInUp>

        <Separator />

        <FadeInUp delay={1.4}>
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">latest <TextShimmer>posts</TextShimmer> by yours truly (currently experimenting)</h2>
              <Link href="/blog" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
                all posts →
              </Link>
            </div>
            <PostList posts={posts} />
          </section>
        </FadeInUp>
      </div>
    </PageTransition>
  )
}
