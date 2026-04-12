import React from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ZODIAC, MAZALOT_3D, COLORS } from './constants';

/**
 * ZodiacRing - 3D ring showing the 12 constellations (Mazalot)
 * Visual reference for the ecliptic and zodiac positions
 * 
 * Features:
 * - Large ring representing the ecliptic plane
 * - 12 constellation markers at 30° intervals
 * - Hebrew labels for each mazal
 * - Degree markers for precise readings
 */
const ZodiacRing = ({
  radius = ZODIAC.RADIUS,
  showLabels = true,
  showDegreeMarkers = true,
  onHover = null,
  ...props
}) => {
  // Create 12 segments for each constellation
  const constellationMarkers = MAZALOT_3D.map((mazal, index) => {
    const angleRad = (mazal.angle * Math.PI) / 180;
    const x = Math.cos(angleRad) * radius;
    const z = Math.sin(angleRad) * radius;
    
    return (
      <group key={mazal.en} position={[x, 0, z]}>
        {/* Marker dot */}
        <mesh>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        
        {/* Degree line */}
        <mesh rotation={[0, -angleRad, 0]} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
          <meshBasicMaterial color={COLORS.ZODIAC_WIREFRAME} opacity={0.5} transparent />
        </mesh>
        
        {/* Label */}
        {showLabels && (
          <Html 
            position={[Math.cos(angleRad) * 2, 0, Math.sin(angleRad) * 2]}
            center
            distanceFactor={20}
            style={{
              transform: `rotate(${-mazal.angle}deg)`,
            }}
          >
            <div className="galgal-label zodiac-label">
              <span className="hebrew">{mazal.he}</span>
              <span className="english">{mazal.en}</span>
              <span className="degree">{mazal.angle}°</span>
            </div>
          </Html>
        )}
      </group>
    );
  });

  // Generate degree markers every 10 degrees
  const degreeMarkers = showDegreeMarkers 
    ? Array.from({ length: 36 }, (_, i) => {
        const angle = i * 10;
        const angleRad = (angle * Math.PI) / 180;
        const x = Math.cos(angleRad) * radius;
        const z = Math.sin(angleRad) * radius;
        const isMajor = i % 3 === 0; // Every 30 degrees
        
        return (
          <mesh 
            key={angle} 
            position={[x, 0, z]}
            rotation={[0, -angleRad, 0]}
          >
            <cylinderGeometry 
              args={[0.01, 0.01, isMajor ? 0.6 : 0.3, 8]} 
            />
            <meshBasicMaterial 
              color={isMajor ? "#ffffff" : "#666666"} 
              opacity={isMajor ? 0.8 : 0.4}
              transparent 
            />
          </mesh>
        );
      })
    : null;

  return (
    <group {...props}>
      {/* Main zodiac ring - torus lying flat on XZ plane */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry 
          args={[radius, ZODIAC.TUBE_RADIUS, 16, ZODIAC.SEGMENTS]} 
        />
        <meshBasicMaterial 
          color={COLORS.ZODIAC_RING}
          transparent
          opacity={ZODIAC.OPACITY}
        />
      </mesh>
      
      {/* Wireframe inner ring for structure */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry 
          args={[radius - 0.2, 0.02, 8, 64]} 
        />
        <meshBasicMaterial 
          color={COLORS.ZODIAC_WIREFRAME}
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>
      
      {/* Constellation markers */}
      {constellationMarkers}
      
      {/* Degree markers */}
      {degreeMarkers}
    </group>
  );
};

export default ZodiacRing;
