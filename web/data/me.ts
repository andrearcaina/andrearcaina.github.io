export type ExperienceItem = {
  role: string;
  company: string;
  location?: string;
  date: string;
  description: string;
  bullets?: string[];
  tech: string[];
};

export const profile = {
  name: "andre arcaina",
  links: {
    github: "https://github.com/andrearcaina",
    linkedin: "https://www.linkedin.com/in/andrearcaina/",
    contact: "/contact",
    resume: "/resume/resume.pdf",
  },
};

export const education = {
  degree: "Bachelor of Science (Honours), Computer Science (Co-op)",
  institution:
    "Toronto Metropolitan University (TMU, formerly Ryerson University)",
  location: "Toronto, ON",
  date: "Sept 2022 — Apr 2027",
  involvements: [
    "Backend Lead @ PACS",
    "Backend Engineer @ USSTM",
    "Web Developer @ TMUCSA",
  ],
  courses: [
    "Data Structures and Algorithms",
    "Distributed Systems and Computer Networks",
    "Operating Systems",
    "Database Systems",
    "Software Engineering",
    "Computer Security",
    "Discrete Structures",
  ],
};

export const experiences: ExperienceItem[] = [
  {
    role: "Open Source Contributor",
    company: "Linux Foundation (CNCF and LF AI & Data)",
    location: "Markham, ON (Remote)",
    date: "Aug 2026 — Present",
    description:
      "Contributing to cloud-native infrastructure projects including Flux CD, OpenTelemetry, gRPC-Go, Flyte, Kepler, and Trickster by improving Helm charts, unit and end-to-end test coverage, CI workflows, and overall software and system reliability.",
    tech: [
      "Go",
      "Rust",
      "Python",
      "Kubernetes",
      "Helm",
      "Prometheus",
      "CI/CD",
      "GitHub Actions",
      "Flux CD",
      "gRPC",
    ],
  },
  {
    role: "Software Engineer Intern",
    company: "Environment and Climate Change Canada (ECCC)",
    location: "North York, ON",
    date: "Jun 2025 — Aug 2026",
    description:
      "Modernized mission-critical weather, maritime, and Coast Guard systems by upgrading Java services, building Go test automation, and troubleshooting C++ decoders and production workflows.",
    tech: [
      "Go",
      "C++",
      "Java",
      "Python",
      "PostgreSQL",
      "Maven",
      "Jakarta EE",
      "Apache Tomcat",
      "PyQt",
      "Jenkins",
      "GitLab",
      "Linux",
    ],
  },
  {
    role: "Backend Engineer",
    company: "Undergraduate Science Society of TMU (USSTM)",
    location: "Toronto, ON",
    date: "Jan 2025 — Present",
    description:
      "Co-owned a contract-first Go REST API for a campus item-lending service, deployed on Amazon EC2 with Docker Compose and Caddy, with secure S3 uploads and asynchronous email delivery.",
    tech: [
      "Go",
      "AWS",
      "Docker",
      "PostgreSQL",
      "Redis",
      "SQLc",
      "OpenAPI",
      "Swagger",
      "GNU Make",
    ],
  },
  {
    role: "Software Engineer Intern",
    company: "DataKinetics",
    location: "Ottawa, ON",
    date: "May 2024 — Aug 2024",
    description:
      "Led development of a Spring Boot REST API and dashboard that converted COBOL copybooks to JSON and helped engineers edit Db2 records and troubleshoot mainframe data.",
    tech: [
      "Java",
      "Spring Boot",
      "Thymeleaf",
      "JavaScript",
      "jQuery",
      "Postman",
      "GitHub Actions",
    ],
  },
];
