"use client";

import { useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { AnimatedText } from "@/components/primitives/AnimatedText";
import { GlowButton } from "@/components/primitives/GlowButton";

// Dynamically import Three.js scene — avoids SSR issues
const ParticleCloud = dynamic(
    () => import("@/lib/three/ParticleCloud").then((m) => m.ParticleCloud),
    { ssr: false }
);

// Shared easing curve — Spring-like feel
const EASE = [0.16, 1, 0.3, 1] as const;

function fadeUpProps(delay: number) {
    return {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.9, ease: EASE, delay },
    } as const;
}

export function HeroSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const scrollProgress = useScrollProgress(
        sectionRef as React.RefObject<HTMLElement | null>
    );

    return (
        <section
            ref={sectionRef}
            className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Full-viewport Three.js canvas */}
            <div className="absolute inset-0 z-0 will-change-transform">
                <Suspense fallback={null}>
                    <ParticleCloud scrollProgress={scrollProgress} />
                </Suspense>
            </div>

            {/* Radial gradient vignette to ground the content */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,transparent_30%,hsl(var(--background))_100%)]" />

            {/* Hero content */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto px-6">
                {/* Eyebrow label */}
                <motion.div
                    className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm"
                    {...fadeUpProps(0.3)}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    Intelligence Infrastructure · Now in Beta
                </motion.div>

                {/* Main headline */}
                <AnimatedText
                    text="From raw data to decisive intelligence."
                    as="h1"
                    delay={0.5}
                    stagger={0.07}
                    className="text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.1] tracking-tight text-foreground"
                />

                {/* Sub-copy */}
                <motion.p
                    className="mt-6 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed"
                    {...fadeUpProps(1.1)}
                >
                    Xai ingests your operational chaos, structures it with AI, and
                    orchestrates it into automated decisions — without the noise.
                </motion.p>

                {/* CTA row */}
                <motion.div
                    className="mt-10 flex flex-wrap items-center justify-center gap-4"
                    {...fadeUpProps(1.4)}
                >
                    <GlowButton href="#dashboard" variant="primary">
                        Explore the Platform
                    </GlowButton>
                    <GlowButton href="#insight-flow" variant="outline">
                        See how it works →
                    </GlowButton>
                </motion.div>

                {/* Scroll cue */}
                <motion.div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.2, duration: 1 }}
                >
                    <span className="text-xs text-muted-foreground/50 tracking-widest uppercase">
                        Scroll
                    </span>
                    <motion.div
                        className="h-8 w-px bg-gradient-to-b from-primary/60 to-transparent"
                        animate={{ scaleY: [0.3, 1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                </motion.div>
            </div>
        </section>
    );
}
