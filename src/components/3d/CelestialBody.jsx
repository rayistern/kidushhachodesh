import React, { useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

/**
 * A celestial body (Sun, Moon, or Earth) rendered as a glowing sphere with a label.
 */
export default function CelestialBody({
  position = [0, 0, 0],
  radius = 0.5,
  color = '#ffffff',
  emissive = '#000000',
  emissiveIntensity = 0,
  label = '',
  hebrewLabel = '',
  sublabel = '',
  showLabel = true,
  glow = false,
  glowColor = '#ffffff',
  glowIntensity = 1,
  onClick,
}) {
  const meshRef = useRef();

  return (
    <group position={position}>
      {/* Main sphere */}
      <mesh ref={meshRef} onClick={onClick}>
        <sphereGeometry args={[radius, 32, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      {/* Glow effect */}
      {glow && (
        <mesh>
          <sphereGeometry args={[radius * 1.8, 16, 12]} />
          <meshBasicMaterial
            color={glowColor}
            transparent
            opacity={0.15 * glowIntensity}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Label */}
      {showLabel && label && (
        <Html
          position={[0, radius + 0.6, 0]}
          center
          style={{
            pointerEvents: onClick ? 'auto' : 'none',
            cursor: onClick ? 'pointer' : 'default',
          }}
        >
          <div
            style={{
              color: '#f8fafc',
              fontSize: '12px',
              fontWeight: 700,
              textShadow: '0 0 10px rgba(0,0,0,0.9)',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
            onClick={onClick}
          >
            {hebrewLabel && (
              <div style={{ fontSize: '14px', direction: 'rtl' }}>{hebrewLabel}</div>
            )}
            <div>{label}</div>
            {sublabel && (
              <div style={{ fontSize: '10px', opacity: 0.7, marginTop: 2 }}>{sublabel}</div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
