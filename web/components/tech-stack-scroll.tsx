import Link from "next/link";
import { FaAws, FaJava, FaJenkins } from "react-icons/fa";
import {
  SiApachekafka,
  SiCplusplus,
  SiCloudflare,
  SiDocker,
  SiFlux,
  SiGnubash,
  SiGithubactions,
  SiGo,
  SiGooglecloud,
  SiGrafana,
  SiGraylog,
  SiHelm,
  SiJavascript,
  SiKubernetes,
  SiLinux,
  SiPostgresql,
  SiPrometheus,
  SiPython,
  SiRedis,
  SiRust,
  SiTerraform,
  SiTypescript,
  SiNatsdotio,
} from "react-icons/si";
import { DiMsqlServer } from "react-icons/di";
import { FiTerminal } from "react-icons/fi";

const workingSet = [
  { name: "Go", icon: SiGo, href: "https://go.dev" },
  { name: "Python", icon: SiPython, href: "https://www.python.org" },
  { name: "Java", icon: FaJava, href: "https://www.java.com" },
  { name: "C++", icon: SiCplusplus, href: "https://isocpp.org" },
  { name: "Rust", icon: SiRust, href: "https://www.rust-lang.org" },
  { name: "TypeScript", icon: SiTypescript, href: "https://www.typescriptlang.org" },
  { name: "JavaScript", icon: SiJavascript, href: "https://developer.mozilla.org/docs/Web/JavaScript" },
  { name: "SQL", icon: DiMsqlServer, href: "https://en.wikipedia.org/wiki/SQL" },
  { name: "Bash", icon: SiGnubash, href: "https://www.gnu.org/software/bash/" },
  { name: "Kubernetes", icon: SiKubernetes, href: "https://kubernetes.io" },
  { name: "Docker", icon: SiDocker, href: "https://www.docker.com" },
  { name: "Helm", icon: SiHelm, href: "https://helm.sh" },
  { name: "Terraform", icon: SiTerraform, href: "https://www.terraform.io" },
  { name: "Linux", icon: SiLinux, href: "https://www.linux.org" },
  { name: "Cloudflare", icon: SiCloudflare, href: "https://www.cloudflare.com" },
  { name: "AWS", icon: FaAws, href: "https://aws.amazon.com" },
  { name: "GCP", icon: SiGooglecloud, href: "https://cloud.google.com" },
  { name: "GitHub Actions", icon: SiGithubactions, href: "https://github.com/features/actions" },
  { name: "Jenkins", icon: FaJenkins, href: "https://www.jenkins.io" },
  { name: "Flux CD", icon: SiFlux, href: "https://fluxcd.io" },
  { name: "Prometheus", icon: SiPrometheus, href: "https://prometheus.io" },
  { name: "Grafana", icon: SiGrafana, href: "https://grafana.com" },
  { name: "Loki", icon: SiGrafana, href: "https://grafana.com/oss/loki/" },
  { name: "Graylog", icon: SiGraylog, href: "https://graylog.org" },
  { name: "PostgreSQL", icon: SiPostgresql, href: "https://www.postgresql.org" },
  { name: "Redis", icon: SiRedis, href: "https://redis.io" },
  { name: "NATS", icon: SiNatsdotio, href: "https://nats.io" },
  { name: "Kafka", icon: SiApachekafka, href: "https://kafka.apache.org" },
];

function StackItems({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="tech-stack-group" aria-hidden={hidden || undefined}>
      {workingSet.map(({ name, icon: Icon, href }) => (
        <Link className="tech-stack-item" href={href} target="_blank" rel="noreferrer" tabIndex={hidden ? -1 : undefined} key={name}>
          <Icon aria-hidden="true" />
          <span>{name}</span>
        </Link>
      ))}
    </div>
  );
}

export function TechStackScroll() {
  return (
    <div className="tech-stack" aria-label="tools i work with">
      <p className="tech-stack-label">working with</p>
      <div className="tech-stack-window">
        <div className="tech-stack-track">
          <StackItems />
          <StackItems hidden />
        </div>
      </div>
    </div>
  );
}
