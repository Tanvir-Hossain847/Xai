"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 1500;

function TunnelParticles() {
    const meshRef = useRef<THREE.Points>(null);
    const time = useRef(0);

    const particles = useMemo(() => {
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const speeds = new Float32Array(PARTICLE_COUNT);
        const radius = new Float32Array(PARTICLE_COUNT);
        const angles = new Float32Array(PARTICLE_COUNT);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const r = 0.5 + Math.random() * 4.5;
            const angle = Math.random() * Math.PI * 2;

            positions[i * 3] = Math.cos(angle) * r;
            positions[i * 3 + 1] = Math.sin(angle) * r;
            positions[i * 3 + 2] = -Math.random() * 50;

            speeds[i] = 15 + Math.random() * 35;
            radius[i] = r;
            angles[i] = angle;
        }

        return { positions, speeds, radius, angles };
    }, []);

    useFrame((_, delta) => {
        if (!meshRef.current) return;

        time.current += delta;
        const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const array = posAttr.array as Float32Array;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;

            array[i3 + 2] += particles.speeds[i] * delta;

            if (array[i3 + 2] > 5) {
                array[i3 + 2] = -45;
            }

            const sway = Math.sin(time.current * 0.5 + particles.angles[i]) * 0.1;
            array[i3] = Math.cos(particles.angles[i]) * (particles.radius[i] + sway);
            array[i3 + 1] = Math.sin(particles.angles[i]) * (particles.radius[i] + sway);
        }

        posAttr.needsUpdate = true;
        meshRef.current.rotation.z += delta * 0.1;
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[particles.positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.06}
                color="#ff7a00"
                transparent
                opacity={0.8}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

export function TunnelAnimation() {
    return (
        <div className="absolute inset-0 z-0 bg-black">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <TunnelParticles />
                <fog attach="fog" args={["black", 5, 45]} />
            </Canvas>
        </div>
    );
}
