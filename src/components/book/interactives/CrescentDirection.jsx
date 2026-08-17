/**
 * CrescentDirection — which way the horns point. [R] KH 19:12-14
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The most physical thing in the book: a drawing of what a witness would
 * actually have described. Three cases, keyed on one number.
 *
 * Worth drawing rather than tabulating because the rule contains a
 * reversal that reads as a mistake in prose — a moon in the NORTH-west
 * has horns pointing SOUTH-east. Seen as a picture it is obvious: the
 * horns point away from the sun, so the further the moon leans one way,
 * the further its horns swing the other.
 */
import React, { useState } from 'react';
import InteractiveCard, { PresetButton } from '../../text/interactives/InteractiveCard';
import { crescentDirection } from '../../../lib/khDeclination';

export default function CrescentDirection() {
  const [fromEquator, setFromEquator] = useState(14); // his evening

  const c = crescentDirection(fromEquator);

  return (
    <InteractiveCard
      title="Which way the horns point"
      source="KH 19:12-14"
      blurb="the question a witness could answer and a liar could not"
      defaultOpen
    >
      <label className="block">
        <span className="text-xs font-bold text-[var(--color-text-secondary)]">
          The moon's distance from the equator — {Math.abs(fromEquator).toFixed(0)}°{' '}
          {Math.abs(fromEquator) <= 3 ? '(on it, near enough)' : fromEquator > 0 ? 'north' : 'south'}
        </span>
        <input
          type="range"
          min="-30"
          max="30"
          value={fromEquator}
          onChange={(e) => setFromEquator(Number(e.target.value))}
          className="mt-1 w-full accent-[var(--color-accent)]"
          aria-label="The moon's distance from the equator, in degrees"
        />
      </label>

      <div className="mt-1">
        <PresetButton onClick={() => setFromEquator(14)} title="The evening of KH 19:11">
          His evening — 14° north
        </PresetButton>
      </div>

      <Sky fromEquator={fromEquator} />

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
          <div className="text-[11px] text-[var(--color-text-secondary)]">The moon appears</div>
          <div className="text-lg font-bold text-[var(--color-accent)]">{c.appears}</div>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
          <div className="text-[11px] text-[var(--color-text-secondary)]">Its horns point</div>
          <div className="text-lg font-bold text-[var(--color-gold)]">{c.horns}</div>
        </div>
      </div>
      <div className="mt-1 font-mono text-[10px] text-[var(--color-gold)]">{c.ref}</div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        The reversal in there reads like an error and is not: a moon in the <em>north</em>-west has
        horns pointing <em>south</em>-east. Watch the drawing and it is obvious — the horns point
        away from the sun, so the further the moon leans one way, the further they swing the other.
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        And this is why the court asked. Someone who had really looked could say which way it
        leaned. Someone who had not would be guessing between three answers.
      </p>
    </InteractiveCard>
  );
}

/** The western horizon at sunset, with the moon where the rule puts it. */
function Sky({ fromEquator }) {
  const w = 380;
  const h = 190;
  const groundY = 150;
  const cx = w / 2;

  // Lean the moon's position and its horns in opposite directions.
  const lean = Math.max(-1, Math.min(1, fromEquator / 24));
  const mx = cx + lean * 110;
  const my = groundY - 58 - Math.abs(lean) * 6;
  // Horns face away from the sun, which is below the horizon at centre.
  const hornAngle = Math.atan2(my - groundY, mx - cx) * (180 / Math.PI) + 90;

  return (
    <figure className="mt-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img"
        aria-label="The western horizon at sunset with the crescent moon leaning north or south and its horns pointing the opposite way">
        <line x1="10" y1={groundY} x2={w - 10} y2={groundY} stroke="var(--color-border)" strokeWidth="1.5" />
        <text x={cx} y={groundY + 16} fontSize="9" textAnchor="middle" fill="var(--color-text-secondary)">
          west — where the sun has just set
        </text>
        <text x="14" y={groundY - 6} fontSize="9" fill="var(--color-text-secondary)">south</text>
        <text x={w - 14} y={groundY - 6} fontSize="9" textAnchor="end" fill="var(--color-text-secondary)">
          north
        </text>

        {/* the set sun, as a glow at the centre of the horizon */}
        <circle cx={cx} cy={groundY} r="26" fill="var(--color-gold)" fillOpacity="0.13" />
        <circle cx={cx} cy={groundY} r="13" fill="var(--color-gold)" fillOpacity="0.2" />

        {/* the crescent, rotated so its horns face away from the sun */}
        <g transform={`translate(${mx} ${my}) rotate(${hornAngle})`}>
          <defs>
            <mask id="kh-horns">
              <rect x="-30" y="-30" width="60" height="60" fill="black" />
              <circle cx="0" cy="0" r="17" fill="white" />
              <circle cx="0" cy="-13" r="16" fill="black" />
            </mask>
          </defs>
          <circle cx="0" cy="0" r="17" fill="var(--color-silver)" mask="url(#kh-horns)" />
        </g>

        <line x1={cx} y1={groundY} x2={mx} y2={my} stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      </svg>
      <figcaption className="text-center text-[11px] text-[var(--color-text-secondary)]">
        Schematic — the lean is exaggerated so the direction is readable.
      </figcaption>
    </figure>
  );
}
