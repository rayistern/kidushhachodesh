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
