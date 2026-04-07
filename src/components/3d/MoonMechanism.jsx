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
 * Per Rabbi Losh's colored props:
 *
 *   1. RED galgal (domeh) — outermost, aligned with the kav hamazalos (ecliptic).
 *      Earth-centered. Carries the blue.
 *
 *   2. BLUE galgal (noteh) — tilted 5° off the ecliptic. This tilt is what
 *      creates the moon's latitude (rosh/zanav). The blue's intersection with
 *      the ecliptic IS the rosh (ascending node). Carries the green.
 *
 *   3. GREEN galgal (yoitzeh) — OFF-CENTER inside the blue (it has its own
 *      govah). Carries the galgal katan on its rim.
 *      Daily motion: 24°23' per day.
 *
 *   4. GALGAL KATAN — small epicycle (radius 5°) on which the MOON sits.
 *      The moon's position on this small circle is the maslul (anomaly).
 *      Daily motion: 13° 3' 53.33" per day.
 *
 * The rosh slowly regresses 3'11"/day along the ecliptic (KH 16:2).
 *
 * Animation works the same way as SunMechanism: positions are computed
 * from days-since-epoch + animationDays offset directly in useFrame.
 */
export default function MoonMechanism({
  daysFromEpoch,
  scale = 2.5, // smaller than sun
  showLabels = true,
}) {
  const animationSpeed = useVisualizationStore((s) => s.animationSpeed);
  const isPlaying = useVisualizationStore((s) => s.isPlaying);
  const showRadii = useVisualizationStore((s) => s.showRadii);
  const highlightedGalgal = useVisualizationStore((s) => s.highlightedGalgal);
  const setHighlightedGalgal = useVisualizationStore((s) => s.setHighlightedGalgal);
  const selectStep = useCalculationStore((s) => s.selectStep);

  // ── Constants ──
  // Moon mean longitude motion (~13°10'35"/day)
  const moonDailyMotion = useMemo(
    () => dmsToDecimal(CONSTANTS.MOON.MEAN_MOTION_PER_DAY),
    [],
  );
  const moonStartLon = CONSTANTS.MOON.MEAN_LONGITUDE_AT_EPOCH +
    CONSTANTS.MOON.START_CONSTELLATION * 30; // absolute degrees

  // Maslul motion on the galgal katan
  const maslulDailyMotion = useMemo(
    () => dmsToDecimal(CONSTANTS.MOON.MASLUL_MEAN_MOTION),
    [],
  );
  const maslulStart = useMemo(
    () => dmsToDecimal(CONSTANTS.MOON.MASLUL_START),
    [],
  );

  // Node (rosh) regression
  const nodeDailyMotion = useMemo(
    () => -dmsToDecimal(CONSTANTS.NODE.DAILY_MOTION), // negative = regression
    [],
  );
  const nodeStart = useMemo(() => dmsToDecimal(CONSTANTS.NODE.START_POSITION), []);

  const inclinationDeg = CONSTANTS.MOON.GALGALIM.BLUE_NOTEH.INCLINATION;

  // ── Geometry ──
  // The "moon's distance from earth" gets compressed for visibility — it
  // would be too small relative to the sun otherwise. This is a [D]educed
  // visualization choice. Real Rambam ratios are not preserved across
  // different planet galgalim.
  const redRadius = scale; // outer (Earth-centered)
  // Eccentric offset of green inside blue — exaggerated for visibility.
  // Real eccentricity is small (~5.5%); we use ~12%.
  const greenEccentricFraction = 0.12;
  const blueRadius = redRadius * 0.96; // visually distinct, ecliptic-aligned
  const greenRadius = blueRadius * (1 - greenEccentricFraction);
  const greenOffset = blueRadius * greenEccentricFraction;
  // Galgal katan radius — exaggerated. Rambam: 5° angular = small fraction of green.
  const katanRadius = greenRadius * 0.18;

  // Refs for mutation
  const blueGroupRef = useRef(); // tilted 5° around the rosh axis
  const greenGroupRef = useRef(); // off-center inside blue, follows mean lon
  const katanGroupRef = useRef(); // on green's rim, follows mean lon
  const moonRef = useRef(); // on katan's rim, follows maslul

  const radiusEarthMoonRef = useRef();
  const radiusGreenKatanRef = useRef();
  const radiusKatanMoonRef = useRef();

  const labelRef = useRef();

  useFrame(() => {
    const days = daysFromEpoch + useVisualizationStore.getState().animationDays;

    // ── 1. Compute angles ──
    const meanLon = normalizeDegrees(moonStartLon + moonDailyMotion * days);
    const maslul = normalizeDegrees(maslulStart + maslulDailyMotion * days);
    const node = normalizeDegrees(nodeStart + nodeDailyMotion * days);

    const meanRad = meanLon * DEG2RAD;
    const maslulRad = maslul * DEG2RAD;
    const nodeRad = node * DEG2RAD;

    // ── 2. Tilt the blue galgal (noteh) so that it's inclined 5° around
    // the line of nodes. The line of nodes points in the direction of `node`
    // (in the ecliptic plane). We achieve this by rotating the blue group:
    //   first by `node` around Y (pointing the node line to its longitude)
    //   then by `inclination` around X
    //   then back by -`node` around Y
    // — but we can simplify by using a quaternion that rotates the ecliptic
    // normal (Y axis) by `inclination` around the node-direction axis.
    if (blueGroupRef.current) {
      const nodeAxis = new THREE.Vector3(
        Math.cos(nodeRad),
        0,
        -Math.sin(nodeRad),
      );
      const q = new THREE.Quaternion().setFromAxisAngle(
        nodeAxis,
        inclinationDeg * DEG2RAD,
      );
      blueGroupRef.current.quaternion.copy(q);
    }

    // ── 3. Position the green galgal off-center inside the blue. The
    // green's center sits at distance `greenOffset` from blue's center,
    // in a direction that — per the Rambam's model — points toward the
    // moon's mean longitude. (This is what makes the green's center the
    // anchor of the moon's mean motion.)
    const greenLocalX = greenOffset * Math.cos(meanRad);
    const greenLocalZ = -greenOffset * Math.sin(meanRad);
    if (greenGroupRef.current) {
      greenGroupRef.current.position.set(greenLocalX, 0, greenLocalZ);
    }

    // ── 4. Position the galgal katan on green's rim, in the direction of
    // the mean longitude. The katan's CENTER is the moon's mean position.
    const katanLocalX = greenRadius * Math.cos(meanRad);
    const katanLocalZ = -greenRadius * Math.sin(meanRad);
    if (katanGroupRef.current) {
      katanGroupRef.current.position.set(katanLocalX, 0, katanLocalZ);
    }

    // ── 5. Position the moon on the katan's rim per the maslul angle.
    // The maslul measured FROM the line connecting earth → katan center.
    // Local katan coordinates: angle from the same line.
    // We rotate the maslul into world space by adding meanRad.
    const moonLocalAngle = meanRad + maslulRad + Math.PI; // +180° because katan is "leading"
    const moonLocalX = katanRadius * Math.cos(moonLocalAngle);
    const moonLocalZ = -katanRadius * Math.sin(moonLocalAngle);
    if (moonRef.current) {
      moonRef.current.position.set(moonLocalX, 0, moonLocalZ);
    }

    // ── 6. Update radius lines ──
    if (showRadii && radiusEarthMoonRef.current) {
      // Compute moon's world position by walking up the parent chain
      const moonWorld = new THREE.Vector3();
      if (moonRef.current) moonRef.current.getWorldPosition(moonWorld);
      radiusEarthMoonRef.current.geometry.setFromPoints([
        new THREE.Vector3(0, 0, 0),
        moonWorld,
      ]);
    }

    // ── 7. Update label ──
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
      {/* ── RED galgal (domeh) — outer, ecliptic-aligned ── */}
      <mesh renderOrder={-3}>
        <sphereGeometry args={[redRadius, 48, 32]} />
        <meshPhysicalMaterial
          color="#cc4444"
          transparent
          opacity={op(0.05)}
          transmission={0.85}
          roughness={0.2}
          thickness={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[redRadius - 0.008, redRadius + 0.008, 96]} />
        <meshBasicMaterial color="#ee6666" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* ── BLUE galgal (noteh) — tilted 5° ── */}
      <group ref={blueGroupRef}>
        <mesh renderOrder={-2}>
          <sphereGeometry args={[blueRadius, 48, 32]} />
          <meshPhysicalMaterial
            color="#4488cc"
            transparent
            opacity={op(0.06)}
            transmission={0.85}
            roughness={0.2}
            thickness={0.3}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        {/* Blue equator ring shows the tilted plane */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[blueRadius - 0.008, blueRadius + 0.008, 96]} />
          <meshBasicMaterial color="#66aaff" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>

        {/* ── GREEN galgal (yoitzeh) — off-center, has its own govah ── */}
        <group
          ref={greenGroupRef}
          onClick={(e) => {
            e.stopPropagation();
            setHighlightedGalgal('moon');
            selectStep('moonMaslul');
          }}
        >
          <mesh renderOrder={-1}>
            <sphereGeometry args={[greenRadius, 40, 28]} />
            <meshPhysicalMaterial
              color="#44aa44"
              transparent
              opacity={op(0.07)}
              transmission={0.85}
              roughness={0.2}
              thickness={0.3}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[greenRadius - 0.008, greenRadius + 0.008, 96]} />
            <meshBasicMaterial color="#66cc66" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>

          {/* Green's center marker (its govah) */}
          <mesh>
            <sphereGeometry args={[0.05, 16, 12]} />
            <meshBasicMaterial color="#88ff88" />
          </mesh>

          {/* ── GALGAL KATAN — small epicycle ── */}
          <group ref={katanGroupRef}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                selectStep('maslulHanachon');
              }}
            >
              <sphereGeometry args={[katanRadius, 24, 16]} />
              <meshPhysicalMaterial
                color="#dddd44"
                transparent
                opacity={op(0.18)}
                transmission={0.7}
                roughness={0.2}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[katanRadius - 0.005, katanRadius + 0.005, 64]} />
              <meshBasicMaterial color="#ffff66" transparent opacity={0.7} side={THREE.DoubleSide} />
            </mesh>

            {/* katan center marker = the moon's mean position */}
            <mesh>
              <sphereGeometry args={[0.04, 12, 8]} />
              <meshBasicMaterial color="#ffff88" />
            </mesh>

            {/* ── THE MOON ── */}
            <group ref={moonRef}>
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  selectStep('moonTrueLongitude');
                  setHighlightedGalgal('moon');
                }}
              >
                <sphereGeometry args={[0.11, 24, 16]} />
                <meshStandardMaterial
                  color="#dddde0"
                  emissive="#666677"
                  emissiveIntensity={0.4}
                />
              </mesh>
              <mesh>
                <sphereGeometry args={[0.18, 12, 10]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.12} depthWrite={false} />
              </mesh>

              {showLabels && (
                <Html
                  position={[0, 0.28, 0]}
                  center
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  <div
                    style={{
                      color: '#ddddff',
                      fontSize: '11px',
                      fontWeight: 700,
                      textShadow: '0 0 6px #000',
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

      {/* ── RADIUS LINE: Earth → Moon (in world coordinates) ── */}
      {showRadii && (
        <line ref={radiusEarthMoonRef}>
          <bufferGeometry />
          <lineBasicMaterial color="#aaccff" transparent opacity={0.4} />
        </line>
      )}
    </group>
  );
}
