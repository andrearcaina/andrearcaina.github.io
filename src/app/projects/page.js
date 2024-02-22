'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Projects() {
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
        <motion.main
            className="max-w-[30rem] mt-[0.8rem] mb-[2rem] md:mt-[3.5rem] md:mb-[2.5rem]"
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
        >        
            {projects.length > 0 && (
                <div className="bg-gray-100 p-4 rounded-sm">
                    <nav className="flex flex-wrap items-center">
                        {projects.map((project) => (
                            <div key={project.id} className={`cursor-pointer p-2 font-bold ${nav === project.id ? 'text-green-500' : 'hover:text-green-500 duration-300 transition-all'}`} onClick={() => handleNav(project.id)}>
                                {project.name}
                            </div>
                        ))}
                        
                        <div className="cursor-pointer p-2 font-bold">
                            <Link target="_blank" href="https://github.com/andrearcaina?tab=repositories" className="underline hover:text-green-500 duration-300 transition-all">more!</Link>
                        </div>
                    </nav>

                    <Link target="_blank" href={projects[nav].href} className="text-2xl font-bold mb-4 underline hover:text-green-500 hover:text-[1.6rem]/[2rem] duration-300 transition-all">{projects[nav].name}</Link>
                    
                    <p className="text-md md:text-lg my-5">{projects[nav].info}</p>
                    <p className="text-sm md:text-md mb-4">{projects[nav].description}</p>
                    <p className="text-sm md:text-md mb-2"> &gt; <span className="font-bold">{projects[nav].technologies}</span></p>
                    <p className="text-sm md:text-md mb-4"> &gt; <span className="font-bold">{projects[nav].languages}</span></p>
                    
                    {projects[nav].deployment && (
                        <p className="text-sm md:text-md mb-2">
                            <Link target="_blank" href={projects[nav].deployment} className="underline hover:text-green-500 duration-300 transition-all">check deployment</Link>
                        </p>
                    )}
                </div>
            )}
        </motion.main>
    );
}