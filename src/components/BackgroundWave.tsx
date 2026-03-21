import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface BackgroundWaveProps {
    intensity?: number; // Optional prop for any future customization
    speed?: number; // Optional speed control
}

const BackgroundWave: React.FC<BackgroundWaveProps> = ({
    intensity = 0.1,
    speed = 0.3
}) => {
    return (
        <Canvas
            camera={{ position: [0, 2, 22], fov: 55 }}
            gl={{
                powerPreference: "high-performance",
                antialias: true,
                alpha: true,
            }}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'transparent'
            }}
        >
            {/* Simplified fixed lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 5]} intensity={1} color="#ffffff" />
            <directionalLight position={[-5, -5, 5]} intensity={0.5} color="#aaccff" />

            {/* Single fixed point light */}
            <pointLight position={[0, 0, 5]} intensity={0.5} color="#7c3aed" />

            <Suspense fallback={null}>
                <WaveMesh speed={speed} />
            </Suspense>

            {/* Camera controls disabled */}
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                enableRotate={false}
                autoRotate={false}
            />
        </Canvas>
    );
};

// Internal wave mesh component
const WaveMesh: React.FC<{ speed: number }> = ({ speed }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    const geometry = useMemo(() => {
        const width = 40;
        const height = 40;
        const segments = 250;

        const geo = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];
        const indices = [];

        for (let i = 0; i <= segments; i++) {
            const x = (i / segments - 0.5) * width;

            for (let j = 0; j <= segments; j++) {
                const y = (j / segments - 0.5) * height;

                vertices.push(x, 0, y);

                const diagonalPos = (x + y) / (width + height) * 2;
                const hue = 0.65 + diagonalPos * 0.3;
                const saturation = 0.6;
                const lightness = 0.65 + Math.sin(x * 0.2) * 0.1;

                const color = new THREE.Color().setHSL(
                    hue,
                    saturation,
                    lightness
                );

                colors.push(color.r, color.g, color.b);
            }
        }

        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segments; j++) {
                const a = i * (segments + 1) + j;
                const b = i * (segments + 1) + j + 1;
                const c = (i + 1) * (segments + 1) + j;
                const d = (i + 1) * (segments + 1) + j + 1;

                indices.push(a, b, c);
                indices.push(b, d, c);
            }
        }

        geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geo.setIndex(indices);
        geo.computeVertexNormals();

        return geo;
    }, []);

    useFrame((state) => {
        if (meshRef.current) {
            const positions = meshRef.current.geometry.attributes.position.array;
            const time = state.clock.elapsedTime * speed;

            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const z = positions[i + 2];

                const diagonal = (x - z) / 15;

                const wave1 = Math.sin(diagonal * 3.5 + time) * 1.2;
                const wave2 = Math.cos(diagonal * 2.8 + time * 1.5) * 0.8;
                const wave3 = Math.sin(x * 0.4 + z * 0.3 + time * 2) * 0.4;

                const y = wave1 + wave2 + wave3;

                positions[i + 1] = y;
            }

            meshRef.current.geometry.attributes.position.needsUpdate = true;
            meshRef.current.geometry.computeVertexNormals();

            meshRef.current.rotation.x = 0.1;
            meshRef.current.rotation.y = -0.3;
            meshRef.current.rotation.z = 0.05;

            if (meshRef.current.material) {
                const material = meshRef.current.material as THREE.MeshStandardMaterial;
                material.emissiveIntensity = 0.1;
                material.opacity = 0.85;
            }
        }
    });

    return (
        <mesh
            ref={meshRef}
            geometry={geometry}
            position={[0, -2, -12]}
        >
            <meshStandardMaterial
                vertexColors
                wireframe={false}
                emissive={new THREE.Color(0x331144)}
                emissiveIntensity={0.1}
                roughness={0.15}
                metalness={0.2}
                transparent
                opacity={0.85}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

export default BackgroundWave;