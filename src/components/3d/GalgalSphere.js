import React, { useRef } from 'react';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { MATERIALS } from './constants';

/**
 * GalgalSphere - Transparent celestial sphere component
 * Replicates Rabbi Losh's clear acrylic sphere physical props
 * 
 * Features:
 * - Glass-like transparent material
 * - Wireframe overlay for structure visibility
 * - Hebrew and English floating labels
 * - Configurable opacity and color
 */
const GalgalSphere = ({ 
  radius,
  color = '#4a90d9',
  opacity = 0.08,
  labelHe = '',
  labelEn = '',
  showWireframe = true,
  wireframeOpacity = 0.3,
  segments = 64,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  onHover = null,
  tooltipData = null,
  ...props 
}) => {
  const sphereRef = useRef();
  
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
      {/* Main transparent sphere - glass-like appearance */}
      <Sphere
        ref={sphereRef}
        args={[radius, segments, segments]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={opacity}
          roughness={MATERIALS.GALGAL.roughness}
          metalness={MATERIALS.GALGAL.metalness}
          transmission={MATERIALS.GALGAL.transmission}
          thickness={MATERIALS.GALGAL.thickness}
          ior={MATERIALS.GALGAL.ior}
          side={THREE.DoubleSide}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </Sphere>
      
      {/* Wireframe overlay for structure visibility */}
      {showWireframe && (
        <Sphere args={[radius, Math.max(segments / 2, 16), Math.max(segments / 2, 16)]}>
          <meshBasicMaterial
            color={color}
            wireframe
            transparent
            opacity={wireframeOpacity}
          />
        </Sphere>
      )}
      
      {/* Latitude/Longitude grid lines (optional visual aid) */}
      {showWireframe && (
        <>
          {/* Equator ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius - 0.01, radius + 0.01, 64]} />
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={wireframeOpacity * 0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}
      
      {/* Floating label */}
      {(labelHe || labelEn) && (
        <Html position={[0, radius + 1, 0]} center distanceFactor={15}>
          <div className="galgal-label">
            {labelHe && <span className="hebrew">{labelHe}</span>}
            {labelEn && <span className="english">{labelEn}</span>}
          </div>
        </Html>
      )}
    </group>
  );
};

export default GalgalSphere;
