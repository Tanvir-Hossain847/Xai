"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 2200;

// ─── Data-pack icon target positions ──────────────────────────────────────────
// Builds 3D points that form a solid cube with a circular "data" disc in front.
function buildDataPackPositions(count: number): Float32Array {
    const positions = new Float32Array(count * 3);
    const SIZE = 1.6; // box half-extent

    // Split particles: 60% cube surface, 25% cylinder/disc faces, 15% inner grid
    const cubeCount = Math.floor(count * 0.55);
    const discCount = Math.floor(count * 0.28);
    const gridCount = count - cubeCount - discCount;

    let idx = 0;

    // CUBE surface (6 faces)
    const faces = [
        (u: number, v: number) => [u, v, SIZE],    // front
        (u: number, v: number) => [u, v, -SIZE],   // back
        (u: number, v: number) => [SIZE, u, v],    // right
        (u: number, v: number) => [-SIZE, u, v],   // left
        (u: number, v: number) => [u, SIZE, v],    // top
        (u: number, v: number) => [u, -SIZE, v],   // bottom
    ];
    for (let i = 0; i < cubeCount; i++) {
        const face = faces[i % 6];
        const u = (Math.random() - 0.5) * SIZE * 2;
        const v = (Math.random() - 0.5) * SIZE * 2;
        const [x, y, z] = face(u, v);
        positions[idx++] = x;
        positions[idx++] = y;
        positions[idx++] = z;
    }

    // CIRCULAR DISC on front face — database/data-pack symbol
    const discR = SIZE * 0.68;
    const discZ = SIZE + 0.01;
    for (let i = 0; i < discCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * discR;
        const isEdge = Math.random() < 0.45; // ring vs fill
        const rr = isEdge ? discR * (0.9 + Math.random() * 0.1) : r;
        positions[idx++] = Math.cos(angle) * rr;
        positions[idx++] = Math.sin(angle) * rr * 0.3; // flatten to ellipse
        positions[idx++] = discZ;
    }

    // INNER grid lines — looks like data slots inside the box
    const cols = Math.ceil(Math.sqrt(gridCount));
    const spacing = (SIZE * 1.8) / cols;
    const off = ((cols - 1) * spacing) / 2;
    for (let i = 0; i < gridCount; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        positions[idx++] = col * spacing - off;
        positions[idx++] = row * spacing - off;
        positions[idx++] = (Math.random() - 0.5) * SIZE * 1.6;
    }

    return positions;
}

// Chaotic spread — sphere shell
function buildChaosPositions(count: number): Float32Array {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 3.8 + Math.random() * 2.5;
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return positions;
}

function Particles() {
    const meshRef = useRef<THREE.Points>(null);
    const timeRef = useRef(0);
    // t = 0 (chaos) → 1 (data-pack), driven by auto animation
    const tRef = useRef(0);
    const gatheringRef = useRef(false);

    const chaosPos = useMemo(() => buildChaosPositions(PARTICLE_COUNT), []);
    const packPos = useMemo(() => buildDataPackPositions(PARTICLE_COUNT), []);
    const currentPos = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);

    // Auto-animate: scatter → gather → scatter → ... cycle
    useEffect(() => {
        let cancelled = false;

        async function cycle() {
            await new Promise((r) => setTimeout(r, 800)); // initial pause
            while (!cancelled) {
                // Gather
                gatheringRef.current = true;
                const gatherStart = performance.now();
                const gatherDur = 1800;
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

                // Hold formed shape
                await new Promise((r) => setTimeout(r, 2400));
                if (cancelled) break;

                // Gentle rotate while formed — handled in useFrame
                // Scatter
                gatheringRef.current = false;
                const scatterStart = performance.now();
                const scatterDur = 1400;
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

                // Hold chaotic
                await new Promise((r) => setTimeout(r, 2000));
            }
        }

        cycle();
        return () => { cancelled = true; };
    }, []);

    useFrame((_, delta) => {
        timeRef.current += delta * 0.9; // ← faster ambient drift
        const mesh = meshRef.current;
        if (!mesh) return;

        const attr = mesh.geometry.attributes.position as THREE.BufferAttribute;
        const t = tRef.current;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const ci = i * 3;
            // Faster drift oscillation
            const cx = chaosPos[ci] + Math.sin(timeRef.current + i * 0.42) * 0.07;
            const cy = chaosPos[ci + 1] + Math.cos(timeRef.current + i * 0.61) * 0.07;
            const cz = chaosPos[ci + 2] + Math.sin(timeRef.current * 0.8 + i) * 0.05;

            const px = packPos[ci];
            const py = packPos[ci + 1];
            const pz = packPos[ci + 2];

            // Ease-in-out interpolation
            const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

            attr.array[ci] = cx + (px - cx) * ease;
            attr.array[ci + 1] = cy + (py - cy) * ease;
            attr.array[ci + 2] = cz + (pz - cz) * ease;
        }

        attr.needsUpdate = true;
        // Slow rotation when formed, fast spin when chaotic
        mesh.rotation.y = timeRef.current * (0.12 * (1 - t) + 0.06 * t);
        mesh.rotation.x = Math.sin(timeRef.current * 0.3) * 0.12 * t;
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
                size={0.038}
                color={new THREE.Color("hsl(28, 90%, 68%)")}
                transparent
                opacity={0.85}
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
            camera={{ position: [0, 0, 7.5], fov: 52 }}
            gl={{ antialias: false, alpha: true }}
            style={{ background: "transparent" }}
        >
            <Particles />
        </Canvas>
    );
}
