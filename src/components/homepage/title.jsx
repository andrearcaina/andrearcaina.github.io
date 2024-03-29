import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Title() {
    const [clickCount, setClickCount] = useState(0);

    const handleClick = () => {
        setClickCount(clickCount + 1);
    };

    return (
        <div className="mb-[2rem] flex items-center">
            {(clickCount > 0 && clickCount != 60) && (
                <p className="mr-[1.5rem] text-[0.95rem]/[1.75rem] text-gray-400">{clickCount}</p>
            )}

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
                    do you just want to see the number rise?
                </motion.h1>
            ) : clickCount >= 40 && clickCount < 50 ? (
                <motion.h1
                    className="text-[1.7rem]/[1.75rem] sm:text-[2.1rem]/[2rem] cursor-pointer select-none"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 1 }}
                    onClick={handleClick}
                    style={{ display: 'inline-block' }}
                >
                    here&apos;s a present! 🎁
                </motion.h1>
            ) : clickCount >= 50 && clickCount < 60 ? (
                <motion.h1
                    className="text-[1.7rem]/[1.75rem] sm:text-[2.1rem]/[2rem] cursor-pointer select-none"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 1 }}
                    onClick={handleClick}
                    style={{ display: 'inline-block' }}
                >
                    wait, you&apos;re still not done?
                </motion.h1>
            ) : clickCount == 60 ? (
                <div>
                    <h1 className="text-[1.7rem]/[1.75rem] sm:text-[2.1rem]/[2rem] select-none">since you&apos;ve come so far, check this out!</h1>
                    
                    <br />
                    
                    <iframe
                        className="rounded-md w-[300px] h-[250px] sm:w-[500px] sm:h-[360px]"
                        loading="lazy"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
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
