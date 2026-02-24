"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlowButton } from "@/components/primitives/GlowButton";

const navLinks = [
    { label: "Product", href: "#dashboard" },
    { label: "Intelligence", href: "#insight-flow" },
    { label: "Constellation", href: "#constellation" },
];

/**
 * Fixed navbar — appears with a slight delay after load.
 * Glassmorphic background on scroll.
 */
export function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <motion.header
            className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 transition-all duration-500 ${scrolled
                ? "bg-background/80 backdrop-blur-md border-b border-border/50"
                : "bg-transparent"
                }`}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.5 }}
        >
            {/* Wordmark */}
            <a href="#" className="flex items-center gap-2 group">
                <span className="relative flex h-7 w-7 items-center justify-center rounded-md border border-primary/30 bg-primary/10">
                    {/* Minimal geometric mark — using var(--color-primary) so oklch values resolve */}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="2.5" style={{ fill: "var(--color-primary)" }} />
                        <circle cx="7" cy="7" r="5.5" style={{ stroke: "var(--color-primary)" }} strokeWidth="0.75" strokeOpacity="0.4" fill="none" />
                        <line x1="7" y1="1" x2="7" y2="13" style={{ stroke: "var(--color-primary)" }} strokeWidth="0.5" strokeOpacity="0.3" />
                        <line x1="1" y1="7" x2="13" y2="7" style={{ stroke: "var(--color-primary)" }} strokeWidth="0.5" strokeOpacity="0.3" />
                    </svg>
                </span>
                <span className="text-base font-semibold tracking-tight text-foreground">
                    Xai
                </span>
            </a>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-8 ml-20">
                {navLinks.map((link) => (
                    <a
                        key={link.label}
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                        {link.label}
                    </a>
                ))}
            </nav>

            {/* CTA */}
            <GlowButton href="#dashboard" variant="outline">
                Request Access
            </GlowButton>
        </motion.header>
    );
}
