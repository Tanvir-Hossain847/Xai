"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 1500;

// Grid target positions for "structured" state
function buildGridPositions(count: number): Float32Array {
    const cols = Math.ceil(Math.sqrt(count));
    const positions = new Float32Array(count * 3);
    const spacing = 0.28;
    const offset = ((cols - 1) * spacing) / 2;
    for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        positions[i * 3] = col * spacing - offset;
        positions[i * 3 + 1] = row * spacing - offset;
        positions[i * 3 + 2] = 0;
    }
    return positions;
}

// Chaotic spread positions
function buildChaosPositions(count: number): Float32Array {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        // Spherical distribution with some z-depth
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 3.5 + Math.random() * 2;
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return positions;
}

interface ParticlesProps {
    scrollProgress: number;
}

function Particles({ scrollProgress }: ParticlesProps) {
    const meshRef = useRef<THREE.Points>(null);
    const timeRef = useRef(0);

    // Memoize stable start and end positions
    const chaosPos = useMemo(() => buildChaosPositions(PARTICLE_COUNT), []);
    const gridPos = useMemo(() => buildGridPositions(PARTICLE_COUNT), []);

    const currentPos = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);

    useFrame((_, delta) => {
        timeRef.current += delta * 0.3;
        const mesh = meshRef.current;
        if (!mesh) return;

        const attr = mesh.geometry.attributes.position as THREE.BufferAttribute;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const ci = i * 3;

            // Chaos position with subtle drift
            const cx = chaosPos[ci] + Math.sin(timeRef.current + i * 0.5) * 0.04;
            const cy = chaosPos[ci + 1] + Math.cos(timeRef.current + i * 0.7) * 0.04;
            const cz = chaosPos[ci + 2] + Math.sin(timeRef.current * 0.5 + i) * 0.02;

            // Target grid position
            const gx = gridPos[ci];
            const gy = gridPos[ci + 1];
            const gz = gridPos[ci + 2];

            const t = scrollProgress;

            attr.array[ci] = cx + (gx - cx) * t;
            attr.array[ci + 1] = cy + (gy - cy) * t;
            attr.array[ci + 2] = cz + (gz - cz) * t;
        }

        attr.needsUpdate = true;
        mesh.rotation.y = timeRef.current * 0.04 * (1 - scrollProgress);
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
                size={0.04}
                color={new THREE.Color("hsl(200, 80%, 72%)")}
                transparent
                opacity={0.75}
                sizeAttenuation
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

interface ParticleCloudProps {
    scrollProgress: number;
}

export function ParticleCloud({ scrollProgress }: ParticleCloudProps) {
    return (
        <Canvas
            camera={{ position: [0, 0, 8], fov: 55 }}
            gl={{ antialias: false, alpha: true }}
            style={{ background: "transparent" }}
        >
            <Particles scrollProgress={scrollProgress} />
        </Canvas>
    );
}
