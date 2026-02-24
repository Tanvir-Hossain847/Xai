"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface PinnedSectionOptions {
    /** Total scroll distance for the pin (e.g. "300%") */
    scrollDistance?: string;
    /** onUpdate callback receives progress [0..1] */
    onUpdate?: (progress: number) => void;
}

/**
 * Sets up a GSAP pinned section.
 * Returns the trigger ref to attach to the outer wrapper.
 */
export function usePinnedSection({
    scrollDistance = "300%",
    onUpdate,
}: PinnedSectionOptions = {}) {
    const triggerRef = useRef<HTMLElement | null>(null);
    const tlRef = useRef<gsap.core.Timeline | null>(null);

    useEffect(() => {
        const el = triggerRef.current;
        if (!el) return;

        // Create a proxy object for progress tracking
        const proxy = { progress: 0 };

        tlRef.current = gsap.timeline({
            scrollTrigger: {
                trigger: el,
                pin: true,
                scrub: 1.2,
                start: "top top",
                end: `+=${scrollDistance}`,
                onUpdate: (self) => {
                    onUpdate?.(self.progress);
                },
            },
        });

        return () => {
            tlRef.current?.scrollTrigger?.kill();
            tlRef.current?.kill();
        };
    }, [scrollDistance, onUpdate]);

    return { triggerRef, tlRef };
}
