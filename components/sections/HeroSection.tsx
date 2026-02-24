"use client";

import { useRef, Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    animate,
} from "framer-motion";
import { AnimatedText } from "@/components/primitives/AnimatedText";
import { GlowButton } from "@/components/primitives/GlowButton";

const ParticleCloud = dynamic(
    () => import("@/lib/three/ParticleCloud").then((m) => m.ParticleCloud),
    { ssr: false }
);

const EASE = [0.16, 1, 0.3, 1] as const;

function fadeUpProps(delay: number) {
    return {
        initial: { opacity: 0, y: 28 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 1, ease: EASE, delay },
    } as const;
}

function MagneticButton({
    children,
    href,
    variant,
}: {
    children: React.ReactNode;
    href: string;
    variant: "primary" | "outline";
}) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 380, damping: 28 });
    const sy = useSpring(y, { stiffness: 380, damping: 28 });

    const onMove = (e: React.MouseEvent) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        x.set((e.clientX - cx) * 0.35);
        y.set((e.clientY - cy) * 0.35);
    };
    const onLeave = () => { x.set(0); y.set(0); };

    return (
        <motion.div
            ref={ref}
            style={{ x: sx, y: sy }}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
        >
            <GlowButton href={href} variant={variant}>
                {children}
            </GlowButton>
        </motion.div>
    );
}

export function HeroSection() {
    const sectionRef = useRef<HTMLDivElement>(null);

const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 140, damping: 22 });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 140, damping: 22 });

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = sectionRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };
    const onMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

const scrollY = useMotionValue(0);
    const bgOpacity = useTransform(scrollY, [0, 600], [1, 0]);
    useEffect(() => {
        const update = () => scrollY.set(window.scrollY);
        window.addEventListener("scroll", update, { passive: true });
        return () => window.removeEventListener("scroll", update);
    }, [scrollY]);

    return (
        <section
            ref={sectionRef}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden"
        >

<motion.div className="absolute inset-0 z-0 will-change-transform" style={{ opacity: bgOpacity }}>
                <Suspense fallback={null}>
                    <ParticleCloud scrollProgress={0} />
                </Suspense>
            </motion.div>

<div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,transparent_30%,hsl(var(--background))_100%)]" />

<motion.div
                className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto px-6"
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                    perspective: 900,
                }}
            >
                
                <motion.div
                    className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm"
                    {...fadeUpProps(0.3)}
                >
                    <motion.span
                        className="h-2 w-2 rounded-full bg-primary"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    Intelligence Infrastructure · Now in Beta
                </motion.div>

<AnimatedText
                    text="From raw data to decisive intelligence."
                    as="h1"
                    delay={0.5}
                    stagger={0.07}
                    className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight text-foreground"
                />

<motion.p
                    className="mt-6 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed"
                    {...fadeUpProps(1.1)}
                >
                    Xai ingests your operational chaos, structures it with AI, and
                    orchestrates it into automated decisions — without the noise.
                </motion.p>

<motion.div
                    className="mt-10 flex flex-wrap items-center justify-center gap-4"
                    {...fadeUpProps(1.4)}
                >
                    <MagneticButton href="#dashboard" variant="primary">
                        Explore the Platform
                    </MagneticButton>
                    <MagneticButton href="#insight-flow" variant="outline">
                        See how it works →
                    </MagneticButton>
                </motion.div>

<motion.div
                    className="mt-14 flex items-center gap-8 text-xs text-muted-foreground/60"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2, duration: 1 }}
                >
                    {[
                        { val: "99.98%", label: "Uptime" },
                        { val: "<40ms", label: "Latency" },
                        { val: "3 847", label: "Insights today" },
                    ].map((m) => (
                        <div key={m.label} className="flex flex-col items-center gap-1">
                            <span className="text-foreground/80 font-semibold text-sm tabular-nums">
                                {m.val}
                            </span>
                            <span>{m.label}</span>
                        </div>
                    ))}
                </motion.div>
            </motion.div>

<motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.4, duration: 1 }}
            >
                <span className="text-xs text-muted-foreground/40 tracking-widest uppercase">Scroll</span>
                <motion.div
                    className="h-8 w-px bg-gradient-to-b from-primary/60 to-transparent"
                    animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.div>
        </section>
    );
}
