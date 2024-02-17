'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Contact() {
    return (
        <motion.main
            className="max-w-[30rem] mt-[0.8rem] mb-[2rem] md:mt-[3.5rem] md:mb-[2.5rem] text-white"
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <h1>Welcome to my portfolio</h1>
            <p>this is the contact page</p>
            <p>currently under construction</p>
            <div>for more information, check my <Link href="https://www.linkedin.com/in/andre-arcaina/" className="underline hover:text-green-500 duration-300 transition-all">LinkedIn</Link></div>
        </motion.main>
    );
}
