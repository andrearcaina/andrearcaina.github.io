import Image from "next/image";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import { Education } from "@/components/education";
import { ExperienceTimeline } from "@/components/experience-timeline";
import { GitHubActivity } from "@/components/github-activity";
import { GitHubRepoCards } from "@/components/github-repo-cards";
import { GalleryPreview } from "@/components/gallery-preview";
import { HevySummary } from "@/components/hevy-summary";
import { PostList } from "@/components/post-list";
import { SpotifyNowPlaying } from "@/components/spotify-now-playing";
import { TechStackScroll } from "@/components/tech-stack-scroll";
import { experiences, profile } from "@/data/me";
import { galleryPhotos } from "@/data/gallery";
import { getAllPosts } from "@/lib/posts";

export default async function HomePage() {
  const posts = (await getAllPosts()).slice(0, 3);

  return (
    <div>
      <section className="hero" aria-labelledby="intro-title">
        <div>
          <p className="hero-kicker">hello, i&apos;m</p>
          <h1 id="intro-title" className="hero-title">
            andre
            <br />
            arcaina
          </h1>
          <p className="hero-copy">
            computer science student in toronto. i work on systems, cloud
            infrastructure, and backend software. lately that has meant
            open-source contributions, Go, and a mini PC running more than it
            probably should.
          </p>
          <div className="hero-links" aria-label="Quick links">
            <Link
              className="text-link"
              href={profile.links.resume}
              target="_blank"
              rel="noreferrer"
            >
              <span className="link-text">résumé</span>
              <FiArrowUpRight aria-hidden="true" />
            </Link>
            <Link
              className="quiet-link"
              href={profile.links.github}
              target="_blank"
              rel="noreferrer"
            >
              <span className="link-text">github</span>
              <FiArrowUpRight aria-hidden="true" />
            </Link>
            <Link
              className="quiet-link"
              href={profile.links.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              <span className="link-text">linkedin</span>
              <FiArrowUpRight aria-hidden="true" />
            </Link>
            <Link className="quiet-link" href="/contact">
              <span className="link-text">say hello</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="hero-photo-wrap">
          <Image
            src="/gallery/profile.webp"
            alt="Andre scuba diving underwater"
            fill
            priority
            sizes="(max-width: 700px) calc(100vw - 1.25rem), 34rem"
            className="hero-photo"
          />
        </div>
      </section>

      <section className="section section-divider" aria-labelledby="experience-heading">
        <div className="section-heading">
          <div>
            <p className="section-label">00 / experience</p>
            <h2 id="experience-heading" className="section-title mt-3">
              journey so far in my career
            </h2>
          </div>
        </div>
        <ExperienceTimeline items={experiences} />
        <div className="mt-10">
          <Education />
        </div>
      </section>

      <TechStackScroll />

      <section className="section" aria-labelledby="project-heading">
        <div className="section-heading">
          <div>
            <p className="section-label">01 / projects</p>
            <h2 id="project-heading" className="section-title mt-3">
              things made throughout it
            </h2>
          </div>
          <Link className="quiet-link" href="/projects">
            everything else →
          </Link>
        </div>
        <GitHubRepoCards limit={4} />
      </section>

      <section className="section activity-section" aria-labelledby="activity-heading">
        <div className="section-heading">
          <div>
            <p className="section-label">02 / activity</p>
            <h2 id="activity-heading" className="section-title mt-3">
              what i&apos;ve been up to
            </h2>
          </div>
        </div>
        <div className="activity-grid">
          <div className="activity-column">
            <GitHubActivity />
            <SpotifyNowPlaying />
          </div>
          <HevySummary />
        </div>
      </section>

      <section className="section" aria-labelledby="notes-heading">
        <div className="section-heading">
          <div>
            <p className="section-label">03 / notes</p>
            <h2 id="notes-heading" className="section-title mt-3">
              notes from along the way
            </h2>
          </div>
          <Link className="quiet-link" href="/blog">
            all notes →
          </Link>
        </div>
        <PostList posts={posts} />
      </section>

      <section className="section" aria-labelledby="elsewhere-heading">
        <div className="section-heading">
          <div>
            <p className="section-label">04 / gallery</p>
            <h2 id="elsewhere-heading" className="section-title mt-3">
              outside the editor
            </h2>
          </div>
          <Link className="quiet-link" href="/gallery">
            see more →
          </Link>
        </div>
        <GalleryPreview photos={galleryPhotos} />
      </section>
    </div>
  );
}
