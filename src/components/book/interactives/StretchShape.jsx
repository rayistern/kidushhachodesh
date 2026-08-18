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
