import Link from "next/link";

export default function NotFound() {
  return (
    <div className="site-page">
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
