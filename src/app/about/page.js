'use client';
import { motion } from 'framer-motion';
import { Interests, Code } from '@/components';

export default function About() {
    return (
        <motion.main
            className="max-w-[30rem] mt-[0.8rem] mb-[2rem] md:mt-[3.5rem] md:mb-[2.5rem] text-white"
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Interests />
            <Code />
        </motion.main>
    );
}
