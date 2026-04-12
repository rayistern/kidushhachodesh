import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS } from './constants';

/**
 * MoonMarker - Moon representation with phase visualization
 * 
 * Features:
 * - Sphere showing moon phase (illuminated portion)
 * - Glow effect for visibility
 * - Color based on phase (darker for new moon, brighter for full)
 * - Hover tooltip with astronomical data
 */
const MoonMarker = ({ 
  position = [0, 0, 0],
  longitude = 0,
  latitude = 0,
  elongation = 0,
  phase = 'New Moon',
  constellation = '',
  isVisible = false,
  showLabel = true,
  onHover = null,
  ...props 
}) => {
  const moonRef = useRef();
  const glowRef = useRef();
  
  // Calculate moon appearance based on phase
  const moonAppearance = useMemo(() => {
    // Convert elongation to illumination (0 = new, 180 = full)
    const illumination = (1 - Math.cos((elongation * Math.PI) / 180)) / 2;
    
    // Brightness from 30% (new) to 100% (full)
    const brightness = 30 + illumination * 70;
    const color = new THREE.Color().setHSL(0, 0, brightness / 100);
    
    return {
      color,
      brightness,
      scale: 0.3 + illumination * 0.1, // Slightly larger when full
    };
  }, [elongation]);
  
  // Subtle glow animation
  useFrame((state) => {
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.05 + 0.95;
      glowRef.current.scale.setScalar(pulse);
    }
  });
  
  const handlePointerOver = (e) => {
    e.stopPropagation();
    if (onHover) onHover({
      title: 'Moon (ירח)',
      longitude: longitude.toFixed(2),
      latitude: latitude.toFixed(2),
      constellation,
      phase,
      visibility: isVisible ? 'Potentially Visible' : 'Not Visible',
      elongation: elongation.toFixed(2),
      description: 'The moon\'s position as calculated from the Rambam\'s model.',
      reference: 'Hilchot Kiddush HaChodesh, Chapter 17'
    });
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = () => {
    if (onHover) onHover(null);
    document.body.style.cursor = 'auto';
  };

  return (
    <group position={position} {...props}>
      {/* Main moon body */}
      <mesh
        ref={moonRef}
        scale={moonAppearance.scale}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial
          color={moonAppearance.color}
          roughness={0.8}
          metalness={0.1}
          emissive={moonAppearance.color}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Glow effect - stronger when fuller */}
      <mesh ref={glowRef} scale={moonAppearance.scale}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial
          color={COLORS.MOON_GLOW}
          transparent
          opacity={0.1 + (moonAppearance.brightness / 1000)}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Visibility indicator (subtle ring when potentially visible) */}
      {isVisible && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 0.9, 32]} />
          <meshBasicMaterial
            color="#00ff00"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Label */}
      {showLabel && (
        <Html position={[0, 1, 0]} center distanceFactor={15}>
          <div className="galgal-label moon-label">
            <span className="hebrew">ירח</span>
            <span className="english">Moon</span>
            <span className="detail">{phase}</span>
            {isVisible && <span className="visible-indicator">👁 Visible</span>}
          </div>
        </Html>
      )}
    </group>
  );
};

export default MoonMarker;
