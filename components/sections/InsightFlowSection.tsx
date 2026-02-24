"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { AnimatedText } from "@/components/primitives/AnimatedText";

// Primary color as CSS var (works with oklch theme)
const PRIMARY = "var(--color-primary)";

const STAGES = [
    {
        id: 0,
        label: "01 — Ingest",
        title: "Connect every data stream.",
        body: "Xai ingests structured and unstructured data from APIs, databases, and event streams — without requiring schema definitions. Raw input, accepted.",
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" style={{ stroke: PRIMARY }} strokeWidth="1" strokeOpacity="0.3" />
                <circle cx="24" cy="24" r="5" style={{ fill: PRIMARY }} fillOpacity="0.8" />
                {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                    const rad = (deg * Math.PI) / 180;
                    const x = 24 + 14 * Math.cos(rad);
                    const y = 24 + 14 * Math.sin(rad);
                    return (
                        <g key={i}>
                            <line
                                x1="24" y1="24" x2={x} y2={y}
                                style={{ stroke: PRIMARY }} strokeWidth="0.75" strokeOpacity="0.5"
                                strokeDasharray="2 3"
                            />
                            <circle cx={x} cy={y} r="2.5" style={{ fill: PRIMARY }} fillOpacity="0.5" />
                        </g>
                    );
                })}
            </svg>
        ),
        path: "M 0,48 C 30,48 50,24 80,24 C 110,24 130,48 160,48",
    },
    {
        id: 1,
        label: "02 — Analyze",
        title: "Intelligence applied in real-time.",
        body: "Pattern recognition, anomaly detection, and causal models run in parallel. The system builds a semantic graph of your data as it flows through.",
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                {[[8, 8], [24, 8], [40, 8], [8, 24], [24, 24], [40, 24], [8, 40], [24, 40], [40, 40]].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="3" style={{ fill: PRIMARY }} fillOpacity={i === 4 ? 1 : 0.35} />
                ))}
                {[[8, 8, 24, 24], [40, 8, 24, 24], [8, 24, 24, 24], [40, 24, 24, 24], [8, 40, 24, 24], [40, 40, 24, 24], [24, 8, 24, 24], [24, 40, 24, 24]].map(([x1, y1, x2, y2], i) => (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: PRIMARY }} strokeWidth="0.8" strokeOpacity="0.3" />
                ))}
            </svg>
        ),
        path: "M 0,48 C 40,48 40,8 80,8 C 120,8 120,48 160,48",
    },
    {
        id: 2,
        label: "03 — Generate",
        title: "Insight becomes action.",
        body: "From the analyzed graph, Xai surfaces structured insights — ranked, explained, and routed directly to the pipeline that acts on them. No noise, no dashboards to babysit.",
        icon: (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="12" width="40" height="7" rx="2" style={{ fill: PRIMARY, stroke: PRIMARY }} fillOpacity="0.15" strokeWidth="0.75" strokeOpacity="0.5" />
                <rect x="4" y="24" width="28" height="7" rx="2" style={{ fill: PRIMARY, stroke: PRIMARY }} fillOpacity="0.1" strokeWidth="0.75" strokeOpacity="0.35" />
                <rect x="4" y="36" width="16" height="7" rx="2" style={{ fill: PRIMARY, stroke: PRIMARY }} fillOpacity="0.06" strokeWidth="0.75" strokeOpacity="0.2" />
            </svg>
        ),
        path: "M 0,8 C 30,8 50,48 80,48 C 110,48 130,8 160,8",
    },
];

export function InsightFlowSection() {
    const [activeStage, setActiveStage] = useState(0);
    const pathRefs = useRef<(SVGPathElement | null)[]>([]);

    // Animate SVG path draw whenever active stage changes
    useEffect(() => {
        const path = pathRefs.current[activeStage];
        if (!path) return;
        const len = path.getTotalLength();
        gsap.fromTo(
            path,
            { strokeDasharray: len, strokeDashoffset: len },
            { strokeDashoffset: 0, duration: 1.2, ease: "power3.out" }
        );
    }, [activeStage]);

    // Auto-cycle on mount for first-time users to discover the interaction
    useEffect(() => {
        const timer = setTimeout(() => {
            // gentle pulse on the next button after 3s to hint at interactivity
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const goNext = () => setActiveStage((s) => Math.min(STAGES.length - 1, s + 1));
    const goPrev = () => setActiveStage((s) => Math.max(0, s - 1));

    return (
        <section
            id="insight-flow"
            className="relative w-full py-32 px-6 md:px-12 lg:px-24"
        >
            {/* Section header */}
            <div className="mb-20 max-w-xl">
                <motion.span
                    className="text-xs font-medium tracking-widest text-primary uppercase mb-3 block"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    How Intelligence Forms
                </motion.span>
                <AnimatedText
                    text="Three steps. One system."
                    as="h2"
                    className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground"
                />
            </div>

            {/* Stage selector tabs — clickable */}
            <div className="flex gap-0 border-b border-border/50 mb-16">
                {STAGES.map((stage) => (
                    <button
                        key={stage.id}
                        onClick={() => setActiveStage(stage.id)}
                        className={`relative pb-4 pr-10 text-sm font-medium transition-colors duration-300 cursor-pointer ${activeStage === stage.id
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground/70"
                            }`}
                    >
                        {stage.label}
                        {activeStage === stage.id && (
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 h-px bg-primary"
                                layoutId="stage-indicator"
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Main stage content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[360px]">
                {/* Left: text content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStage}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                        className="space-y-5"
                    >
                        {/* Stage icon — full opacity so it's always visible */}
                        <div className="opacity-90">{STAGES[activeStage].icon}</div>
                        <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                            {STAGES[activeStage].title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed max-w-md">
                            {STAGES[activeStage].body}
                        </p>
                        {/* Progress dots — all primary color, active is wider */}
                        <div className="flex items-center gap-3 pt-2">
                            {STAGES.map((_, i) => (
                                <motion.button
                                    key={i}
                                    onClick={() => setActiveStage(i)}
                                    className={`rounded-full transition-all duration-300 cursor-pointer ${i === activeStage
                                        ? "h-2 w-8 bg-primary"
                                        : i < activeStage
                                            ? "h-2 w-2 bg-primary/50"
                                            : "h-2 w-2 bg-primary/25"
                                        }`}
                                    layout
                                    whileHover={{ scale: 1.2 }}
                                    aria-label={`Go to stage ${i + 1}`}
                                />
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Right: animated SVG path visualization */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`viz-${activeStage}`}
                        className="relative flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="relative w-full max-w-md h-64 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                            {/* Background grid */}
                            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id={`grid-${activeStage}`} width="24" height="24" patternUnits="userSpaceOnUse">
                                        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill={`url(#grid-${activeStage})`} />
                            </svg>

                            {/* Animated signal line */}
                            <svg viewBox="0 0 160 56" className="w-[70%] overflow-visible">
                                <path
                                    ref={(el) => { pathRefs.current[activeStage] = el; }}
                                    d={STAGES[activeStage].path}
                                    fill="none"
                                    style={{ stroke: PRIMARY }}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeOpacity="0.85"
                                />
                            </svg>

                            {/* Corner label */}
                            <span className="absolute bottom-4 right-4 text-xs text-muted-foreground/50 font-mono">
                                stage_{activeStage + 1}.xai
                            </span>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation arrows */}
            <div className="flex gap-3 mt-12">
                <motion.button
                    onClick={goPrev}
                    disabled={activeStage === 0}
                    className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    ←
                </motion.button>
                <motion.button
                    onClick={goNext}
                    disabled={activeStage === STAGES.length - 1}
                    className="h-10 w-10 rounded-full border border-primary/40 bg-primary/5 flex items-center justify-center text-foreground hover:bg-primary/15 hover:border-primary/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={activeStage < STAGES.length - 1 ? {
                        boxShadow: ["0 0 0px 0px rgba(var(--primary),0)", "0 0 12px 2px rgba(var(--primary),0.25)", "0 0 0px 0px rgba(var(--primary),0)"]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    →
                </motion.button>
            </div>
        </section>
    );
}
