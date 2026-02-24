"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AnimatedText } from "@/components/primitives/AnimatedText";

// Node positions for the "chaos" state (random floating cluster)
function buildChaosNodes(count: number, w: number, h: number) {
    // Use deterministic pseudo-random so nodes don't jump on re-render
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: 100 + ((i * 137.508 + 31) % (w - 200)),
        y: 80 + ((i * 97.3 + 17) % (h - 160)),
    }));
}

// Pipeline DAG layout — 5 stages
const PIPELINE_LAYOUT = (w: number, h: number) => [
    // Stage 0: sources (left)
    { id: 0, x: w * 0.12, y: h * 0.25 },
    { id: 1, x: w * 0.12, y: h * 0.5 },
    { id: 2, x: w * 0.12, y: h * 0.75 },
    // Stage 1: ingestion
    { id: 3, x: w * 0.33, y: h * 0.35 },
    { id: 4, x: w * 0.33, y: h * 0.65 },
    // Stage 2: processing
    { id: 5, x: w * 0.54, y: h * 0.3 },
    { id: 6, x: w * 0.54, y: h * 0.5 },
    { id: 7, x: w * 0.54, y: h * 0.7 },
    // Stage 3: outputs
    { id: 8, x: w * 0.75, y: h * 0.38 },
    { id: 9, x: w * 0.75, y: h * 0.62 },
    // Final: decision
    { id: 10, x: w * 0.9, y: h * 0.5 },
];

// Edges in the pipeline DAG
const EDGES = [
    [0, 3], [1, 3], [1, 4], [2, 4],
    [3, 5], [3, 6], [4, 6], [4, 7],
    [5, 8], [6, 8], [6, 9], [7, 9],
    [8, 10], [9, 10],
];

const NODE_COUNT = 11;
const STAGE_LABELS = ["Sources", "Ingest", "Process", "Route", "Decide"];

const STEPS = [
    { label: "Chaos", description: "Raw unstructured data nodes" },
    { label: "Clustering", description: "Nodes grouping by signal type" },
    { label: "Organizing", description: "Pipeline stages forming" },
    { label: "Orchestrated", description: "Intelligence pipeline active" },
];

export function ConstellationSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dims, setDims] = useState({ w: 800, h: 400 });
    // progress driven by interactive step (0–3 maps to 0–1)
    const [step, setStep] = useState(0);
    const progress = step / (STEPS.length - 1);

    // Measure container
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            setDims({ w: entry.contentRect.width, h: entry.contentRect.height });
        });
        observer.observe(el);
        setDims({ w: el.clientWidth, h: el.clientHeight });
        return () => observer.disconnect();
    }, []);

    // Stable chaos positions (deterministic)
    const chaosNodes = useMemo(
        () => buildChaosNodes(NODE_COUNT, dims.w, dims.h),
        [dims.w, dims.h]
    );

    const pipelineNodes = useMemo(
        () => PIPELINE_LAYOUT(dims.w, dims.h),
        [dims.w, dims.h]
    );

    // Interpolate between chaos and pipeline positions based on progress
    const nodes = useMemo(() =>
        chaosNodes.map((chaos, i) => {
            const target = pipelineNodes[i] || chaos;
            return {
                id: i,
                x: chaos.x + (target.x - chaos.x) * progress,
                y: chaos.y + (target.y - chaos.y) * progress,
            };
        }),
        [chaosNodes, pipelineNodes, progress]
    );

    // Edge opacity: edges only visible when organized
    const edgeOpacity = Math.max(0, (progress - 0.5) * 2);

    const currentStepInfo = STEPS[step];

    return (
        <section
            id="constellation"
            className="w-full py-24 px-6 md:px-12 lg:px-24"
        >
            {/* Section header */}
            <div className="mb-12">
                <motion.span
                    className="text-xs font-medium tracking-widest text-primary uppercase mb-3 block"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    Orchestration
                </motion.span>
                <AnimatedText
                    text="Intelligence orchestrating itself."
                    as="h2"
                    className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground"
                />
                <motion.p
                    className="mt-4 text-muted-foreground max-w-md"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    Click through the steps to watch unstructured data nodes
                    self-organize into a deterministic automation pipeline.
                </motion.p>
            </div>

            {/* Interactive step controls */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                {STEPS.map((s, i) => (
                    <motion.button
                        key={s.label}
                        onClick={() => setStep(i)}
                        className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer border ${step === i
                            ? "bg-primary/15 border-primary/50 text-foreground"
                            : "border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground/80 bg-card/20"
                            }`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <span className="mr-2 text-primary/60 font-mono text-xs">0{i + 1}</span>
                        {s.label}
                        {step === i && (
                            <motion.div
                                className="absolute inset-0 rounded-lg bg-primary/5 border border-primary/20"
                                layoutId="step-highlight"
                                transition={{ duration: 0.3 }}
                            />
                        )}
                    </motion.button>
                ))}

                {/* Quick description */}
                <motion.span
                    key={step}
                    className="ml-2 text-xs text-muted-foreground/60 font-mono"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    — {currentStepInfo.description}
                </motion.span>
            </div>

            {/* Canvas */}
            <motion.div
                ref={containerRef}
                className="relative w-full h-[420px] md:h-[480px] rounded-2xl border border-border/50 bg-card/20 backdrop-blur-sm overflow-hidden"
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
                {/* Background subtle grid */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
                    <defs>
                        <pattern id="const-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#const-grid)" />
                </svg>

                {/* Stage labels — appear as nodes organize */}
                {STAGE_LABELS.map((label, i) => {
                    const x = (dims.w * (i * 0.195 + 0.1));
                    return (
                        <motion.span
                            key={label}
                            className="absolute text-xs font-mono text-primary/70 pointer-events-none select-none"
                            style={{ left: x, top: 12 }}
                            animate={{ opacity: Math.max(0, (progress - 0.55) * 2.5) }}
                        >
                            {label}
                        </motion.span>
                    );
                })}

                <svg className="absolute inset-0 w-full h-full overflow-visible">
                    {/* Pipeline edges */}
                    {EDGES.map(([from, to], i) => {
                        const a = nodes[from];
                        const b = nodes[to];
                        if (!a || !b) return null;
                        const mx = (a.x + b.x) / 2;
                        return (
                            <path
                                key={i}
                                d={`M ${a.x} ${a.y} C ${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`}
                                fill="none"
                                style={{ stroke: "var(--color-primary)" }}
                                strokeWidth="1"
                                strokeOpacity={edgeOpacity * 0.5}
                                strokeLinecap="round"
                            />
                        );
                    })}

                    {/* Nodes */}
                    {nodes.map((node, i) => {
                        const isDecision = i === 10;
                        return (
                            <g key={node.id}>
                                {/* Outer ring — appears when organized */}
                                <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={isDecision ? 22 : 14}
                                    fill="none"
                                    style={{ stroke: "var(--color-primary)" }}
                                    strokeWidth="0.75"
                                    strokeOpacity={edgeOpacity * 0.3}
                                />
                                {/* Core */}
                                <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={isDecision ? 8 : 5}
                                    style={{
                                        fill: isDecision ? "var(--color-primary)" : "var(--color-card)",
                                        stroke: "var(--color-primary)",
                                    }}
                                    strokeWidth={isDecision ? 0 : 1.2}
                                    fillOpacity={isDecision ? 0.9 : 0.7}
                                    strokeOpacity={0.7}
                                />
                            </g>
                        );
                    })}
                </svg>

                {/* Progress bar at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-border/30">
                    <motion.div
                        className="h-full bg-primary/60"
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                </div>

                {/* Status label */}
                <div className="absolute bottom-4 right-4 text-right pointer-events-none">
                    <motion.span
                        key={step}
                        className="text-xs font-mono text-primary/50"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {currentStepInfo.label.toLowerCase()}
                    </motion.span>
                </div>

                {/* Prev / Next navigation inside canvas */}
                <div className="absolute bottom-3 left-4 flex gap-2">
                    <motion.button
                        onClick={() => setStep((s) => Math.max(0, s - 1))}
                        disabled={step === 0}
                        className="h-7 w-7 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground/70 hover:border-primary/40 hover:text-foreground transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer text-xs"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        ←
                    </motion.button>
                    <motion.button
                        onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                        disabled={step === STEPS.length - 1}
                        className="h-7 w-7 rounded-full border border-primary/40 bg-primary/10 flex items-center justify-center text-foreground hover:bg-primary/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer text-xs"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        →
                    </motion.button>
                </div>
            </motion.div>
        </section>
    );
}
