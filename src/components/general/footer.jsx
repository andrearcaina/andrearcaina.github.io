import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin, faInstagram, faDev } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faFileInvoice } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function Footer() {
    return (
        <motion.footer
            className="text-white text-left"
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <p className="text-[0.9rem]/[1.75rem] sm:text-[1.05rem]/[1.75rem]"> 
                &copy; 2024 andre arcaina. all rights reserved :P
            </p>
            
            <div className="flex space-x-3 sm:space-x-6">
                <Link href="https://github.com/andrearcaina" target="_blank">
                    <FontAwesomeIcon icon={faGithub} className="text-white p-2 text-2xl sm:text-3xl hover:text-green-500 hover:scale-[1.3] transition-all duration-400 cursor-pointer" />
                </Link>

                <Link href="https://www.linkedin.com/in/andre-arcaina/" target="_blank">
                    <FontAwesomeIcon icon={faLinkedin} className="text-white p-2 text-2xl sm:text-3xl hover:text-green-500 hover:scale-[1.3] transition-all duration-400 cursor-pointer" />
                </Link>

                <Link href="https://www.instagram.com/azdrx" target="_blank">
                    <FontAwesomeIcon icon={faInstagram} className="text-white p-2 text-2xl sm:text-3xl hover:text-green-500 hover:scale-[1.3] transition-all duration-400 cursor-pointer" />
                </Link>

                <Link href="https://devpost.com/andrearcaina/" target="_blank">
                    <FontAwesomeIcon icon={faDev} className="text-white p-2 text-2xl sm:text-3xl hover:text-green-500 hover:scale-[1.3] transition-all duration-400 cursor-pointer" />
                </Link>

                <Link href="mailto:dtandre331@gmail.com" target="_blank">
                    <FontAwesomeIcon icon={faEnvelope} className="text-white p-2 text-2xl sm:text-3xl hover:text-green-500 hover:scale-[1.3] transition-all duration-400 cursor-pointer" />
                </Link>

                <Link href="https://drive.google.com/file/d/1UB49TjfiDvw8c1rFQWSK1j1XeEZQMcOq/view?usp=sharing" target="_blank">
                    <FontAwesomeIcon icon={faFileInvoice} className="text-white p-2 text-2xl sm:text-3xl hover:text-green-500 hover:scale-[1.3] transition-all duration-400 cursor-pointer" />
                </Link>
            </div>
        </motion.footer>
    );
}
