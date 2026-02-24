"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns a normalized [0, 1] scroll progress for a given element ref.
 * 0 = element top reaches viewport bottom, 1 = element bottom leaves viewport top.
 */
export function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const update = () => {
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight;
            // progress from 0 (el entering bottom) to 1 (el leaving top)
            const raw = 1 - rect.bottom / (vh + rect.height);
            setProgress(Math.min(1, Math.max(0, raw)));
        };

        window.addEventListener("scroll", update, { passive: true });
        update();
        return () => window.removeEventListener("scroll", update);
    }, [ref]);

    return progress;
}
