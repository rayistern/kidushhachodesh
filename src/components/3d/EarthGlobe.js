import React, { useRef } from 'react';
import { Sphere, MeshDistortMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';
import { EARTH, COLORS, TOOLTIP_CONTENT } from './constants';

/**
 * EarthGlobe - 3D Earth with 23.5° axial tilt
 * Replicates Rabbi Losh's tilted globe physical prop
 * 
 * Features:
 * - 23.5° axial tilt (Earth's obliquity to ecliptic)
 * - Atmospheric glow effect
 * - Interactive hover states
 * - Visual indicator of ecliptic plane
 */
const EarthGlobe = ({ 
  tilt = EARTH.TILT_DEGREES,
  showLabels = true,
  onHover = null,
  ...props 
}) => {
  const earthRef = useRef();
  const groupRef = useRef();
  
  // Convert tilt to radians for Three.js
  const tiltRadians = (tilt * Math.PI) / 180;
  
  const handlePointerOver = (e) => {
    e.stopPropagation();
    if (onHover) onHover(TOOLTIP_CONTENT.EARTH);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = () => {
    if (onHover) onHover(null);
    document.body.style.cursor = 'auto';
  };

  return (
    <group ref={groupRef} {...props}>
      {/* Earth's rotation axis group - applies the 23.5° tilt */}
      <group rotation={[0, 0, tiltRadians]}>
        
        {/* Main Earth sphere */}
        <Sphere
          ref={earthRef}
          args={[EARTH.RADIUS, 64, 64]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <MeshDistortMaterial
            color={COLORS.EARTH_BASE}
            emissive={COLORS.EARTH_EMISSIVE}
            emissiveIntensity={0.2}
            roughness={0.6}
            metalness={0.1}
            distort={0.1}
            speed={0.5}
          />
        </Sphere>
        
        {/* Atmosphere glow - outer transparent sphere */}
        <Sphere args={[EARTH.ATMOSPHERE_RADIUS, 32, 32]}>
          <meshBasicMaterial
            color={COLORS.ATMOSPHERE}
            transparent
            opacity={0.15}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </Sphere>
        
        {/* Ecliptic plane indicator ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[EARTH.RADIUS + 1, EARTH.RADIUS + 1.2, 64]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.1} 
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Axis line (visual aid) */}
        <mesh position={[0, EARTH.RADIUS * 1.5, 0]}>
          <cylinderGeometry args={[0.02, 0.02, EARTH.RADIUS, 8]} />
          <meshBasicMaterial color="#ffffff" opacity={0.5} transparent />
        </mesh>
        <mesh position={[0, -EARTH.RADIUS * 1.5, 0]}>
          <cylinderGeometry args={[0.02, 0.02, EARTH.RADIUS, 8]} />
          <meshBasicMaterial color="#ffffff" opacity={0.5} transparent />
        </mesh>
        
      </group>
      
      {/* Labels */}
      {showLabels && (
        <Html position={[0, EARTH.RADIUS + 1.5, 0]} center distanceFactor={10}>
          <div className="galgal-label earth-label">
            <span className="hebrew">ארץ</span>
            <span className="english">Earth</span>
            <span className="detail">Tilt: {tilt}°</span>
          </div>
        </Html>
      )}
    </group>
  );
};

export default EarthGlobe;
