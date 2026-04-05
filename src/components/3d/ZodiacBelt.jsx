import React from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { CONSTANTS } from '../../engine/constants.js';

/**
 * The zodiac belt — 12 constellation segments around the ecliptic.
 * Shows Hebrew names and degree markers.
 */
export default function ZodiacBelt({ radius = 12, visible = true }) {
  if (!visible) return null;

  const segments = CONSTANTS.CONSTELLATIONS.map((name, i) => {
    const startAngle = (i * 30 * Math.PI) / 180;
    const midAngle = ((i * 30 + 15) * Math.PI) / 180;
    const x = radius * Math.cos(midAngle);
    const z = -radius * Math.sin(midAngle);
    const englishName = CONSTANTS.CONSTELLATION_NAMES_EN[i];

    return (
      <group key={i}>
        {/* Constellation label */}
        <Html
          position={[x, 0.3, z]}
          center
          style={{
            color: '#c9d6e3',
            fontSize: '11px',
            fontWeight: 600,
            textShadow: '0 0 8px rgba(0,0,0,0.8)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '13px', direction: 'rtl' }}>{name}</div>
            <div style={{ fontSize: '9px', opacity: 0.7 }}>{englishName}</div>
          </div>
        </Html>
      </group>
    );
  });

  // Degree tick marks every 10°
  const ticks = [];
  for (let deg = 0; deg < 360; deg += 10) {
    const angle = (deg * Math.PI) / 180;
    const isMajor = deg % 30 === 0;
    const len = isMajor ? 0.4 : 0.2;
    const r1 = radius - len;
    const r2 = radius + len;

    ticks.push(
      <line key={`tick-${deg}`}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([
              r1 * Math.cos(angle), 0, -r1 * Math.sin(angle),
              r2 * Math.cos(angle), 0, -r2 * Math.sin(angle),
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={isMajor ? '#6688cc' : '#445566'} transparent opacity={0.5} />
      </line>
    );
  }

  // Zodiac ring (thin torus)
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} renderOrder={-1}>
        <torusGeometry args={[radius, 0.03, 8, 128]} />
        <meshBasicMaterial color="#4466aa" transparent opacity={0.3} />
      </mesh>
      {ticks}
      {segments}
    </group>
  );
}
