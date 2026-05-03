'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark' || !theme;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[1, 64, 64]} ref={meshRef} scale={2}>
        <MeshDistortMaterial
          color={isDark ? '#E10600' : '#18181b'}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

export default function ThreeScene() {
  return (
    <div className="absolute inset-0 z-0 opacity-40 dark:opacity-60 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#E10600" />
        <AnimatedSphere />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
