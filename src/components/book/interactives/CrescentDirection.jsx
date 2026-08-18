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
 * has horns pointing SOUTH-east.
 *
 * ── A correction this drawing has been through ──
 * A first version put a sun-glow at due west and aimed the crescent
 * radially away from it. A reader noticed that for the northerly moon
 * that arrow points up-NORTH on screen while the label says SOUTH-east
 * — the drawing contradicted its own answer. The radial model is wrong:
 * checked against real sky geometry (skyView) for his worked evening,
 * the moon 14° north of the equator stands on the SOUTH side of where
 * the sun went down, because "north of the equator" is not "north of
 * the sun" — sun and moon ride the same slanted belt. The drawing now
 * renders the halacha's own three answers directly (screen: facing
 * west, so south-east = up-and-left), with the seasonal wobble of the
 * exact tilt left to KH 19:1's own disclaimer of exactness.
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

      <Sky fromEquator={fromEquator} horns={c.horns} />

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
        horns pointing <em>south</em>-east. The trap is assuming the horns aim straight out from
        the sunset point. They aim away from the sun <strong>along the slanted belt</strong> both
        bodies ride — and "north of the equator" is not "north of the sun". On his own evening the
        moon, 14° north of the equator, actually stood on the <em>south</em> side of where the sun
        went down. The mouth of the bow aims up and south: south-east.
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        The exact tilt wobbles with the season — this is the chapter the Rambam opens by saying
        will not be exact, because none of it affects the verdict. His three cases are the coarse
        version a court could put to a witness.
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        And this is why the court asked. Someone who had really looked could say which way it
        leaned. Someone who had not would be guessing between three answers.
      </p>
    </InteractiveCard>
  );
}

/**
 * Screen rotation for a mouth direction, facing west: up = east,
 * left = south, right = north. SVG rotate() is clockwise-positive.
 */
export function mouthScreenRotation(horns) {
  if (horns === 'south-east') return -45; // up and to the left
  if (horns === 'north-east') return 45; // up and to the right
  return 0; // due east — straight up
}

/** The western horizon at sunset, with the moon where the rule puts it. */
function Sky({ fromEquator, horns }) {
  const w = 380;
  const h = 190;
  const groundY = 150;
  const cx = w / 2;

  // Lean the moon's position with its equator distance (right = north,
  // since we face west), and rotate the crescent to the halacha's own
  // answer for that case — not to a radial guess.
  const lean = Math.max(-1, Math.min(1, fromEquator / 24));
  const mx = cx + lean * 110;
  const my = groundY - 58 - Math.abs(lean) * 6;
  const hornAngle = mouthScreenRotation(horns);

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

        {/* The pointing, drawn as an arrow out of the crescent's mouth,
            using the same screen rotation as the bow — so arrow, bow and
            label agree by construction. Up is east; left is south. */}
        {(() => {
          const rad = ((hornAngle - 90) * Math.PI) / 180; // mouth vector
          const ux = Math.cos(rad);
          const uy = Math.sin(rad);
          const x1 = mx + ux * 24;
          const y1 = my + uy * 24;
          const x2 = mx + ux * 56;
          const y2 = my + uy * 56;
          return (
            <g>
              <defs>
                <marker id="kh-horn-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M 0 0 L 8 4 L 0 8 z" fill="var(--color-gold)" />
                </marker>
              </defs>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-gold)" strokeWidth="1.5" markerEnd="url(#kh-horn-arrow)" />
              <text
                x={x2 + ux * 12}
                y={y2 + uy * 12 - 2}
                fontSize="9"
                fill="var(--color-gold)"
                textAnchor="middle"
              >
                horns → {horns}
              </text>
            </g>
          );
        })()}
      </svg>
      <figcaption className="text-center text-[11px] text-[var(--color-text-secondary)]">
        The corner labels name the horizon's compass ends; the gold arrow names the horns. Bulge
        toward the sun, mouth away — the mouth is the pointing. Schematic, with the lean
        exaggerated so the direction is readable.
      </figcaption>
    </figure>
  );
}
