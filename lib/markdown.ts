import matter from "gray-matter"

export type MDMeta = {
  title: string
  description?: string
  summary?: string
  publishedAt?: string
  tags?: string[]
  cover?: string
  image?: string
}

export async function mdToHtml(markdown: string) {
  return markdown
}

export function parseFrontmatter(fileContent: string) {
  const { data, content } = matter(fileContent)
  return { data: data as MDMeta, content }
}
