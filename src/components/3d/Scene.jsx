import React, { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import CelestialSphere from './CelestialSphere';
import CelestialBody from './CelestialBody';
import OrbitalDisc from './OrbitalDisc';
import ZodiacBelt from './ZodiacBelt';
import { CONSTANTS } from '../../engine/constants.js';
import { useVisualizationStore } from '../../stores/visualizationStore';
import { useCalculationStore } from '../../stores/calculationStore';
import { formatDms } from '../../engine/dmsUtils';

const DEG2RAD = Math.PI / 180;

/** Scale galgalim radii to scene units */
const SCALE = 1 / 30;

function CelestialScene() {
  const calculation = useCalculationStore((s) => s.calculation);
  const selectStep = useCalculationStore((s) => s.selectStep);
  const {
    showGalgalim, showDiscs, showLabels, sidewaysAxis, highlightedGalgal,
  } = useVisualizationStore();

  // Compute positions from calculation results
  const positions = useMemo(() => {
    if (!calculation) return null;

    const sunAngle = calculation.sun.trueLongitude * DEG2RAD;
    const moonAngle = calculation.moon.trueLongitude * DEG2RAD;
    const sunR = CONSTANTS.GALGALIM[5].radius * SCALE; // Sun sphere
    const moonR = CONSTANTS.GALGALIM[8].radius * SCALE; // Moon sphere

    // Eccentric offset for sun
    const eccOffset = CONSTANTS.SUN.ECCENTRICITY * sunR;
    const eccAngle = CONSTANTS.SUN.ECCENTRIC_ANGLE * DEG2RAD;

    return {
      sun: {
        x: sunR * Math.cos(sunAngle),
        z: -sunR * Math.sin(sunAngle),
        angle: sunAngle,
        radius: sunR,
      },
      moon: {
        x: moonR * Math.cos(moonAngle),
        z: -moonR * Math.sin(moonAngle),
        angle: moonAngle,
        radius: moonR,
      },
      eccentric: {
        x: eccOffset * Math.cos(eccAngle),
        z: -eccOffset * Math.sin(eccAngle),
      },
    };
  }, [calculation]);

  if (!calculation || !positions) {
    return (
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#4ea1f7" wireframe />
      </mesh>
    );
  }

  const sunConst = calculation.sun.constellation;
  const moonConst = calculation.moon.constellation;
  const moonIllum = calculation.moon.illumination;

  return (
    <group rotation={sidewaysAxis ? [0, 0, Math.PI / 2] : [0, 0, 0]}>
      {/* Stars background */}
      <Stars radius={50} depth={50} count={2000} factor={2} fade speed={0.5} />

      {/* Earth at center */}
      <CelestialBody
        position={[0, 0, 0]}
        radius={0.6}
        color="#2266aa"
        emissive="#113366"
        emissiveIntensity={0.3}
        label="Earth"
        hebrewLabel="ארץ"
        showLabel={showLabels}
        onClick={() => selectStep('daysFromEpoch')}
      />

      {/* Galgalim spheres — nested transparent shells */}
      {showGalgalim && CONSTANTS.GALGALIM.map((galgal) => (
        <CelestialSphere
          key={galgal.id}
          radius={galgal.radius * SCALE}
          color={galgal.color}
          opacity={0.06}
          highlighted={highlightedGalgal === galgal.id}
        />
      ))}

      {/* Sun orbital disc (gold) */}
      <OrbitalDisc
        outerRadius={positions.sun.radius}
        innerRadius={positions.sun.radius - 0.3}
        color="#ddaa33"
        opacity={0.2}
        visible={showDiscs}
      />

      {/* Sun epicycle disc (orange) */}
      <OrbitalDisc
        outerRadius={positions.sun.radius * CONSTANTS.SUN.EPICYCLE.RADIUS_RATIO}
        color="#ee8833"
        opacity={0.3}
        position={[positions.sun.x, 0, positions.sun.z]}
        visible={showDiscs}
      />

      {/* Moon orbital disc (silver) */}
      <OrbitalDisc
        outerRadius={positions.moon.radius}
        innerRadius={positions.moon.radius - 0.3}
        color="#8899bb"
        opacity={0.2}
        visible={showDiscs}
      />

      {/* Moon first epicycle disc (blue) */}
      <OrbitalDisc
        outerRadius={positions.moon.radius * CONSTANTS.MOON.GALGALIM.FIRST_EPICYCLE.RADIUS_RATIO}
        color="#4488cc"
        opacity={0.3}
        position={[positions.moon.x, 0, positions.moon.z]}
        visible={showDiscs}
      />

      {/* Moon's inclined plane disc (galgal noteh — violet) */}
      <OrbitalDisc
        outerRadius={positions.moon.radius * 0.8}
        innerRadius={positions.moon.radius * 0.5}
        color="#8855aa"
        opacity={0.12}
        rotation={[CONSTANTS.MOON.GALGALIM.INCLINATION * DEG2RAD, 0, 0]}
        visible={showDiscs}
      />

      {/* Sun */}
      <CelestialBody
        position={[positions.sun.x, 0, positions.sun.z]}
        radius={0.5}
        color="#ffdd44"
        emissive="#ffaa00"
        emissiveIntensity={1.5}
        glow
        glowColor="#ffdd44"
        glowIntensity={2}
        label="Sun"
        hebrewLabel="שמש"
        sublabel={`${formatDms(calculation.sun.trueLongitude)} — ${sunConst.hebrew} (${sunConst.english})`}
        showLabel={showLabels}
        onClick={() => selectStep('sunTrueLongitude')}
      />

      {/* Sun point light */}
      <pointLight
        position={[positions.sun.x, 0, positions.sun.z]}
        color="#ffdd88"
        intensity={2}
        distance={30}
      />

      {/* Moon */}
      <CelestialBody
        position={[positions.moon.x, calculation.moon.latitude * SCALE * 10, positions.moon.z]}
        radius={0.35}
        color={`hsl(220, 10%, ${30 + moonIllum * 60}%)`}
        emissive="#334455"
        emissiveIntensity={moonIllum * 0.5}
        label="Moon"
        hebrewLabel="ירח"
        sublabel={`${formatDms(calculation.moon.trueLongitude)} — ${moonConst.hebrew} — ${calculation.moon.phase}`}
        showLabel={showLabels}
        onClick={() => selectStep('moonTrueLongitude')}
      />

      {/* Eccentric center marker (for sun) */}
      <mesh position={[positions.eccentric.x, 0, positions.eccentric.z]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#ddaa33" transparent opacity={0.6} />
      </mesh>

      {/* Connection line: Earth → Eccentric center */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, positions.eccentric.x, 0, positions.eccentric.z])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ddaa33" transparent opacity={0.3} />
      </line>

      {/* Connection line: Earth → Sun */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, positions.sun.x, 0, positions.sun.z])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffdd44" transparent opacity={0.2} />
      </line>

      {/* Connection line: Earth → Moon */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([
              0, 0, 0,
              positions.moon.x, calculation.moon.latitude * SCALE * 10, positions.moon.z,
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#8899bb" transparent opacity={0.2} />
      </line>

      {/* Zodiac belt */}
      <ZodiacBelt radius={CONSTANTS.GALGALIM[1].radius * SCALE} visible={showLabels} />

      {/* Ambient + directional light */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
    </group>
  );
}

/**
 * The main 3D scene canvas.
 */
export default function Scene3D() {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true, sortObjects: false }}
      style={{ background: '#0a0e14', borderRadius: '12px' }}
    >
      <PerspectiveCamera makeDefault position={[0, 15, 25]} fov={50} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={60}
        maxPolarAngle={Math.PI}
      />
      <Suspense fallback={null}>
        <CelestialScene />
      </Suspense>
    </Canvas>
  );
}
