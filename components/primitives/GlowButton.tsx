"use client";

import { motion } from "framer-motion";

interface GlowButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    href?: string;
    className?: string;
    variant?: "primary" | "outline";
}

export function GlowButton({
    children,
    onClick,
    href,
    className = "",
    variant = "primary",
}: GlowButtonProps) {
    const base =
        "relative inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-medium tracking-wide rounded-lg transition-all duration-300 cursor-pointer select-none";

    const styles =
        variant === "primary"
            ? "bg-primary text-primary-foreground hover:opacity-90"
            : "border border-border text-foreground hover:border-primary/60 hover:text-primary";

    const content = (
        <motion.span
            className={`${base} ${styles} ${className}`}
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px -4px hsl(var(--primary) / 0.45)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
        >
            {children}
        </motion.span>
    );

    if (href) {
        return <a href={href}>{content}</a>;
    }

    return <button onClick={onClick}>{content}</button>;
}
