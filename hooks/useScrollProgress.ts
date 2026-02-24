"use client";

import { useEffect, useRef, useState } from "react";

export function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const update = () => {
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight;
            
            const raw = 1 - rect.bottom / (vh + rect.height);
            setProgress(Math.min(1, Math.max(0, raw)));
        };

        window.addEventListener("scroll", update, { passive: true });
        update();
        return () => window.removeEventListener("scroll", update);
    }, [ref]);

    return progress;
}
