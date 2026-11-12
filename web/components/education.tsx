import { education } from "@/data/me";

export function Education() {
  return (
    <section className="education-note" aria-labelledby="education-heading">
      <p className="section-label">on paper</p>
      <div className="education-copy">
        <h3 id="education-heading">
          <strong>{education.degree}</strong> at {education.institution}
        </h3>
        <p className="mt-2">
          {education.date} · {education.location}
        </p>
        <p className="mt-4">
          Outside class: {education.involvements.join(" · ")}
        </p>
      </div>
    </section>
  );
}
