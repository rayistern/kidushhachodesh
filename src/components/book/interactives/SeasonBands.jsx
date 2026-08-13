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
 * ── The disagreement ──
 * For the sun between the start of Gemini and the start of Leo
 * (60°–120°), Touger's English — which is what `/text/14` displays —
 * reads "30 minutes should be added", with his own footnote conceding
 * that most standard printed texts say 15. The engine ships +15′
 * uniformly from 15° to 165°, following Sefaria's Torat Emet text; that
 * was a deliberate decision (2026-05-03, issue #19) under a
 * "true to the source text" directive.
 *
 * So a reader who reads the chapter here and then uses this calculator
 * would otherwise meet two different numbers with nothing to explain
 * them. docs/OPEN_QUESTIONS.md Q8 records three live traditions and
 * notes a 15′ shift here propagates through every later moon value and
 * can flip a borderline visibility verdict.
 *
 * This card shows both readings and marks which one the site computes
 * with. It does not offer a switch: changing the engine's table would
 * fork every downstream answer and needs a provenance story of its own.
 * That is Q8's follow-up, not this card's.
 */
import React, { useState } from 'react';
import InteractiveCard from '../../text/interactives/InteractiveCard';
import { CONSTANTS } from '../../../engine/constants';
import { calculateSeasonCorrection } from '../../../engine/moonCalculations';
import { zodiacPosition } from '../../../engine/zodiac';

/** Touger's reading: as shipped, but +30′ between Gemini and Leo. */
const TOUGER_OVERRIDE = { from: 60, to: 120, arcmin: 30 };

function shippedArcmin(longitude) {
  return calculateSeasonCorrection(longitude).result * 60;
}

function tougerArcmin(longitude) {
  if (longitude >= TOUGER_OVERRIDE.from && longitude < TOUGER_OVERRIDE.to) {
    return TOUGER_OVERRIDE.arcmin;
  }
  return shippedArcmin(longitude);
}

function signed(arcmin) {
  if (Math.abs(arcmin) < 0.01) return 'no change';
  return `${arcmin > 0 ? '+' : '−'}${Math.abs(arcmin).toFixed(0)}′`;
}

export default function SeasonBands() {
  const [sunLongitude, setSunLongitude] = useState(90);

  const shipped = shippedArcmin(sunLongitude);
  const touger = tougerArcmin(sunLongitude);
  const disputed = Math.abs(shipped - touger) > 0.01;
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
        {disputed && (
          <div className="mt-1 text-xs text-[var(--color-accent)]">
            …but Touger's text says {signed(touger)} here. See below.
          </div>
        )}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-secondary)]">
              <th className="py-1 pr-2 font-bold">Sun between</th>
              <th className="py-1 pr-2 font-bold">This site</th>
              <th className="py-1 font-bold">Touger's text</th>
            </tr>
          </thead>
          <tbody>
            {CONSTANTS.SEASON_CORRECTIONS.map((row) => {
              const mid = (row.sunFrom + row.sunTo) / 2;
              const t = tougerArcmin(mid);
              const differs = Math.abs(row.adjustment * 60 - t) > 0.01;
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
                  </td>
                  <td className="py-1 pr-2 font-mono text-[var(--color-gold)]">
                    {signed(row.adjustment * 60)}
                  </td>
                  <td
                    className={`py-1 font-mono ${differs ? 'font-bold text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'}`}
                  >
                    {signed(t)}
                    {differs && ' ←'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-surface)] p-3">
        <div className="text-xs font-bold text-[var(--color-text)]">
          One row of this table is disputed — worth knowing now
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
          For the sun between the start of Gemini and the start of Leo, the English translation
          you will read on the source page says <strong>30 minutes</strong>. Its own footnote
          adds that most standard printed texts say <strong>15</strong>. This site computes with{' '}
          <strong>15</strong>, following the Hebrew text it takes from Sefaria — a deliberate
          choice to stay with the source edition rather than the translation.
        </p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
          So if you read chapter 14 and then use this calculator, you have found a real
          disagreement between two witnesses to the text, not a bug. It is not settled. Fifteen
          minutes of arc is small, but it carries through every later step and can tip a
          borderline "was it visible" verdict either way.
        </p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
          There is one more thread: the previous figure showed the nudges tracking sunset through
          the year, and noted the shipped table is lopsided where sunset drift is not. The
          symmetric reading — the one with +30′ — fits that pattern rather better. Suggestive,
          and nowhere near enough to settle which text is right.
        </p>
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
