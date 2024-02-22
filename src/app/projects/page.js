'use client';
import { motion } from 'framer-motion';
import { Display } from '@/components';

export default function Projects() {
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
            
            <Display />
        </motion.main>
    );
}