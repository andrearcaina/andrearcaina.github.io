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
    resume: "/resume/Andre_Arcaina_Full_Stack_SWE_Resume.pdf"
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
      "Rebuilt 2+ legacy VB6 tools using Python and PyQt, integrating the team’s standard logging framework to make debugging and auditing significantly faster.",
      "Secured database operations by implementing parameterized SQL queries with psycopg, preventing SQL injection attacks and improving performance for iceberg dataset validation.",
      "Modified and documented a C/C++ ETL pipeline for Synthetic Aperture Radar (SAR) satellite data, mapping end-to-end data flows across decoding, calibration, and encoding modules to support system modernization.",
      "Modernized 8+ Java 1.8 codebases to Jakarta EE 10, refactoring 5,000+ LOC and resolving 1,200+ compiler warnings."
    ],
    tech: ["C", "C++", "Python", "PyQt", "Java", "JPA", "Jakarta EE", "Maven", "Apache Tomcat", "Oracle", "PostgreSQL", "GitLab", "Linux"],
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
    tech: ["Go", "SQLc", "OpenAPI", "Swagger", "PostgreSQL", "Docker"],
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
    tech: ["Java", "Spring Boot", "Thymeleaf", "jQuery", "Postman", "GitHub Actions"],
  },
]
