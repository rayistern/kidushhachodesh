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
 * What you are seeing:
 *   • BLUE galgal (outer)  — centered on Earth. Carries the red galgal.
 *                            Rotates extremely slowly (~1°/70yr) — visually static.
 *   • RED galgal (inner)   — OFF-CENTER inside the blue. Its center is the
 *                            "eccentric point" (the govah's anchor).
 *                            Carries the sun on its rim.
 *                            Rotates ~59'8"/day — most of the visible motion.
 *   • SUN — sits on the rim of the red galgal.
 *
 *   The sun's emtzoi (mean longitude) is its angle as seen from the RED'S CENTER.
 *   The sun's amiti (true longitude) is its angle as seen from EARTH.
 *   The difference = the maslul correction (max ~2°).
 *
 * Animation:
 *   The mechanism is driven directly by days-since-epoch + animationDays offset
 *   from the visualization store. Engine functions are not re-run per frame —
 *   we just compute the two cheap angles in JS.
 */
export default function SunMechanism({
  daysFromEpoch,
  scale = 4, // scene units per "blue galgal radius"
  showLabels = true,
}) {
  const animationDays = useVisualizationStore((s) => s.animationDays);
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
  const blueRadius = scale; // Earth-centered (the actual sphere of the sun)
  // Eccentric offset — keep it visually obvious (~10% of radius) even though
  // physically it's only ~1.7%. This is a [D]educed visualization choice.
  const eccentricFraction = 0.18;
  const redRadius = blueRadius * (1 - eccentricFraction); // sits inside the blue
  const eccentricOffset = blueRadius * eccentricFraction;

  // Refs that we mutate from useFrame so we never trigger React re-renders
  const sunRef = useRef();
  const eccentricGroupRef = useRef();
  const redRingRef = useRef();
  const radiusEarthSunRef = useRef();
  const radiusEarthEccRef = useRef();
  const radiusEccSunRef = useRef();
  const lastFrameTimeRef = useRef(null);

  // Static refs — for the meanLon HTML overlay
  const labelRef = useRef();

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

    // ── 2. Compute current days ──
    const days = daysFromEpoch + useVisualizationStore.getState().animationDays;

    // ── 3. Apogee + mean longitude ──
    const apogee = normalizeDegrees(apogeeStart + apogeeMotion * days);
    const meanLon = normalizeDegrees(startPos + dailyMotion * days);

    // ── 4. Position the eccentric point ──
    // The line from Earth → eccentric points toward the apogee direction.
    const apogeeRad = apogee * DEG2RAD;
    const eccX = eccentricOffset * Math.cos(apogeeRad);
    const eccZ = -eccentricOffset * Math.sin(apogeeRad);
    if (eccentricGroupRef.current) {
      eccentricGroupRef.current.position.set(eccX, 0, eccZ);
    }

    // ── 5. Position the sun on the red galgal ──
    // The sun's angle FROM THE ECCENTRIC POINT equals meanLon (this is what
    // "emtzoi" means in the Rambam — the angle as seen from the red's center).
    const meanRad = meanLon * DEG2RAD;
    const sunLocalX = redRadius * Math.cos(meanRad);
    const sunLocalZ = -redRadius * Math.sin(meanRad);
    // World coordinates of the sun (eccentric origin + local)
    const sunWorldX = eccX + sunLocalX;
    const sunWorldZ = eccZ + sunLocalZ;
    if (sunRef.current) {
      sunRef.current.position.set(sunWorldX, 0, sunWorldZ);
    }

    // ── 6. Update radius lines ──
    if (showRadii) {
      if (radiusEarthEccRef.current) {
        radiusEarthEccRef.current.geometry.setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(eccX, 0, eccZ),
        ]);
      }
      if (radiusEarthSunRef.current) {
        radiusEarthSunRef.current.geometry.setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(sunWorldX, 0, sunWorldZ),
        ]);
      }
      if (radiusEccSunRef.current) {
        radiusEccSunRef.current.geometry.setFromPoints([
          new THREE.Vector3(eccX, 0, eccZ),
          new THREE.Vector3(sunWorldX, 0, sunWorldZ),
        ]);
      }
    }

    // ── 7. Update label text via DOM (no React re-render) ──
    if (labelRef.current) {
      // Compute amiti (true longitude) for the label
      const trueAngle = normalizeDegrees(
        Math.atan2(-sunWorldZ, sunWorldX) / DEG2RAD,
      );
      labelRef.current.textContent =
        `emtzoi ${formatDms(meanLon)}  →  amiti ${formatDms(trueAngle)}`;
    }
  });

  const isHighlighted = highlightedGalgal === 'sun';
  const blueOpacity = isHighlighted ? 0.18 : 0.06;
  const redOpacity = isHighlighted ? 0.22 : 0.1;

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        setHighlightedGalgal('sun');
      }}
    >
      {/* ── BLUE GALGAL (outer, Earth-centered) ── */}
      <mesh renderOrder={-2}>
        <sphereGeometry args={[blueRadius, 48, 32]} />
        <meshPhysicalMaterial
          color="#3b6fd4"
          transparent
          opacity={blueOpacity}
          transmission={0.85}
          roughness={0.2}
          thickness={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Blue equator ring (the sun's deferent in the ecliptic plane) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[blueRadius - 0.01, blueRadius + 0.01, 96]} />
        <meshBasicMaterial
          color="#5e8fe6"
          side={THREE.DoubleSide}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* ── ECCENTRIC GROUP (carries the red galgal) ── */}
      <group ref={eccentricGroupRef}>
        {/* Red galgal — sphere */}
        <mesh
          ref={redRingRef}
          onClick={(e) => {
            e.stopPropagation();
            setHighlightedGalgal('sun');
            selectStep('sunMeanLongitude');
          }}
        >
          <sphereGeometry args={[redRadius, 48, 32]} />
          <meshPhysicalMaterial
            color="#d44747"
            transparent
            opacity={redOpacity}
            transmission={0.8}
            roughness={0.2}
            thickness={0.3}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        {/* Red equator ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[redRadius - 0.01, redRadius + 0.01, 96]} />
          <meshBasicMaterial
            color="#ff7777"
            side={THREE.DoubleSide}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* Eccentric center marker */}
        <mesh>
          <sphereGeometry args={[0.06, 16, 12]} />
          <meshBasicMaterial color="#ff9966" />
        </mesh>
      </group>

      {/* ── THE SUN ── */}
      <group ref={sunRef}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            selectStep('sunTrueLongitude');
            setHighlightedGalgal('sun');
          }}
        >
          <sphereGeometry args={[0.18, 32, 24]} />
          <meshStandardMaterial
            color="#ffdd44"
            emissive="#ffaa00"
            emissiveIntensity={1.6}
          />
        </mesh>
        {/* Soft glow */}
        <mesh>
          <sphereGeometry args={[0.32, 16, 12]} />
          <meshBasicMaterial color="#ffdd44" transparent opacity={0.18} depthWrite={false} />
        </mesh>
        <pointLight color="#ffeeaa" intensity={1.2} distance={20} />

        {showLabels && (
          <Html
            position={[0, 0.45, 0]}
            center
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div
              style={{
                color: '#ffdd66',
                fontSize: '11px',
                fontWeight: 700,
                textShadow: '0 0 6px #000',
                whiteSpace: 'nowrap',
              }}
            >
              <div style={{ fontSize: '13px' }}>שמש</div>
              <div ref={labelRef} style={{ fontSize: '9px', opacity: 0.85 }}>—</div>
            </div>
          </Html>
        )}
      </group>

      {/* ── RADIUS LINES ── */}
      {showRadii && (
        <>
          <line ref={radiusEarthEccRef}>
            <bufferGeometry />
            <lineBasicMaterial color="#ff9966" transparent opacity={0.6} />
          </line>
          <line ref={radiusEarthSunRef}>
            <bufferGeometry />
            <lineBasicMaterial color="#ffdd44" transparent opacity={0.5} />
          </line>
          <line ref={radiusEccSunRef}>
            <bufferGeometry />
            <lineBasicMaterial color="#ff7777" transparent opacity={0.5} />
          </line>
        </>
      )}
    </group>
  );
}
