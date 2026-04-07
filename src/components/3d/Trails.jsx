import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useVisualizationStore } from '../../stores/visualizationStore';
import { liveAll } from '../../engine/liveLongitudes';
import { CONSTANTS } from '../../engine/constants';
import { dmsToDecimal } from '../../engine/dmsUtils';

const DEG2RAD = Math.PI / 180;

/**
 * Trails — leaves a fading line behind the sun and moon as they move.
 *
 * Unlike a "remember last N frames" approach, this samples positions
 * across a fixed interval of CALENDAR days centered on the current
 * animation time. So when you scrub or play, the trail is the same
 * shape — it represents a window of motion, not a window of frames.
 *
 * The shape itself is what reveals the maslul: where the body slows
 * (near apogee), the dots bunch up; where it speeds up, they spread.
 * For the moon you see clear loops around the sun's path.
 */
export default function Trails({ daysFromEpoch, scale = 4.2 }) {
  const showTrails = useVisualizationStore((s) => s.showTrails);
  const trailDays = useVisualizationStore((s) => s.trailDays);

  const sunLineRef = useRef();
  const moonLineRef = useRef();

  // Geometry: pre-allocate enough vertices for max trail (180 samples)
  const maxSamples = 180;
  const sunGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(maxSamples * 3), 3),
    );
    return g;
  }, []);
  const moonGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(maxSamples * 3), 3),
    );
    return g;
  }, []);

  // Pre-compute scaling — same eccentricity layout as SunMechanism
  const sunBlueRadius = scale;
  const sunRedRadius = sunBlueRadius * (1 - 0.18);
  const sunEccOffset = sunBlueRadius * 0.18;

  // Moon — emulate the position of the moon at distance redRadius from earth
  // (it's more complex because of all the nested galgalim, but we
  // approximate using the trueLongitude in the ecliptic plane)
  const moonRadius = scale * 0.55;

  // Compute the apogee at given days for the sun
  const sunApogeeStart =
    dmsToDecimal(CONSTANTS.SUN.APOGEE_START) +
    CONSTANTS.SUN.APOGEE_CONSTELLATION * 30;

  useFrame(() => {
    if (!showTrails) return;
    const animationDays = useVisualizationStore.getState().animationDays;
    const days = daysFromEpoch + animationDays;

    // Sample backward from current time across `trailDays` days.
    const stepDays = trailDays / maxSamples;

    const sunPositions = sunGeometry.attributes.position.array;
    const moonPositions = moonGeometry.attributes.position.array;

    for (let i = 0; i < maxSamples; i++) {
      const sampleDays = days - (maxSamples - 1 - i) * stepDays;
      const live = liveAll(sampleDays);

      // Sun position: at distance sunRedRadius from the (apogee-rotated)
      // eccentric center. Approximate by using true longitude × red radius.
      const sunAngle = -live.sun.trueLongitude * DEG2RAD;
      // Approximate the eccentric offset's effect by tilting the position
      // along the apogee vector — for visualization purposes the simple
      // (cos, sin) at the absolute longitude is close enough.
      const sunR = sunRedRadius;
      sunPositions[i * 3 + 0] = Math.cos(sunAngle) * sunR + Math.cos(-live.sun.apogee * DEG2RAD) * sunEccOffset;
      sunPositions[i * 3 + 1] = 0;
      sunPositions[i * 3 + 2] = Math.sin(sunAngle) * sunR + Math.sin(-live.sun.apogee * DEG2RAD) * sunEccOffset;

      const moonAngle = -live.moon.trueLongitude * DEG2RAD;
      moonPositions[i * 3 + 0] = Math.cos(moonAngle) * moonRadius;
      moonPositions[i * 3 + 1] = 0;
      moonPositions[i * 3 + 2] = Math.sin(moonAngle) * moonRadius;
    }

    sunGeometry.attributes.position.needsUpdate = true;
    moonGeometry.attributes.position.needsUpdate = true;
    sunGeometry.computeBoundingSphere();
    moonGeometry.computeBoundingSphere();
  });

  if (!showTrails) return null;

  return (
    <group>
      <line ref={sunLineRef}>
        <primitive object={sunGeometry} attach="geometry" />
        <lineBasicMaterial color="#fde29a" transparent opacity={0.55} />
      </line>
      <line ref={moonLineRef}>
        <primitive object={moonGeometry} attach="geometry" />
        <lineBasicMaterial color="#e8e4d8" transparent opacity={0.45} />
      </line>
    </group>
  );
}
