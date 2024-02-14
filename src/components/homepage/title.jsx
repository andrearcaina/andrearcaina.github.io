import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Title() {
    const [clickCount, setClickCount] = useState(0);

    const handleClick = () => {
        setClickCount(clickCount + 1);
    };

    return (
        <div className="mb-[2rem]">
            {clickCount >= 10 && clickCount < 20 ? (
                <motion.h1
                    className="text-[1.7rem]/[1.75rem] sm:text-[2.1rem]/[2rem] cursor-pointer select-none"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 1 }}
                    onClick={handleClick}
                    style={{ display: 'inline-block' }}
                >
                    stop clicking my name 😭
                </motion.h1>
            ) : clickCount >= 20 && clickCount < 30 ? (
                <motion.h1
                    className="text-[1.7rem]/[1.75rem] sm:text-[2.1rem]/[2rem] cursor-pointer select-none"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 1 }}
                    onClick={handleClick}
                    style={{ display: 'inline-block' }}
                >
                    what are you clicking
                </motion.h1>
            ) : clickCount >= 30 && clickCount < 40 ? (
                <motion.h1
                    className="text-[1.7rem]/[1.75rem] sm:text-[2.1rem]/[2rem] cursor-pointer select-none"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 1 }}
                    onClick={handleClick}
                    style={{ display: 'inline-block' }}
                >
                    stop clicking 😭
                </motion.h1>
            ) : clickCount >= 40 && clickCount < 50 ? (
                <motion.h1
                    className="text-[1.7rem]/[1.75rem] sm:text-[2.1rem]/[2rem] cursor-pointer select-none"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 1 }}
                    onClick={handleClick}
                    style={{ display: 'inline-block' }}
                >
                    here&apos;s a present 🎁
                </motion.h1>
            ) : clickCount >= 50 && clickCount < 60 ? (
                <motion.h1
                    className="text-[1.7rem]/[1.75rem] sm:text-[2.1rem]/[2rem] cursor-pointer select-none"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 1 }}
                    onClick={handleClick}
                    style={{ display: 'inline-block' }}
                >
                    you&apos;re still not done?
                </motion.h1>
            ) : clickCount == 60 ? (
                <div>
                    <h1 className="text-[1.7rem]/[1.75rem] sm:text-[2.1rem]/[2rem] select-none">since you&apos;ve come so far, check this out!</h1>
                    
                    <br />
                    
                    <video className="rounded-md" controls autoPlay width="640" height="360">
                        <source src="/videos/yeee.mp4" type="video/mp4" />
                        your browser doesn&apos;t support the rick roll :(
                    </video>
            
                    <div className="text-[0.85rem]/[1.75rem]">Youtube Source:
                        <Link className="underline hover:text-green-500 duration-300 transition-all" href="https://youtu.be/dQw4w9WgXcQ?si=syB3alqrZUGCG270" target="_blank">
                            <p> Rick Astley - Never Gonna Give You Up (Official Music Video) </p>                     
                        </Link>
                    </div>
                </div>
            ) : (
                <motion.h1
                    className="text-[2.1rem]/[1.75rem] sm:text-[2.5rem]/[2rem] cursor-pointer select-none"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 1 }}
                    onClick={handleClick}
                    style={{ display: 'inline-block' }}
                >
                    i&apos;m <span className="text-[2.1rem]/[1.75rem] sm:text-[2.5rem]/[2rem] text-green-500">andre</span>!
                </motion.h1>
            )}
        </div>
    );
}
