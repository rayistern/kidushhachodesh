import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

const Earth = ({ isTilted }) => {
  const earthRef = useRef();
  const [hovered, setHovered] = useState(false);

  const tiltAngle = isTilted ? 23.5 * (Math.PI / 180) : 0;

  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002;
    }
  });

  const createEarthTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#1a4d6e');
    gradient.addColorStop(0.3, '#2d7d9a');
    gradient.addColorStop(0.5, '#4a9c6b');
    gradient.addColorStop(0.7, '#2d7d9a');
    gradient.addColorStop(1, '#1a4d6e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 256);

    ctx.fillStyle = '#f5f5dc';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const r = Math.random() * 20 + 5;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  return (
    <group rotation={[0, 0, tiltAngle]}>
      <mesh ref={earthRef} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={createEarthTexture()}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {hovered && (
        <Html position={[2.5, 0, 0]}>
          <div style={{ 
            background: 'rgba(0,0,0,0.8)', 
            padding: '8px 12px', 
            borderRadius: '6px',
            color: 'white',
            fontSize: '12px',
            whiteSpace: 'nowrap'
          }}>
            Earth<br/>
            {isTilted ? 'Tilt: 23.5°' : 'Tilt: 0° (horizontal)'}
          </div>
        </Html>
      )}
    </group>
  );
};

const EarthAxis = ({ isTilted }) => {
  const tiltAngle = isTilted ? 23.5 * (Math.PI / 180) : 0;
  const axisLength = 5;

  return (
    <group rotation={[0, 0, tiltAngle]}>
      <Line
        points={[[0, -axisLength, 0], [0, axisLength, 0]]}
        color="#ff6b6b"
        lineWidth={3}
      />
      <mesh position={[0, axisLength + 0.3, 0]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      <mesh position={[0, -axisLength - 0.3, 0]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color="#ff6b6b" rotation={[Math.PI, 0, 0]} />
      </mesh>
    </group>
  );
};

const TiltedEarthScene = ({ isTilted }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#4a90d9" />
      
      <Earth isTilted={isTilted} />
      <EarthAxis isTilted={isTilted} />
      
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={3}
        maxDistance={20}
      />
    </>
  );
};

const TiltedEarth = ({ isActive, date }) => {
  const [isTilted, setIsTilted] = useState(true);
  const [showAxis, setShowAxis] = useState(true);

  if (!isActive) {
    return (
      <div className="prop-inactive">
        <p>This prop is hidden</p>
      </div>
    );
  }

  return (
    <div className="tilted-earth-container">
      <div className="earth-controls">
        <div className="control-row">
          <label className="control-label">
            <input
              type="checkbox"
              checked={isTilted}
              onChange={(e) => setIsTilted(e.target.checked)}
            />
            <span>Actual Tilt (23.5°)</span>
          </label>
          <button
            className={`mode-btn ${!isTilted ? 'active' : ''}`}
            onClick={() => setIsTilted(false)}
          >
            Horizontal (Sideways)
          </button>
          <button
            className={`mode-btn ${isTilted ? 'active' : ''}`}
            onClick={() => setIsTilted(true)}
          >
            Tilted (23.5°)
          </button>
        </div>
        
        <div className="control-row">
          <label className="control-label">
            <input
              type="checkbox"
              checked={showAxis}
              onChange={(e) => setShowAxis(e.target.checked)}
            />
            <span>Show Axis</span>
          </label>
        </div>
      </div>

      <div className="earth-canvas">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
          <TiltedEarthScene isTilted={isTilted} />
        </Canvas>
      </div>

      <div className="earth-info">
        <h4>Earth Tilt Information</h4>
        <ul>
          <li><strong>Horizontal Mode:</strong> Earth shown with axis perpendicular to orbital plane (0° tilt)</li>
          <li><strong>Tilted Mode:</strong> Earth's axis tilted at 23.5° relative to the ecliptic</li>
          <li><strong>Axis:</strong> The red line represents Earth's rotational axis</li>
          <li><strong>Context:</strong> This tilt causes seasons in the Rambam's geocentric model</li>
        </ul>
      </div>

      <style>{`
        .tilted-earth-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .earth-controls {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--color-surface);
          border-radius: 8px;
        }

        .control-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .control-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .control-label input[type="checkbox"] {
          accent-color: var(--color-accent);
        }

        .mode-btn {
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          border: 1px solid var(--color-border);
          background: var(--color-surface-2);
          color: var(--color-text-secondary);
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .mode-btn:hover {
          background: var(--color-accent);
          color: white;
        }

        .mode-btn.active {
          background: var(--color-accent);
          color: white;
          border-color: var(--color-accent);
        }

        .earth-canvas {
          height: 300px;
          border-radius: 8px;
          overflow: hidden;
          background: linear-gradient(135deg, #0a0a12 0%, #1a1a2e 100%);
        }

        .earth-info {
          padding: 0.75rem;
          background: var(--color-surface);
          border-radius: 8px;
          font-size: 0.85rem;
        }

        .earth-info h4 {
          margin: 0 0 0.5rem 0;
          color: var(--color-text);
        }

        .earth-info ul {
          margin: 0;
          padding-left: 1.2rem;
          color: var(--color-text-secondary);
        }

        .earth-info li {
          margin-bottom: 0.25rem;
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

export default TiltedEarth;