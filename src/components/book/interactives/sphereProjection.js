/**
 * Shared orthographic-sphere machinery for the book's globe figures.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **modern** — drawing geometry only, no doctrine in it
 *  SURFACE CATEGORY: internal UI helper (teaching figures)
 * ═══════════════════════════════════════════════════════════════════
 *
 * One projector, several spheres: chapter 19's equator-and-road globe,
 * chapter 17's slice sphere (same two circles, different annotation)
 * and stretch dome (horizon and belt). Scene coordinates are x to the
 * right, z up, y toward the viewer; the camera sits `viewDeg` above
 * the x-y plane. Great circles come back split into front and back
 * runs so the back can be dashed — that split is what makes a flat
 * projection read as a ball.
 */
import React from 'react';

const DEG = Math.PI / 180;

/** A projector for a sphere of radius R centred at (cx, cy) on screen. */
export function makeSphereProjector({ cx, cy, R, viewDeg }) {
  const view = viewDeg * DEG;
  const project = ({ x, y, z }) => ({
    X: cx + R * x,
    Y: cy - R * (-y * Math.sin(view) + z * Math.cos(view)),
    front: y * Math.cos(view) + z * Math.sin(view) > 0,
  });

  /**
   * A closed curve, sampled every 3° and split into front/back runs.
   * `pointAt` maps a parameter in radians to a scene-space unit vector.
   */
  const halves = (pointAt) => {
    const segs = { front: [], back: [] };
    let run = [];
    let side = null;
    for (let d = 0; d <= 360; d += 3) {
      const p = project(pointAt(d * DEG));
      const s = p.front ? 'front' : 'back';
      if (side !== null && s !== side) {
        segs[side].push(run);
        run = [];
      }
      run.push(p);
      side = s;
    }
    if (run.length) segs[side].push(run);
    return segs;
  };

  return { project, halves };
}

/** Unit vector on the x-y plane's great circle (an "equator"). */
export const flatCircle = (t) => ({ x: Math.cos(t), y: Math.sin(t), z: 0 });

/** That circle tilted by `epsRad` about the x-axis (an "ecliptic"). */
export const tiltedCircle = (epsRad) => (t) => ({
  x: Math.cos(t),
  y: Math.sin(t) * Math.cos(epsRad),
  z: Math.sin(t) * Math.sin(epsRad),
});

/**
 * Where the 3D figures live: collapsed by default. The spheres earn
 * their keep for readers who think geometrically, but the cards must
 * read complete without them — a reader told us the sphere was more
 * puzzling than the staircase it explained. React's <details> handles
 * the state; no JS.
 */
export function GeometryAside({ summary, children }) {
  return React.createElement(
    'details',
    { className: 'mt-3 rounded-lg border border-[var(--color-border)]/60 px-3 py-2' },
    React.createElement(
      'summary',
      {
        className:
          'cursor-pointer select-none text-[11px] font-bold text-[var(--color-text-secondary)]',
      },
      summary,
    ),
    children,
  );
}

/** Front/back runs of a curve as SVG polyline props, back dashed. */
export function circleHalvesProps(segs, color, width) {
  const out = [];
  for (const side of ['back', 'front']) {
    segs[side].forEach((seg, i) => {
      out.push({
        key: `${side}${i}`,
        points: seg.map((p) => `${p.X.toFixed(1)},${p.Y.toFixed(1)}`).join(' '),
        fill: 'none',
        stroke: color,
        strokeWidth: width,
        strokeOpacity: side === 'front' ? 0.9 : 0.28,
        strokeDasharray: side === 'front' ? undefined : '3 3',
      });
    });
  }
  return out;
}
