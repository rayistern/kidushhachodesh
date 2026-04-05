import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { CONSTANTS } from '../../constants';

const SunSystem = ({ showSun, sunParams, date }) => {
  const deferentRef = useRef();
  const epicycleRef = useRef();
  const eccentricRef = useRef();
  const [hovered, setHovered] = useState(null);

  const deferentRadius = 3;
  const epicycleRadius = deferentRadius * sunParams.epicycleRadiusRatio;
  const eccentricity = sunParams.eccentricity || 0.0167;
  const eccentricOffset = deferentRadius * eccentricity;

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (deferentRef.current) {
      deferentRef.current.rotation.z = time * 0.1;
    }
    if (epicycleRef.current) {
      epicycleRef.current.rotation.z = -time * 0.3;
    }
    if (eccentricRef.current) {
      eccentricRef.current.rotation.z = time * 0.05;
    }
  });

  if (!showSun) return null;

  return (
    <group>
      <Text position={[0, deferentRadius + 0.8, 0]} fontSize={0.35} color="#ffd700">
        Sun (גלגל השמש)
      </Text>

      <group ref={deferentRef}>
        <mesh
          onPointerOver={() => setHovered('deferent')}
          onPointerOut={() => setHovered(null)}
        >
          <ringGeometry args={[deferentRadius - 0.02, deferentRadius + 0.02, 64]} />
          <meshBasicMaterial color="#ffd700" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>

        <group position={[eccentricOffset, 0, 0]}>
          <group ref={epicycleRef}>
            <mesh>
              <ringGeometry args={[epicycleRadius - 0.015, epicycleRadius + 0.015, 32]} />
              <meshBasicMaterial color="#ff8c00" transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>

            <mesh position={[epicycleRadius * 0.7, 0, 0]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} />
            </mesh>
          </group>
        </group>

        <mesh position={[eccentricOffset, 0, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#ff4444" />
        </mesh>
        <Text position={[eccentricOffset + 0.3, 0.3, 0]} fontSize={0.15} color="#ff4444">
          Eccentric Point
        </Text>
      </group>

      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffaa00" emissiveIntensity={0.8} />
      </mesh>

      {hovered && (
        <Html position={[0, deferentRadius + 0.5, 0]}>
          <div style={{
            background: 'rgba(0,0,0,0.9)',
            padding: '8px 12px',
            borderRadius: '6px',
            color: 'white',
            fontSize: '11px',
          }}>
            <strong>Sun's Deferent</strong><br/>
            Eccentric Circle (גלגל יוצא)<br/>
            Epicycle (גלגל קטן)
          </div>
        </Html>
      )}
    </group>
  );
};

const MoonSystem = ({ showMoon, moonParams, date }) => {
  const deferentRef = useRef();
  const firstEpicycleRef = useRef();
  const secondEpicycleRef = useRef();
  const [hovered, setHovered] = useState(null);

  const deferentRadius = 2;
  const firstEpicycleRadius = deferentRadius * moonParams.firstEpicycleRatio;
  const secondEpicycleRadius = deferentRadius * moonParams.secondEpicycleRatio;
  const eccentricity = moonParams.eccentricity || 0.0549;
  const eccentricOffset = deferentRadius * eccentricity;

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (deferentRef.current) {
      deferentRef.current.rotation.z = time * 0.2;
    }
    if (firstEpicycleRef.current) {
      firstEpicycleRef.current.rotation.z = -time * 0.5;
    }
    if (secondEpicycleRef.current) {
      secondEpicycleRef.current.rotation.z = time * 0.7;
    }
  });

  if (!showMoon) return null;

  return (
    <group>
      <Text position={[0, deferentRadius + 0.6, 0]} fontSize={0.3} color="#c0c0c0">
        Moon (גלגל הירח)
      </Text>

      <group ref={deferentRef}>
        <mesh
          onPointerOver={() => setHovered('deferent')}
          onPointerOut={() => setHovered(null)}
        >
          <ringGeometry args={[deferentRadius - 0.02, deferentRadius + 0.02, 64]} />
          <meshBasicMaterial color="#c0c0c0" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>

        <group position={[eccentricOffset, 0, 0]} ref={firstEpicycleRef}>
          <mesh>
            <ringGeometry args={[firstEpicycleRadius - 0.015, firstEpicycleRadius + 0.015, 32]} />
            <meshBasicMaterial color="#87ceeb" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>

          <mesh position={[firstEpicycleRadius * 0.6, 0, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.3} />
          </mesh>

          <group position={[firstEpicycleRadius * 0.6, 0, 0]} ref={secondEpicycleRef}>
            <mesh>
              <ringGeometry args={[secondEpicycleRadius - 0.01, secondEpicycleRadius + 0.01, 24]} />
              <meshBasicMaterial color="#da70d6" transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>

            <mesh position={[secondEpicycleRadius * 0.7, 0, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
            </mesh>
          </group>
        </group>

        <mesh position={[eccentricOffset, 0, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
        <Text position={[eccentricOffset + 0.25, 0.25, 0]} fontSize={0.12} color="#ff6b6b">
          Eccentric
        </Text>
      </group>

      <mesh>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#e0e0e0" emissive="#ffffff" emissiveIntensity={0.1} />
      </mesh>

      {hovered && (
        <Html position={[0, deferentRadius + 0.4, 0]}>
          <div style={{
            background: 'rgba(0,0,0,0.9)',
            padding: '8px 12px',
            borderRadius: '6px',
            color: 'white',
            fontSize: '11px',
          }}>
            <strong>Moon's Galgalim</strong><br/>
            Deferent (גלגל גדול)<br/>
            1st Epicycle (גלגל קטן)<br/>
            2nd Epicycle (גלגל נוטה)
          </div>
        </Html>
      )}
    </group>
  );
};

const PlanetSystem = ({ showPlanet, planetName, radius, planetColor, date }) => {
  const deferentRef = useRef();
  const epicycleRef = useRef();
  const [hovered, setHovered] = useState(null);

  const deferentRadius = radius;
  const epicycleRadius = deferentRadius * 0.1;

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (deferentRef.current) {
      deferentRef.current.rotation.z = time * 0.08;
    }
    if (epicycleRef.current) {
      epicycleRef.current.rotation.z = -time * 0.2;
    }
  });

  if (!showPlanet) return null;

  return (
    <group>
      <group ref={deferentRef}>
        <mesh
          onPointerOver={() => setHovered(planetName)}
          onPointerOut={() => setHovered(null)}
        >
          <ringGeometry args={[deferentRadius - 0.015, deferentRadius + 0.015, 48]} />
          <meshBasicMaterial color={planetColor} transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>

        <group ref={epicycleRef}>
          <mesh>
            <ringGeometry args={[epicycleRadius - 0.01, epicycleRadius + 0.01, 24]} />
            <meshBasicMaterial color={planetColor} transparent opacity={0.35} side={THREE.DoubleSide} />
          </mesh>

          <mesh position={[epicycleRadius * 0.7, 0, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color={planetColor} emissive={planetColor} emissiveIntensity={0.3} />
          </mesh>
        </group>
      </group>

      <mesh position={[deferentRadius * 0.5, deferentRadius * 0.3, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color={planetColor} />
      </mesh>

      {hovered && (
        <Html position={[deferentRadius, deferentRadius * 0.5, 0]}>
          <div style={{
            background: 'rgba(0,0,0,0.9)',
            padding: '6px 10px',
            borderRadius: '6px',
            color: 'white',
            fontSize: '10px',
          }}>
            <strong>{planetName}</strong><br/>
            Deferent + Epicycle
          </div>
        </Html>
      )}
    </group>
  );
};

const EpicyclesScene = ({ showSun, showMoon, showPlanets, sunParams, moonParams, planetParams }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#ffffff" />
      
      <group>
        <mesh>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#4a90d9" emissive="#4a90d9" emissiveIntensity={0.2} />
        </mesh>
        <Text position={[0, -0.5, 0]} fontSize={0.2} color="#4a90d9">
          Earth (כדור הארץ)
        </Text>

        {showSun && (
          <group position={[0, 0, 0.1]}>
            <SunSystem showSun={showSun} sunParams={sunParams} />
          </group>
        )}

        {showMoon && (
          <group position={[0, 0, -0.1]}>
            <MoonSystem showMoon={showMoon} moonParams={moonParams} />
          </group>
        )}

        {showPlanets && (
          <>
            <PlanetSystem 
              showPlanet={planetParams.showMercury} 
              planetName="Mercury (כוכב)"
              radius={1.8}
              planetColor="#b8860b"
            />
            <PlanetSystem 
              showPlanet={planetParams.showVenus} 
              planetName="Venus (נוגה)"
              radius={2.4}
              planetColor="#ff69b4"
            />
            <PlanetSystem 
              showPlanet={planetParams.showMars} 
              planetName="Mars (מאדים)"
              radius={3.2}
              planetColor="#ff4444"
            />
            <PlanetSystem 
              showPlanet={planetParams.showJupiter} 
              planetName="Jupiter (צדק)"
              radius={3.8}
              planetColor="#deb887"
            />
            <PlanetSystem 
              showPlanet={planetParams.showSaturn} 
              planetName="Saturn (שבתאי)"
              radius={4.4}
              planetColor="#f4a460"
            />
          </>
        )}
      </group>
      
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={3}
        maxDistance={15}
      />
    </>
  );
};

const Epicycles = ({ isActive, date }) => {
  const [showSun, setShowSun] = useState(true);
  const [showMoon, setShowMoon] = useState(true);
  const [showPlanets, setShowPlanets] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState(null);

  const sunParams = {
    epicycleRadiusRatio: CONSTANTS.SUN.EPICYCLE.RADIUS_RATIO,
    eccentricity: CONSTANTS.SUN.ECCENTRICITY,
  };

  const moonParams = {
    firstEpicycleRatio: CONSTANTS.MOON.GALGALIM.FIRST_EPICYCLE.RADIUS_RATIO,
    secondEpicycleRatio: CONSTANTS.MOON.GALGALIM.SECOND_EPICYCLE.RADIUS_RATIO,
    eccentricity: CONSTANTS.MOON.GALGALIM.ECCENTRIC.ECCENTRICITY,
  };

  const planetParams = {
    showMercury: selectedPlanet === 'mercury' || selectedPlanet === null,
    showVenus: selectedPlanet === 'venus' || selectedPlanet === null,
    showMars: selectedPlanet === 'mars' || selectedPlanet === null,
    showJupiter: selectedPlanet === 'jupiter' || selectedPlanet === null,
    showSaturn: selectedPlanet === 'saturn' || selectedPlanet === null,
  };

  if (!isActive) {
    return (
      <div className="prop-inactive">
        <p>This prop is hidden</p>
      </div>
    );
  }

  return (
    <div className="epicycles-container">
      <div className="epicycle-controls">
        <div className="control-section">
          <h4>Major Bodies</h4>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showSun}
                onChange={(e) => setShowSun(e.target.checked)}
              />
              <span>☀️ Sun (גלגל השמש)</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showMoon}
                onChange={(e) => setShowMoon(e.target.checked)}
              />
              <span>🌙 Moon (גלגל הירח)</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showPlanets}
                onChange={(e) => setShowPlanets(e.target.checked)}
              />
              <span>🪐 Planets</span>
            </label>
          </div>
        </div>

        {showPlanets && (
          <div className="control-section">
            <h4>Select Planet</h4>
            <div className="planet-buttons">
              <button 
                className={`planet-btn ${selectedPlanet === null ? 'active' : ''}`}
                onClick={() => setSelectedPlanet(null)}
              >
                All
              </button>
              <button 
                className={`planet-btn ${selectedPlanet === 'mercury' ? 'active' : ''}`}
                onClick={() => setSelectedPlanet('mercury')}
              >
                Mercury
              </button>
              <button 
                className={`planet-btn ${selectedPlanet === 'venus' ? 'active' : ''}`}
                onClick={() => setSelectedPlanet('venus')}
              >
                Venus
              </button>
              <button 
                className={`planet-btn ${selectedPlanet === 'mars' ? 'active' : ''}`}
                onClick={() => setSelectedPlanet('mars')}
              >
                Mars
              </button>
              <button 
                className={`planet-btn ${selectedPlanet === 'jupiter' ? 'active' : ''}`}
                onClick={() => setSelectedPlanet('jupiter')}
              >
                Jupiter
              </button>
              <button 
                className={`planet-btn ${selectedPlanet === 'saturn' ? 'active' : ''}`}
                onClick={() => setSelectedPlanet('saturn')}
              >
                Saturn
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="epicycle-canvas">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <EpicyclesScene
            showSun={showSun}
            showMoon={showMoon}
            showPlanets={showPlanets}
            sunParams={sunParams}
            moonParams={moonParams}
            planetParams={planetParams}
          />
        </Canvas>
      </div>

      <div className="epicycle-info">
        <h4>Rambam's Epicycle System (גלגלים)</h4>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-color" style={{ background: '#ffd700' }} />
            <div>
              <strong>Sun</strong><br/>
              <span className="info-desc">Deferent + Epicycle + Eccentric</span>
            </div>
          </div>
          <div className="info-item">
            <span className="info-color" style={{ background: '#c0c0c0' }} />
            <div>
              <strong>Moon</strong><br/>
              <span className="info-desc">Deferent + 2 Epicycles + Eccentric</span>
            </div>
          </div>
          <div className="info-item">
            <span className="info-color" style={{ background: '#ff69b4' }} />
            <div>
              <strong>Planets</strong><br/>
              <span className="info-desc">Deferent + Epicycle</span>
            </div>
          </div>
        </div>
        <p className="info-note">
          The epicycle model explains retrograde motion. The planet moves on a small circle (epicycle),
          while the epicycle's center moves along a larger circle (deferent).
        </p>
      </div>

      <style>{`
        .epicycles-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .epicycle-controls {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          padding: 0.75rem;
          background: var(--color-surface);
          border-radius: 8px;
        }

        .control-section h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.85rem;
          color: var(--color-text);
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          accent-color: var(--color-accent);
        }

        .planet-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .planet-btn {
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          border: 1px solid var(--color-border);
          background: var(--color-surface-2);
          color: var(--color-text-secondary);
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.2s;
        }

        .planet-btn:hover {
          background: var(--color-accent);
          color: white;
        }

        .planet-btn.active {
          background: var(--color-accent);
          color: white;
          border-color: var(--color-accent);
        }

        .epicycle-canvas {
          height: 300px;
          border-radius: 8px;
          overflow: hidden;
          background: radial-gradient(ellipse at center, #12121c 0%, #08080c 100%);
        }

        .epicycle-info {
          padding: 0.75rem;
          background: var(--color-surface);
          border-radius: 8px;
        }

        .epicycle-info h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.95rem;
          color: var(--color-text);
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.8rem;
        }

        .info-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .info-desc {
          color: var(--color-text-secondary);
          font-size: 0.75rem;
        }

        .info-note {
          margin: 0;
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          font-style: italic;
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

export default Epicycles;