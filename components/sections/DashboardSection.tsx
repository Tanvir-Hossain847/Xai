"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView, useSpring, useTransform } from "framer-motion";
import { AnimatedText } from "@/components/primitives/AnimatedText";

// --- Animated counter hook ---
function useCountUp(target: number, inView: boolean, duration = 1.4) {
    const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
    const display = useTransform(spring, (v) =>
        v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : Math.round(v).toString()
    );
    useEffect(() => {
        if (inView) spring.set(target);
    }, [inView, target, spring]);
    return display;
}

// --- Metrics ---
const metrics = [
    { label: "Data Sources", value: 142, suffix: "", delta: "+12", trend: "up" },
    { label: "Insights Generated", value: 3847, suffix: "", delta: "+204", trend: "up" },
    { label: "Active Pipelines", value: 28, suffix: "", delta: "−2", trend: "down" },
];

function MetricCard({ m, inView, index }: { m: typeof metrics[0]; inView: boolean; index: number }) {
    const count = useCountUp(m.value, inView);
    return (
        <motion.div
            className="rounded-xl border border-border/50 bg-card/60 p-4 space-y-2 group cursor-default"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{
                borderColor: "color-mix(in oklch, var(--color-primary) 40%, transparent)",
                boxShadow: "0 0 24px -4px color-mix(in oklch, var(--color-primary) 25%, transparent)",
                y: -2,
            }}
        >
            <span className="text-xs text-muted-foreground">{m.label}</span>
            <div className="flex items-end justify-between">
                <motion.span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                    {count}
                </motion.span>
                <motion.span
                    className={`text-xs font-medium ${m.trend === "up" ? "text-green-400" : "text-destructive"}`}
                    initial={{ opacity: 0, x: 8 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: index * 0.1 + 0.4 }}
                >
                    {m.delta}
                </motion.span>
            </div>
            {/* Thin progress stripe at card bottom */}
            <div className="h-0.5 w-full bg-border/30 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-primary/50 rounded-full"
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${Math.min(100, (m.value / 4000) * 100 + 30)}%` } : {}}
                    transition={{ delay: index * 0.1 + 0.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>
        </motion.div>
    );
}

// --- Live Area Chart ---
const BASE_POINTS = [12, 32, 18, 48, 35, 58, 42, 72, 55, 80, 63, 90];

function LiveAreaChart({ inView }: { inView: boolean }) {
    const [points, setPoints] = useState(BASE_POINTS);

    // Simulate live data ticks
    useEffect(() => {
        if (!inView) return;
        const id = setInterval(() => {
            setPoints((prev) => {
                const next = [...prev.slice(1)];
                const last = prev[prev.length - 1];
                const newVal = Math.min(98, Math.max(8, last + (Math.random() - 0.48) * 14));
                next.push(newVal);
                return next;
            });
        }, 1400);
        return () => clearInterval(id);
    }, [inView]);

    const h = 80, w = 320;
    const step = w / (points.length - 1);
    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${i * step},${h - (p / 100) * h}`).join(" ");
    const areaD = `${pathD} L ${(points.length - 1) * step},${h} L 0,${h} Z`;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                </linearGradient>
            </defs>
            <motion.path
                d={areaD}
                fill="url(#chartGrad)"
                animate={{ d: areaD }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
            />
            <motion.path
                d={pathD}
                fill="none"
                style={{ stroke: "var(--color-primary)" }}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={inView ? { d: pathD, pathLength: 1, opacity: 1 } : { d: pathD, pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                initial={{ pathLength: 0, opacity: 0 }}
            />
            {/* Latest point pulse */}
            {(() => {
                const last = points[points.length - 1];
                const lx = (points.length - 1) * step;
                const ly = h - (last / 100) * h;
                return (
                    <g>
                        <motion.circle
                            cx={lx} cy={ly} r="4"
                            style={{ fill: "var(--color-primary)" }}
                            animate={{ r: [3, 5, 3] }}
                            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.circle
                            cx={lx} cy={ly}
                            style={{ stroke: "var(--color-primary)", fill: "none" }}
                            strokeWidth="1"
                            strokeOpacity="0.4"
                            animate={{ r: [4, 10, 4], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </g>
                );
            })()}
        </svg>
    );
}

// --- Insight feed ---
const insightFeed = [
    { message: "Pipeline #07 latency spiked 340% — root cause isolated to upstream connector.", time: "2m ago", severity: "high" },
    { message: "Recurring data drop every Tue 03:00 UTC — scheduled maintenance window detected.", time: "18m ago", severity: "info" },
    { message: "Auto-scaled worker pool from 4→8 nodes. Cost impact: +$0.14/hr.", time: "1h ago", severity: "success" },
];
const sevColor: Record<string, string> = {
    high: "bg-destructive",
    info: "bg-primary",
    success: "bg-green-500",
};

function OverviewPanel({ inView }: { inView: boolean }) {
    return (
        <motion.div
            key="overview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="space-y-5"
        >
            <div className="grid grid-cols-3 gap-3">
                {metrics.map((m, i) => <MetricCard key={m.label} m={m} inView={inView} index={i} />)}
            </div>

            {/* Chart */}
            <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-foreground">Insight Volume</span>
                    <div className="flex items-center gap-1.5">
                        <motion.span className="h-1.5 w-1.5 rounded-full bg-green-400"
                            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                        <span className="text-xs text-muted-foreground">Live</span>
                    </div>
                </div>
                <div className="h-20">
                    <LiveAreaChart inView={inView} />
                </div>
            </div>

            {/* Feed */}
            <div className="rounded-xl border border-border/50 bg-card/60 p-4 space-y-3">
                <span className="text-xs font-medium text-foreground block mb-1">Live Insights</span>
                {insightFeed.map((item, i) => (
                    <motion.div
                        key={i}
                        className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0"
                        initial={{ opacity: 0, x: -10 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.5 + i * 0.12 }}
                        whileHover={{ x: 3 }}
                    >
                        <span className={`mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full ${sevColor[item.severity]}`} />
                        <p className="text-xs text-muted-foreground leading-relaxed flex-1">{item.message}</p>
                        <span className="text-xs text-muted-foreground/50 flex-shrink-0">{item.time}</span>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

function PipelinesPanel({ inView }: { inView: boolean }) {
    const pipes = [
        { name: "prod-ingest-01", status: "running", throughput: "12.4k/s", health: 98 },
        { name: "analytics-transform", status: "running", throughput: "3.2k/s", health: 95 },
        { name: "ml-feature-store", status: "degraded", throughput: "0.8k/s", health: 42 },
        { name: "export-warehouse", status: "paused", throughput: "—", health: 0 },
    ];
    const statusColor: Record<string, string> = {
        running: "text-green-400", degraded: "text-yellow-400", paused: "text-muted-foreground",
    };
    return (
        <motion.div
            key="pipelines"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="rounded-xl border border-border/50 bg-card/60 overflow-hidden"
        >
            <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">Active Pipelines</span>
                <span className="text-xs text-muted-foreground">{pipes.filter(p => p.status === "running").length} running</span>
            </div>
            {pipes.map((p, i) => (
                <motion.div
                    key={p.name}
                    className="px-4 py-3 flex items-center gap-4 border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ x: 3 }}
                >
                    <motion.span
                        className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${p.status === "running" ? "bg-green-400" : p.status === "degraded" ? "bg-yellow-400" : "bg-muted-foreground"}`}
                        animate={p.status === "running" ? { opacity: [1, 0.4, 1] } : {}}
                        transition={{ duration: 1.6, repeat: Infinity }}
                    />
                    <span className="text-xs font-mono text-foreground flex-1">{p.name}</span>
                    <span className={`text-xs ${statusColor[p.status]}`}>{p.status}</span>
                    <span className="text-xs text-muted-foreground w-20 text-right">{p.throughput}</span>
                    <div className="w-16 h-1 rounded-full bg-border overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-primary"
                            initial={{ width: 0 }}
                            animate={inView ? { width: `${p.health}%` } : {}}
                            transition={{ delay: i * 0.08 + 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        />
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}

function PlaceholderPanel({ label }: { label: string }) {
    return (
        <motion.div
            key={label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center h-48 rounded-xl border border-dashed border-border/40 text-muted-foreground/40 text-sm"
        >
            {label} — coming soon
        </motion.div>
    );
}

const navItems = [
    { label: "Overview", icon: "◈", id: "overview" },
    { label: "Pipelines", icon: "⊶", id: "pipelines" },
    { label: "Insights", icon: "◎", id: "insights" },
    { label: "Automations", icon: "◉", id: "automations" },
    { label: "Settings", icon: "◌", id: "settings" },
];

export function DashboardSection() {
    const [activeTab, setActiveTab] = useState("overview");
    const sectionRef = useRef<HTMLDivElement>(null);
    const inView = useInView(sectionRef, { once: true, amount: 0.15 });

    const tabContent: Record<string, React.ReactNode> = {
        overview: <OverviewPanel inView={inView} />,
        pipelines: <PipelinesPanel inView={inView} />,
        insights: <PlaceholderPanel label="Insights" />,
        automations: <PlaceholderPanel label="Automations" />,
        settings: <PlaceholderPanel label="Settings" />,
    };

    return (
        <section id="dashboard" ref={sectionRef} className="w-full py-24 px-6 md:px-12 lg:px-24">
            {/* Header */}
            <div className="mb-14">
                <motion.span
                    className="text-xs font-medium tracking-widest text-primary uppercase mb-3 block"
                    initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
                >
                    Platform
                </motion.span>
                <AnimatedText
                    text="Intelligence, structured."
                    as="h2"
                    className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground"
                />
                <motion.p
                    className="mt-4 text-muted-foreground max-w-md"
                    initial={{ opacity: 0, y: 12 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.3 }}
                >
                    The workspace where your data becomes decisions.
                </motion.p>
            </div>

            {/* Dashboard shell */}
            <motion.div
                className="rounded-2xl border border-border/50 bg-card/20 backdrop-blur-sm overflow-hidden shadow-2xl"
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-card/40">
                    <motion.span className="h-2.5 w-2.5 rounded-full bg-destructive/60" whileHover={{ scale: 1.3 }} />
                    <motion.span className="h-2.5 w-2.5 rounded-full bg-yellow-500/40" whileHover={{ scale: 1.3 }} />
                    <motion.span className="h-2.5 w-2.5 rounded-full bg-green-500/40" whileHover={{ scale: 1.3 }} />
                    <span className="ml-3 text-xs text-muted-foreground/60 font-mono">xai.workspace · {activeTab}</span>
                </div>

                <div className="flex min-h-[520px]">
                    {/* Sidebar */}
                    <aside className="w-48 flex-shrink-0 border-r border-border/50 p-4 space-y-1 relative">
                        <div className="px-3 py-2 mb-4">
                            <span className="text-xs text-muted-foreground/60 font-medium uppercase tracking-wider">Workspace</span>
                        </div>
                        {navItems.map((item) => (
                            <motion.button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-200 cursor-pointer ${activeTab === item.id
                                    ? "bg-primary/10 text-foreground font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <span className="text-base leading-none opacity-70">{item.icon}</span>
                                {item.label}
                                {activeTab === item.id && (
                                    <motion.div
                                        className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                                        layoutId="sidebar-active"
                                    />
                                )}
                            </motion.button>
                        ))}

                        {/* Sidebar footer */}
                        <div className="absolute bottom-0 left-0 w-48 border-t border-border/50 p-4">
                            <motion.div
                                className="flex items-center gap-2.5"
                                whileHover={{ x: 2 }}
                            >
                                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-medium">T</div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-foreground">Tanvir</span>
                                    <span className="text-xs text-muted-foreground/60">Admin</span>
                                </div>
                            </motion.div>
                        </div>
                    </aside>

                    {/* Main panel */}
                    <main className="flex-1 p-5 overflow-auto">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-sm font-medium text-foreground capitalize">{activeTab}</h3>
                                <p className="text-xs text-muted-foreground">Real-time · Updated just now</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <motion.span
                                    className="h-1.5 w-1.5 rounded-full bg-green-400"
                                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 1.6, repeat: Infinity }}
                                />
                                <span className="text-xs text-muted-foreground">Live</span>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {tabContent[activeTab]}
                        </AnimatePresence>
                    </main>
                </div>
            </motion.div>
        </section>
    );
}
