/**
 * ZodiacPosition — locate a longitude in the constellations. [R] KH 11:7-9
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching interactive)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Both of the Rambam's worked examples are loadable as presets, and the
 * answer is phrased the way he phrases it ("in Gemini, in the eleventh
 * degree") alongside the measured arc, because those two numbers differ
 * by one and the text uses the ordinal. See engine/zodiac.js.
 */
import React, { useState, useMemo } from 'react';
import InteractiveCard, { DmsInput, PresetButton } from './InteractiveCard';
import { zodiacPosition, ordinalSuffix, SIGN_ARC, SIGN_SYMBOLS } from '../../../engine/zodiac';
import {
  sexagesimalToDecimal,
  decimalToSexagesimal,
  formatSexagesimal,
} from '../../../lib/sexagesimal';
import { CONSTANTS } from '../../../engine/constants';

// The two positions the Rambam himself works through in KH 11:8-9.
const PRESETS = [
  { label: "70° 30' 40\"", value: { degrees: 70, minutes: 30, seconds: 40 }, note: 'KH 11:8' },
  { label: '320°', value: { degrees: 320, minutes: 0, seconds: 0 }, note: 'KH 11:9' },
];

export default function ZodiacPosition() {
  const [dms, setDms] = useState(PRESETS[0].value);

  const decimal = sexagesimalToDecimal(dms);
  const pos = useMemo(() => zodiacPosition(decimal), [decimal]);
  const intoDms = decimalToSexagesimal(pos.degreesInto);
  const signsRemoved = pos.index;

  return (
    <InteractiveCard
      title="Where in the zodiac is this longitude?"
      source="KH 11:7-9"
      blurb="360° in twelve signs of 30°, counted from the start of Aries"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <DmsInput label="Position on the sphere" value={dms} onChange={setDms} />

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--color-text-secondary)]">
              The Rambam's examples:
            </span>
            {PRESETS.map((p) => (
              <PresetButton
                key={p.label}
                onClick={() => setDms(p.value)}
                title={`Load the worked example from ${p.note}`}
              >
                {p.label}
              </PresetButton>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl" aria-hidden="true">
                {pos.symbol}
              </span>
              <span className="text-lg font-bold">{pos.translit}</span>
              <span className="hebrew-text text-lg text-[var(--color-accent)]">{pos.hebrew}</span>
              <span className="text-xs text-[var(--color-text-secondary)]">{pos.english}</span>
            </div>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              In {pos.translit}, in the{' '}
              <strong className="text-[var(--color-gold)]">
                {pos.ordinalDegree}
                {ordinalSuffix(pos.ordinalDegree)} degree
              </strong>
              .
            </p>
          </div>

          <ol className="mt-3 space-y-1.5 text-xs text-[var(--color-text-secondary)]">
            <li>
              <span className="font-mono text-[var(--color-gold)]">1.</span> Full signs of 30°
              contained in {formatSexagesimal(dms)}:{' '}
              <strong>{signsRemoved}</strong>
              {signsRemoved > 0 && (
                <> — {CONSTANTS.CONSTELLATION_TRANSLIT.slice(0, signsRemoved).join(', ')}</>
              )}
              .
            </li>
            <li>
              <span className="font-mono text-[var(--color-gold)]">2.</span> Remove{' '}
              {signsRemoved} × 30° = {signsRemoved * SIGN_ARC}°, leaving{' '}
              <strong>{formatSexagesimal(intoDms)}</strong> into {pos.translit}.
            </li>
            <li>
              <span className="font-mono text-[var(--color-gold)]">3.</span> An arc of{' '}
              {formatSexagesimal(intoDms)} into the sign lies inside its{' '}
              <strong>
                {pos.ordinalDegree}
                {ordinalSuffix(pos.ordinalDegree)}
              </strong>{' '}
              degree — the first degree runs from 0° to 1°, so the count is one ahead of the
              measurement.
            </li>
          </ol>
        </div>

        <ZodiacWheel longitude={pos.normalized} activeIndex={pos.index} />
      </div>
    </InteractiveCard>
  );
}

/**
 * The 360° sphere as the chapter describes it: twelve equal sectors
 * starting at Aries, longitude increasing counterclockwise from the
 * right — the standard orientation for ecliptic longitude.
 */
function ZodiacWheel({ longitude, activeIndex }) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 118;
  const rInner = 74;

  const point = (r, deg) => {
    const rad = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)];
  };

  const sectorPath = (i) => {
    const a0 = i * SIGN_ARC;
    const a1 = a0 + SIGN_ARC;
    const [x0, y0] = point(rOuter, a0);
    const [x1, y1] = point(rOuter, a1);
    const [x2, y2] = point(rInner, a1);
    const [x3, y3] = point(rInner, a0);
    return `M ${x0} ${y0} A ${rOuter} ${rOuter} 0 0 0 ${x1} ${y1} L ${x2} ${y2} A ${rInner} ${rInner} 0 0 1 ${x3} ${y3} Z`;
  };

  const [mx, my] = point(rOuter + 8, longitude);

  return (
    <figure className="mx-auto w-full max-w-[260px]">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full" role="img"
        aria-label={`Zodiac wheel with a marker at ${longitude.toFixed(2)} degrees`}>
        {CONSTANTS.CONSTELLATION_TRANSLIT.map((name, i) => {
          const active = i === activeIndex;
          const [lx, ly] = point((rOuter + rInner) / 2, i * SIGN_ARC + SIGN_ARC / 2);
          return (
            <g key={name}>
              <title>{`${name} — ${CONSTANTS.CONSTELLATIONS[i]}`}</title>
              <path
                d={sectorPath(i)}
                fill={active ? 'var(--color-accent)' : 'var(--color-card)'}
                fillOpacity={active ? 0.55 : 1}
                stroke="var(--color-border)"
                strokeWidth="1"
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="15"
                fill={active ? 'var(--color-text)' : 'var(--color-text-secondary)'}
              >
                {SIGN_SYMBOLS[i]}
              </text>
            </g>
          );
        })}

        {/* Earth sits at the centre — this is the sphere of the
            constellations as seen from here (KH 11:14). */}
        <circle cx={cx} cy={cy} r="4" fill="var(--color-silver)" />

        {/* The measured longitude, drawn from the centre outward. */}
        <line
          x1={cx}
          y1={cy}
          x2={point(rOuter, longitude)[0]}
          y2={point(rOuter, longitude)[1]}
          stroke="var(--color-gold)"
          strokeWidth="2"
        />
        <circle cx={mx} cy={my} r="4.5" fill="var(--color-gold)" />

        {/* 0° Aries marker — where the count begins. */}
        <text
          x={point(rOuter + 22, 0)[0]}
          y={point(rOuter + 22, 0)[1]}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="9"
          fill="var(--color-text-secondary)"
        >
          0°
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-[11px] text-[var(--color-text-secondary)]">
        The count starts at Aries and runs counterclockwise.
      </figcaption>
    </figure>
  );
}
