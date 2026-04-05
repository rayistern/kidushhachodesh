import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Torus, Html } from '@react-three/drei';
import * as THREE from 'three';
import { MATERIALS, ANIMATION } from './constants';

/**
 * EpicycleRing - Colored torus representing Ptolemaic epicycles
 * Replicates Rabbi Losh's colored foam epicycle physical props
 * 
 * Features:
 * - Torus (donut) geometry for epicycle shape
 * - Glowing emissive material
 * - Animated rotation based on astronomical period
 * - Configurable inclination (for Galgal Noteh)
 * - Center marker for the deferent attachment point
 */
const EpicycleRing = ({ 
  radius,
  tube = 0.15,
  color = '#FFD700',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  revolutionPeriod = 365.25, // days for full rotation
  isAnimating = true,
  labelHe = '',
  labelEn = '',
  showCenterMarker = true,
  onHover = null,
  tooltipData = null,
  ...props 
}) => {
  const ringRef = useRef();
  const glowRef = useRef();
  
  // Calculate rotation speed based on period
  // Full rotation = 2π radians
  const rotationSpeed = isAnimating ? (2 * Math.PI) / (revolutionPeriod * 100) : 0;
  
  // Animate the ring rotation
  useFrame((state, delta) => {
    if (ringRef.current && isAnimating) {
      ringRef.current.rotation.z += rotationSpeed * delta * 50;
    }
    
    // Subtle glow pulse
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * ANIMATION.GLOW_PULSE_SPEED) * 0.1 + 0.9;
      glowRef.current.material.opacity = 0.15 * pulse;
    }
  });
  
  const handlePointerOver = (e) => {
    e.stopPropagation();
    if (onHover && tooltipData) onHover(tooltipData);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = () => {
    if (onHover) onHover(null);
    document.body.style.cursor = 'auto';
  };

  return (
    <group position={position} rotation={rotation} {...props}>
      {/* Main epicycle ring - the colored "inlaid" torus */}
      <Torus
        ref={ringRef}
        args={[radius, tube, 16, 100]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={MATERIALS.EPICYCLE.emissiveIntensity}
          roughness={MATERIALS.EPICYCLE.roughness}
          metalness={MATERIALS.EPICYCLE.metalness}
        />
      </Torus>
      
      {/* Outer glow effect for "inlaid" appearance */}
      <Torus
        ref={glowRef}
        args={[radius, tube * 2.5, 16, 100]}
      >
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </Torus>
      
      {/* Inner glow for depth */}
      <Torus args={[radius, tube * 0.5, 16, 100]}>
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </Torus>
      
      {/* Center marker - attachment point to deferent */}
      {showCenterMarker && (
        <mesh>
          <sphereGeometry args={[tube * 1.5, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
      
      {/* Planet/Marker position on epicycle (will be calculated based on true anomaly) */}
      <group name="planet-marker">
        {/* This will be positioned by parent based on astronomical calculations */}
      </group>
      
      {/* Label */}
      {(labelHe || labelEn) && (
        <Html position={[0, radius + 1, 0]} center distanceFactor={12}>
          <div className="galgal-label epicycle-label">
            {labelHe && <span className="hebrew">{labelHe}</span>}
            {labelEn && <span className="english">{labelEn}</span>}
          </div>
        </Html>
      )}
    </group>
  );
};

export default EpicycleRing;
