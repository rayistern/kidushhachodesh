/**
 * WhereCorrectionVanishes — the two courses that need no correction.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** — [R] KH 13:3
 *  SURFACE CATEGORY: internal UI (teaching diagram)
 * ═══════════════════════════════════════════════════════════════════
 *
 * KH 13:3 states the exception without saying why it holds: at exactly
 * 180° and exactly 360° the mean position *is* the true position.
 *
 * The reason is visible rather than algebraic. Those are the only two
 * places where the sun sits on the line joining the earth to the centre
 * of its circle — so the ray from the centre and the ray from the earth
 * point the same way, and there is nothing between them to correct.
 * Everywhere else the two rays diverge.
 *
 * Drawn side by side at the two courses, with a third panel the reader
 * can move, so the special cases read as the ends of a continuum rather
 * than as arbitrary exemptions.
 */
import React, { useState } from 'react';
import InteractiveCard from './InteractiveCard';

const DEG = Math.PI / 180;
const ECCENTRICITY = 0.4; // exaggerated for legibility, as elsewhere

export default function WhereCorrectionVanishes() {
  const [course, setCourse] = useState(60);

  return (
    <InteractiveCard
      title="The two places where there is nothing to correct"
      source="KH 13:3"
      blurb="at 360° and 180° the sun lies on the earth–centre line, so both rays point the same way"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Panel course={0} caption="Course 360° — at the apogee" aligned />
        <Panel course={180} caption="Course 180° — at the perigee" aligned />
        <Panel course={course} caption={`Course ${course}° — anywhere else`} />
      </div>

      <label className="mt-3 block">
        <span className="text-xs font-bold text-[var(--color-text-secondary)]">
          Move the third one — {course}°
        </span>
        <input
          type="range"
          min="1"
          max="359"
          value={course}
          onChange={(e) => setCourse(Number(e.target.value))}
          className="mt-1 w-full accent-[var(--color-accent)]"
          aria-label="Course for the third panel"
        />
      </label>

      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        In the first two the silver and gold rays lie on top of each other — the sun, the centre
        of its circle and the earth are all in a line, so there is no angle between "where the
        uniform reckoning says it is" and "where it is". Move the third panel anywhere off that
        line and the rays separate. The correction is exactly that separation, which is why it
        starts at nothing, grows, and returns to nothing.
      </p>
    </InteractiveCard>
  );
}

function Panel({ course, caption, aligned }) {
  const size = 132;
  const cx = 58;
  const cy = size / 2;
  const R = 44;
  const centreX = cx + ECCENTRICITY * R;

  const rad = course * DEG;
  const bx = centreX + R * Math.cos(rad);
  const by = cy - R * Math.sin(rad);

  // Extend both rays to a common radius so their divergence is visible.
  const reach = 62;
  const meanAngle = rad;
  const trueAngle = Math.atan2(cy - by, bx - cx);

  return (
    <figure>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full" role="img" aria-label={caption}>
        <circle cx={centreX} cy={cy} r={R} fill="none" stroke="var(--color-border)" strokeWidth="1" />
        <line x1={centreX - R} y1={cy} x2={centreX + R} y2={cy}
          stroke="var(--color-border)" strokeWidth="0.8" strokeDasharray="2 2" />

        {/* Ray from the orbit's centre — the uniform direction */}
        <line
          x1={centreX}
          y1={cy}
          x2={centreX + reach * Math.cos(meanAngle)}
          y2={cy - reach * Math.sin(meanAngle)}
          stroke="var(--color-silver)"
          strokeWidth={aligned ? 3 : 1.5}
          strokeDasharray="3 2"
        />
        {/* Ray from the earth — what is actually seen */}
        <line
          x1={cx}
          y1={cy}
          x2={cx + reach * Math.cos(trueAngle)}
          y2={cy - reach * Math.sin(trueAngle)}
          stroke="var(--color-gold)"
          strokeWidth="1.5"
        />

        <circle cx={centreX} cy={cy} r="2.5" fill="var(--color-silver)" />
        <circle cx={cx} cy={cy} r="4" fill="var(--color-accent)" />
        <circle cx={bx} cy={by} r="4.5" fill="var(--color-gold)" />
      </svg>
      <figcaption
        className={`mt-0.5 text-center text-[10px] ${aligned ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'}`}
      >
        {caption}
      </figcaption>
    </figure>
  );
}
