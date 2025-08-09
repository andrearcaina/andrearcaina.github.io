"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { TextScramble } from "./text-scramble"

export function FadeInUp({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    )
}

export function StaggerContainer({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                opacity: 1,
                transition: {
                    staggerChildren: 0.1
                }
                }
            }}
        >
            {children}
        </motion.div>
    )
}

export function StaggerItem({ children }: { children: ReactNode }) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    )
}

export function HoverScale({ children, scale = 1.05 }: { children: ReactNode; scale?: number }) {
    return (
        <motion.div
            whileHover={{ scale }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {children}
        </motion.div>
    )
}

export function TextShimmer({ children }: { children: ReactNode }) {
    return (
        <motion.span
            animate={{
                opacity: [1, 0.7, 1],
                scale: [1, 1.02, 1]
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className="font-medium text-primary"
        >
            {children}
        </motion.span>
    )
}

export function FloatingElement({ children }: { children: ReactNode }) {
    return (
        <motion.div
            animate={{
                y: [0, -10, 0]
            }}
            transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        >
            {children}
        </motion.div>
    )
}

export function NameHover({ children }: { children: ReactNode }) {
    return (
        <motion.span
            whileHover={{
                scale: 1.02,
                textShadow: "0 0 20px rgba(59, 130, 246, 0.3)"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="cursor-pointer inline-block"
        >
            <TextScramble 
                text={children as string}
                className="font-normal"
            />
        </motion.span>
    )
}

export function PageTransition({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            {children}
        </motion.div>
    )
}

export function ButtonMotion({ children, ...props }: { children: ReactNode; [key: string]: any }) {
    return (
        <motion.span
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{ display: "inline-block" }}
            {...props}
        >
            {children}
        </motion.span>
    )
}
