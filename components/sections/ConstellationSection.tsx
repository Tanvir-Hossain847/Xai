"use client";

import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { motion, useSpring } from "framer-motion";
import { AnimatedText } from "@/components/primitives/AnimatedText";

// ─── 28-node pipeline layout ──────────────────────────────────────────────────
// 6 stages: Sources(5) → Filter(4) → Enrich(5) → Analyze(5) → Route(5) → Decide(4)
const PIPELINE_LAYOUT = (w: number, h: number) => [
    // Stage 0 — Sources (5 nodes)
    { id: 0, x: w * 0.06, y: h * 0.14 },
    { id: 1, x: w * 0.06, y: h * 0.32 },
    { id: 2, x: w * 0.06, y: h * 0.50 },
    { id: 3, x: w * 0.06, y: h * 0.68 },
    { id: 4, x: w * 0.06, y: h * 0.86 },
    // Stage 1 — Filter (4 nodes)
    { id: 5, x: w * 0.22, y: h * 0.22 },
    { id: 6, x: w * 0.22, y: h * 0.40 },
    { id: 7, x: w * 0.22, y: h * 0.60 },
    { id: 8, x: w * 0.22, y: h * 0.78 },
    // Stage 2 — Enrich (5 nodes)
    { id: 9, x: w * 0.38, y: h * 0.18 },
    { id: 10, x: w * 0.38, y: h * 0.34 },
    { id: 11, x: w * 0.38, y: h * 0.50 },
    { id: 12, x: w * 0.38, y: h * 0.66 },
    { id: 13, x: w * 0.38, y: h * 0.82 },
    // Stage 3 — Analyze (5 nodes)
    { id: 14, x: w * 0.54, y: h * 0.22 },
    { id: 15, x: w * 0.54, y: h * 0.36 },
    { id: 16, x: w * 0.54, y: h * 0.50 },
    { id: 17, x: w * 0.54, y: h * 0.64 },
    { id: 18, x: w * 0.54, y: h * 0.78 },
    // Stage 4 — Route (5 nodes)
    { id: 19, x: w * 0.70, y: h * 0.26 },
    { id: 20, x: w * 0.70, y: h * 0.40 },
    { id: 21, x: w * 0.70, y: h * 0.54 },
    { id: 22, x: w * 0.70, y: h * 0.68 },
    { id: 23, x: w * 0.70, y: h * 0.82 },
    // Stage 5 — Decide (4 nodes)
    { id: 24, x: w * 0.86, y: h * 0.30 },
    { id: 25, x: w * 0.86, y: h * 0.46 },
    { id: 26, x: w * 0.86, y: h * 0.62 },
    // Final hub
    { id: 27, x: w * 0.96, y: h * 0.50 },
];

const EDGES = [
    // Sources → Filter
    [0, 5], [0, 6], [1, 5], [1, 6], [2, 6], [2, 7], [3, 7], [3, 8], [4, 7], [4, 8],
    // Filter → Enrich
    [5, 9], [5, 10], [6, 10], [6, 11], [7, 11], [7, 12], [8, 12], [8, 13],
    // Enrich → Analyze
    [9, 14], [10, 14], [10, 15], [11, 15], [11, 16], [12, 16], [12, 17], [13, 17], [13, 18],
    // Analyze → Route
    [14, 19], [15, 19], [15, 20], [16, 20], [16, 21], [17, 21], [17, 22], [18, 22], [18, 23],
    // Route → Decide
    [19, 24], [20, 24], [20, 25], [21, 25], [21, 26], [22, 26], [23, 26],
    // Decide → Hub
    [24, 27], [25, 27], [26, 27],
];

const NODE_COUNT = 30;
const STAGE_LABELS = ["Sources", "Filter", "Enrich", "Analyze", "Route", "Decide"];

// Seeded pseudo-random (deterministic, Mulberry32)
function mulberry32(seed: number) {
    let s = seed;
    return () => {
        s |= 0; s = s + 0x6d2b79f5 | 0;
        let t = Math.imul(s ^ s >>> 15, 1 | s);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// Per-node drift metadata — unique speed, phase, amplitude
function buildChaosNodes(count: number, w: number, h: number) {
    const rand = mulberry32(0xdeadbeef);
    // Push nodes into 9 zones (3×3 grid) with random scatter inside each zone
    const ZONES = [
        [0, 0], [0.33, 0], [0.66, 0],   // top row
        [0, 0.33], [0.33, 0.33], [0.66, 0.33], // middle
        [0, 0.66], [0.33, 0.66], [0.66, 0.66], // bottom
    ];
    return Array.from({ length: count }, (_, i) => {
        const [zx, zy] = ZONES[i % ZONES.length];
        const jx = (rand() - 0.5) * 0.28;  // jitter within zone
        const jy = (rand() - 0.5) * 0.28;
        const baseX = (zx + 0.165 + jx) * (w - 60) + 30;
        const baseY = (zy + 0.165 + jy) * (h - 60) + 30;
        return {
            id: i,
            x: Math.min(w - 30, Math.max(30, baseX)),
            y: Math.min(h - 30, Math.max(30, baseY)),
            // unique drift params
            driftAmpX: 14 + rand() * 22,
            driftAmpY: 12 + rand() * 20,
            driftSpeedX: 0.28 + rand() * 0.55,
            driftSpeedY: 0.22 + rand() * 0.48,
            driftPhaseX: rand() * Math.PI * 2,
            driftPhaseY: rand() * Math.PI * 2,
        };
    });
}

function DragSlider({ progress, onChange }: { progress: number; onChange: (v: number) => void }) {
    const trackRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);

    const calc = useCallback((clientX: number) => {
        const el = trackRef.current;
        if (!el) return;
        const { left, width } = el.getBoundingClientRect();
        onChange(Math.min(1, Math.max(0, (clientX - left) / width)));
    }, [onChange]);

    return (
        <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-muted-foreground/50 w-12">chaos</span>
            <div
                ref={trackRef}
                className="relative flex-1 h-1.5 rounded-full bg-border/40 cursor-pointer select-none"
                onPointerDown={(e) => {
                    dragging.current = true;
                    (e.target as HTMLElement).setPointerCapture(e.pointerId);
                    calc(e.clientX);
                }}
                onPointerMove={(e) => { if (dragging.current) calc(e.clientX); }}
                onPointerUp={() => { dragging.current = false; }}
            >
                <div
                    className="absolute top-0 left-0 h-full rounded-full bg-primary/60"
                    style={{ width: `${progress * 100}%` }}
                />
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-primary border-2 border-background cursor-grab active:cursor-grabbing pointer-events-none shadow-[0_0_14px_2px_color-mix(in_oklch,var(--color-primary)_50%,transparent)]"
                    style={{ left: `${progress * 100}%` }}
                />
            </div>
            <span className="text-xs font-mono text-primary/70 w-24">orchestrated</span>
        </div>
    );
}

export function ConstellationSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dims, setDims] = useState({ w: 900, h: 420 });
    const [progress, setProgress] = useState(0);
    const mouse = useRef({ x: -9999, y: -9999 });
    const timeRef = useRef(0);
    const lastFrameRef = useRef(performance.now());
    const [, setTick] = useState(0);

    const springProgress = useSpring(0, { stiffness: 80, damping: 17 });

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([e]) => setDims({ w: e.contentRect.width, h: e.contentRect.height }));
        ro.observe(el);
        setDims({ w: el.clientWidth, h: el.clientHeight });
        return () => ro.disconnect();
    }, []);

    useEffect(() => { springProgress.set(progress); }, [progress, springProgress]);

    useEffect(() => {
        let raf: number;
        const loop = (now: number) => {
            const dt = Math.min((now - lastFrameRef.current) / 1000, 0.05);
            timeRef.current += dt;
            lastFrameRef.current = now;
            setTick((t) => t + 1);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    const chaosNodes = useMemo(() => buildChaosNodes(NODE_COUNT, dims.w, dims.h), [dims.w, dims.h]);
    const pipelineNodes = useMemo(() => PIPELINE_LAYOUT(dims.w, dims.h), [dims.w, dims.h]);

    const sp = springProgress.get();

    // Interpolate chaos→pipeline + living drift in chaos mode + mouse repulsion
    const nodes = useMemo(() => {
        const REPEL_RADIUS = 80;
        const REPEL_FORCE = 26;
        const t = timeRef.current;
        return chaosNodes.map((chaos, i) => {
            const target = pipelineNodes[i] || chaos;
            const ease = sp < 0.5 ? 2 * sp * sp : 1 - Math.pow(-2 * sp + 2, 2) / 2;

            // Drift fades to 0 as nodes organize (scale by 1-ease²)
            const driftScale = 1 - ease * ease;
            const driftX = Math.sin(t * chaos.driftSpeedX + chaos.driftPhaseX) * chaos.driftAmpX * driftScale;
            const driftY = Math.cos(t * chaos.driftSpeedY + chaos.driftPhaseY) * chaos.driftAmpY * driftScale;

            let x = chaos.x + driftX + (target.x - chaos.x) * ease;
            let y = chaos.y + driftY + (target.y - chaos.y) * ease;

            // Mouse repulsion
            const dx = x - mouse.current.x;
            const dy = y - mouse.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < REPEL_RADIUS && dist > 0) {
                const f = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
                x += (dx / dist) * f;
                y += (dy / dist) * f;
            }
            return { id: i, x, y };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chaosNodes, pipelineNodes, sp, timeRef.current]);

    const edgeOpacity = Math.max(0, (sp - 0.45) * 2.2);
    const labelOpacity = Math.max(0, (sp - 0.55) * 2.5);
    const statusLabel =
        progress < 0.1 ? "chaos" :
            progress < 0.35 ? "filtering…" :
                progress < 0.6 ? "enriching…" :
                    progress < 0.85 ? "analyzing…" : "orchestrated";

    // Stage-based node color
    const stageOf = (i: number) =>
        i <= 4 ? 0 : i <= 8 ? 1 : i <= 13 ? 2 : i <= 18 ? 3 : i <= 23 ? 4 : i < 27 ? 5 : 6;

    const stageOpacity = [0.55, 0.65, 0.72, 0.80, 0.88, 0.95, 1.0];

    return (
        <section id="constellation" className="w-full py-24 px-6 md:px-12 lg:px-24">
            <div className="mb-12">
                <motion.span
                    className="text-xs font-medium tracking-widest text-primary uppercase mb-3 block"
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                >
                    Orchestration
                </motion.span>
                <AnimatedText
                    text="Intelligence orchestrating itself."
                    as="h2"
                    className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground"
                />
                <motion.p
                    className="mt-4 text-muted-foreground max-w-xl"
                    initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    Drag the slider to watch 28 unstructured data nodes self-organize
                    into a 6-stage live automation pipeline. Hover the canvas to repel nodes.
                </motion.p>
            </div>

            {/* Canvas */}
            <motion.div
                ref={containerRef}
                className="relative w-full h-[460px] md:h-[520px] rounded-2xl border border-border/50 bg-card/20 backdrop-blur-sm overflow-hidden"
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                onMouseMove={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
                }}
                onMouseLeave={() => { mouse.current = { x: -9999, y: -9999 }; }}
            >
                {/* Grid bg */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.035]">
                    <defs>
                        <pattern id="cg2" width="28" height="28" patternUnits="userSpaceOnUse">
                            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#cg2)" />
                </svg>

                {/* Stage labels */}
                {STAGE_LABELS.map((label, i) => (
                    <div
                        key={label}
                        className="absolute text-xs font-mono text-primary/70 pointer-events-none select-none"
                        style={{
                            left: dims.w * (i * 0.162 + 0.05),
                            top: 10,
                            opacity: labelOpacity,
                            transition: "opacity 0.3s",
                        }}
                    >
                        {label}
                    </div>
                ))}

                <svg className="absolute inset-0 w-full h-full overflow-visible">
                    {/* Edges */}
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
                                strokeWidth="0.8"
                                strokeOpacity={edgeOpacity * 0.55}
                                strokeLinecap="round"
                            />
                        );
                    })}

                    {/* Nodes */}
                    {nodes.map((node, i) => {
                        const isHub = i === 27;
                        const stage = stageOf(i);
                        const r = isHub ? 9 : 4.5;
                        const outerR = isHub ? 20 : 11;
                        const ao = stageOpacity[stage];
                        return (
                            <g key={node.id}>
                                {/* Outer ring */}
                                <circle
                                    cx={node.x} cy={node.y} r={outerR}
                                    fill="none"
                                    style={{ stroke: "var(--color-primary)" }}
                                    strokeWidth={isHub ? 1 : 0.7}
                                    strokeOpacity={edgeOpacity * 0.28}
                                />
                                {/* Core */}
                                <circle
                                    cx={node.x} cy={node.y} r={r}
                                    style={{
                                        fill: isHub ? "var(--color-primary)" : "var(--color-card)",
                                        stroke: "var(--color-primary)",
                                    }}
                                    strokeWidth={isHub ? 0 : 1.2}
                                    fillOpacity={isHub ? 0.95 : ao * 0.7}
                                    strokeOpacity={ao * 0.85}
                                />
                                {/* Hub glow */}
                                {isHub && (
                                    <circle
                                        cx={node.x} cy={node.y} r={r + 8}
                                        style={{ fill: "var(--color-primary)" }}
                                        fillOpacity={0.15 * sp}
                                    />
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* Status */}
                <div className="absolute bottom-4 right-4">
                    <motion.span
                        key={statusLabel}
                        className="text-xs font-mono text-primary/60"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {statusLabel}
                    </motion.span>
                </div>

                {/* Node count badge */}
                <div className="absolute top-4 right-4 text-xs font-mono text-muted-foreground/40">
                    {NODE_COUNT} nodes · {EDGES.length} edges
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border/20">
                    <div className="h-full bg-primary/50" style={{ width: `${sp * 100}%` }} />
                </div>
            </motion.div>

            {/* Drag slider */}
            <div className="mt-6 px-2">
                <DragSlider progress={progress} onChange={setProgress} />
            </div>
        </section>
    );
}
