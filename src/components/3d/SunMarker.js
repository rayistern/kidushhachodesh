import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS } from './constants';

/**
 * SunMarker - Glowing sun representation at calculated true position
 * 
 * Features:
 * - Glowing sphere with pulsating effect
 * - Rays/aura for visual prominence
 * - Hover tooltip with astronomical data
 * - Light source for scene illumination
 */
const SunMarker = ({ 
  position = [0, 0, 0],
  longitude = 0,
  constellation = '',
  showLabel = true,
  onHover = null,
  ...props 
}) => {
  const sunRef = useRef();
  const glowRef = useRef();
  const raysRef = useRef();
  
  // Animate glow pulse and slow rotation
  useFrame((state) => {
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.9;
      glowRef.current.scale.setScalar(pulse);
    }
    
    if (raysRef.current) {
      raysRef.current.rotation.z += 0.002;
    }
  });
  
  const handlePointerOver = (e) => {
    e.stopPropagation();
    if (onHover) onHover({
      title: 'Sun (שמש)',
      longitude: longitude.toFixed(2),
      constellation,
      description: 'The sun\'s true position based on all epicycles.',
      reference: 'Hilchot Kiddush HaChodesh, Chapter 13'
    });
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = () => {
    if (onHover) onHover(null);
    document.body.style.cursor = 'auto';
  };

  return (
    <group position={position} {...props}>
      {/* Main sun body */}
      <mesh
        ref={sunRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color={COLORS.SUN_MARKER} />
      </mesh>
      
      {/* Inner glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial
          color={COLORS.SUN_GLOW}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Outer glow aura */}
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial
          color={COLORS.SUN_GLOW}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Rotating rays */}
      <mesh ref={raysRef}>
        <ringGeometry args={[1.2, 1.4, 12]} />
        <meshBasicMaterial
          color={COLORS.SUN_GLOW}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Light source */}
      <pointLight
        color={COLORS.SUN_GLOW}
        intensity={1}
        distance={30}
        decay={2}
      />
      
      {/* Label */}
      {showLabel && (
        <Html position={[0, 1.5, 0]} center distanceFactor={15}>
          <div className="galgal-label sun-label">
            <span className="hebrew">שמש</span>
            <span className="english">Sun</span>
            {longitude > 0 && (
              <span className="detail">{longitude.toFixed(1)}° {constellation}</span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};

export default SunMarker;
