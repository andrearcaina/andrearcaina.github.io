export type GitHubRepo = {
  id: number
  name: string
  html_url: string
  description: string | null
  stargazers_count: number
  forks_count: number
  watchers_count: number
  language: string | null
  pushed_at: string
  archived?: boolean
  fork?: boolean
  owner?: { login: string }
  topics?: string[]
}

export async function fetchRecentRepos(username: string, perPage = 10, initialFetch = 20) {
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&direction=desc&per_page=${initialFetch}`,
    { headers: { Accept: "application/vnd.github+json" }, next: { revalidate: 3600 } }
  )
  if (!res.ok) return []
  const data = (await res.json()) as GitHubRepo[]
  
  const filtered = data.filter(r => 
    !r.fork && 
    !r.archived && 
    r.owner?.login?.toLowerCase() === username.toLowerCase() &&
    r.name.toLowerCase() !== 'andrearcaina'
  )
  
  const priorityRepos = ['fafnir', 'vivid', 'zephyr', 'nectar']
  
  const priority = filtered.filter(repo => 
    priorityRepos.some(priorityName => repo.name.toLowerCase().includes(priorityName.toLowerCase()))
  )
  const others = filtered.filter(repo => 
    !priorityRepos.some(priorityName => repo.name.toLowerCase().includes(priorityName.toLowerCase()))
  )
  
  priority.sort((a, b) => {
    const aIndex = priorityRepos.findIndex(name => a.name.toLowerCase().includes(name.toLowerCase()))
    const bIndex = priorityRepos.findIndex(name => b.name.toLowerCase().includes(name.toLowerCase()))
    return aIndex - bIndex
  })
  
  others.sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
  
  return [...priority, ...others].slice(0, perPage)
}
