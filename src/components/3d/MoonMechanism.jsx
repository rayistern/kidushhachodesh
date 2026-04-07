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
 * MoonMechanism — the Rambam's four-galgal model of the moon (KH 14-16).
 *
 * Hierarchy (the moon is PASSIVE — every galgal in the chain drags it):
 *
 *   Earth (origin)
 *   └── Red domeh group           (rotation.y = -nodeLon — slow node regression)
 *       └── Blue noteh group      (pre-tilted 5° around X, then rotates to track moon's mean lon)
 *           └── Green yoitzeh group (off-center inside blue, rotates at maslul rate)
 *               └── Galgal katan group at (greenRadius, 0, 0)  (rotates at maslul rate)
 *                   └── Moon fixed at (katanRadius, 0, 0)
 *
 * Each galgal sphere wears wireframe gridlines so you can see it spin.
 * The five-degree blue tilt is what creates the moon's latitude (rosh/zanav).
 * The slow node regression along the ecliptic (3'11"/day) is the red rotation.
 */
export default function MoonMechanism({
  daysFromEpoch,
  scale = 2.5,
  showLabels = true,
}) {
  const showRadii = useVisualizationStore((s) => s.showRadii);
  const highlightedGalgal = useVisualizationStore((s) => s.highlightedGalgal);
  const setHighlightedGalgal = useVisualizationStore((s) => s.setHighlightedGalgal);
  const selectStep = useCalculationStore((s) => s.selectStep);

  // ── Constants ──
  const moonDailyMotion = useMemo(
    () => dmsToDecimal(CONSTANTS.MOON.MEAN_MOTION_PER_DAY),
    [],
  );
  const moonStartLon = CONSTANTS.MOON.MEAN_LONGITUDE_AT_EPOCH +
    CONSTANTS.MOON.START_CONSTELLATION * 30;

  const maslulDailyMotion = useMemo(
    () => dmsToDecimal(CONSTANTS.MOON.MASLUL_MEAN_MOTION),
    [],
  );
  const maslulStart = useMemo(() => dmsToDecimal(CONSTANTS.MOON.MASLUL_START), []);

  const nodeDailyMotion = useMemo(
    () => -dmsToDecimal(CONSTANTS.NODE.DAILY_MOTION),
    [],
  );
  const nodeStart = useMemo(() => dmsToDecimal(CONSTANTS.NODE.START_POSITION), []);

  const inclinationDeg = CONSTANTS.MOON.GALGALIM.BLUE_NOTEH.INCLINATION;
  const inclinationRad = inclinationDeg * DEG2RAD;

  // ── Geometry ──
  const redRadius = scale;
  const blueRadius = redRadius * 0.97;
  const greenEccentricFraction = 0.12;
  const greenRadius = blueRadius * (1 - greenEccentricFraction);
  const greenOffset = blueRadius * greenEccentricFraction;
  const katanRadius = greenRadius * 0.18;

  // Refs
  const redGroupRef = useRef();
  const blueGroupRef = useRef();
  const greenGroupRef = useRef();
  const katanGroupRef = useRef();
  const moonHandleRef = useRef();
  const radiusEarthMoonRef = useRef();
  const labelRef = useRef();

  useFrame(() => {
    const days = daysFromEpoch + useVisualizationStore.getState().animationDays;

    const meanLon = normalizeDegrees(moonStartLon + moonDailyMotion * days);
    const maslul = normalizeDegrees(maslulStart + maslulDailyMotion * days);
    const node = normalizeDegrees(nodeStart + nodeDailyMotion * days);

    // ── 1. Red domeh — rotates at the rate the rosh regresses along the ecliptic ──
    if (redGroupRef.current) {
      redGroupRef.current.rotation.y = -node * DEG2RAD;
    }

    // ── 2. Blue noteh — pre-tilted 5° around its local X axis,
    // then rotated to track the moon's mean longitude RELATIVE to the node.
    // (mean longitude minus node = position along the inclined orbit)
    if (blueGroupRef.current) {
      // We use Euler with order 'YXZ': first Y rotation (mean - node),
      // then X tilt (the 5° inclination).
      blueGroupRef.current.rotation.order = 'YXZ';
      blueGroupRef.current.rotation.y = -(meanLon - node) * DEG2RAD;
      blueGroupRef.current.rotation.x = inclinationRad;
    }

    // ── 3. Green yoitzeh — sits off-center inside blue. We do not rotate it
    // additionally; its position offset is what creates the eccentricity.
    // The galgal katan inside it carries the maslul motion.
    // (greenGroupRef has fixed position; no rotation needed at this layer.)

    // ── 4. Galgal katan — rotates at the maslul rate ──
    if (katanGroupRef.current) {
      katanGroupRef.current.rotation.y = -maslul * DEG2RAD;
    }

    // ── 5. Update radius line + label ──
    if (showRadii && radiusEarthMoonRef.current && moonHandleRef.current) {
      const moonWorld = new THREE.Vector3();
      moonHandleRef.current.getWorldPosition(moonWorld);
      radiusEarthMoonRef.current.geometry.setFromPoints([
        new THREE.Vector3(0, 0, 0),
        moonWorld,
      ]);
    }

    if (labelRef.current) {
      labelRef.current.textContent = `emtzoi ${formatDms(meanLon)}  •  maslul ${formatDms(maslul)}`;
    }
  });

  const isHighlighted = highlightedGalgal === 'moon';
  const op = (base) => (isHighlighted ? base * 2.5 : base);

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        setHighlightedGalgal('moon');
      }}
    >
      {/* ── RED domeh — outer, rotates with node regression ── */}
      <group ref={redGroupRef}>
        <GalgalSphere
          radius={redRadius}
          color="#9c4f5f"
          ringColor="#c47588"
          gridColor="#dc97a8"
          opacity={op(0.04)}
          gridOpacity={isHighlighted ? 0.32 : 0.16}
        />

        {/* ── BLUE noteh — tilted 5°, rotates at moon mean motion (relative to node) ── */}
        <group ref={blueGroupRef}>
          <GalgalSphere
            radius={blueRadius}
            color="#3d6a78"
            ringColor="#6aa0b4"
            gridColor="#88c0d8"
            opacity={op(0.05)}
            gridOpacity={isHighlighted ? 0.32 : 0.16}
          />

          {/* ── GREEN yoitzeh — off-center inside blue ── */}
          <group ref={greenGroupRef} position={[greenOffset, 0, 0]}>
            <GalgalSphere
              radius={greenRadius}
              color="#5a7a5a"
              ringColor="#8fb088"
              gridColor="#b0d0a4"
              opacity={op(0.06)}
              gridOpacity={isHighlighted ? 0.34 : 0.18}
              onClick={(e) => {
                e.stopPropagation();
                setHighlightedGalgal('moon');
                selectStep('moonMaslul');
              }}
            />

            {/* Green's center marker (its govah) */}
            <mesh>
              <sphereGeometry args={[0.05, 16, 12]} />
              <meshBasicMaterial color="#a8c89a" />
            </mesh>

            {/* ── GALGAL KATAN — small epicycle, rotates at maslul rate ── */}
            <group ref={katanGroupRef} position={[greenRadius, 0, 0]}>
              <GalgalSphere
                radius={katanRadius}
                color="#c4a978"
                ringColor="#e4cf9a"
                gridColor="#f4dfa8"
                opacity={op(0.18)}
                gridOpacity={0.5}
                onClick={(e) => {
                  e.stopPropagation();
                  selectStep('maslulHanachon');
                }}
              />

              {/* katan center marker = the moon's mean position */}
              <mesh>
                <sphereGeometry args={[0.04, 12, 8]} />
                <meshBasicMaterial color="#f4e4a8" />
              </mesh>

              {/* ── THE MOON — fixed to the katan's rim ── */}
              <group ref={moonHandleRef} position={[katanRadius, 0, 0]}>
                <mesh
                  onClick={(e) => {
                    e.stopPropagation();
                    selectStep('moonTrueLongitude');
                    setHighlightedGalgal('moon');
                  }}
                >
                  <sphereGeometry args={[0.13, 24, 16]} />
                  <meshStandardMaterial
                    color="#e8e4d8"
                    emissive="#888a98"
                    emissiveIntensity={0.6}
                  />
                </mesh>
                <mesh>
                  <sphereGeometry args={[0.22, 12, 10]} />
                  <meshBasicMaterial color="#e8e4d8" transparent opacity={0.18} depthWrite={false} />
                </mesh>
                <mesh>
                  <sphereGeometry args={[0.36, 10, 8]} />
                  <meshBasicMaterial color="#ccd0e0" transparent opacity={0.06} depthWrite={false} />
                </mesh>

                {showLabels && (
                  <Html
                    position={[0, 0.32, 0]}
                    center
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    <div
                      style={{
                        color: '#e8e4d8',
                        fontSize: '11px',
                        fontWeight: 700,
                        textShadow: '0 0 8px #000, 0 0 4px #000',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <div style={{ fontSize: '13px' }}>ירח</div>
                      <div ref={labelRef} style={{ fontSize: '9px', opacity: 0.85 }}>—</div>
                    </div>
                  </Html>
                )}
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* ── RADIUS LINE: Earth → Moon ── */}
      {showRadii && (
        <line ref={radiusEarthMoonRef}>
          <bufferGeometry />
          <lineBasicMaterial color="#b6c2d4" transparent opacity={0.4} />
        </line>
      )}
    </group>
  );
}

/**
 * Galgal sphere with body + equator ring + wireframe gridlines + prime meridian.
 * The wireframe is what makes the rotation visible.
 */
function GalgalSphere({
  radius,
  color,
  ringColor,
  gridColor,
  opacity,
  gridOpacity,
  onClick,
}) {
  return (
    <group onClick={onClick}>
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

      {/* Wireframe gridlines — show rotation */}
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

      {/* Equator ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.012, radius + 0.012, 96]} />
        <meshBasicMaterial color={ringColor} side={THREE.DoubleSide} transparent opacity={0.6} />
      </mesh>

      {/* Prime meridian (great circle) */}
      <mesh rotation={[0, 0, 0]}>
        <ringGeometry args={[radius - 0.008, radius + 0.008, 96]} />
        <meshBasicMaterial color={ringColor} side={THREE.DoubleSide} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}
