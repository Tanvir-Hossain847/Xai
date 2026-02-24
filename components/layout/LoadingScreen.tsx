"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TunnelAnimation } from "@/lib/three/TunnelAnimation";

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            // Brief delay after fade out starts before notifying parent to show main content
            setTimeout(onComplete, 800);
        }, 3200);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden pointer-events-none"
                >
                    <TunnelAnimation />

                    <div className="relative z-10 flex flex-col items-center gap-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="px-6 py-2 border border-primary/30 rounded-full bg-primary/5 bg-backdrop-blur-sm"
                        >
                            <span className="text-xs font-mono tracking-[0.3em] text-primary uppercase">
                                Synchronizing Workspace
                            </span>
                        </motion.div>

                        <motion.div
                            className="w-48 h-[1px] bg-white/10 rounded-full overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 3, ease: "easeInOut" }}
                            />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
