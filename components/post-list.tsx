import Link from "next/link"

import { Separator } from "@/components/ui/separator"
import type { Post } from "@/lib/posts"

export function PostList({ posts }: { posts: Post[] }) {
  if (!posts.length) {
    return <p className="text-sm text-muted-foreground">No posts yet.</p>
  }

  return (
    <div className="space-y-4">
      {posts.map((p, i) => (
        <article key={p.slug} className="space-y-1">
          <h3 className="text-base font-semibold">
            <Link className="underline underline-offset-4 hover:text-foreground text-muted-foreground" href={`/blog/${p.slug}`}>
              {p.meta.title}
            </Link>
          </h3>
          {p.meta.summary && (
            <p className="text-sm text-muted-foreground">{p.meta.summary}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {p.meta.publishedAt ? new Date(p.meta.publishedAt).toLocaleDateString() : 
             p.meta.date ? new Date(p.meta.date).toLocaleDateString() : ""}
          </p>
          {i < posts.length - 1 && <Separator className="mt-3" />}
        </article>
      ))}
    </div>
  )
}
