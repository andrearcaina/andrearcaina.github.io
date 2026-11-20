import Link from "next/link";

// This concrete route is emitted during the static export so the Go server can
// use it as the fallback document for unknown blog slugs.
export default function BlogNotFoundPage() {
  return (
    <div className="site-page flex min-h-[55vh] items-center">
      <div className="page-intro">
        <p className="page-label">404</p>
        <h1 className="page-title">note not found</h1>
        <p className="page-summary">It may have moved, or it may still be a thought.</p>
        <Link href="/blog" className="text-link mt-8">
          back to notes →
        </Link>
      </div>
    </div>
  );
}
