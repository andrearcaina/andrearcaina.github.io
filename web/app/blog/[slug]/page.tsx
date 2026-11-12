import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import MDXContent from "@/components/mdx-content";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  return {
    title: post?.meta.title ?? "note",
    description: post?.meta.description || post?.meta.summary,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { meta, content } = post;

  return (
    <article className="article-layout">
      <Link className="quiet-link article-back" href="/blog">
        <FiArrowLeft aria-hidden="true" /> back to notes
      </Link>

      <header>
        <p className="page-label">note</p>
        <h1 className="article-title mt-3">{meta.title}</h1>
        <div className="article-meta">
          {meta.publishedAt && <span>{formatDate(meta.publishedAt)}</span>}
          {meta.lastUpdatedAt && (
            <span>updated {formatDate(meta.lastUpdatedAt)}</span>
          )}
        </div>
      </header>

      {meta.image && (
        <div className="article-cover">
          <Image src={meta.image} alt={meta.title || ""} fill className="object-cover" />
        </div>
      )}

      <div className="mdx-content">
        <MDXContent source={content} />
      </div>
    </article>
  );
}
