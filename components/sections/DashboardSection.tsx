"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedText } from "@/components/primitives/AnimatedText";

// --- Sidebar ---
const navItems = [
    { label: "Overview", icon: "◈", id: "overview" },
    { label: "Pipelines", icon: "⊶", id: "pipelines" },
    { label: "Insights", icon: "◎", id: "insights" },
    { label: "Automations", icon: "◉", id: "automations" },
    { label: "Settings", icon: "◌", id: "settings" },
];

// --- Metrics ---
const metrics = [
    { label: "Data Sources", value: "142", delta: "+12", trend: "up" },
    { label: "Insights Generated", value: "3,847", delta: "+204", trend: "up" },
    { label: "Active Pipelines", value: "28", delta: "−2", trend: "down" },
];

// --- SVG Area Chart ---
function AreaChart() {
    const points = [12, 32, 18, 48, 35, 58, 42, 72, 55, 80, 63, 90];
    const h = 80;
    const w = 320;
    const step = w / (points.length - 1);

    const pathD = points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step},${h - (p / 100) * h}`)
        .join(" ");
    const areaD = `${pathD} L ${(points.length - 1) * step},${h} L 0,${h} Z`;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
            </defs>
            <motion.path
                d={areaD}
                fill="url(#chartGrad)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.3 }}
            />
            <motion.path
                d={pathD}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, ease: "easeInOut", delay: 0.2 }}
            />
            {/* Dots */}
            {points.map((p, i) => (
                <motion.circle
                    key={i}
                    cx={i * step}
                    cy={h - (p / 100) * h}
                    r="2.5"
                    fill="hsl(var(--primary))"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.06, duration: 0.3 }}
                />
            ))}
        </svg>
    );
}

// --- Insight Feed Items ---
const insightFeed = [
    {
        type: "anomaly",
        message: "Pipeline #07 latency spiked 340% — root cause isolated to upstream connector.",
        time: "2m ago",
        severity: "high",
    },
    {
        type: "pattern",
        message: "Recurring data drop every Tue 03:00 UTC — scheduled maintenance window detected.",
        time: "18m ago",
        severity: "info",
    },
    {
        type: "action",
        message: "Auto-scaled worker pool from 4→8 nodes. Cost impact: +$0.14/hr.",
        time: "1h ago",
        severity: "success",
    },
];

const severityColor: Record<string, string> = {
    high: "bg-destructive",
    info: "bg-primary",
    success: "bg-green-500",
};

// --- Tab content panels ---
function OverviewPanel() {
    return (
        <motion.div
            key="overview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="space-y-5"
        >
            {/* Metric cards */}
            <div className="grid grid-cols-3 gap-3">
                {metrics.map((m, i) => (
                    <motion.div
                        key={m.label}
                        className="rounded-xl border border-border/50 bg-card/60 p-4 space-y-2 hover:border-primary/30 hover:shadow-[0_0_16px_-4px_hsl(var(--primary)/0.2)] transition-all duration-300"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.5 }}
                    >
                        <span className="text-xs text-muted-foreground">{m.label}</span>
                        <div className="flex items-end justify-between">
                            <span className="text-2xl font-semibold tracking-tight text-foreground">
                                {m.value}
                            </span>
                            <span
                                className={`text-xs font-medium ${m.trend === "up" ? "text-green-400" : "text-destructive"
                                    }`}
                            >
                                {m.delta}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Chart */}
            <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-foreground">Insight Volume</span>
                    <span className="text-xs text-muted-foreground">Last 12 cycles</span>
                </div>
                <div className="h-20">
                    <AreaChart />
                </div>
            </div>

            {/* Insight feed */}
            <div className="rounded-xl border border-border/50 bg-card/60 p-4 space-y-3">
                <span className="text-xs font-medium text-foreground block mb-1">Live Insights</span>
                {insightFeed.map((item, i) => (
                    <motion.div
                        key={i}
                        className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                    >
                        <span
                            className={`mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full ${severityColor[item.severity]}`}
                        />
                        <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                            {item.message}
                        </p>
                        <span className="text-xs text-muted-foreground/50 flex-shrink-0">{item.time}</span>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

function PipelinesPanel() {
    const pipes = [
        { name: "prod-ingest-01", status: "running", throughput: "12.4k/s", health: 98 },
        { name: "analytics-transform", status: "running", throughput: "3.2k/s", health: 95 },
        { name: "ml-feature-store", status: "degraded", throughput: "0.8k/s", health: 42 },
        { name: "export-warehouse", status: "paused", throughput: "—", health: 0 },
    ];
    const statusColor: Record<string, string> = {
        running: "text-green-400",
        degraded: "text-yellow-400",
        paused: "text-muted-foreground",
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
                <span className="text-xs text-muted-foreground">{pipes.filter(p => p.status === 'running').length} running</span>
            </div>
            {pipes.map((p, i) => (
                <motion.div
                    key={p.name}
                    className="px-4 py-3 flex items-center gap-4 border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.07 }}
                >
                    <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${p.status === 'running' ? 'bg-green-400' : p.status === 'degraded' ? 'bg-yellow-400' : 'bg-muted-foreground'}`} />
                    <span className="text-xs font-mono text-foreground flex-1">{p.name}</span>
                    <span className={`text-xs ${statusColor[p.status]}`}>{p.status}</span>
                    <span className="text-xs text-muted-foreground w-20 text-right">{p.throughput}</span>
                    <div className="w-16 h-1 rounded-full bg-border overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${p.health}%` }} />
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

export function DashboardSection() {
    const [activeTab, setActiveTab] = useState("overview");

    const tabContent: Record<string, React.ReactNode> = {
        overview: <OverviewPanel />,
        pipelines: <PipelinesPanel />,
        insights: <PlaceholderPanel label="Insights" />,
        automations: <PlaceholderPanel label="Automations" />,
        settings: <PlaceholderPanel label="Settings" />,
    };

    return (
        <section
            id="dashboard"
            className="w-full py-24 px-6 md:px-12 lg:px-24"
        >
            {/* Section header */}
            <div className="mb-14">
                <motion.span
                    className="text-xs font-medium tracking-widest text-primary uppercase mb-3 block"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
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
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    The workspace where your data becomes decisions.
                </motion.p>
            </div>

            {/* Dashboard shell */}
            <motion.div
                className="rounded-2xl border border-border/50 bg-card/20 backdrop-blur-sm overflow-hidden shadow-2xl"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-card/40">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/40" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500/40" />
                    <span className="ml-3 text-xs text-muted-foreground/60 font-mono">
                        xai.workspace · overview
                    </span>
                </div>

                <div className="flex min-h-[520px]">
                    {/* Sidebar */}
                    <aside className="w-48 flex-shrink-0 border-r border-border/50 p-4 space-y-1">
                        <div className="px-3 py-2 mb-4">
                            <span className="text-xs text-muted-foreground/60 font-medium uppercase tracking-wider">
                                Workspace
                            </span>
                        </div>
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${activeTab === item.id
                                    ? "bg-primary/10 text-foreground font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                    }`}
                            >
                                <span className="text-base leading-none opacity-70">{item.icon}</span>
                                {item.label}
                                {activeTab === item.id && (
                                    <motion.div
                                        className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                                        layoutId="sidebar-active"
                                    />
                                )}
                            </button>
                        ))}

                        {/* Sidebar footer */}
                        <div className="absolute bottom-0 left-0 w-48 border-t border-border/50 p-4">
                            <div className="flex items-center gap-2.5">
                                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-medium">
                                    T
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-foreground">Tanvir</span>
                                    <span className="text-xs text-muted-foreground/60">Admin</span>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main panel */}
                    <main className="flex-1 p-5 overflow-auto">
                        {/* Top bar */}
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-sm font-medium text-foreground capitalize">{activeTab}</h3>
                                <p className="text-xs text-muted-foreground">Real-time · Updated just now</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-xs text-muted-foreground">Live</span>
                            </div>
                        </div>

                        {/* Tab panels */}
                        <AnimatePresence mode="wait">
                            {tabContent[activeTab]}
                        </AnimatePresence>
                    </main>
                </div>
            </motion.div>
        </section>
    );
}
