import { PostList } from "@/components/post-list";
import { getAllPosts } from "@/lib/posts";

export const metadata = {
  title: "notes · andre arcaina",
  description: "Notes on engineering, homelabs, and things Andre Arcaina is working on.",
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="site-page">
      <header className="page-intro notes-intro">
        <p className="page-label">writing notes</p>
        <h1 className="page-title">whenever i feel like it</h1>
        <p className="page-summary">
          Mostly engineering, occasionally whatever else has been taking up
          space in my head.
        </p>
      </header>
      <PostList posts={posts} />
    </div>
  );
}
