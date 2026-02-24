"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface PinnedSectionOptions {
    
    scrollDistance?: string;
    
    onUpdate?: (progress: number) => void;
}

export function usePinnedSection({
    scrollDistance = "300%",
    onUpdate,
}: PinnedSectionOptions = {}) {
    const triggerRef = useRef<HTMLElement | null>(null);
    const tlRef = useRef<gsap.core.Timeline | null>(null);

    useEffect(() => {
        const el = triggerRef.current;
        if (!el) return;

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
