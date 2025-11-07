import matter from "gray-matter"
import { serialize } from 'next-mdx-remote/serialize'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import remarkGfm from 'remark-gfm'

export type MDMeta = {
  title: string
  description?: string
  summary?: string
  publishedAt?: string
  lastUpdatedAt?: string
  tags?: string[]
  cover?: string
  image?: string
}

export async function mdToHtml(markdown: string): Promise<MDXRemoteSerializeResult> {
  return await serialize(markdown, {
    mdxOptions: { remarkPlugins: [remarkGfm] },
  })
}

export function parseFrontmatter(fileContent: string) {
  const { data, content } = matter(fileContent)
  return { data: data as MDMeta, content }
}
