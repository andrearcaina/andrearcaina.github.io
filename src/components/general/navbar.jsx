import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Navbar() {
    const [navItems, setNavItems] = useState([]);
    const pathname = usePathname();

    useEffect(() => {
        fetchNavItems();
    }, []);

    const fetchNavItems = async () => {
        try {
            const response = await fetch('/data/nav-items.json');
            const data = await response.json();
            setNavItems(data);
        } catch (err) {
            console.error(err);
        }
    }; 

    return (
        <motion.nav
            className="flex flex-row md:flex-col md:mt-[12vh] items-end lg:w-[15rem] xl:w-[35rem]"
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            {navItems.map((item) => (
                <Link key={item.id} href={item.href} passHref>
                    <p className={`px-[0.5rem] py-[1.15rem] md:px-3 lg:px-4 text-[1.2rem]/[1] sm:text-[1.35rem]/[1] hover:text-green-600 hover:scale-[1.2] hover:font-bold transition-all duration-400 cursor-pointer ${pathname === item.href ? 'text-green-600 underline' : 'text-white'}`}>{item.name}</p>
                </Link>
            ))}
        </motion.nav>
    );
}
