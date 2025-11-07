import { getAllPosts, getPostBySlug } from "@/lib/posts"
import { formatDate } from "@/lib/utils"
import { LinkWithIcon } from "@/components/link-with-icon"
import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { FiArrowLeft } from "react-icons/fi"
import MDXContent from "@/components/mdx-content"

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  return {
    title: post?.meta.title ?? "post",
    description: post?.meta.description || post?.meta.summary,
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  
  if (!post) {
    notFound()
  }

  const { meta, content } = post
  const { title, image, publishedAt } = meta
  const publishedDate = publishedAt
  const lastUpdatedAt = meta.lastUpdatedAt

  return (
    <article className="mt-8 flex flex-col gap-8 pb-16">
      <LinkWithIcon
        href="/blog"
        position="left"
        icon={<FiArrowLeft className="h-4 w-4" />}
        text="back to blog"
      />

      {image && (
        <div className="relative mb-6 h-96 w-full overflow-hidden rounded-lg">
          <Image src={image} alt={title || ""} className="object-cover" fill />
        </div>
      )}

      <header>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {publishedDate && (
          <p className="mt-2 text-sm text-muted-foreground">
            Published: {formatDate(publishedDate)}
          </p>
        )}
        {lastUpdatedAt && (
          <p className="mt-1 text-sm text-muted-foreground">
            Last Updated: {formatDate(lastUpdatedAt)}
          </p>
        )}
      </header>

      <main className="prose prose-slate dark:prose-invert max-w-none">
        <MDXContent source={content} />
      </main>
    </article>
  )
}
