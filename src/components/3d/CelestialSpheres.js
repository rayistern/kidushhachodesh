import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { CONSTANTS } from '../../constants';

const CelestialSphere = ({ radius, name, englishName, color, opacity, index, isRotating }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && isRotating) {
      meshRef.current.rotation.y += 0.001 * (10 - index);
    }
  });

  const segments = Math.max(32, Math.floor(radius / 5));

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[radius, segments, segments]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={opacity * 0.3}
        side={THREE.DoubleSide}
        wireframe={false}
      />
      {hovered && (
        <Html position={[radius * 0.7, radius * 0.5, 0]}>
          <div style={{
            background: 'rgba(0,0,0,0.9)',
            padding: '8px 12px',
            borderRadius: '6px',
            color: 'white',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            border: `2px solid ${color}`,
            maxWidth: '200px'
          }}>
            <strong>{englishName}</strong><br/>
            {name}<br/>
            <span style={{color: '#aaa'}}>Radius: {radius}</span>
          </div>
        </Html>
      )}
    </mesh>
  );
};

const SphereRings = ({ radius, color, opacity }) => {
  const ringCount = 8;
  const rings = useMemo(() => {
    const result = [];
    for (let i = 0; i < ringCount; i++) {
      const phi = (Math.PI / (ringCount + 1)) * (i + 1);
      result.push({
        rotation: [phi, 0, 0],
        radius: radius * Math.sin(phi),
      });
      result.push({
        rotation: [Math.PI / 2, 0, phi],
        radius: radius * Math.cos(phi),
      });
    }
    return result;
  }, [radius]);

  return (
    <>
      {rings.map((ring, i) => (
        <mesh key={i} rotation={ring.rotation}>
          <ringGeometry args={[ring.radius * 0.99, ring.radius * 1.01, 64]} />
          <meshBasicMaterial color={color} transparent opacity={opacity * 0.15} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
};

const ZodiacCircle = ({ radius, opacity }) => {
  const zodiacSigns = CONSTANTS.CONSTELLATIONS;
  const zodiacColors = [
    '#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#38d9a9', '#4dabf7',
    '#748ffc', '#da77f2', '#f783ac', '#ff878c', '#ffc9c9', '#e599f7'
  ];

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.98, radius * 1.02, 64]} />
        <meshBasicMaterial color="#ffd700" transparent opacity={opacity * 0.2} side={THREE.DoubleSide} />
      </mesh>
      
      {zodiacSigns.map((sign, i) => {
        const angle = (i * 30 + 15) * (Math.PI / 180);
        const x = Math.cos(angle) * radius * 1.1;
        const y = Math.sin(angle) * radius * 1.1;
        
        return (
          <Text
            key={i}
            position={[x, y, 0]}
            fontSize={radius * 0.06}
            color={zodiacColors[i]}
            anchorX="center"
            anchorY="middle"
            rotation={[0, 0, angle]}
          >
            {sign}
          </Text>
        );
      })}
    </group>
  );
};

const CelestialSpheresScene = ({ spheres, opacity, showRings, showZodiac, isRotating }) => {
  const colors = [
    '#4fc3f7', '#29b6f6', '#03a9f4', '#039be5', '#0288d1', '#0277bd',
    '#01579b', '#014886', '#ffc107'
  ];

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[15, 15, 10]} intensity={0.8} />
      <pointLight position={[-15, -10, -5]} intensity={0.4} color="#6366f1" />
      
      <group>
        {spheres.map((sphere, index) => (
          <React.Fragment key={index}>
            <CelestialSphere
              radius={sphere.radius / 20}
              name={sphere.name}
              englishName={sphere.englishName}
              color={colors[index]}
              opacity={opacity}
              index={index}
              isRotating={isRotating}
            />
            {showRings && (
              <SphereRings
                radius={sphere.radius / 20}
                color={colors[index]}
                opacity={opacity}
              />
            )}
          </React.Fragment>
        ))}
        {showZodiac && <ZodiacCircle radius={spheres[0].radius / 20 + 0.5} opacity={opacity} />}
      </group>
      
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={3}
        maxDistance={30}
      />
    </>
  );
};

const CelestialSpheres = ({ isActive, date }) => {
  const [opacity, setOpacity] = useState(0.5);
  const [showRings, setShowRings] = useState(false);
  const [showZodiac, setShowZodiac] = useState(true);
  const [isRotating, setIsRotating] = useState(true);

  const spheres = CONSTANTS.GALGALIM;

  if (!isActive) {
    return (
      <div className="prop-inactive">
        <p>This prop is hidden</p>
      </div>
    );
  }

  return (
    <div className="celestial-spheres-container">
      <div className="sphere-controls">
        <div className="control-group">
          <label>Global Opacity: {Math.round(opacity * 100)}%</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group checkboxes">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showRings}
              onChange={(e) => setShowRings(e.target.checked)}
            />
            <span>Show Rings</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showZodiac}
              onChange={(e) => setShowZodiac(e.target.checked)}
            />
            <span>Show Zodiac</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isRotating}
              onChange={(e) => setIsRotating(e.target.checked)}
            />
            <span>Auto Rotate</span>
          </label>
        </div>
      </div>

      <div className="sphere-canvas">
        <Canvas camera={{ position: [0, 0, 25], fov: 50 }}>
          <CelestialSpheresScene
            spheres={spheres}
            opacity={opacity}
            showRings={showRings}
            showZodiac={showZodiac}
            isRotating={isRotating}
          />
        </Canvas>
      </div>

      <div className="sphere-legend">
        <h4>Rambam's 9 Celestial Spheres (גלגלים)</h4>
        <div className="legend-grid">
          {spheres.map((sphere, index) => (
            <div key={index} className="legend-item">
              <span 
                className="legend-color" 
                style={{
                  backgroundColor: [
                    '#4fc3f7', '#29b6f6', '#03a9f4', '#039be5', '#0288d1', '#0277bd',
                    '#01579b', '#014886', '#ffc107'
                  ][index]
                }}
              />
              <span className="legend-name">{sphere.englishName}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .celestial-spheres-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .sphere-controls {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 0.75rem;
          background: var(--color-surface);
          border-radius: 8px;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .control-group > label {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }

        .control-group input[type="range"] {
          width: 150px;
          accent-color: var(--color-accent);
        }

        .checkboxes {
          flex-direction: row;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          accent-color: var(--color-accent);
        }

        .sphere-canvas {
          height: 300px;
          border-radius: 8px;
          overflow: hidden;
          background: radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a12 100%);
        }

        .sphere-legend {
          padding: 0.75rem;
          background: var(--color-surface);
          border-radius: 8px;
        }

        .sphere-legend h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.95rem;
          color: var(--color-text);
        }

        .legend-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.4rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
          flex-shrink: 0;
        }

        .legend-name {
          color: var(--color-text-secondary);
        }

        .prop-inactive {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: var(--color-text-secondary);
        }
      `}</style>
    </div>
  );
};

export default CelestialSpheres;