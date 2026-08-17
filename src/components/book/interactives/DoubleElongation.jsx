/**
 * DoubleElongation — the gap to the sun, doubled. [R] KH 15:1-3
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Three things at once, because they are one idea:
 *
 *  - the elongation, drawn as an actual gap between two bodies;
 *  - the doubling, which is the step nobody expects;
 *  - the nudge it earns (KH 15:3), which is what the doubled figure is
 *    for.
 *
 * The band showing 5°-62° is the point of KH 15:2, and the card says
 * why it holds: the question is only ever asked on the one night the
 * new moon might first be seen, so the moon is never far from the sun
 * when it is asked. Drag past the band and the card says plainly that
 * you have left the situation the chapter is about.
 */
import React, { useState, useMemo } from 'react';
import InteractiveCard, { PresetButton } from '../../text/interactives/InteractiveCard';
import { calculateMaslulHanachon } from '../../../engine/moonCalculations';
import { CONSTANTS } from '../../../engine/constants';
import { formatDms } from '../../../engine/dmsUtils';

// KH 15:2's stated bounds for a sighting night.
const BOUNDS = { min: 5, max: 62 };

export default function DoubleElongation() {
  // The Rambam's own worked example: elongation 17°58'6" at N=29.
  const [elongation, setElongation] = useState(17.97);

  const doubled = elongation * 2;
  const inRange = doubled >= BOUNDS.min && doubled <= BOUNDS.max;

  // The nudge KH 15:3 awards, via the engine's own band table. Passing
  // a course of 0 isolates the addition from the course itself.
  const nudge = useMemo(() => calculateMaslulHanachon(0, doubled).result, [doubled]);

  const daysSinceConjunction = elongation / (
    // moon gains on the sun at roughly 12.2° a day
    13.176 - 0.986
  );

  return (
    <InteractiveCard
      title="The gap to the sun, and why it gets doubled"
      source="KH 15:1-3"
      blurb="the one place the sun genuinely disturbs the moon's motion"
      defaultOpen
    >
      <label className="block">
        <span className="text-xs font-bold text-[var(--color-text-secondary)]">
          How far the moon has pulled away from the sun — {formatDms(elongation)}
        </span>
        <input
          type="range"
          min="0"
          max="45"
          step="0.1"
          value={elongation}
          onChange={(e) => setElongation(Number(e.target.value))}
          className="mt-1 w-full accent-[var(--color-accent)]"
          aria-label="Elongation in degrees"
        />
      </label>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="text-xs text-[var(--color-text-secondary)]">His example:</span>
        <PresetButton onClick={() => setElongation(17.97)}>17° 58′</PresetButton>
      </div>

      <SkyGap elongation={elongation} />

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Box label="Elongation" value={formatDms(elongation)} note="moon less sun" />
        <Box
          label="Doubled (מרחק כפול)"
          value={formatDms(doubled)}
          note={inRange ? 'inside his stated range' : 'outside 5°–62°'}
          highlight
        />
        <Box
          label="Nudge to the course"
          value={nudge === 0 ? 'none' : `+${nudge}°`}
          note="KH 15:3"
        />
      </div>

      <BoundsStrip doubled={doubled} />

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        {inRange ? (
          <>
            That is about{' '}
            <strong className="text-[var(--color-text)]">
              {daysSinceConjunction.toFixed(1)} days
            </strong>{' '}
            since the moon and sun were together — which is the whole window in which anyone
            would be outside looking for a new moon. That is why the doubled figure stays
            between 5° and 62°, and why his table stops at 63.
          </>
        ) : (
          <>
            You have slid outside the range the chapter is about. At{' '}
            {daysSinceConjunction.toFixed(1)} days past conjunction the moon is either still
            invisible in the sun's glare or long since obvious — either way, not the night the
            court is asking about.
          </>
        )}
      </p>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-[var(--color-accent)]">
          The whole nudge table (KH 15:3)
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[260px] text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-secondary)]">
                <th className="py-1 pr-3 font-bold">Doubled gap</th>
                <th className="py-1 font-bold">Add to the course</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {/* Rows past 63° are this project's extrapolation, not the
                  Rambam's, and lie outside the window a sighting night
                  can produce — so the table he actually gives is the
                  table shown. */}
              {CONSTANTS.DOUBLE_ELONGATION_ADJUSTMENTS.filter(
                (r) => r.source !== 'approximated',
              ).map((row) => {
                const active = doubled >= row.minElongation && doubled <= row.maxElongation;
                return (
                  <tr
                    key={`${row.minElongation}-${row.maxElongation}`}
                    className={`border-b border-[var(--color-border)]/40 ${active ? 'bg-[var(--color-accent)]/10' : ''}`}
                  >
                    <td className="py-1 pr-3">
                      {row.minElongation}°–{row.maxElongation}°
                    </td>
                    <td className="py-1 text-[var(--color-gold)]">
                      {row.adjustment === 0 ? 'nothing' : `+${row.adjustment}°`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
    </InteractiveCard>
  );
}

function Box({ label, value, note, highlight }) {
  return (
    <div
      className={`rounded-lg border p-2 ${highlight ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5' : 'border-[var(--color-border)] bg-[var(--color-bg)]'}`}
    >
      <div className="text-[11px] text-[var(--color-text-secondary)]">{label}</div>
      <div className="font-mono text-sm font-bold text-[var(--color-gold)]">{value}</div>
      <div className="text-[10px] text-[var(--color-text-secondary)]">{note}</div>
    </div>
  );
}

/** Sun and moon on the horizon, with the gap between them drawn. */
function SkyGap({ elongation }) {
  const w = 480;
  const h = 96;
  const groundY = 74;
  // A degree of sky drawn as ~9px, so the whole 45° slider fits.
  const px = (deg) => 60 + deg * 9;

  return (
    <figure className="mt-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img"
        aria-label="The sun at the horizon with the moon a short distance above and to one side of it">
        <line x1="0" y1={groundY} x2={w} y2={groundY} stroke="var(--color-border)" strokeWidth="1.5" />
        <text x="4" y={h - 6} fontSize="8" fill="var(--color-text-secondary)">
          horizon at sunset
        </text>

        {/* the sun, just setting */}
        <circle cx={px(0)} cy={groundY} r="9" fill="var(--color-gold)" fillOpacity="0.85" />
        <text x={px(0)} y={groundY + 14} fontSize="8" textAnchor="middle" fill="var(--color-text-secondary)">
          sun
        </text>

        {/* the moon, that far along the belt */}
        <circle cx={px(elongation)} cy={groundY - elongation * 1.1} r="6" fill="var(--color-silver)" />
        <text
          x={px(elongation)}
          y={groundY - elongation * 1.1 - 10}
          fontSize="8"
          textAnchor="middle"
          fill="var(--color-text-secondary)"
        >
          moon
        </text>

        {/* the gap itself */}
        <line
          x1={px(0)}
          y1={groundY}
          x2={px(elongation)}
          y2={groundY - elongation * 1.1}
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
      </svg>
      <figcaption className="text-center text-[10px] text-[var(--color-text-secondary)]">
        Not to scale — the point is the gap, not the geometry.
      </figcaption>
    </figure>
  );
}

/** The 5°–62° window of KH 15:2. */
function BoundsStrip({ doubled }) {
  const w = 480;
  const scaleMax = 90;
  const x = (deg) => (Math.min(deg, scaleMax) / scaleMax) * w;

  return (
    <figure className="mt-3">
      <svg viewBox={`0 0 ${w} 34`} className="w-full" role="img"
        aria-label="A strip showing the 5 to 62 degree window the double elongation always falls in on a sighting night">
        <rect x="0" y="8" width={w} height="14" fill="var(--color-card)" />
        <rect
          x={x(BOUNDS.min)}
          y="8"
          width={x(BOUNDS.max) - x(BOUNDS.min)}
          height="14"
          fill="var(--color-accent)"
          fillOpacity="0.3"
        />
        <line x1={x(doubled)} y1="4" x2={x(doubled)} y2="26" stroke="var(--color-gold)" strokeWidth="2" />
        <text x={x(BOUNDS.min)} y="32" fontSize="8" fill="var(--color-text-secondary)" textAnchor="middle">
          5°
        </text>
        <text x={x(BOUNDS.max)} y="32" fontSize="8" fill="var(--color-text-secondary)" textAnchor="middle">
          62°
        </text>
      </svg>
      <figcaption className="text-center text-[10px] text-[var(--color-text-secondary)]">
        The window KH 15:2 says the doubled gap never leaves, on the night the moon might be seen.
      </figcaption>
    </figure>
  );
}
