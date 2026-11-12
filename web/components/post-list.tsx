import Link from "next/link";
import type { Post } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

export function PostList({ posts }: { posts: Post[] }) {
  if (!posts.length) {
    return <p className="text-sm text-muted-foreground">nothing here yet.</p>;
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <article className="post-row" key={post.slug}>
          <p className="article-date">
            {post.meta.publishedAt
              ? formatDate(post.meta.publishedAt)
              : "undated"}
          </p>
          <div>
            <h3>
              <Link className="post-title" href={`/blog/${post.slug}`}>
                {post.meta.title}
              </Link>
            </h3>
            {post.meta.summary && (
              <p className="post-summary">{post.meta.summary}</p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
