import { SocialIcons } from "./social-icons";

export function Footer() {
  return (
    <footer className="site-footer">
      <p>© {new Date().getFullYear()} Andre Arcaina</p>
      <SocialIcons size="sm" />
    </footer>
  );
}
