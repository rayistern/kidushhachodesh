import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * A single transparent celestial sphere (galgal).
 * Rendered as glass-like with MeshPhysicalMaterial.
 */
export default function CelestialSphere({
  radius = 1,
  color = '#4466aa',
  opacity = 0.08,
  visible = true,
  highlighted = false,
  rotationSpeed = 0, // radians per frame
  children,
}) {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (meshRef.current && rotationSpeed) {
      meshRef.current.rotation.y += rotationSpeed * delta;
    }
  });

  if (!visible) return children || null;

  return (
    <group>
      <mesh ref={meshRef} renderOrder={-radius}>
        <sphereGeometry args={[radius, 48, 32]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={highlighted ? opacity * 3 : opacity}
          transmission={highlighted ? 0.6 : 0.85}
          roughness={0.15}
          thickness={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
        {/* Wireframe overlay */}
        <mesh renderOrder={-radius + 0.1}>
          <sphereGeometry args={[radius * 1.001, 24, 12]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={highlighted ? 0.15 : 0.04}
            wireframe
            depthWrite={false}
          />
        </mesh>
      </mesh>
      {children}
    </group>
  );
}
