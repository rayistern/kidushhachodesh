/**
 * Declination — the sun's road against the equator. [R] KH 19:2-9
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The switch of reference line is the thing to make obvious. Chapters 16
 * and 17 measured off the sun's road; this chapter measures off the
 * equator, and a reader who does not notice will add the two tilts as
 * though they were the same quantity.
 *
 * So the equator is the flat line here and the sun's road is the wave —
 * exactly inverting chapter 16's figure, where the road was flat and the
 * moon was the wave. Seeing the same drawing with the roles swapped is
 * the clearest way to say "different line".
 *
 * Above the wave sits the sphere the wave unrolls: the dashboard's
 * globe reduced to the two great circles this chapter needs (a reader's
 * request). Same slider drives both, so "a wave on the flat drawing" and
 * "a tilted circle on the sphere" visibly name one fact. Drawn as SVG
 * orthographic projection — the 3D scene's three.js stays out of the
 * book bundle.
 *
 * The reality check is the closing note of the book: his table is right
 * to about a fifth of a degree, in the chapter he opens by apologising
 * for. It is NOT the most accurate table in the book — KH 13:4's sun
 * correction beats it on both absolute and relative error — and an
 * earlier draft claimed otherwise. The apology is the point, not a
 * ranking.
 */
import React, { useState } from 'react';
import InteractiveCard, { PresetButton } from '../../text/interactives/InteractiveCard';
import {
  DECLINATION_TABLE,
  MAX_TILT,
  declinationAt,
  foldForDeclination,
} from '../../../lib/khDeclination';
import { CONSTANTS } from '../../../engine/constants';
import { eclipticToEquatorial } from '../../../lib/skyView';

const DEG = Math.PI / 180;
/** The true tilt, for the comparison: arcsin(sin ε · sin λ). */
const trueTilt = (lon) =>
  Math.asin(Math.sin(MAX_TILT * DEG) * Math.sin(lon * DEG)) / DEG;

export default function Declination() {
  const [longitude, setLongitude] = useState(49); // 19° into Shor, his evening

  const tilt = declinationAt(longitude);
  const fold = foldForDeclination(longitude);
  const real = trueTilt(longitude);
  const sign = CONSTANTS.CONSTELLATION_TRANSLIT[Math.floor((((longitude % 360) + 360) % 360) / 30)];

  return (
    <InteractiveCard
      title="A different line: the equator"
      source="KH 19:2-9"
      blurb="the sun's road is itself tilted, by up to 23½°"
      defaultOpen
    >
      <Sphere longitude={longitude} tilt={tilt} />
      <Wave longitude={longitude} tilt={tilt} />

      <label className="mt-3 block">
        <span className="text-xs font-bold text-[var(--color-text-secondary)]">
          A point along the sun's road — {longitude}° ({sign})
        </span>
        <input
          type="range"
          min="0"
          max="360"
          value={longitude}
          onChange={(e) => setLongitude(Number(e.target.value))}
          className="mt-1 w-full accent-[var(--color-accent)]"
          aria-label="Position along the sun's road, in degrees"
        />
      </label>

      <div className="mt-1">
        <PresetButton onClick={() => setLongitude(49)} title="Where the moon stood on his evening">
          His evening — 19° into Shor
        </PresetButton>
      </div>

      <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="text-xs text-[var(--color-text-secondary)]">Distance from the equator</div>
        <div className="mt-0.5 font-mono text-xl font-bold text-[var(--color-gold)]">
          {Math.abs(tilt).toFixed(1)}°{' '}
          <span className="font-sans text-sm font-normal">
            {Math.abs(tilt) < 0.05 ? 'on the equator' : tilt > 0 ? 'north' : 'south'}
          </span>
        </div>
        <div className="mt-1 font-mono text-[11px] text-[var(--color-text-secondary)]">
          {fold.rule === 'as it stands'
            ? `under 90° — read the table as it stands (${fold.ref})`
            : `${fold.rule} = ${fold.folded.toFixed(0)}° — read the table there (${fold.ref})`}
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2">
          <div className="text-[var(--color-text-secondary)]">His table gives</div>
          <div className="font-mono text-sm text-[var(--color-gold)]">{Math.abs(tilt).toFixed(2)}°</div>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2">
          <div className="text-[var(--color-text-secondary)]">The true value</div>
          <div className="font-mono text-sm text-[var(--color-silver)]">
            {Math.abs(real).toFixed(2)}°
          </div>
          <div className="text-[10px] text-[var(--color-accent)]">
            off by {Math.abs(Math.abs(tilt) - Math.abs(real)).toFixed(2)}°
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Compare this drawing with the one in chapter 16 and notice the roles have swapped. There,
        the sun's road was the straight line and the moon was the wave crossing it. Here the{' '}
        <strong>equator</strong> is the straight line and the sun's road is the wave. Two
        different reference lines, and this chapter needs both.
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        The two crossings are the start of Taleh and the start of Moznayim. When the sun is at
        either, it rises due east and sets due west and day equals night everywhere — the
        equinox, falling out of the geometry rather than being put in.
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        And note the two figures above. He opens this chapter warning that it "will not be exact,
        because this knowledge is of no consequence regarding the actual sighting" — and then his
        table lands within about a fifth of a degree of the real geometry, everywhere. Not the
        tightest table in the book, but easily good enough that the apology was unnecessary.
      </p>
    </InteractiveCard>
  );
}

/**
 * The sphere itself: the equator and the sun's road as two great
 * circles, crossing at Taleh and Moznayim — the dashboard's globe with
 * everything else stripped away. Orthographic projection, the viewer
 * standing a little above the equator's plane so both circles read.
 * The dashed arc from the moving point down to the equator IS the
 * chapter's quantity: how far that degree of the road is inclined.
 */
function Sphere({ longitude, tilt }) {
  const w = 520;
  const h = 240;
  const cx = w / 2;
  const cy = h / 2 + 6;
  const R = 100;
  // Camera height above the equator's plane. Not near 0° (the equator
  // would collapse to a line) and not near 23½° (the road would): 40°
  // keeps both circles open as ellipses.
  const VIEW = 40 * DEG;
  const EPS = MAX_TILT * DEG;

  // Scene coords: x to the right (both circles cross there), z up,
  // y toward the viewer. Tilt the scene toward the camera, project flat.
  const project = ({ x, y, z }) => ({
    X: cx + R * x,
    Y: cy - R * (-y * Math.sin(VIEW) + z * Math.cos(VIEW)),
    front: y * Math.cos(VIEW) + z * Math.sin(VIEW) > 0,
  });
  const equatorPt = (t) => project({ x: Math.cos(t), y: Math.sin(t), z: 0 });
  const eclipticPt = (t) =>
    project({ x: Math.cos(t), y: Math.sin(t) * Math.cos(EPS), z: Math.sin(t) * Math.sin(EPS) });

  // A circle as front/back polylines, split where it dips behind the sphere.
  const halves = (ptAt) => {
    const segs = { front: [], back: [] };
    let run = [];
    let side = null;
    for (let d = 0; d <= 360; d += 3) {
      const p = ptAt(d * DEG);
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
  const draw = (segs, color, width) =>
    ['back', 'front'].map((side) =>
      segs[side].map((seg, i) => (
        <polyline
          key={`${side}${i}`}
          points={seg.map((p) => `${p.X.toFixed(1)},${p.Y.toFixed(1)}`).join(' ')}
          fill="none"
          stroke={color}
          strokeWidth={width}
          strokeOpacity={side === 'front' ? 0.9 : 0.28}
          strokeDasharray={side === 'front' ? undefined : '3 3'}
        />
      )),
    );

  // The moving point, and its meridian arc down to the equator — the
  // declination made visible as an arc on the sphere itself.
  const lam = longitude * DEG;
  const moving = eclipticPt(lam);
  const { ra, dec } = eclipticToEquatorial(longitude, 0);
  const meridian = [];
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const d = (dec * i) / steps;
    meridian.push(
      project({
        x: Math.cos(d * DEG) * Math.cos(ra * DEG),
        y: Math.cos(d * DEG) * Math.sin(ra * DEG),
        z: Math.sin(d * DEG),
      }),
    );
  }
  const foot = meridian[0];

  const taleh = equatorPt(0);
  const moznayim = equatorPt(Math.PI);
  const pole = project({ x: 0, y: 0, z: 1 });
  const roadTop = eclipticPt(90 * DEG);
  const equatorFrontMid = equatorPt(90 * DEG);

  return (
    <figure className="mb-3">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        role="img"
        aria-label="A sphere carrying two great circles: the equator, and the sun's road tilted 23 and a half degrees against it, crossing at the start of Taleh and the start of Moznayim; a dashed arc drops from a point on the road to the equator, showing its inclination"
      >
        <circle cx={cx} cy={cy} r={R} fill="var(--color-card)" fillOpacity="0.5" stroke="var(--color-border)" strokeWidth="1" />

        {draw(halves(equatorPt), 'var(--color-silver)', 1.5)}
        {draw(halves(eclipticPt), 'var(--color-gold)', 1.5)}

        {/* the two crossings */}
        {[
          { p: taleh, label: 'Taleh 0°', dx: 8, anchor: 'start' },
          { p: moznayim, label: 'Moznayim 180°', dx: -8, anchor: 'end' },
        ].map(({ p, label, dx, anchor }) => (
          <g key={label}>
            <circle cx={p.X} cy={p.Y} r="3.5" fill="var(--color-accent)" />
            <text x={p.X + dx} y={p.Y + 3} fontSize="9" textAnchor={anchor} fill="var(--color-accent)">
              {label}
            </text>
          </g>
        ))}

        {/* the pole of the equator, which every meridian runs through */}
        <circle cx={pole.X} cy={pole.Y} r="2" fill="var(--color-silver)" fillOpacity="0.8" />
        <text x={pole.X} y={pole.Y - 6} fontSize="8" textAnchor="middle" fill="var(--color-text-secondary)">
          the pole of the equator
        </text>

        {/* labels on the circles themselves */}
        <text x={equatorFrontMid.X + 4} y={equatorFrontMid.Y + 12} fontSize="9" fill="var(--color-silver)">
          the equator
        </text>
        <text x={roadTop.X + 4} y={roadTop.Y - 6} fontSize="9" fill="var(--color-gold)">
          the sun's road
        </text>

        {/* declination arc: the chapter's own quantity, on the sphere */}
        <polyline
          points={meridian.map((p) => `${p.X.toFixed(1)},${p.Y.toFixed(1)}`).join(' ')}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.25"
          strokeDasharray="2 2"
          strokeOpacity={moving.front ? 0.9 : 0.4}
        />
        <circle cx={foot.X} cy={foot.Y} r="2.5" fill="var(--color-accent)" fillOpacity="0.7" />
        <circle
          cx={moving.X}
          cy={moving.Y}
          r="5.5"
          fill="var(--color-accent)"
          fillOpacity={moving.front ? 1 : 0.45}
          stroke="var(--color-bg)"
          strokeWidth="1.5"
        />
        <text
          x={moving.X}
          y={moving.Y - 10}
          fontSize="9"
          textAnchor="middle"
          fill="var(--color-accent)"
          fillOpacity={moving.front ? 1 : 0.55}
        >
          {Math.abs(tilt) < 0.05 ? 'on the equator' : `${Math.abs(tilt).toFixed(1)}° ${tilt > 0 ? 'north' : 'south'}`}
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-[11px] text-[var(--color-text-secondary)]">
        The dashboard's globe, cut down to the two lines this chapter needs. The gold circle is
        tilted 23½° against the silver one; the dashed arc dropping to the equator is exactly the
        quantity KH 19:7 tabulates. The wave below is this same picture unrolled flat.
      </figcaption>
    </figure>
  );
}

/** The equator flat, the sun's road as a wave — chapter 16's figure inverted. */
function Wave({ longitude, tilt }) {
  const w = 520;
  const h = 150;
  const midY = h / 2;
  const amp = 46;

  const x = (deg) => (deg / 360) * w;
  const y = (t) => midY - (t / MAX_TILT) * amp;

  const path = [];
  for (let d = 0; d <= 360; d += 2) {
    path.push(`${d === 0 ? 'M' : 'L'} ${x(d).toFixed(1)} ${y(declinationAt(d)).toFixed(1)}`);
  }

  return (
    <figure>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img"
        aria-label="The equator drawn flat with the sun's road crossing it as a wave, reaching 23 and a half degrees north and south">
        <line x1="0" y1={midY} x2={w} y2={midY} stroke="var(--color-silver)" strokeWidth="2" />
        <text x="4" y={midY - 5} fontSize="9" fill="var(--color-silver)">
          the equator
        </text>

        <path d={path.join(' ')} fill="none" stroke="var(--color-gold)" strokeWidth="1.5" />
        <text x={x(45)} y={y(MAX_TILT) - 6} fontSize="9" textAnchor="middle" fill="var(--color-gold)">
          the sun's road
        </text>

        {[
          { deg: 0, label: 'Taleh' },
          { deg: 180, label: 'Moznayim' },
        ].map(({ deg, label }) => (
          <g key={deg}>
            <circle cx={x(deg)} cy={midY} r="4" fill="var(--color-accent)" />
            <text x={x(deg) + 6} y={midY + 14} fontSize="8" fill="var(--color-accent)">
              {label}
            </text>
          </g>
        ))}

        <text x={x(90)} y={y(MAX_TILT) + 14} fontSize="8" textAnchor="middle" fill="var(--color-text-secondary)">
          23½° north
        </text>
        <text x={x(270)} y={y(-MAX_TILT) - 6} fontSize="8" textAnchor="middle" fill="var(--color-text-secondary)">
          23½° south
        </text>

        <line x1={x(longitude)} y1={midY} x2={x(longitude)} y2={y(tilt)} stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx={x(longitude)} cy={y(tilt)} r="5.5" fill="var(--color-accent)" stroke="var(--color-bg)" strokeWidth="1.5" />

        {DECLINATION_TABLE.map((row) => (
          <circle key={row.longitude} cx={x(row.longitude)} cy={y(row.tilt)} r="2" fill="var(--color-gold)" />
        ))}
      </svg>
      <figcaption className="mt-1 text-center text-[11px] text-[var(--color-text-secondary)]">
        Gold dots are the nine values KH 19:7 publishes; the rest of the wave is his fold and his
        sharing-out.
      </figcaption>
    </figure>
  );
}
