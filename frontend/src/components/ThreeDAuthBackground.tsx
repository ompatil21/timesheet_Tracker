'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshTransmissionMaterial, ContactShadows, Sphere } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function AbstractGlassShape() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Custom organic geometry
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.5, 4);
    
    // Add organic noise to the vertices
    const positionAttribute = geo.getAttribute('position');
    const vertex = new THREE.Vector3();
    for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i);
      // Subtle displacement
      const noise = Math.sin(vertex.x * 2) * Math.cos(vertex.y * 2) * Math.sin(vertex.z * 2);
      vertex.addScalar(noise * 0.15);
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.5;
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} geometry={geometry} position={[2, 0, 0]}>
        <MeshTransmissionMaterial 
          backside
          backsideThickness={5}
          thickness={2}
          chromaticAberration={0.4}
          anisotropicBlur={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          roughness={0.05}
          transmission={1}
          ior={1.2}
          color="#ffffff"
          attenuationDistance={3}
          attenuationColor="#ffffff"
        />
      </mesh>
      
      {/* Floating internal particles for depth */}
      <Sphere args={[0.2, 16, 16]} position={[1.5, 0.5, 0]}>
        <meshBasicMaterial color="#3b82f6" toneMapped={false} />
      </Sphere>
      <Sphere args={[0.15, 16, 16]} position={[2.5, -0.5, 0.5]}>
        <meshBasicMaterial color="#ec4899" toneMapped={false} />
      </Sphere>
    </Float>
  );
}

export default function ThreeDAuthBackground() {
  return (
    <div className="absolute inset-0 z-0 bg-[#020202] overflow-hidden pointer-events-none">
      {/* Heavy radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-[#020202] to-[#020202]"></div>
      
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.5} />
        
        {/* Dynamic dramatic lighting */}
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#4f46e5" />
        <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={3} color="#ec4899" />
        
        <AbstractGlassShape />
        
        <Environment preset="city" />
        <ContactShadows position={[0, -3, 0]} opacity={0.6} scale={15} blur={2.5} far={4} color="#000000" />
      </Canvas>
      
      {/* Glass noise overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
    </div>
  );
}
