import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { MdMail, MdDescription } from "react-icons/md";
import { cn } from "@/lib/utils";
import { profile } from "@/data/me";

type Size = "sm" | "md";

export function SocialIcons({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: Size;
}) {
  const iconClass = cn(
    "site-social-icon",
    size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
  );

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Link
        href={profile.links.github}
        aria-label="GitHub"
        target="_blank"
        rel="noreferrer"
      >
        <FaGithub className={iconClass} />
      </Link>
      <Link
        href={profile.links.linkedin}
        aria-label="LinkedIn"
        target="_blank"
        rel="noreferrer"
      >
        <FaLinkedin className={iconClass} />
      </Link>
      <Link href={profile.links.contact} aria-label="Email">
        <MdMail className={iconClass} />
      </Link>
      <Link
        href={profile.links.resume}
        aria-label="Resume"
        target="_blank"
        rel="noreferrer"
      >
        <MdDescription className={iconClass} />
      </Link>
    </div>
  );
}
