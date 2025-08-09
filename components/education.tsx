import { education } from "@/data/me"
import { TextShimmer } from "@/components/motion-components"

export function Education() {
  return (
    <section id="education" className="space-y-4">
      <h2 className="text-lg font-medium">the things i do for <TextShimmer>education</TextShimmer></h2>
      <div className="text-sm leading-relaxed text-muted-foreground">
        <p>
          {education.institution} — {education.degree}
        </p>
        <p>{education.start} – {education.end} · {education.location} · CGPA: {education.cgpa}</p>
        <p className="pt-2">
          Coursework: {education.courses.join(", ")}
        </p>
        <p className="pt-2">Involvements: {education.involvements.join(" · ")}</p>
      </div>
    </section>
  )
}
