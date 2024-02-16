'use client';
import Link from 'next/link';

export default function Projects() {
    return (
        <main className="sm:w-[70%] lg:w-[50%] xl:w-[40%] mt-[0.8rem] mb-[2rem] md:mt-[3.5rem] md:mb-[2.5rem] text-white">
            <h1>Welcome to my portfolio</h1>
            <p>this is the project page</p>
            <p>currently under construction</p>
            <div>for more information, check my <Link href="https://github.com/andrearcaina" className="underline hover:text-green-500 duration-300 transition-all">GitHub</Link></div>
        </main>
    );
}
