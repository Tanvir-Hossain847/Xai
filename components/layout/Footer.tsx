"use client";

import { motion } from "framer-motion";

export function Footer() {
    return (
        <motion.footer
            className="w-full border-t border-border/50 px-6 md:px-12 lg:px-24 py-10 flex items-center justify-between text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
        >
            <span className="font-medium text-foreground tracking-tight">Xai</span>
            <span>Intelligence Workspace · {new Date().getFullYear()}</span>
            <span>Built with restraint.</span>
        </motion.footer>
    );
}
