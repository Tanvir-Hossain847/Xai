"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 3200;

function buildGridSquaresPositions(count: number): Float32Array {
    const positions = new Float32Array(count * 3);
    const GRID_SIZE = 8;
    const SQUARE_SIZE = 0.35;
    const SPACING = 1.3;

    const particlesPerSquare = Math.floor(count / (GRID_SIZE * GRID_SIZE));
    let idx = 0;

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const centerX = (col - (GRID_SIZE - 1) / 2) * SPACING;
            const centerY = (row - (GRID_SIZE - 1) / 2) * SPACING;

            for (let i = 0; i < particlesPerSquare; i++) {
                if (idx >= count * 3) break;

                const side = Math.floor(Math.random() * 6);
                const u = (Math.random() - 0.5) * SQUARE_SIZE;
                const v = (Math.random() - 0.5) * SQUARE_SIZE;
                const half = SQUARE_SIZE / 2;

                let px = 0, py = 0, pz = 0;
                if (side === 0) { px = u; py = v; pz = half; }
                else if (side === 1) { px = u; py = v; pz = -half; }
                else if (side === 2) { px = half; py = u; pz = v; }
                else if (side === 3) { px = -half; py = u; pz = v; }
                else if (side === 4) { px = u; py = half; pz = v; }
                else { px = u; py = -half; pz = v; }

                positions[idx++] = centerX + px;
                positions[idx++] = centerY + py;
                positions[idx++] = pz;
            }
        }
    }

    while (idx < count * 3) {
        positions[idx++] = (Math.random() - 0.5) * 6;
        positions[idx++] = (Math.random() - 0.5) * 6;
        positions[idx++] = (Math.random() - 0.5) * 3;
    }

    return positions;
}

function buildChaosPositions(count: number): Float32Array {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 4.2 + Math.random() * 3.5;
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return positions;
}

function Particles() {
    const meshRef = useRef<THREE.Points>(null);
    const timeRef = useRef(0);
    const tRef = useRef(0);

    const chaosPos = useMemo(() => buildChaosPositions(PARTICLE_COUNT), []);
    const structuredPos = useMemo(() => buildGridSquaresPositions(PARTICLE_COUNT), []);
    const currentPos = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);

    useEffect(() => {
        let cancelled = false;

        async function cycle() {
            await new Promise((r) => setTimeout(r, 1000));
            while (!cancelled) {
                const gatherStart = performance.now();
                const gatherDur = 2400;
                await new Promise<void>((r) => {
                    const tick = () => {
                        const elapsed = performance.now() - gatherStart;
                        tRef.current = Math.min(1, elapsed / gatherDur);
                        if (tRef.current < 1 && !cancelled) requestAnimationFrame(tick);
                        else r();
                    };
                    requestAnimationFrame(tick);
                });
                if (cancelled) break;

                await new Promise((r) => setTimeout(r, 4000));
                if (cancelled) break;

                const scatterStart = performance.now();
                const scatterDur = 1800;
                await new Promise<void>((r) => {
                    const tick = () => {
                        const elapsed = performance.now() - scatterStart;
                        tRef.current = Math.max(0, 1 - elapsed / scatterDur);
                        if (tRef.current > 0 && !cancelled) requestAnimationFrame(tick);
                        else r();
                    };
                    requestAnimationFrame(tick);
                });
                if (cancelled) break;

                await new Promise((r) => setTimeout(r, 3000));
            }
        }

        cycle();
        return () => { cancelled = true; };
    }, []);

    useFrame((_, delta) => {
        timeRef.current += delta * 1.0;
        const mesh = meshRef.current;
        if (!mesh) return;

        const attr = mesh.geometry.attributes.position as THREE.BufferAttribute;
        const t = tRef.current;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const ci = i * 3;

            const cx = chaosPos[ci] + Math.sin(timeRef.current + i * 0.45) * 0.12;
            const cy = chaosPos[ci + 1] + Math.cos(timeRef.current + i * 0.65) * 0.12;
            const cz = chaosPos[ci + 2] + Math.sin(timeRef.current * 0.85 + i) * 0.1;

            const px = structuredPos[ci];
            const py = structuredPos[ci + 1];
            const pz = structuredPos[ci + 2];

            const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

            attr.array[ci] = cx + (px - cx) * ease;
            attr.array[ci + 1] = cy + (py - cy) * ease;
            attr.array[ci + 2] = cz + (pz - cz) * ease;
        }

        attr.needsUpdate = true;
        mesh.rotation.y = timeRef.current * (0.08 * (1 - t) + 0.04 * t);
        mesh.rotation.x = Math.sin(timeRef.current * 0.2) * 0.08 * t;
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[currentPos, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.022}
                color={new THREE.Color("hsl(26, 100%, 60%)")}
                transparent
                opacity={0.8}
                sizeAttenuation
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

export function ParticleCloud({ scrollProgress }: { scrollProgress: number }) {
    return (
        <Canvas
            camera={{ position: [0, 0, 9], fov: 45 }}
            gl={{ antialias: false, alpha: true }}
            style={{ background: "transparent" }}
        >
            <Particles />
        </Canvas>
    );
}
