import Link from "next/link";

export default function NotFound() {
  return (
    <div className="site-page flex min-h-[55vh] items-center">
      <div className="page-intro">
        <p className="page-label">404</p>
        <h1 className="page-title">nothing here</h1>
        <p className="page-summary">
          This page either moved or never existed in the first place.
        </p>
        <Link className="text-link mt-8" href="/">
          back home →
        </Link>
      </div>
    </div>
  );
}
