/**
 * MoonCorrectionTable — KH 15:6, drawn beside the sun's. [R] KH 15:6
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The moon's table read the same way the sun's was, so the card does
 * not re-teach the method. What it adds is the comparison: both arches
 * plotted on one axis, because "the moon's correction is two and a half
 * times the sun's" is a sentence, and two curves is a fact.
 *
 * The moon's arch also peaks later — 100° against the sun's 90° — which
 * is visible once they are drawn together and invisible in prose.
 *
 * ── On the disputed rows ──
 * Two rows of this table differ between witnesses. Unlike KH 14:5,
 * where Touger's English and this site's engine disagree, here they
 * *agree*: both read 4°40' at 120° and 2°48' at 150°, against the
 * standard printed texts' 4°20' and 3°48'. Touger flags both in his own
 * footnotes. The card says so rather than staying silent, because a
 * reader comparing against a printed Mishneh Torah would otherwise find
 * a discrepancy and have no way to place it.
 */
import React, { useState } from 'react';
import InteractiveCard, { PresetButton } from '../../text/interactives/InteractiveCard';
import { CONSTANTS } from '../../../engine/constants';
import { lookupMoonMaslulCorrection } from '../../../engine/moonCalculations';
import { formatDms } from '../../../engine/dmsUtils';

const MOON = CONSTANTS.MOON_MASLUL_CORRECTIONS;
const SUN = CONSTANTS.SUN_MASLUL_CORRECTIONS;
const PEAK = Math.max(...MOON.map((r) => r.correction));

// Rows where the manuscripts this site follows part company with the
// standard printed editions. Touger footnotes both.
const DISPUTED = {
  120: { printed: 4 + 20 / 60 },
  150: { printed: 3 + 48 / 60 },
};

function formatMin(deg) {
  const total = Math.round(deg * 60);
  const d = Math.floor(total / 60);
  const m = total - d * 60;
  return d > 0 ? `${d}° ${m}'` : `${m}'`;
}

export default function MoonCorrectionTable() {
  const [course, setCourse] = useState(108);

  const correction = lookupMoonMaslulCorrection(course).result;
  const sunAt = sunCorrection(course);
  const ratio = sunAt > 0.01 ? correction / sunAt : null;

  return (
    <InteractiveCard
      title="The moon's table, next to the sun's"
      source="KH 15:6"
      blurb="same rules as chapter 13, much bigger numbers"
      defaultOpen
    >
      <label className="block">
        <span className="text-xs font-bold text-[var(--color-text-secondary)]">
          Correct course (המסלול הנכון) — {course}°
        </span>
        <input
          type="range"
          min="0"
          max="360"
          value={course}
          onChange={(e) => setCourse(Number(e.target.value))}
          className="mt-1 w-full accent-[var(--color-accent)]"
          aria-label="Correct course in degrees"
        />
      </label>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="text-xs text-[var(--color-text-secondary)]">Try:</span>
        <PresetButton onClick={() => setCourse(108)}>his example (108°)</PresetButton>
        <PresetButton onClick={() => setCourse(100)}>the peak (100°)</PresetButton>
      </div>

      <Curves course={course} />

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2">
          <div className="text-[11px] text-[var(--color-text-secondary)]">Moon's correction</div>
          <div className="font-mono text-base font-bold text-[var(--color-gold)]">
            {formatMin(correction)}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2">
          <div className="text-[11px] text-[var(--color-text-secondary)]">
            Sun's, at the same course
          </div>
          <div className="font-mono text-base text-[var(--color-silver)]">{formatMin(sunAt)}</div>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2">
          <div className="text-[11px] text-[var(--color-text-secondary)]">The moon is</div>
          <div className="font-mono text-base text-[var(--color-accent)]">
            {ratio ? `${ratio.toFixed(1)}× bigger` : '—'}
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        The moon's arch tops out at{' '}
        <strong className="text-[var(--color-text)]">{formatMin(PEAK)}</strong> and does it at
        100°, where the sun's tops out at {formatMin(Math.max(...SUN.map((r) => r.correction)))}{' '}
        at 90°. Higher, and slightly later. That extra height is the moon straying further from
        its average than the sun ever does — and it is why the moon needs four chapters where
        the sun needed two.
      </p>

      {DISPUTED[course] && (
        <div className="mt-3 rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-surface)] p-3 text-[11px] leading-relaxed">
          <strong className="text-[var(--color-text)]">This row is disputed.</strong> At {course}°
          this site reads <strong>{formatMin(correction)}</strong>, following the manuscripts —
          and Touger's translation reads the same. The standard printed editions have{' '}
          <strong>{formatMin(DISPUTED[course].printed)}</strong>, which Touger notes in his own
          footnote. So unlike the disagreement you met in chapter 14, here the translation and
          this site agree with each other; it is the common printed texts that differ.
        </div>
      )}
    </InteractiveCard>
  );
}

/** The sun's correction at the same course, for the comparison. */
function sunCorrection(course) {
  const folded = course > 180 ? 360 - course : course;
  for (let i = 0; i < SUN.length - 1; i++) {
    const lo = SUN[i];
    const hi = SUN[i + 1];
    if (folded >= lo.maslul && folded <= hi.maslul) {
      const t = (folded - lo.maslul) / (hi.maslul - lo.maslul);
      return lo.correction + t * (hi.correction - lo.correction);
    }
  }
  return 0;
}

function Curves({ course }) {
  const w = 500;
  const h = 170;
  const padL = 36;
  const padR = 8;
  const padT = 10;
  const padB = 20;

  const x = (deg) => padL + (deg / 360) * (w - padL - padR);
  const y = (corr) => padT + (1 - corr / PEAK) * (h - padT - padB);

  const path = (lookup) => {
    const pts = [];
    for (let d = 0; d <= 360; d += 2) {
      pts.push(`${d === 0 ? 'M' : 'L'} ${x(d).toFixed(1)} ${y(lookup(d)).toFixed(1)}`);
    }
    return pts.join(' ');
  };

  const moonAt = (d) => lookupMoonMaslulCorrection(d).result;

  return (
    <figure className="mt-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img"
        aria-label="The moon's correction table and the sun's plotted together; the moon's arch is about two and a half times taller">
        <line x1={padL} y1={y(0)} x2={w - padR} y2={y(0)} stroke="var(--color-border)" strokeWidth="1" />
        <line x1={x(180)} y1={padT} x2={x(180)} y2={y(0)} stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" />
        <line x1={padL} y1={y(PEAK)} x2={w - padR} y2={y(PEAK)} stroke="var(--color-border)" strokeWidth="1" strokeDasharray="2 4" />
        <text x={2} y={y(PEAK) + 3} fontSize="8" fill="var(--color-text-secondary)">
          {formatMin(PEAK)}
        </text>
        <text x={18} y={y(0) + 3} fontSize="8" fill="var(--color-text-secondary)">0</text>

        <path d={path(sunCorrection)} fill="none" stroke="var(--color-silver)" strokeWidth="1.5" />
        <path d={path(moonAt)} fill="none" stroke="var(--color-accent)" strokeWidth="2" />

        {MOON.map((row) => (
          <circle key={row.maslul} cx={x(row.maslul)} cy={y(row.correction)} r="2.5" fill="var(--color-accent)" />
        ))}

        <line x1={x(course)} y1={padT} x2={x(course)} y2={y(0)} stroke="var(--color-gold)" strokeWidth="1" />
        <circle cx={x(course)} cy={y(moonAt(course))} r="4" fill="var(--color-gold)" />

        {[0, 90, 180, 270, 360].map((d) => (
          <text key={d} x={x(d)} y={h - 6} fontSize="8" textAnchor="middle" fill="var(--color-text-secondary)">
            {d}°
          </text>
        ))}
      </svg>
      <figcaption className="mt-1 flex flex-wrap gap-3 text-[11px] text-[var(--color-text-secondary)]">
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 bg-[var(--color-accent)]" /> the moon (KH 15:6)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 bg-[var(--color-silver)]" /> the sun (KH 13:4),
          same axis
        </span>
      </figcaption>
    </figure>
  );
}
