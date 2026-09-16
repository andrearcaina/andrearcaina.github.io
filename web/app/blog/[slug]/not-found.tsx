import Link from "next/link"

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-6xl font-extrabold tracking-tight text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold mt-4">
        Post not found
      </h1>
      <p className="text-sm text-muted-foreground mt-2 mb-6">
        The blog post you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link 
        href="/blog" 
        className="text-sm text-foreground underline underline-offset-4 hover:text-muted-foreground"
      >
        ← Back to blog
      </Link>
    </div>
  )
}
