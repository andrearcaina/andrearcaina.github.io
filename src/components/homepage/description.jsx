import { useState } from 'react';
import Link from 'next/link';

export default function Description() {
    const [hovered, setHovered] = useState(false);

    const toggleHover = () => {
        setHovered(!hovered);
    }

    return (
        <div>
            <div className="text-[1.1rem]/[1.75rem] sm:text-lg">
                what is this? well, i&apos;m glad you asked! the <Link target="_blank" href="https://gist.github.com/andrearcaina" className="hover:text-green-500 hover:text-[1.25rem]/[1.75rem] cursor-pointer duration-200 transition-all">gist</Link> is ~
                a simple website to showcase my <Link href="/projects" className="select-none underline hover:animate-pulse hover:text-green-500 duration-300 transition-all">projects</Link> and
                to learn more about me 
            </div>
            
            <br />

            <div className="text-[1.1rem]/[1.75rem] sm:text-lg">
                the main thing is ... i love to explore and go on an adventure! if you see
                me <b className={`cursor-pointer ${hovered ? 'text-green-600 underline' : 'text-green-500'}`} onMouseEnter={toggleHover} onMouseLeave={toggleHover}>afk</b>  
                {hovered && (
                    <span className="text-sm text-gray-500 ml-1">(away from keyboard)</span>
                )} i&apos;m usually:
            </div>

            <br />
        </div>
    )
}
