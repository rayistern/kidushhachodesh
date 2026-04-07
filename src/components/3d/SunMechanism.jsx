import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { CONSTANTS } from '../../engine/constants.js';
import { dmsToDecimal, normalizeDegrees, formatDms } from '../../engine/dmsUtils.js';
import { useVisualizationStore } from '../../stores/visualizationStore';
import { useCalculationStore } from '../../stores/calculationStore';

const DEG2RAD = Math.PI / 180;

/**
 * SunMechanism — the Rambam's two-galgal model of the sun (KH 12-13).
 *
 * Hierarchy (the body is PASSIVE — the galgalim drag it):
 *
 *   Earth (origin)
 *   └── Blue galgal group   (rotation.y = -apogee)
 *       ├── Eccentric point marker (at offset, 0, 0)
 *       └── Red galgal group at (offset, 0, 0)   (rotation.y = -maslul)
 *           └── Sun fixed at (redRadius, 0, 0)
 *
 * The blue rotates extremely slowly (~1°/70 yr — apogee precession). Within
 * its frame, the red rotates at the maslul rate (~59'/day relative to apogee).
 * Combined, the sun's absolute longitude = apogee + maslul = emtzoi. ✓
 *
 * Both galgalim wear visible meridian/parallel gridlines so you can SEE the
 * rotation — without those, a rotating sphere looks identical to a static one.
 */
export default function SunMechanism({
  daysFromEpoch,
  scale = 4,
  showLabels = true,
}) {
  const isPlaying = useVisualizationStore((s) => s.isPlaying);
  const animationSpeed = useVisualizationStore((s) => s.animationSpeed);
  const advanceAnimation = useVisualizationStore((s) => s.advanceAnimation);
  const showRadii = useVisualizationStore((s) => s.showRadii);
  const highlightedGalgal = useVisualizationStore((s) => s.highlightedGalgal);
  const setHighlightedGalgal = useVisualizationStore((s) => s.setHighlightedGalgal);
  const selectStep = useCalculationStore((s) => s.selectStep);

  // ── Constants in decimal degrees ──
  const dailyMotion = useMemo(() => dmsToDecimal(CONSTANTS.SUN.MEAN_MOTION_PER_DAY), []);
  const startPos = useMemo(() => dmsToDecimal(CONSTANTS.SUN.START_POSITION), []);
  const apogeeStart = useMemo(
    () =>
      dmsToDecimal(CONSTANTS.SUN.APOGEE_START) +
      CONSTANTS.SUN.APOGEE_CONSTELLATION * 30,
    [],
  );
  const apogeeMotion = CONSTANTS.SUN.APOGEE_MOTION_PER_DAY;

  // ── Geometry ──
  const blueRadius = scale;
  const eccentricFraction = 0.18;
  const redRadius = blueRadius * (1 - eccentricFraction);
  const eccentricOffset = blueRadius * eccentricFraction;

  // Refs
  const blueGroupRef = useRef();
  const redGroupRef = useRef();
  const radiusEarthSunRef = useRef();
  const radiusEarthEccRef = useRef();
  const radiusEccSunRef = useRef();
  const lastFrameTimeRef = useRef(null);
  const labelRef = useRef();
  const sunHandleRef = useRef();

  useFrame((state) => {
    // ── 1. Advance the animation clock ──
    if (isPlaying) {
      const now = state.clock.getElapsedTime();
      if (lastFrameTimeRef.current !== null) {
        const dt = now - lastFrameTimeRef.current;
        advanceAnimation(dt * animationSpeed);
      }
      lastFrameTimeRef.current = now;
    } else {
      lastFrameTimeRef.current = null;
    }

    // ── 2. Compute angles ──
    const days = daysFromEpoch + useVisualizationStore.getState().animationDays;
    const apogee = normalizeDegrees(apogeeStart + apogeeMotion * days);
    const meanLon = normalizeDegrees(startPos + dailyMotion * days);
    // The maslul is the sun's angle from the apogee = emtzoi - apogee
    const maslul = normalizeDegrees(meanLon - apogee);

    // ── 3. Drive the rotations (negative because of screen-coord convention) ──
    if (blueGroupRef.current) {
      blueGroupRef.current.rotation.y = -apogee * DEG2RAD;
    }
    if (redGroupRef.current) {
      redGroupRef.current.rotation.y = -maslul * DEG2RAD;
    }

    // ── 4. Update radius lines + label ──
    if (showRadii && sunHandleRef.current) {
      const sunWorld = new THREE.Vector3();
      sunHandleRef.current.getWorldPosition(sunWorld);

      // Eccentric world position (also a child of blue group)
      const eccWorld = new THREE.Vector3(eccentricOffset, 0, 0);
      if (blueGroupRef.current) eccWorld.applyMatrix4(blueGroupRef.current.matrixWorld);

      if (radiusEarthEccRef.current) {
        radiusEarthEccRef.current.geometry.setFromPoints([
          new THREE.Vector3(0, 0, 0),
          eccWorld,
        ]);
      }
      if (radiusEarthSunRef.current) {
        radiusEarthSunRef.current.geometry.setFromPoints([
          new THREE.Vector3(0, 0, 0),
          sunWorld,
        ]);
      }
      if (radiusEccSunRef.current) {
        radiusEccSunRef.current.geometry.setFromPoints([eccWorld, sunWorld]);
      }
    }

    if (labelRef.current) {
      labelRef.current.textContent = `emtzoi ${formatDms(meanLon)}  •  apogee ${formatDms(apogee)}`;
    }
  });

  const isHighlighted = highlightedGalgal === 'sun';
  const blueOpacity = isHighlighted ? 0.16 : 0.05;
  const redOpacity = isHighlighted ? 0.2 : 0.08;

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        setHighlightedGalgal('sun');
      }}
    >
      {/* ── BLUE GALGAL (outer, Earth-centered) ── */}
      <group ref={blueGroupRef}>
        <GalgalSphere
          radius={blueRadius}
          color="#3a5478"
          ringColor="#7fa8d8"
          opacity={blueOpacity}
          gridColor="#9bc0e8"
          gridOpacity={isHighlighted ? 0.35 : 0.18}
        />

        {/* Eccentric center marker — sits inside blue at offset */}
        <mesh position={[eccentricOffset, 0, 0]}>
          <sphereGeometry args={[0.07, 16, 12]} />
          <meshBasicMaterial color="#e4b94a" />
        </mesh>

        {/* ── RED GALGAL (off-center, carries the sun) ── */}
        <group ref={redGroupRef} position={[eccentricOffset, 0, 0]}>
          <GalgalSphere
            radius={redRadius}
            color="#a8623a"
            ringColor="#d8895a"
            opacity={redOpacity}
            gridColor="#f0b090"
            gridOpacity={isHighlighted ? 0.4 : 0.22}
            onClick={(e) => {
              e.stopPropagation();
              setHighlightedGalgal('sun');
              selectStep('sunMeanLongitude');
            }}
          />

          {/* ── THE SUN — fixed to red's rim ── */}
          <group ref={sunHandleRef} position={[redRadius, 0, 0]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                selectStep('sunTrueLongitude');
                setHighlightedGalgal('sun');
              }}
            >
              <sphereGeometry args={[0.2, 32, 24]} />
              <meshStandardMaterial
                color="#fde29a"
                emissive="#e4b94a"
                emissiveIntensity={1.8}
              />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.36, 16, 12]} />
              <meshBasicMaterial color="#f4cf6c" transparent opacity={0.22} depthWrite={false} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.55, 12, 10]} />
              <meshBasicMaterial color="#f4cf6c" transparent opacity={0.08} depthWrite={false} />
            </mesh>
            <pointLight color="#fff0c4" intensity={1.5} distance={22} />

            {showLabels && (
              <Html
                position={[0, 0.5, 0]}
                center
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                <div
                  style={{
                    color: '#fde29a',
                    fontSize: '11px',
                    fontWeight: 700,
                    textShadow: '0 0 8px #000, 0 0 4px #000',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div style={{ fontSize: '13px' }}>שמש</div>
                  <div ref={labelRef} style={{ fontSize: '9px', opacity: 0.85 }}>—</div>
                </div>
              </Html>
            )}
          </group>
        </group>
      </group>

      {/* ── RADIUS LINES (in world space) ── */}
      {showRadii && (
        <>
          <line ref={radiusEarthEccRef}>
            <bufferGeometry />
            <lineBasicMaterial color="#e4b94a" transparent opacity={0.55} />
          </line>
          <line ref={radiusEarthSunRef}>
            <bufferGeometry />
            <lineBasicMaterial color="#fde29a" transparent opacity={0.5} />
          </line>
          <line ref={radiusEccSunRef}>
            <bufferGeometry />
            <lineBasicMaterial color="#d8895a" transparent opacity={0.5} />
          </line>
        </>
      )}
    </group>
  );
}

/**
 * A galgal sphere with a transparent body, an equator ring, AND a wireframe
 * grid of meridians and parallels so you can SEE the rotation.
 *
 * Note: this geometry is local to its parent group, so when the parent rotates,
 * the entire sphere (gridlines included) rotates visibly.
 */
function GalgalSphere({
  radius,
  color,
  ringColor,
  opacity,
  gridColor,
  gridOpacity,
  onClick,
}) {
  return (
    <group onClick={onClick}>
      {/* Body */}
      <mesh renderOrder={-radius}>
        <sphereGeometry args={[radius, 48, 32]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={opacity}
          transmission={0.88}
          roughness={0.18}
          thickness={0.4}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Wireframe grid — this is what shows the rotation */}
      <mesh renderOrder={-radius + 0.1}>
        <sphereGeometry args={[radius * 1.001, 16, 10]} />
        <meshBasicMaterial
          color={gridColor}
          transparent
          opacity={gridOpacity}
          wireframe
          depthWrite={false}
        />
      </mesh>

      {/* Equator ring (heavier than the wireframe) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.012, radius + 0.012, 96]} />
        <meshBasicMaterial color={ringColor} side={THREE.DoubleSide} transparent opacity={0.6} />
      </mesh>

      {/* Prime meridian — a vertical great-circle ring at longitude 0 */}
      <mesh rotation={[0, 0, 0]}>
        <ringGeometry args={[radius - 0.008, radius + 0.008, 96]} />
        <meshBasicMaterial
          color={ringColor}
          side={THREE.DoubleSide}
          transparent
          opacity={0.45}
        />
      </mesh>
    </group>
  );
}
