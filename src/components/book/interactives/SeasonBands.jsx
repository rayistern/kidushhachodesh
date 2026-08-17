/**
 * SeasonBands — the KH 14:5 table, and the row the texts argue about.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**, with an editorial disclosure
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Two jobs. First, make the table usable: pick where the sun is, read
 * the nudge. Second — and this is why the card is longer than it looks
 * like it needs to be — tell the reader that the printed texts disagree
 * about one row, *before* they discover it as a contradiction.
 *
 * ── On the one contested row ──
 * For 60°–120° the Yemenite manuscripts read +30' where the standard
 * printed editions read +15'. The engine follows the Yemenite reading as
 * given in the **Chitrik edition** (Touger's English agrees); the reasoning and the audit trail
 * are in OPEN_QUESTIONS.md Q8 and the CONSTANTS header.
 *
 * This card used to show both readings side by side, from when the
 * question was open. It no longer does — a settled reading presented as
 * a live dispute teaches the wrong thing, and the alternative is one
 * step in the file's history rather than something a reader must weigh.
 */
import React, { useState } from 'react';
import InteractiveCard from '../../text/interactives/InteractiveCard';
import { CONSTANTS } from '../../../engine/constants';
import { calculateSeasonCorrection } from '../../../engine/moonCalculations';
import { zodiacPosition } from '../../../engine/zodiac';
import { bandDates } from '../../../lib/sunDates';

function shippedArcmin(longitude) {
  return calculateSeasonCorrection(longitude).result * 60;
}


function signed(arcmin) {
  if (Math.abs(arcmin) < 0.01) return 'no change';
  return `${arcmin > 0 ? '+' : '−'}${Math.abs(arcmin).toFixed(0)}′`;
}

export default function SeasonBands() {
  // Dates shift a day either way between years, so they are computed for
  // the current one and shown as approximate.
  const year = new Date().getFullYear();
  const [sunLongitude, setSunLongitude] = useState(90);

  const shipped = shippedArcmin(sunLongitude);
  const sign = zodiacPosition(sunLongitude);

  return (
    <InteractiveCard
      title="The nudge, by where the sun is"
      source="KH 14:5"
      blurb="find the sun, read the adjustment — and meet the row the texts disagree about"
      defaultOpen
    >
      <label className="block">
        <span className="text-xs font-bold text-[var(--color-text-secondary)]">
          Where the sun is — {sunLongitude}° ({sign.translit})
        </span>
        <input
          type="range"
          min="0"
          max="359"
          value={sunLongitude}
          onChange={(e) => setSunLongitude(Number(e.target.value))}
          className="mt-1 w-full accent-[var(--color-accent)]"
          aria-label="The sun's position in degrees"
        />
      </label>

      <BandStrip sunLongitude={sunLongitude} />

      <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="text-xs text-[var(--color-text-secondary)]">
          Adjustment to the moon's mean
        </div>
        <div className="mt-0.5 font-mono text-xl font-bold text-[var(--color-gold)]">
          {signed(shipped)}
        </div>

      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-secondary)]">
              <th className="py-1 pr-2 font-bold">Sun between <span className="font-normal">(and roughly when)</span></th>
              <th className="py-1 font-bold">The nudge</th>
            </tr>
          </thead>
          <tbody>
            {CONSTANTS.SEASON_CORRECTIONS.map((row) => {
              const active = sunLongitude >= row.sunFrom && sunLongitude < row.sunTo;
              return (
                <tr
                  key={`${row.sunFrom}-${row.sunTo}`}
                  className={`border-b border-[var(--color-border)]/40 ${active ? 'bg-[var(--color-accent)]/10' : ''}`}
                >
                  <td className="py-1 pr-2">
                    <span className="hebrew-text">{row.sourcePhrase.replace(/\s*\(.*\)$/, '')}</span>
                    <span className="block font-mono text-[10px] text-[var(--color-text-secondary)]">
                      {row.sunFrom}°–{row.sunTo}°
                    </span>
                    {/* The degrees are exact and unreadable. These dates are
                        his own sun run backwards (KH 13:11's move), so the
                        reader can see that the -30' band really does sit on
                        midwinter. Approximate because the ranges shift a day
                        either way between years. */}
                    <span className="block text-[10px] text-[var(--color-text-secondary)]">
                      ≈ {bandDates(row.sunFrom, row.sunTo, year).from} –{' '}
                      {bandDates(row.sunFrom, row.sunTo, year).to}
                    </span>
                  </td>
                  <td className="py-1 font-mono text-[var(--color-gold)]">
                    {signed(row.adjustment * 60)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </InteractiveCard>
  );
}

/** The 360° circle as a strip, with the bands laid on it. */
function BandStrip({ sunLongitude }) {
  const w = 520;
  const h = 46;
  const x = (deg) => (deg / 360) * w;

  const colourFor = (adjustment) => {
    if (adjustment > 0) return 'var(--color-accent)';
    if (adjustment < 0) return 'var(--color-gold)';
    return 'var(--color-border)';
  };

  return (
    <figure className="mt-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img"
        aria-label="The season correction bands laid out across the 360 degrees of the zodiac">
        {CONSTANTS.SEASON_CORRECTIONS.map((row) => (
          <g key={`${row.sunFrom}-${row.sunTo}`}>
            <rect
              x={x(row.sunFrom)}
              y={6}
              width={x(row.sunTo) - x(row.sunFrom)}
              height={20}
              fill={colourFor(row.adjustment)}
              fillOpacity={row.adjustment === 0 ? 0.35 : 0.55}
              stroke="var(--color-bg)"
              strokeWidth="1"
            />
            {x(row.sunTo) - x(row.sunFrom) > 40 && (
              <text
                x={(x(row.sunFrom) + x(row.sunTo)) / 2}
                y={20}
                fontSize="9"
                textAnchor="middle"
                fill="var(--color-text)"
              >
                {row.adjustment === 0 ? '—' : signed(row.adjustment * 60)}
              </text>
            )}
          </g>
        ))}
        <line x1={x(sunLongitude)} y1={2} x2={x(sunLongitude)} y2={30} stroke="var(--color-text)" strokeWidth="2" />
        <circle cx={x(sunLongitude)} cy={2} r="3" fill="var(--color-text)" />
        {[0, 90, 180, 270].map((d) => (
          <text key={d} x={x(d)} y={42} fontSize="8" fill="var(--color-text-secondary)" textAnchor="middle">
            {d}°
          </text>
        ))}
      </svg>
    </figure>
  );
}
