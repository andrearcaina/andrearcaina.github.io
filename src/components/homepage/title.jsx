import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Title() {
    const [clickCount, setClickCount] = useState(0);

    const handleClick = () => {
        if (clickCount < 10) {
            setClickCount(clickCount + 1);
        }
    };

    return (
        <div>
            {clickCount < 10 ? (
                <motion.h1
                    className="text-[2.1rem]/[1.75rem] sm:text-[2.5rem]/[2rem] cursor-pointer select-none"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 1 }}
                    onClick={handleClick}
                    style={{ display: 'inline-block' }}
                >
                    i&apos;m <span className="text-[2.1rem]/[1.75rem] sm:text-[2.5rem]/[2rem] text-green-500">andre</span>!
                </motion.h1>
            ) : (
                <h1 className="text-[1.7rem]/[1.75rem] sm:text-[2.1rem]/[2rem] cursor-pointer select-none">stop clicking my name 😭</h1>
            )}
            <br /> 
        </div>
    );
}
