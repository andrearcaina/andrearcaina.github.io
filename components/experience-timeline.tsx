import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ExperienceItem } from "@/data/me"
import { cn } from "@/lib/utils"
import { TextShimmer } from "@/components/motion-components"

export function ExperienceTimeline({
  items = [],
  className = "",
}: {
  items?: ExperienceItem[]
  className?: string
}) {
  return (
    <section id="experience" className={cn("space-y-6", className)}>
      <h2 className="text-lg font-medium">here are some of the <TextShimmer>experiences</TextShimmer> I've gained throughout my career:</h2>
      <div className="space-y-4">
        {items.map((exp, i) => (
          <Card key={i} className="border border-border bg-card transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-muted-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="flex flex-wrap items-baseline gap-x-2 text-base">
                <span className="font-semibold">{exp.role}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{exp.company}</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {exp.start} — {exp.end} {exp.location ? `· ${exp.location}` : ""}
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="list-disc pl-5 text-sm leading-relaxed text-muted-foreground">
                {exp.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
              {exp.tech && (
                <p className="pt-2 text-xs text-muted-foreground">
                  tech: <span className="italic">{exp.tech.join(", ")}</span>
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
