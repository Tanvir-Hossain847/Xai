"use client";

import { useState, useEffect } from "react";
import { LoadingScreen } from "@/components/layout/LoadingScreen";

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <>
            {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
            <div className={isLoading ? "hidden" : "block transition-opacity duration-1000 opacity-100"}>
                {children}
            </div>
        </>
    );
}
