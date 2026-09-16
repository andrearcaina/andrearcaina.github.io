import "server-only"
import { promises as fs } from "fs"
import path from "path"
import { mdToHtml, parseFrontmatter, type MDMeta } from "./markdown"
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'

export type Post = {
  slug: string
  meta: MDMeta & { dateISO?: string }
  content: string
  contentHtml: MDXRemoteSerializeResult
}

const POSTS_DIR = path.join(process.cwd(), "content", "posts")

export async function getPostSlugs(): Promise<string[]> {
  try {
    const all = await fs.readdir(POSTS_DIR)
    return all.filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, ""))
  } catch {
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const fullPath = path.join(POSTS_DIR, `${slug}.mdx`)
    const raw = await fs.readFile(fullPath, "utf8")
    const { data, content } = parseFrontmatter(raw)
    const contentHtml = await mdToHtml(content)
    const dateField = data.publishedAt
    const dateISO = dateField ? new Date(dateField).toISOString() : undefined
    return { slug, meta: { ...data, dateISO }, content, contentHtml }
  } catch {
    return null
  }
}

export async function getAllPosts(): Promise<Post[]> {
  const slugs = await getPostSlugs()
  const posts = await Promise.all(slugs.map((s) => getPostBySlug(s)))
  return (posts.filter(Boolean) as Post[]).sort((a, b) => {
    const dateA = a.meta.publishedAt ? new Date(a.meta.publishedAt).getTime() : 0
    const dateB = b.meta.publishedAt ? new Date(b.meta.publishedAt).getTime() : 0
    return dateB - dateA
  })
}
