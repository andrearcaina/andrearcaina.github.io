import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Display() {
    const [projects, setProjects] = useState([]);
    const [nav, setNav] = useState(0);
    
    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/data/best-projects.json');
            const data = await res.json();
            setProjects(data);
        } catch (err) {
            console.error(err);
        }
    }
    
    const handleNav = (id) => {
        setNav(id);
    }

    return (
        <div className="text-black">
            {projects.length > 0 && (
                <div className="bg-gray-400 p-4 rounded-md">
                    <nav className="flex flex-wrap items-center">
                        {projects.map((project) => (
                            <div key={project.id} className={`cursor-pointer p-2 font-bold ${nav === project.id ? 'text-green-200' : 'hover:text-green-200 duration-300 transition-all'}`} onClick={() => handleNav(project.id)}>
                                {project.name}
                            </div>
                        ))}
                        
                        <div className="cursor-pointer p-2 font-bold">
                            <Link target="_blank" href="https://github.com/andrearcaina?tab=repositories" className="underline hover:text-green-200 duration-300 transition-all">more!</Link>
                        </div>
                    </nav>
        
                    <p className="text-md md:text-lg my-5">{projects[nav].info}</p>
                    <p className="text-sm md:text-md mb-4">{projects[nav].description}</p>

                    <blockquote className="p-4 mb-4 border-l-2 border-gray-600 bg-gray-800 text-sm md:text-md">
                        <span className="leading-relaxed text-gray-300 font-bold">
                            <p>&gt; built using {projects[nav].technologies}</p>
                            <p>&gt; coded in {projects[nav].languages}</p>
                        </span>
                    </blockquote>
                    
                    <div className="flex gap-5">
                        <span className="text-sm md:text-md font-bold mb-4">view <Link target="_blank" href={projects[nav].href} className="underline hover:text-green-200 duration-300 transition-all">source</Link> code</span>

                        {projects[nav].deployment && (
                            <p className="text-sm md:text-md mb-2">
                                <span className="text-sm md:text-md font-bold mb-4">view <Link target="_blank" href={projects[nav].deployment} className="underline hover:text-green-200 duration-300 transition-all">website</Link></span>
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}