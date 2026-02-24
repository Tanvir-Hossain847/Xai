"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface SectionWrapperProps {
    children: React.ReactNode;
    className?: string;
    id?: string;
    /** Delay before fade-in starts (seconds) */
    delay?: number;
}

/**
 * Wraps sections with a scroll-triggered fade + Y-offset reveal.
 * Keeps layout clean — all section spacing is handled here.
 */
export function SectionWrapper({
    children,
    className = "",
    id,
    delay = 0,
}: SectionWrapperProps) {
    const ref = useRef<HTMLElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.1 });

    return (
        <motion.section
            ref={ref}
            id={id}
            className={`relative w-full px-6 md:px-12 lg:px-24 ${className}`}
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay }}
        >
            {children}
        </motion.section>
    );
}
