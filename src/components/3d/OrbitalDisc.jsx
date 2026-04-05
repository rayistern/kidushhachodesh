import React from 'react';
import * as THREE from 'three';

/**
 * A colored disc representing an orbital plane (deferent, epicycle).
 * Mimics Rabbi Losh's colored paper inlays inside clear globes.
 */
export default function OrbitalDisc({
  innerRadius = 0,
  outerRadius = 1,
  color = '#ddaa33',
  opacity = 0.25,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  visible = true,
  label = '',
}) {
  if (!visible) return null;

  return (
    <group position={position} rotation={rotation}>
      <mesh renderOrder={10}>
        <ringGeometry args={[innerRadius, outerRadius, 64]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Edge glow ring */}
      <mesh renderOrder={11}>
        <ringGeometry args={[outerRadius - 0.02, outerRadius, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * 2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
