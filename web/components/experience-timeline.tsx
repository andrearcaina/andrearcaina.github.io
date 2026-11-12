import type { ExperienceItem } from "@/data/me";
import { cn } from "@/lib/utils";

export function ExperienceTimeline({
  items = [],
  className = "",
}: {
  items?: ExperienceItem[];
  className?: string;
}) {
  return (
    <div className={cn("experience-list", className)}>
      {items.map((experience) => (
        <article
          className="experience-row"
          key={`${experience.role}-${experience.company}`}
        >
          <p className="experience-date">
            {experience.date}
            {experience.location && (
              <>
                <br />
                {experience.location}
              </>
            )}
          </p>
          <div>
            <h3 className="experience-role">{experience.role}</h3>
            <span className="experience-company">{experience.company}</span>
            <p className="experience-description">{experience.description}</p>
            <p className="experience-tech">{experience.tech.join(" · ")}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
