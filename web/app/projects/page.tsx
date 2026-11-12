import { GitHubRepoCards } from "@/components/github-repo-cards";

export const metadata = {
  title: "projects · andre arcaina",
  description: "Projects and repositories by Andre Arcaina.",
};

export default function ProjectsPage() {
  return (
    <div className="site-page">
      <header className="page-intro">
        <p className="page-label">working on some</p>
        <h1 className="page-title">side projects</h1>
        <p className="page-summary">
          A running list from GitHub. The useful details live with the code.
        </p>
      </header>
      <GitHubRepoCards limit={20} />
    </div>
  );
}
