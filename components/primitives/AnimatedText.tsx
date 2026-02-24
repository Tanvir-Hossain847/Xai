"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedTextProps {
    text: string;
    className?: string;
    /** Stagger delay between words */
    stagger?: number;
    delay?: number;
    as?: "h1" | "h2" | "h3" | "p" | "span";
}

/**
 * Splits text into words and reveals each with a staggered Y-offset + fade.
 * Triggers once when the element enters the viewport.
 */
export function AnimatedText({
    text,
    className = "",
    stagger = 0.06,
    delay = 0,
    as: Tag = "h1",
}: AnimatedTextProps) {
    const ref = useRef<HTMLHeadingElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    const words = text.split(" ");

    return (
        <Tag ref={ref} className={`overflow-hidden ${className}`}>
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    className="inline-block mr-[0.25em]"
                    initial={{ opacity: 0, y: 24 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{
                        duration: 0.7,
                        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                        delay: delay + i * stagger,
                    }}
                >
                    {word}
                </motion.span>
            ))}
        </Tag>
    );
}
