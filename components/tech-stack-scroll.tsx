'use client'

import React from 'react'
import Autoplay from "embla-carousel-autoplay"
import Image from 'next/image'

import { FaJava, FaGitAlt, FaJenkins } from 'react-icons/fa'
import { FaC } from "react-icons/fa6"
import { VscVscode, VscTerminalBash } from "react-icons/vsc"

import { 
    SiGo, SiPython, SiJavascript, SiTypescript, SiPostgresql,
    SiReact, SiNextdotjs, SiTailwindcss, SiSpringboot, SiDjango, SiFastapi, SiFlask,
    SiDotnet, SiNodedotjs, SiMongodb, SiSupabase, SiOracle, SiGooglecloud,
    SiDocker, SiKubernetes, SiGithubactions, SiCircleci, SiGraphql, SiSqlalchemy, SiHibernate, SiArcgis, SiQgis, 
    SiPrometheus, SiGrafana, SiPostman, SiSwagger, SiOpencv,
} from 'react-icons/si'

import { TbBrandCpp } from "react-icons/tb"

import { DiVisualstudio, DiRedis, DiMysql } from "react-icons/di";
import { FcLinux } from "react-icons/fc";

import Link from 'next/link'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel"
import { IconBase } from 'react-icons/lib'

const CustomIcon = ({ src, alt }: { src: string; alt: string }) => (
    <Image
        src={src}
        alt={alt}
        width={28}
        height={28}
        className="object-contain"
    />
)

const TECH_STACK = [
    // Languages
    { name: "Go", icon: SiGo, url: "https://golang.org", color: "#00ADD8" },
    { name: "Python", icon: SiPython, url: "https://python.org", color: "#3776AB" },
    { name: "Java", icon: FaJava, url: "https://www.java.com/en/", color: "#ED8B00" },
    { name: "C", icon: FaC, url: "https://en.cppreference.com/w/", color: "#A8B9CC" },
    { name: "C++", icon: TbBrandCpp, url: "https://en.cppreference.com/w/", color: "#00599C" },
    // { name: "C#", icon: () => <CustomIcon src="/images/csharp.png" alt="C#" />, url: "https://docs.microsoft.com/en-us/dotnet/csharp", color: "#512BD4" },
    { name: "JavaScript", icon: SiJavascript, url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", color: "#F7DF1E" },
    { name: "TypeScript", icon: SiTypescript, url: "https://typescriptlang.org", color: "#3178C6" },
    
    // Frameworks - Backend
    { name: "Spring Boot", icon: SiSpringboot, url: "https://spring.io/projects/spring-boot", color: "#6DB33F" },
    { name: "Flask", icon: SiFlask, url: "https://flask.palletsprojects.com/en/stable/", color: "" },
    { name: "FastAPI", icon: SiFastapi, url: "https://fastapi.tiangolo.com", color: "#009688" },
    { name: "Django", icon: SiDjango, url: "https://djangoproject.com", color: "#092E20" },
    // { name: ".NET", icon: SiDotnet, url: "https://dotnet.microsoft.com", color: "#512BD4" },
    { name: "Node.js", icon: SiNodedotjs, url: "https://nodejs.org", color: "#339933" },
    
    // Frameworks - Frontend
    { name: "React", icon: SiReact, url: "https://react.dev", color: "#61DAFB" },
    { name: "Next.js", icon: SiNextdotjs, url: "https://nextjs.org", color: "" },
    { name: "Tailwind CSS", icon: SiTailwindcss, url: "https://tailwindcss.com", color: "#06B6D4" },
    
    // Libraries
    { name: "SQLAlchemy", icon: SiSqlalchemy, url: "https://sqlalchemy.org", color: "#D71F00" },
    // { name: "Hibernate", icon: SiHibernate, url: "https://hibernate.org", color: "#59666C" },
    { name: "GraphQL", icon: SiGraphql, url: "https://graphql.org", color: "#E10098" },
    { name: "WebSockets", icon: () => <CustomIcon src="/images/websockets.png" alt="WebSockets" />, url: "https://websockets.spec.whatwg.org/", color: "" },
    { name: "ArcGIS", icon: SiArcgis, url: "https://www.arcgis.com", color: "#3178C6" },
    { name: "GDAL", icon: SiQgis, url: "https://gdal.org", color: "#589632" },
    // { name: "OpenCV", icon: SiOpencv, url: "https://opencv.org", color: "#5C3EE8" },
    
    // Databases - Relational
    { name: "PostgreSQL", icon: SiPostgresql, url: "https://postgresql.org", color: "#4169E1" },
    { name: "MySQL", icon: DiMysql, url: "https://www.mysql.com", color: "#4479A1" },

    // Databases - Relational + Cloud
    { name: "Oracle", icon: SiOracle, url: "https://oracle.com", color: "#F80000" },
    { name: "Supabase", icon: SiSupabase, url: "https://supabase.com", color: "#3ECF8E" },
    { name: "NeonDB", icon: () => <CustomIcon src="/images/neondb.png" alt="NeonDB" />, url: "https://neon.tech", color: "#00E699" },

    // Databases - NoSQL
    { name: "MongoDB", icon: SiMongodb, url: "https://mongodb.com", color: "#47A248" },
    { name: "Redis", icon: DiRedis, url: "https://redis.io", color: "#DC382D" },

    // Tools - Cloud
    { name: "GCP", icon: SiGooglecloud, url: "https://cloud.google.com", color: "#4285F4" },
    
    // Tools - Containerization
    { name: "Docker", icon: SiDocker, url: "https://docker.com", color: "#2496ED" },
    { name: "Kubernetes", icon: SiKubernetes, url: "https://kubernetes.io", color: "#326CE5" },
    
    // Tools - CI/CD
    { name: "GitHub Actions", icon: SiGithubactions, url: "https://github.com/features/actions", color: "#2088FF" },
    { name: "Jenkins", icon: FaJenkins, url: "https://jenkins.io", color: "" },
    // { name: "CircleCI", icon: SiCircleci, url: "https://circleci.com", color: "#343434" },

    // Tools - Other
    { name: "Git", icon: FaGitAlt, url: "https://git-scm.com", color: "#F05032" },
    { name: "Postman", icon: SiPostman, url: "https://postman.com", color: "#FF6C37" },
    { name: "Swagger", icon: SiSwagger, url: "https://swagger.io", color: "#85EA2D" },
    { name: "Bash", icon: VscTerminalBash, url: "https://www.gnu.org/software/bash/", color: "" },
    
    // Tools - Monitoring
    { name: "Prometheus", icon: SiPrometheus, url: "https://prometheus.io", color: "#E6522C" },
    { name: "Grafana", icon: SiGrafana, url: "https://grafana.com", color: "#F46800" },
    
    // IDEs/Text Editors
    { name: "JetBrains IDEs", icon: () => <CustomIcon src="/images/jetbrains.png" alt="JetBrains IDEs" />, url: "https://jetbrains.com", color: "" },
    { name: "Goland", icon: () => <CustomIcon src="/images/goland.png" alt="Goland" />, url: "https://www.jetbrains.com/go/", color: "" },
    { name: "IntelliJ IDEA", icon: () => <CustomIcon src="/images/intellij.png" alt="IntelliJ IDEA" />, url: "https://www.jetbrains.com/idea/", color: "" },
    { name: "DataGrip", icon: () => <CustomIcon src="/images/datagrip.png" alt="DataGrip" />, url: "https://www.jetbrains.com/datagrip/", color: "" },
    { name: "Visual Studio", icon: DiVisualstudio, url: "https://visualstudio.microsoft.com/", color: "#5C2D91" },
    { name: "VS Code", icon: VscVscode, url: "https://code.visualstudio.com", color: "#007ACC" },

    // Operating Systems
    { name: "Linux", icon: FcLinux, url: "https://www.linux.org", color: "" },
]

export function TechStackScroll() {
    const plugin = React.useRef(
        Autoplay({ delay: 1250, stopOnInteraction: false, stopOnMouseEnter: true })
    )

    return (
        <div className="w-full py-4">
            <Carousel
                plugins={[plugin.current]}
                opts={{
                    align: "start",
                    loop: true,
                    dragFree: true,
                }}
                className="w-full"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
            >
                <CarouselContent className="-ml-1">
                    {TECH_STACK.map((tech, index) => {
                        const IconComponent = tech.icon
                        return (
                            <CarouselItem key={index} className="pl-1 basis-1/4 sm:basis-1/5 md:basis-1/6 lg:basis-1/8 xl:basis-1/10">
                                <Link
                                    className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform duration-200 p-3"
                                    href={tech.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <IconComponent size={28} color={tech.color} />
                                    <span className="text-xs mt-2 text-center leading-tight" style={{ color: tech.color }}>
                                        {tech.name}
                                    </span>
                                </Link>
                            </CarouselItem>
                        )
                    })}
                </CarouselContent>
            </Carousel>
        </div>
    )
}