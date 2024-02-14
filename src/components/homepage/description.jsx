import { useState } from 'react';
import Link from 'next/link';

export default function Description() {
    const [hovered, setHovered] = useState(false);

    const toggleHover = () => {
        setHovered(!hovered);
    }

    return (
        <div>
            <p className="text-[1.1rem]/[1.75rem] sm:text-lg">
                what is this? well, i&apos;m glad you asked! the gist is ~
                a simple website to showcase my <Link href="/projects" className="select-none underline hover:scale-50 hover:text-green-500 duration-300 transition-all">projects</Link> and
                to learn more about me 
            </p>
            
            <br />

            <p className="text-[1.1rem]/[1.75rem] sm:text-lg">
                the main thing is ... i love to explore and go on an adventure! if you see
                me <b className={`cursor-pointer ${hovered ? 'text-green-600 underline' : 'text-green-500'}`} onMouseEnter={toggleHover} onMouseLeave={toggleHover}>afk</b>  
                {hovered && (
                    <span className="text-sm text-gray-500 ml-1">(away from keyboard)</span>
                )} i&apos;m usually:
            </p>

            <br />
        </div>
    )
}
