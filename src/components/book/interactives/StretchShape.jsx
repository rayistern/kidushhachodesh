/**
 * StretchShape — KH 17:12's setting-speed factors, drawn whole.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** — [R] KH 17:12 (the fractions verbatim)
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The companion to SliceShape, at a reader's request. The fourth
 * longitude scales the gap by a fraction OF ITSELF, keyed by the moon's
 * sign — and unlike the slice, the fractions are signed: stretches for
 * the slow-setting stretches of the belt, shrinks for the fast-setting
 * ones. Drawn as a signed staircase about a zero line, straight from
 * SETTING_TIME_BY_MAZAL.
 *
 * Two things the shape teaches that a list cannot:
 *
 *   - It is NOT the slice's shape. The slice pivots on the crossings
 *     and turning points (0/90/180/270); this one is lopsided — its
 *     zeros sit on the 4th and 9th signs, not opposite each other, and
 *     the deepest shrink (a third off) covers the 6th and 7th. Setting
 *     speed is a fact about the horizon at 32° north, not about the
 *     equator, so it owes the four anchors nothing.
 *   - The sign of the factor says which parts of the belt sink slowly
 *     (each degree of gap worth more — stretch) and which plunge
 *     (worth less — shrink).
 */
import React, { useState } from 'react';
import InteractiveCard from '../../text/interactives/InteractiveCard';
import { CONSTANTS } from '../../../engine/constants';
import { ordinalSuffix } from '../../../engine/zodiac';
import { eclipticToEquatorial, equatorialToHorizontal, gmstDeg } from '../../../lib/skyView';
import { makeSphereProjector, flatCircle, circleHalvesProps } from './sphereProjection';

const DEG = Math.PI / 180;
/** KH 11:17's "about 32° north" — the latitude the whole table is for. */
const LATITUDE = 32;

/**
 * The sky over the horizon at the instant the belt's degree `lonDeg`
 * sets, as alt/az of any other belt degree. No clock involved: the
 * sidereal time is CHOSEN so the given degree sits on the western
 * horizon, by handing skyView a synthetic observer longitude.
 */
function settingFrame(lonDeg) {
  const jd0 = 2451545.0;
  const { ra, dec } = eclipticToEquatorial(lonDeg, 0);
  // Hour angle at setting: cos H = −tan φ · tan δ.
  const cosH = -Math.tan(LATITUDE * DEG) * Math.tan(dec * DEG);
  const H = Math.acos(Math.min(1, Math.max(-1, cosH))) / DEG;
  const observer = { latitude: LATITUDE, longitude: ra + H - gmstDeg(jd0) };
  return (beltDeg) => {
    const eq = eclipticToEquatorial(beltDeg, 0);
    return equatorialToHorizontal(eq.ra, eq.dec, jd0, observer);
  };
}

/**
 * The angle at which the belt meets the horizon as `lonDeg` sets —
 * the geometry under KH 17:12. STEEP means the belt's degrees file
 * across the horizon one at a time, so each takes long to set and is
 * worth more (stretch). SHALLOW lays a long run of belt along the
 * horizon and drops it across together — each degree is worth less
 * (shrink). Easy to invert; verified against the classical result
 * (Aries sets slowly at northern latitudes, Virgo–Libra plunge) in
 * ch17figures.test.jsx, and his own table: the −1/3 signs come out
 * shallow, the stretch signs steep.
 */
export function settingDiveAngle(lonDeg) {
  const at = settingFrame(lonDeg);
  const a = at(lonDeg - 2);
  const b = at(lonDeg + 2);
  const dAlt = b.altitude - a.altitude;
  const dAz = ((b.azimuth - a.azimuth + 540) % 360) - 180;
  return (Math.atan2(Math.abs(dAlt), Math.abs(dAz)) / DEG);
}

const ROWS = CONSTANTS.SETTING_TIME_BY_MAZAL;

/** Signed factor for a sign: +stretch, −shrink, 0 leave alone. */
function signedFraction(row) {
  if (row.operation === 'add') return row.fraction;
  if (row.operation === 'subtract') return -row.fraction;
  return 0;
}

function factorWords(row) {
  if (row.operation === 'none') return 'left exactly as it is';
  const name =
    row.fraction === 1 / 3 ? 'a third' : row.fraction === 1 / 5 ? 'a fifth' : 'a sixth';
  return row.operation === 'add' ? `stretched — add ${name} of it` : `shrunk — take ${name} off it`;
}

/**
 * The dome itself: Jerusalem's horizon as the sphere's flat circle,
 * the belt frozen at the instant the chosen degree touches it in the
 * west. NOT chapter 19's sphere — no equator here, deliberately: the
 * card's whole point is that setting speed is a fact about the horizon
 * at 32° north, and this figure is that fact drawn. Viewer faces west,
 * north to the right.
 */
function StretchDome({ lon }) {
  const w = 520;
  const h = 220;
  const cx = w / 2;
  const cy = h / 2 + 4;
  const R = 92;
  const { project } = makeSphereProjector({ cx, cy, R, viewDeg: 40 });

  const at = settingFrame(lon);
  // alt/az → scene: viewer faces west (−E toward the camera), north right.
  const scene = ({ altitude, azimuth }) => ({
    x: Math.cos(altitude * DEG) * Math.cos(azimuth * DEG),
    y: -Math.cos(altitude * DEG) * Math.sin(azimuth * DEG),
    z: Math.sin(altitude * DEG),
  });

  // The belt, split into runs by ONE combined visibility: solid only
  // where it is both on the camera's side of the ball AND above the
  // horizon; everything else reads as "behind something".
  const runs = [];
  let run = null;
  let style = null;
  for (let d = 0; d <= 360; d += 3) {
    const hor = at(lon + d - 180);
    const p = project(scene(hor));
    const s = p.front && hor.altitude > 0 ? 'solid' : 'hidden';
    if (s !== style) {
      if (run) runs.push({ style, pts: run });
      run = [];
      style = s;
    }
    run.push(p);
  }
  if (run) runs.push({ style, pts: run });

  const horizonSegs = { front: [], back: [] };
  const horizonPoly = [];
  for (let d = 0; d <= 360; d += 3) {
    const p = project(flatCircle(d * DEG));
    horizonPoly.push(p);
    (p.front ? horizonSegs.front : horizonSegs.back).push(p);
  }

  const setting = project(scene(at(lon)));
  const under = project(scene(at(lon + (at(lon + 4).altitude < 0 ? 4 : -4))));
  const dive = settingDiveAngle(lon);

  const compass = [
    [225, 'SW'],
    [270, 'W'],
    [315, 'NW'],
  ].map(([az, label]) => ({ label, p: project(scene({ altitude: 0, azimuth: az })) }));

  return (
    <figure className="mt-3">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        role="img"
        aria-label="A dome over Jerusalem's horizon at the instant the chosen degree of the belt sets in the west; the belt meets the horizon at an angle that is steep for the plunging signs and shallow for the slow-setting ones"
      >
        <circle cx={cx} cy={cy} r={R} fill="var(--color-card)" fillOpacity="0.35" stroke="var(--color-border)" strokeWidth="1" />
        {/* the ground, made faintly solid */}
        <polygon
          points={horizonPoly.map((p) => `${p.X.toFixed(1)},${p.Y.toFixed(1)}`).join(' ')}
          fill="var(--color-card)"
          fillOpacity="0.5"
        />
        {circleHalvesProps(
          { front: [horizonSegs.front], back: [horizonSegs.back] },
          'var(--color-silver)',
          1.5,
        ).map((p) => (
          <polyline {...p} />
        ))}

        {runs.map((r, i) => (
          <polyline
            key={i}
            points={r.pts.map((p) => `${p.X.toFixed(1)},${p.Y.toFixed(1)}`).join(' ')}
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="1.5"
            strokeOpacity={r.style === 'solid' ? 0.9 : 0.25}
            strokeDasharray={r.style === 'solid' ? undefined : '3 3'}
          />
        ))}

        {compass.map(({ label, p }) => (
          <text key={label} x={p.X} y={p.Y + 12} fontSize="8" textAnchor="middle" fill="var(--color-text-secondary)">
            {label}
          </text>
        ))}
        <text x={cx - R + 4} y={cy + 26} fontSize="8" fill="var(--color-text-secondary)">
          the horizon — below it, the earth
        </text>

        {/* the setting degree, and the dive it makes */}
        <line x1={setting.X} y1={setting.Y} x2={under.X} y2={under.Y} stroke="var(--color-accent)" strokeWidth="1.5" />
        <circle cx={setting.X} cy={setting.Y} r="4.5" fill="var(--color-accent)" stroke="var(--color-bg)" strokeWidth="1.25" />
        <text x={setting.X} y={setting.Y - 10} fontSize="9" textAnchor="middle" fill="var(--color-text)">
          meets the horizon at {dive.toFixed(0)}°
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-[11px] text-[var(--color-text-secondary)]">
        The moment the moon's degree touches the western horizon, at 32° north. The gold arc is
        the belt; the angle it makes with the horizon is the whole story. <strong>Steep</strong>,
        and its degrees file across one at a time — each takes long to set, so each degree of gap
        is worth more (stretch). <strong>Shallow</strong>, and a long run of belt lies along the
        horizon and drops across together — each degree worth less (shrink). Not chapter 19's
        sphere: there is no equator in this picture, because this table never asks for one.
      </figcaption>
    </figure>
  );
}

export default function StretchShape() {
  const [lon, setLon] = useState(48.6); // his worked evening's moon

  const n = ((lon % 360) + 360) % 360;
  const signNo = Math.floor(n / 30) + 1;
  const row = ROWS[signNo - 1];
  const f = signedFraction(row);

  const w = 520;
  const h = 180;
  const padL = 40;
  const padR = 10;
  const padT = 14;
  const padB = 30;
  const MAXF = 1 / 3; // deepest value in the table, either direction
  const x = (deg) => padL + (deg / 360) * (w - padL - padR);
  const y = (frac) => padT + ((MAXF - frac) / (2 * MAXF)) * (h - padT - padB);

  const stair = ROWS.map((r, i) => {
    const yy = y(signedFraction(r));
    return `${i === 0 ? `M ${x(0)} ${yy}` : `L ${x(i * 30)} ${yy}`} L ${x((i + 1) * 30)} ${yy}`;
  }).join(' ');

  return (
    <InteractiveCard
      title="The stretch, drawn whole"
      source="KH 17:12"
      blurb="a fraction of the gap itself — stretched where the belt sets slowly, shrunk where it plunges"
      defaultOpen
    >
      <figure>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full"
          role="img"
          aria-label="The setting-speed factor per sign: a signed staircase, adding up to a fifth of the gap in some signs and removing up to a third in others, zero at the 4th and 9th"
        >
          {/* factor guides */}
          {[
            [1 / 5, '+1/5'],
            [1 / 6, '+1/6'],
            [0, '0'],
            [-1 / 5, '−1/5'],
            [-1 / 3, '−1/3'],
          ].map(([frac, label]) => (
            <g key={label}>
              <line
                x1={padL}
                y1={y(frac)}
                x2={w - padR}
                y2={y(frac)}
                stroke="var(--color-border)"
                strokeWidth={frac === 0 ? 1.25 : 0.75}
                strokeDasharray={frac === 0 ? undefined : '2 5'}
              />
              <text x={2} y={y(frac) + 3} fontSize="8" fill="var(--color-text-secondary)">
                {label}
              </text>
            </g>
          ))}

          {/* region labels, since the sign of the factor is the story */}
          <text x={w - padR - 2} y={y(1 / 5) - 4} fontSize="7.5" fill="var(--color-text-secondary)" textAnchor="end">
            sets slowly → each degree worth more → stretch
          </text>
          {/* Sits just ABOVE the -1/3 line, inside the plot: below it,
              the text landed on the 10/11/12 sign numbers. The bottom-
              right of the plot is empty (those signs stretch, so the
              staircase is up at the top there). */}
          <text x={w - padR - 2} y={y(-1 / 3) - 4} fontSize="7.5" fill="var(--color-text-secondary)" textAnchor="end">
            plunges → worth less → shrink
          </text>

          {/* sign numbers along the zero line */}
          {ROWS.map((r, i) => (
            <text
              key={r.mazalIdx}
              x={x(i * 30 + 15)}
              y={h - padB + 14}
              fontSize="8"
              fill="var(--color-text-secondary)"
              textAnchor="middle"
            >
              {i + 1}
            </text>
          ))}

          {/* the shape */}
          <path d={stair} fill="none" stroke="var(--color-gold)" strokeWidth="2" />

          {/* the moon's spot */}
          <line x1={x(n)} y1={padT} x2={x(n)} y2={h - padB} stroke="var(--color-silver)" strokeWidth="1.25" />
          <circle cx={x(n)} cy={y(f)} r="4" fill="var(--color-silver)" />
        </svg>
      </figure>

      <StretchDome lon={n} />

      <label className="mt-2 block">
        <span className="text-xs font-bold text-[var(--color-text-secondary)]">
          The moon's position — {Math.round(n)}°, in the {signNo}
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
          The gap here is — his phrase: <span className="hebrew-text">{row.phrase}</span>
        </div>
        <div className="mt-0.5 font-mono text-lg font-bold text-[var(--color-gold)]">
          {factorWords(row)}
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Compare it with the slice's staircase above: this one is <strong>not</strong> anchored to
        the crossings and turning points. Its zeros sit on the 4th and 9th signs, not opposite
        each other, and the deepest cut — a third off — covers the 6th and 7th. Setting speed is
        a fact about the horizon at Jerusalem's latitude, not about the equator, so this shape
        owes the four anchors nothing. And unlike the slice, no direction rule rides on top: each
        sign's factor carries its own, fixed for good.
      </p>
    </InteractiveCard>
  );
}
