export type ExperienceItem = {
  role: string
  company: string
  location?: string
  date: string
  bullets: string[]
  tech?: string[]
}

export const profile = {
  name: "andre arcaina",
  links: {
    github: "https://github.com/andrearcaina",
    linkedin: "https://www.linkedin.com/in/andre-arcaina/",
    contact: "/contact",
    resume: "/resume/resume.pdf"
  },
}

export const education = {
  degree: "Bachelor of Science (Honours), Computer Science (Co-op)",
  institution: "Toronto Metropolitan University (TMU, formerly Ryerson University)",
  location: "Toronto, ON",
  date: "Sept 2022 — Present",
  involvements: [
    "Backend Lead @ PACS",
    "Backend Engineer @ USSTM",
    "Web Developer @ TMUCSA"
  ],
  courses: [
    "Data Structures", 
    "Algorithms",
    "Discrete Structures",
    "Operating Systems I", 
    "Database Systems I", 
    "Computer Networks I",
    "Computer Security I",
  ]
}

export const experiences: ExperienceItem[] = [
  {
    role: "Software Engineer Intern",
    company: "Environment and Climate Change Canada",
    location: "North York, ON",
    date: "Jun 2025 — Present",
    bullets: [
      "Led a 3-person team to reverse-engineer a legacy C++ SAR decoding microservice, producing UML and architectural diagrams to document system design.",
      "Led a Python/PyQt replacement for legacy VB6 tooling, integrating structured logging to reduce debugging time for mission-critical software.",
      "Optimized validation of multiple product datasets (50,000+ rows) by implementing parameterized SQL queries in applications, eliminating SQL injection risks and reducing overall query latency.",
      "Modernized 8+ Java 1.8 codebases to Jakarta EE 10, refactoring 5,000+ LOC and resolving 1,200+ compiler warnings."
    ],
    tech: ["C++", "RabbitMQ", "Python", "PyQt", "Java", "JPA", "Jakarta EE", "Maven", "Apache Tomcat", "Oracle", "PostgreSQL", "GitLab", "Linux"],
  },
  {
    role: "Backend Engineer",
    company: "Undergraduate Science Society of TMU",
    location: "Toronto, ON",
    date: "Jan 2025 — Present",
    bullets: [
      "Developed 27+ RESTful API endpoints in Go with CLEAN architecture for 3+ PostgreSQL databases.",
      "Added 37+ unit, mock integration, and end-to-end tests to ensure reliability and correctness of business logic.",
      "Used SQLc for type‑safe queries and generated OpenAPI/Swagger specs to scaffold Go server code.",
    ],
    tech: ["Go", "Docker", "AWS", "PostgreSQL", "Redis", "SQLc", "OpenAPI", "Swagger", "GNU Make"],
  },
  {
    role: "Software Engineer Intern",
    company: "DataKinetics",
    location: "Ottawa, ON",
    date: "May 2024 — Aug 2024",
    bullets: [
      "Built Java backend services using Spring Boot, designing RESTful APIs to convert COBOL copybooks to JSON.",
      "Implemented uploads + record visualization via jQuery, AJAX, DataTables.",
      "Wrote and documented a Postman test suite across company APIs.",
    ],
    tech: ["Java", "Spring Boot", "Thymeleaf", "JavaScript", "jQuery", "Postman", "GitHub Actions"],
  },
]
