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
    "Data Structures and Algorithms", 
    "Distributed Systems and Computer Networks",
    "Operating Systems", 
    "Database Systems", 
    "Software Engineering",
    "Computer Security",
    "Discrete Structures",
  ]
}

export const experiences: ExperienceItem[] = [
  {
    role: "Software Engineer Intern",
    company: "Environment and Climate Change Canada",
    location: "North York, ON",
    date: "Jun 2025 — Present",
    bullets: [
      "Reduced workflow triage and debugging time by developing a Go-based control plane with an SSE observability stream, eliminating manual log searches and providing real-time file state tracking.",
      "Led a 3-person team to reverse-engineer a legacy C++ system, producing UML and architectural diagrams to document system design.",
      "Modernized internal R\&D tooling by replacing a legacy VB6 application with a structured Python/PyQt GUI, implementing Graylog compatible structured logging and secure psycopg SQL queries to process 50,000+ row product datasets.",
      "Optimized validation of multiple product datasets (50,000+ rows) by implementing parameterized SQL queries in applications, eliminating SQL injection risks and reducing overall query latency.",
      "Standardized 8 legacy enterprise Java components to Java 17 and Jakarta EE 10, resolving over 300 compiler warnings and replacing deprecated APIs during the migration."
    ],
    tech: ["Go", "C++", "RabbitMQ", "Java", "Maven", "JakartaEE", "Apache Tomcat", "Python", "PyQt", "PostgreSQL", "GitLab", "Linux"],
  },
  {
    role: "Backend Engineer",
    company: "Undergraduate Science Society of TMU",
    location: "Toronto, ON",
    date: "Jan 2025 — Present",
    bullets: [
      "Engineered a contract-first backend API in Go powering platform services for the undergraduate science student body, leveraging SQLc for type safety and OpenAPI to enforce strict definitions across 32+ endpoints.",
      "Built S3-based image storage with presigned URLs to support secure, horizontally scalable before and after item image uploads.",
      "Implemented a Redis-backed Asynq worker to asynchronously process queued email jobs and deliver notifications via AWS SES.",
      "Added 37+ unit, mock integration, and end-to-end tests to ensure reliability and correctness of business logic.",
    ],
    tech: ["Go", "AWS", "Docker", "PostgreSQL", "Redis", "SQLc", "OpenAPI", "Swagger", "GNU Make"],
  },
  {
    role: "Software Engineer Intern",
    company: "DataKinetics",
    location: "Ottawa, ON",
    date: "May 2024 — Aug 2024",
    bullets: [
      "Engineered Spring Boot REST APIs bridging legacy mainframe systems with modern web applications, automating COBOL-to-JSON transformations for enterprise clients.",
      "Built an interactive data inspection dashboard using jQuery and DataTables, enabling non-technical stakeholders to explore complex copybook structures without manual parsing.",
      "Designed comprehensive Postman test suites achieving 70\%+ code coverage across all mainframe REST API systems.",
    ],
    tech: ["Java", "Spring Boot", "Thymeleaf", "JavaScript", "jQuery", "Postman", "GitHub Actions"],
  },
]
