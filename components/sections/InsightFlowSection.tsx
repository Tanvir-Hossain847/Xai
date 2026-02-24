"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import gsap from "gsap";
import { AnimatedText } from "@/components/primitives/AnimatedText";

const PRIMARY = "var(--color-primary)";

const STAGES = [
    {
        id: 0,
        label: "01 — Ingest",
        title: "Connect every data stream.",
        body: "Xai ingests structured and unstructured data from APIs, databases, and event streams — without requiring schema definitions. Raw input, accepted.",
        icon: (
            <svg width="56" height="56" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" style={{ stroke: PRIMARY }} strokeWidth="1" strokeOpacity="0.3" />
                <circle cx="24" cy="24" r="5" style={{ fill: PRIMARY }} fillOpacity="0.8" />
                {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                    const rad = (deg * Math.PI) / 180;
                    const x = 24 + 14 * Math.cos(rad);
                    const y = 24 + 14 * Math.sin(rad);
                    return (
                        <g key={i}>
                            <line x1="24" y1="24" x2={x} y2={y}
                                style={{ stroke: PRIMARY }} strokeWidth="0.75" strokeOpacity="0.5" strokeDasharray="2 3" />
                            <circle cx={x} cy={y} r="2.5" style={{ fill: PRIMARY }} fillOpacity="0.5" />
                        </g>
                    );
                })}
            </svg>
        ),
        path: "M 0,48 C 30,48 50,24 80,24 C 110,24 130,48 160,48",
        color: "from-primary/20 to-transparent",
    },
    {
        id: 1,
        label: "02 — Analyze",
        title: "Intelligence applied in real-time.",
        body: "Pattern recognition, anomaly detection, and causal models run in parallel. The system builds a semantic graph of your data as it flows through.",
        icon: (
            <svg width="56" height="56" viewBox="0 0 48 48" fill="none">
                {[[8, 8], [24, 8], [40, 8], [8, 24], [24, 24], [40, 24], [8, 40], [24, 40], [40, 40]].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="3" style={{ fill: PRIMARY }} fillOpacity={i === 4 ? 1 : 0.35} />
                ))}
                {[[8, 8, 24, 24], [40, 8, 24, 24], [8, 24, 24, 24], [40, 24, 24, 24], [8, 40, 24, 24], [40, 40, 24, 24], [24, 8, 24, 24], [24, 40, 24, 24]].map(([x1, y1, x2, y2], i) => (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: PRIMARY }} strokeWidth="0.8" strokeOpacity="0.3" />
                ))}
            </svg>
        ),
        path: "M 0,48 C 40,48 40,8 80,8 C 120,8 120,48 160,48",
        color: "from-primary/15 to-transparent",
    },
    {
        id: 2,
        label: "03 — Generate",
        title: "Insight becomes action.",
        body: "From the analyzed graph, Xai surfaces structured insights — ranked, explained, and routed directly to the pipeline that acts on them. No noise, no dashboards to babysit.",
        icon: (
            <svg width="56" height="56" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="12" width="40" height="7" rx="2" style={{ fill: PRIMARY, stroke: PRIMARY }} fillOpacity="0.15" strokeWidth="0.75" strokeOpacity="0.5" />
                <rect x="4" y="24" width="28" height="7" rx="2" style={{ fill: PRIMARY, stroke: PRIMARY }} fillOpacity="0.1" strokeWidth="0.75" strokeOpacity="0.35" />
                <rect x="4" y="36" width="16" height="7" rx="2" style={{ fill: PRIMARY, stroke: PRIMARY }} fillOpacity="0.06" strokeWidth="0.75" strokeOpacity="0.2" />
            </svg>
        ),
        path: "M 0,8 C 30,8 50,48 80,48 C 110,48 130,8 160,8",
        color: "from-primary/10 to-transparent",
    },
];

/** Scrubber dot that the user drags along a timeline */
function ScrubTimeline({
    activeStage,
    onScrub,
}: {
    activeStage: number;
    onScrub: (stage: number) => void;
}) {
    const trackRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const getStageFromPointer = useCallback((clientX: number) => {
        const el = trackRef.current;
        if (!el) return 0;
        const { left, width } = el.getBoundingClientRect();
        const ratio = Math.min(1, Math.max(0, (clientX - left) / width));
        return Math.round(ratio * (STAGES.length - 1));
    }, []);

    const onPointerDown = (e: React.PointerEvent) => {
        isDragging.current = true;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        onScrub(getStageFromPointer(e.clientX));
    };
    const onPointerMove = (e: React.PointerEvent) => {
        if (!isDragging.current) return;
        onScrub(getStageFromPointer(e.clientX));
    };
    const onPointerUp = () => { isDragging.current = false; };

    const progress = activeStage / (STAGES.length - 1);

    return (
        <div className="mb-12 px-1">
            {/* Track */}
            <div
                ref={trackRef}
                className="relative h-px bg-border/50 cursor-pointer select-none"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
            >
                {/* Filled portion */}
                <motion.div
                    className="absolute top-0 left-0 h-full bg-primary/70 origin-left"
                    animate={{ scaleX: progress }}
                    transition={{ type: "spring", stiffness: 200, damping: 28 }}
                />

                {/* Stage tick marks */}
                {STAGES.map((s, i) => {
                    const pos = i / (STAGES.length - 1);
                    return (
                        <button
                            key={s.id}
                            className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 cursor-pointer group"
                            style={{ left: `${pos * 100}%` }}
                            onClick={() => onScrub(i)}
                        >
                            <motion.div
                                className="rounded-full border transition-all duration-200"
                                animate={{
                                    width: i === activeStage ? 14 : 8,
                                    height: i === activeStage ? 14 : 8,
                                    borderColor: i <= activeStage
                                        ? "var(--color-primary)"
                                        : "color-mix(in oklch, var(--color-primary) 30%, transparent)",
                                    backgroundColor: i === activeStage
                                        ? "var(--color-primary)"
                                        : i < activeStage
                                            ? "color-mix(in oklch, var(--color-primary) 50%, transparent)"
                                            : "transparent",
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                            />
                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                {s.label}
                            </span>
                        </button>
                    );
                })}

                {/* Draggable thumb */}
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-primary shadow-[0_0_12px_2px_color-mix(in_oklch,var(--color-primary)_40%,transparent)] border-2 border-background cursor-grab active:cursor-grabbing pointer-events-none"
                    animate={{ left: `${progress * 100}%` }}
                    transition={{ type: "spring", stiffness: 220, damping: 26 }}
                />
            </div>
            {/* Stage labels row */}
            <div className="flex justify-between mt-8 pointer-events-none">
                {STAGES.map((s, i) => (
                    <motion.span
                        key={s.id}
                        className="text-xs font-medium"
                        animate={{ color: i === activeStage ? "var(--color-primary)" : "hsl(var(--muted-foreground))" }}
                        transition={{ duration: 0.3 }}
                    >
                        {s.label}
                    </motion.span>
                ))}
            </div>
        </div>
    );
}

/** Animated SVG waveform that draws itself */
function WaveViz({ stage }: { stage: number }) {
    const pathRef = useRef<SVGPathElement | null>(null);

    useEffect(() => {
        const path = pathRef.current;
        if (!path) return;
        const len = path.getTotalLength();
        gsap.fromTo(
            path,
            { strokeDasharray: len, strokeDashoffset: len },
            { strokeDashoffset: 0, duration: 1.0, ease: "power3.out" }
        );
    }, [stage]);

    return (
        <div className="relative w-full max-w-md h-64 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm flex items-center justify-center overflow-hidden">
            {/* Gradient background that matches stage */}
            <div className={`absolute inset-0 bg-gradient-to-br ${STAGES[stage].color} opacity-60`} />

            {/* Grid */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id={`grid-${stage}`} width="24" height="24" patternUnits="userSpaceOnUse">
                        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#grid-${stage})`} />
            </svg>

            {/* Signal line */}
            <svg viewBox="0 0 160 56" className="w-[70%] overflow-visible relative z-10">
                <path
                    ref={(el) => { pathRef.current = el; }}
                    d={STAGES[stage].path}
                    fill="none"
                    style={{ stroke: PRIMARY }}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeOpacity="0.9"
                />
            </svg>

            {/* Hover-reactive shimmer */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -skew-x-12 pointer-events-none"
                animate={{ x: ["-200%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
            />

            <span className="absolute bottom-4 right-4 text-xs text-muted-foreground/50 font-mono">
                stage_{stage + 1}.xai
            </span>
        </div>
    );
}

export function InsightFlowSection() {
    const [activeStage, setActiveStage] = useState(0);

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
                <motion.p
                    className="mt-4 text-muted-foreground text-sm"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    Drag the timeline or click a stage to explore how Xai processes your data.
                </motion.p>
            </div>

            {/* Drag scrub timeline */}
            <ScrubTimeline activeStage={activeStage} onScrub={setActiveStage} />

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[360px]">
                {/* Left: text */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStage}
                        initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                        className="space-y-5"
                    >
                        {/* Icon with hover spin */}
                        <motion.div
                            className="opacity-90"
                            whileHover={{ rotate: [0, -8, 8, -4, 0], transition: { duration: 0.5 } }}
                        >
                            {STAGES[activeStage].icon}
                        </motion.div>

                        <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                            {STAGES[activeStage].title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed max-w-md">
                            {STAGES[activeStage].body}
                        </p>

                        {/* Animated progress pills — all primary */}
                        <div className="flex items-center gap-3 pt-2">
                            {STAGES.map((_, i) => (
                                <motion.button
                                    key={i}
                                    onClick={() => setActiveStage(i)}
                                    className="rounded-full cursor-pointer"
                                    animate={{
                                        width: i === activeStage ? 32 : 8,
                                        height: 8,
                                        backgroundColor:
                                            i === activeStage
                                                ? "var(--color-primary)"
                                                : i < activeStage
                                                    ? "color-mix(in oklch, var(--color-primary) 50%, transparent)"
                                                    : "color-mix(in oklch, var(--color-primary) 20%, transparent)",
                                    }}
                                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                                    whileHover={{ scale: 1.2 }}
                                    aria-label={`Stage ${i + 1}`}
                                />
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Right: animated wave visualization */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`viz-${activeStage}`}
                        className="relative flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.04 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                    >
                        <WaveViz stage={activeStage} />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Arrow nav */}
            <div className="flex gap-3 mt-12">
                <motion.button
                    onClick={() => setActiveStage((s) => Math.max(0, s - 1))}
                    disabled={activeStage === 0}
                    className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    whileHover={{ scale: 1.08, x: -2 }}
                    whileTap={{ scale: 0.93 }}
                >
                    ←
                </motion.button>
                <motion.button
                    onClick={() => setActiveStage((s) => Math.min(STAGES.length - 1, s + 1))}
                    disabled={activeStage === STAGES.length - 1}
                    className="h-10 w-10 rounded-full border border-primary/40 bg-primary/5 flex items-center justify-center text-foreground hover:bg-primary/15 hover:border-primary/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    whileHover={{ scale: 1.08, x: 2 }}
                    whileTap={{ scale: 0.93 }}
                >
                    →
                </motion.button>
            </div>
        </section>
    );
}
