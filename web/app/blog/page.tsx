import { getAllPosts } from "@/lib/posts"
import { PostList } from "@/components/post-list"
import { FadeInUp, TextShimmer, PageTransition } from "@/components/motion-components"

export const metadata = {
  title: "andre arcaina's blog",
  description: "writings on life, engineering, systems, and software development.",
}

export default async function BlogPage() {
  const posts = await getAllPosts()
  return (
    <PageTransition>
      <div className="py-8 md:py-12 space-y-6">
        <FadeInUp>
          <h1 className="mb-2 text-xl font-semibold">blog</h1>
          <p className="text-sm text-muted-foreground mb-6">
            My thoughts on <TextShimmer>life</TextShimmer>, engineering, systems, and software development.
          </p>
        </FadeInUp>
        <FadeInUp delay={0.2}>
          <PostList posts={posts} />
        </FadeInUp>
      </div>
    </PageTransition>
  )
}
