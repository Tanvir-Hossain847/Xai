"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AnimatedText } from "@/components/primitives/AnimatedText";

// Node positions for the "chaos" state (random floating cluster)
function buildChaosNodes(count: number, w: number, h: number) {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: 100 + Math.random() * (w - 200),
        y: 80 + Math.random() * (h - 160),
    }));
}

// Pipeline DAG layout — 4 stages
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

export function ConstellationSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dims, setDims] = useState({ w: 800, h: 400 });
    const [progress, setProgress] = useState(0);

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

    // Scroll → progress
    useEffect(() => {
        const section = document.getElementById("constellation");
        if (!section) return;
        const update = () => {
            const rect = section.getBoundingClientRect();
            const vh = window.innerHeight;
            const raw = 1 - (rect.bottom - vh * 0.3) / (rect.height * 0.6);
            setProgress(Math.min(1, Math.max(0, raw)));
        };
        window.addEventListener("scroll", update, { passive: true });
        update();
        return () => window.removeEventListener("scroll", update);
    }, []);

    // Stable chaos positions (seeded by index)
    const chaosNodes = useMemo(
        () => buildChaosNodes(NODE_COUNT, dims.w, dims.h),
        [dims.w, dims.h]
    );

    const pipelineNodes = useMemo(
        () => PIPELINE_LAYOUT(dims.w, dims.h),
        [dims.w, dims.h]
    );

    // Interpolate between chaos and pipeline positions
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
                    Scroll to watch unstructured data nodes self-organize into a
                    deterministic automation pipeline.
                </motion.p>
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
                        // Bezier curve midpoints
                        const mx = (a.x + b.x) / 2;
                        return (
                            <path
                                key={i}
                                d={`M ${a.x} ${a.y} C ${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`}
                                fill="none"
                                stroke="hsl(var(--primary))"
                                strokeWidth="1"
                                strokeOpacity={edgeOpacity * 0.5}
                                strokeLinecap="round"
                            />
                        );
                    })}

                    {/* Nodes */}
                    {nodes.map((node, i) => {
                        // Color based on pipeline stage
                        const stage = i <= 2 ? 0 : i <= 4 ? 1 : i <= 7 ? 2 : i <= 9 ? 3 : 4;
                        const isDecision = i === 10;
                        return (
                            <g key={node.id}>
                                {/* Outer ring — appears when organized */}
                                <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={isDecision ? 22 : 14}
                                    fill="none"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth="0.75"
                                    strokeOpacity={edgeOpacity * 0.3}
                                />
                                {/* Core */}
                                <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={isDecision ? 8 : 5}
                                    fill={isDecision ? "hsl(var(--primary))" : "hsl(var(--card))"}
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={isDecision ? 0 : 1.2}
                                    fillOpacity={isDecision ? 0.9 : 0.7}
                                    strokeOpacity={0.7}
                                />
                            </g>
                        );
                    })}
                </svg>

                {/* Progress label */}
                <div className="absolute bottom-4 right-4 text-right pointer-events-none">
                    <span className="text-xs font-mono text-primary/50">
                        {progress < 0.1
                            ? "chaos"
                            : progress < 0.5
                                ? "clustering…"
                                : progress < 0.9
                                    ? "organizing…"
                                    : "orchestrated"}
                    </span>
                </div>
            </motion.div>
        </section>
    );
}
