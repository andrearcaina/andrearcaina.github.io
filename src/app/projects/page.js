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
            <p className="text-[1.05rem]/[1.75rem] sm:text-lg text-white mb-4">
                here are some of my favourite projects that i&apos;ve been currently working on :)
            </p>

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
                            <p>&gt; {projects[nav].technologies}</p>
                            <p>&gt; {projects[nav].languages}</p>
                        </span>
                    </blockquote>
                    
                    <div className="flex gap-5">
                        <Link target="_blank" href={projects[nav].href} className="text-sm md:text-md font-bold mb-4 hover:underline hover:text-green-200 duration-300 transition-all">view source code</Link>

                        {projects[nav].deployment && (
                            <p className="text-sm md:text-md mb-2">
                                <Link target="_blank" href={projects[nav].deployment} className="hover:underline hover:text-green-200 duration-300 transition-all">deployed website</Link>
                            </p>
                        )}
                    </div>
                </div>
            )}
        </motion.main>
    );
}