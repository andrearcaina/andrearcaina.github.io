export type ExperienceItem = {
  role: string
  company: string
  location?: string
  start: string
  end: string
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
  degree: "Computer Science Co-op - BSc (Hons)",
  institution: "Toronto Metropolitan University (formerly Ryerson University)",
  location: "Toronto, ON",
  start: "Sept 2022",
  end: "Present",
  courses: [
    "DB Systems I",
    "Operating Systems I",
    "Discrete Structures",
    "Data Structures",
    "Algorithms",
    "Computer Security I",
    "Computer Networks I"
  ],
  cgpa: "3.70/4.33 (3.6/4.0)",
  involvements: [
    "Backend Lead @ PACS",
    "Backend Engineer @ USSTM",
    "Web Developer @ TMUCSA"
  ]
}

export const experiences: ExperienceItem[] = [
  {
    role: "Software Engineer Intern",
    company: "Environment and Climate Change Canada",
    location: "North York, ON",
    start: "Jun 2025",
    end: "Present",
    bullets: [
      "Developed Spring Boot microservice to process and validate ice telemetry data.",
      "Migrated 5,000+ lines from javax.* to jakarta.* to meet Jakarta EE 10 standards.",
      "Cut Apache Tomcat build times by 33% by moving from Apache Ivy to Maven.",
      "Contributed to migration of Oracle DB to PostgreSQL, transferring over 80 GB of data.",
      "Refactored data access logic to use psycopg2 instead of oracledb for Python services and APIs."
    ],
    tech: ["Java", "Spring Boot", "JPA", "Jakarta EE", "Maven", "Apache Tomcat", "JSF", "Python", "Oracle", "Postgres", "GitLab"],
  },
  {
    role: "Backend Engineer",
    company: "Undergraduate Science Society of TMU",
    location: "Toronto, ON",
    start: "Jan 2025",
    end: "Present",
    bullets: [
      "Developed 13+ RESTful API endpoints in Go with CLEAN architecture for 3+ PostgreSQL databases.",
      "Added 25+ unit/integration tests, boosting overall project coverage by 75%.",
      "Used SQLc for type‑safe queries and generated OpenAPI/Swagger specs to scaffold Go server code.",
    ],
    tech: ["Go", "SQLc", "OpenAPI", "Swagger", "PostgreSQL", "Docker"],
  },
  {
    role: "Software Engineer Intern",
    company: "DataKinetics",
    location: "Ottawa, ON",
    start: "May 2024",
    end: "Aug 2024",
    bullets: [
      "Built Java backend services using Spring Boot, designing RESTful APIs to convert COBOL copybooks to JSON.",
      "Implemented uploads + record visualization via jQuery, AJAX, DataTables.",
      "Wrote and documented a Postman test suite across company APIs.",
    ],
    tech: ["Java", "Spring Boot", "Thymeleaf", "jQuery"],
  },
]
