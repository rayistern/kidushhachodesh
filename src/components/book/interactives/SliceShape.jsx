/**
 * SliceShape — KH 17:10's fractions drawn as the one shape they are.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** — [R] KH 17:10 (the fractions verbatim)
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The prose claims the circuit fractions are "not a list — a single
 * shape", and a reader asked to see it. This plots every band of
 * MOON_CIRCLE_FRACTIONS straight from the engine: a staircase that
 * peaks at two fifths around the starts of the 1st and 7th signs,
 * steps down to nothing in the bands straddling the starts of the 4th
 * and 10th, and mirrors itself exactly in the second half.
 *
 * The four guide lines are the same four points the book keeps
 * meeting: the two crossings (where the sun's road cuts the equator at
 * its steepest) and the two turning points (where it runs level). The
 * shape IS that geometry, which is the argument the section makes.
 *
 * A slider moves the moon round the circle and reads off the band —
 * with the Rambam's own phrase for the fraction, since the phrases
 * (שני חמישיותיו, שתותו…) are how the halacha actually states them.
 */
import React, { useState } from 'react';
import InteractiveCard from '../../text/interactives/InteractiveCard';
import { CONSTANTS } from '../../../engine/constants';
import { ordinalSuffix } from '../../../engine/zodiac';
import { MAX_TILT } from '../../../lib/khDeclination';
import {
  makeSphereProjector,
  flatCircle,
  tiltedCircle,
  circleHalvesProps,
  GeometryAside,
} from './sphereProjection';

const BANDS = CONSTANTS.MOON_CIRCLE_FRACTIONS;
const PEAK = 2 / 5;

const FRACTION_LABELS = [
  [2 / 5, '2/5'],
  [1 / 3, '1/3'],
  [1 / 4, '1/4'],
  [1 / 6, '1/6'],
  [0, '0'],
];

function bandAt(lon) {
  const n = ((lon % 360) + 360) % 360;
  return BANDS.find((b) => n >= b.from && n < b.to) ?? BANDS[0];
}

function fractionWords(f) {
  if (f === 0) return 'nothing — the step is skipped';
  if (f === 2 / 5) return 'two fifths';
  if (f === 1 / 3) return 'a third';
  if (f === 1 / 4) return 'a quarter';
  if (f === 1 / 5) return 'a fifth';
  if (f === 1 / 6) return 'a sixth';
  if (f === 1 / 12) return 'a twelfth';
  return 'a twenty-fourth';
}

const DEG = Math.PI / 180;

/**
 * Why the staircase has the anchors it has, shown on the sphere the
 * fractions come from. The two great circles are chapter 19's pair —
 * the equator and the sun's road — and the annotation is the road's
 * LOCAL DIRECTION: a gold arrow along the road at the moon's spot, a
 * silver arrow along the parallel of the equator through the same spot
 * (the "level" direction). At the crossings the two arrows split by
 * the full 23½°, and the staircase above peaks; at the turning points
 * they merge, the road runs level, and the staircase dies to nothing.
 * The angle between the arrows is computed, not drawn for effect.
 */
export function roadLevelAngle(lonDeg) {
  const t = lonDeg * DEG;
  const eps = MAX_TILT * DEG;
  // Tangent to the road at t, and to the equator-parallel through the
  // same point. Both unit up to a common factor; the angle between
  // them is what "steepest against level" means.
  const road = [-Math.sin(t), Math.cos(t) * Math.cos(eps), Math.cos(t) * Math.sin(eps)];
  const level = [-Math.sin(t) * Math.cos(eps), Math.cos(t), 0];
  const dot = road[0] * level[0] + road[1] * level[1] + road[2] * level[2];
  const norm = (v) => Math.hypot(v[0], v[1], v[2]);
  return Math.acos(Math.min(1, Math.max(-1, dot / (norm(road) * norm(level))))) / DEG;
}

function SliceSphere({ lon }) {
  const w = 520;
  const h = 220;
  const cx = w / 2;
  const cy = h / 2 + 4;
  const R = 92;
  const eps = MAX_TILT * DEG;
  const { project, halves } = makeSphereProjector({ cx, cy, R, viewDeg: 40 });
  const road = tiltedCircle(eps);

  const t = lon * DEG;
  const pt3 = road(t);
  const moving = project(pt3);
  // The parallel of the equator through the moon's spot: constant
  // height above the equator's plane.
  const z0 = pt3.z;
  const r0 = Math.sqrt(Math.max(0, 1 - z0 * z0));
  const parallel = (tp) => ({ x: r0 * Math.cos(tp), y: r0 * Math.sin(tp), z: z0 });

  // The two direction arrows out of the moving point, equal drawn length.
  const roadDir = [-Math.sin(t), Math.cos(t) * Math.cos(eps), Math.cos(t) * Math.sin(eps)];
  const levelDir = [-Math.sin(t) * Math.cos(eps), Math.cos(t), 0];
  const along = (v, len) => {
    const s = len / Math.hypot(v[0], v[1], v[2]);
    return project({ x: pt3.x + v[0] * s, y: pt3.y + v[1] * s, z: pt3.z + v[2] * s });
  };
  const ARROW = 0.5;
  const roadTip = along(roadDir, ARROW);
  const levelTip = along(levelDir, ARROW);
  const angle = roadLevelAngle(lon);
  const merged = angle < 6; // arrows lie on top of each other
  const dim = moving.front ? 1 : 0.45;

  // A wedge between the two directions, so the printed angle visibly
  // belongs to them: interpolate between the unit tangents.
  const wedge = [];
  for (let k = 0; k <= 1.0001; k += 0.1) {
    const v = [
      roadDir[0] * (1 - k) + levelDir[0] * k,
      roadDir[1] * (1 - k) + levelDir[1] * k,
      roadDir[2] * (1 - k) + levelDir[2] * k,
    ];
    wedge.push(along(v, ARROW * 0.55));
  }

  const draw = (segs, color, width) =>
    circleHalvesProps(segs, color, width).map((p) => <polyline {...p} />);
  const taleh = project(flatCircle(0));
  const moznayim = project(flatCircle(Math.PI));
  const equatorLabelAt = project(flatCircle(Math.PI / 2));
  const roadLabelAt = project(road(Math.PI / 2));
  const label = (tip, txt, color) => (
    <text
      x={tip.X + (tip.X >= moving.X ? 5 : -5)}
      y={tip.Y + 3}
      fontSize="8.5"
      textAnchor={tip.X >= moving.X ? 'start' : 'end'}
      fill={color}
      fillOpacity={dim}
    >
      {txt}
    </text>
  );

  return (
    <figure className="mt-3">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        role="img"
        aria-label="The equator and the sun's road on a sphere, with two labelled arrows at the moon's spot: one along the road, one along the level ring; the wedge between them is largest at the crossings and vanishes at the turning points, matching the staircase"
      >
        <circle cx={cx} cy={cy} r={R} fill="var(--color-card)" fillOpacity="0.5" stroke="var(--color-border)" strokeWidth="1" />
        {draw(halves(flatCircle), 'var(--color-silver)', 1.25)}
        {draw(halves(parallel), 'var(--color-silver)', 0.6)}
        {draw(halves(road), 'var(--color-gold)', 1.5)}

        {/* every line named on the drawing itself */}
        <text x={equatorLabelAt.X + 4} y={equatorLabelAt.Y + 12} fontSize="9" fill="var(--color-silver)">
          the equator
        </text>
        <text x={roadLabelAt.X + 4} y={roadLabelAt.Y - 6} fontSize="9" fill="var(--color-gold)">
          the sun's road
        </text>

        {[
          { p: taleh, label: 'a crossing — the 1st starts', dx: 7, anchor: 'start' },
          { p: moznayim, label: 'a crossing — the 7th starts', dx: -7, anchor: 'end' },
        ].map(({ p, label: txt, dx, anchor }) => (
          <g key={txt}>
            <circle cx={p.X} cy={p.Y} r="3" fill="var(--color-accent)" />
            <text x={p.X + dx} y={p.Y - 4} fontSize="7.5" textAnchor={anchor} fill="var(--color-accent)">
              {txt}
            </text>
          </g>
        ))}

        {/* the wedge between the two directions, carrying the number */}
        {!merged && (
          <polyline
            points={wedge.map((p) => `${p.X.toFixed(1)},${p.Y.toFixed(1)}`).join(' ')}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1"
            strokeOpacity={0.8 * dim}
          />
        )}

        {/* the two directions out of the moon's spot */}
        <line x1={moving.X} y1={moving.Y} x2={levelTip.X} y2={levelTip.Y} stroke="var(--color-silver)" strokeWidth="2" strokeOpacity={dim} />
        <line x1={moving.X} y1={moving.Y} x2={roadTip.X} y2={roadTip.Y} stroke="var(--color-gold)" strokeWidth="2" strokeOpacity={dim} />
        {label(roadTip, 'where the road goes next', 'var(--color-gold)')}
        {!merged && label(levelTip, 'level — along its ring', 'var(--color-silver)')}

        <circle cx={moving.X} cy={moving.Y} r="4.5" fill="var(--color-silver)" fillOpacity={dim} stroke="var(--color-bg)" strokeWidth="1.25" />
        <text x={moving.X} y={moving.Y + 15} fontSize="8.5" textAnchor="middle" fill="var(--color-text)" fillOpacity={dim}>
          the moon's spot
        </text>
        <text x={moving.X} y={moving.Y - 10} fontSize="9.5" fontWeight="bold" textAnchor="middle" fill="var(--color-accent)" fillOpacity={dim}>
          {merged ? 'the road runs level here' : `${angle.toFixed(0)}° apart`}
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-[11px] text-[var(--color-text-secondary)]">
        The same slider, on the sphere. The moon's spot rides the gold road; the thin silver ring
        through it is "level" — no closer to and no further from the equator. The two arrows
        compare directions: <span className="text-[var(--color-gold)]">where the road goes next</span>{' '}
        against <span style={{ opacity: 0.8 }}>level along the ring</span>. Their gap is what the
        staircase plots: the full 23½° at the two crossings, where the slice peaks at two fifths —
        shrinking to nothing at the turning points, where the road runs level and the slice
        vanishes.
      </figcaption>
    </figure>
  );
}

export default function SliceShape() {
  const [lon, setLon] = useState(48.6); // his worked evening's moon

  const band = bandAt(lon);
  const signNo = Math.floor(((lon % 360) + 360) % 360 / 30) + 1;
  // KH 17:11's direction rule is split at 90° and 270° — inside the
  // zero bands, so the reversal never lands where a slice is applied.
  const n = ((lon % 360) + 360) % 360;
  const inCapGem = n >= 270 || n < 90;

  const w = 520;
  const h = 170;
  const padL = 34;
  const padR = 10;
  const padT = 14;
  const padB = 38;
  const x = (deg) => padL + (deg / 360) * (w - padL - padR);
  const y = (f) => padT + (1 - f / PEAK) * (h - padT - padB);

  // The staircase, one horizontal run per band with vertical risers.
  const stair = BANDS.map(
    (b, i) =>
      `${i === 0 ? `M ${x(b.from)} ${y(b.fraction)}` : `L ${x(b.from)} ${y(b.fraction)}`} L ${x(b.to)} ${y(b.fraction)}`,
  ).join(' ');

  return (
    <InteractiveCard
      title="The slice, drawn whole"
      source="KH 17:10"
      blurb="seven fractions that are one shape — peaking at the crossings, vanishing at the turning points"
      defaultOpen
    >
      <figure>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full"
          role="img"
          aria-label="The circuit fraction plotted around the circle: a staircase peaking at two fifths near 0 and 180 degrees and stepping down to nothing around 90 and 270"
        >
          {/* The two halves of KH 17:11's direction rule, shaded. The
              boundaries (90° and 270°) sit inside the zero bands, so the
              rule never reverses while the slice is nonzero. */}
          <rect x={x(90)} y={padT} width={x(270) - x(90)} height={h - padT - padB} fill="var(--color-silver)" fillOpacity="0.06" />

          {/* fraction guide lines */}
          {FRACTION_LABELS.map(([f, label]) => (
            <g key={label}>
              <line
                x1={padL}
                y1={y(f)}
                x2={w - padR}
                y2={y(f)}
                stroke="var(--color-border)"
                strokeWidth="0.75"
                strokeDasharray="2 5"
              />
              <text x={2} y={y(f) + 3} fontSize="8" fill="var(--color-text-secondary)">
                {label}
              </text>
            </g>
          ))}

          {/* The four anchors, each labelled with what it IS, not only
              where it falls: "start of the 7th" alone forced the reader
              to guess "…of the 7th what?". Line one places it on the
              circle of signs; line two names its role in the shape,
              using the caption's own words. */}
          {[
            [0, 'the 1st sign starts', 'a crossing'],
            [90, 'the 4th sign starts', 'a turning point'],
            [180, 'the 7th sign starts', 'a crossing'],
            [270, 'the 10th sign starts', 'a turning point'],
          ].map(([deg, where, role]) => (
            <g key={deg}>
              <line
                x1={x(deg)}
                y1={padT}
                x2={x(deg)}
                y2={h - padB + 4}
                stroke="var(--color-accent)"
                strokeWidth="0.75"
                strokeDasharray="3 4"
                opacity="0.6"
              />
              <text
                x={x(deg) + (deg === 0 ? 2 : 0)}
                y={h - padB + 13}
                fontSize="7"
                fill="var(--color-text-secondary)"
                textAnchor={deg === 0 ? 'start' : 'middle'}
              >
                {where}
              </text>
              <text
                x={x(deg) + (deg === 0 ? 2 : 0)}
                y={h - padB + 22}
                fontSize="7"
                fill="var(--color-accent)"
                textAnchor={deg === 0 ? 'start' : 'middle'}
              >
                {role}
              </text>
            </g>
          ))}

          {/* the shape itself */}
          <path d={stair} fill="none" stroke="var(--color-gold)" strokeWidth="2" />

          {/* the moon's spot */}
          <line
            x1={x(((lon % 360) + 360) % 360)}
            y1={padT}
            x2={x(((lon % 360) + 360) % 360)}
            y2={h - padB}
            stroke="var(--color-silver)"
            strokeWidth="1.25"
          />
          <circle
            cx={x(((lon % 360) + 360) % 360)}
            cy={y(band.fraction)}
            r="4"
            fill="var(--color-silver)"
          />
        </svg>
      </figure>

      <GeometryAside summary="For the curious: why those anchors — the picture on the sphere">
        <SliceSphere lon={n} />
      </GeometryAside>

      <label className="mt-2 block">
        <span className="text-xs font-bold text-[var(--color-text-secondary)]">
          The moon's position — {Math.round(((lon % 360) + 360) % 360)}°, in the {signNo}
          {ordinalSuffix(signNo)} sign
        </span>
        <input
          type="range"
          min="0"
          max="359.9"
          step="0.5"
          value={lon}
          onChange={(e) => setLon(Number(e.target.value))}
          className="mt-1 w-full accent-[var(--color-accent)]"
          aria-label="The moon's position in degrees"
        />
      </label>

      <div className="mt-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="text-[11px] text-[var(--color-text-secondary)]">
          The slice here — his phrase: <span className="hebrew-text">{band.phrase}</span>
        </div>
        <div className="mt-0.5 font-mono text-lg font-bold text-[var(--color-gold)]">
          {fractionWords(band.fraction)}
        </div>
        {band.fraction > 0 && (
          <div className="mt-1.5 border-t border-[var(--color-border)]/60 pt-1.5 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
            Which way it goes depends on which side of the road the moon sits (its height, as
            adjusted in the previous step). Here, in the {inCapGem ? '10th-through-3rd' : '4th-through-9th'}{' '}
            half: <strong>north → taken {inCapGem ? 'off' : 'onto'} the gap; south → {inCapGem ? 'added on' : 'taken off'}</strong>
            {inCapGem ? '' : ' — the reverse of the other half'}. (KH 17:11)
          </div>
        )}
        {band.fraction === 0 && (
          <div className="mt-1.5 border-t border-[var(--color-border)]/60 pt-1.5 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
            Nothing to apply here — and no direction to worry about. These zero bands are also
            where the direction rule reverses, so the flip happens exactly where there is nothing
            to flip.
          </div>
        )}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        One staircase, climbed four times. It peaks where the sun's road crosses the equator at
        its steepest slant — the starts of the 1st and 7th signs — and dies to nothing where the
        road runs level, at the turning points the book keeps returning to. Drag through the
        second half and watch it repeat the first exactly. The shaded region is the half of the
        sky where the direction rule runs in reverse — and its edges fall inside the zero bands,
        so the flip happens exactly where there is no slice to flip.
      </p>
    </InteractiveCard>
  );
}
