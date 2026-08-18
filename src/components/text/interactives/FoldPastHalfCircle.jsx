/**
 * FoldPastHalfCircle — reading the table backwards. [R] KH 13:5
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching interactive)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The table stops at 180°; a course can reach 360°. KH 13:5 says to
 * subtract from 360 and read the answer there instead, and works 200°
 * → 160° → 42 minutes.
 *
 * Only the *size* folds. The direction does not: KH 13:2 already said a
 * course over 180° is added rather than subtracted, so the mirrored
 * pair share a magnitude and differ in sign. Showing both halves at
 * once keeps that from being lost, since it is the natural thing for a
 * reader to over-generalise here.
 */
import React, { useState } from 'react';
import InteractiveCard, { PresetButton } from './InteractiveCard';
import { correctionWithTrace } from '../../../lib/maslulTable';

function formatMin(deg) {
  const total = Math.round(deg * 60);
  const d = Math.floor(total / 60);
  const m = total - d * 60;
  return d > 0 ? `${d}° ${m}'` : `${m}'`;
}

export default function FoldPastHalfCircle() {
  const [course, setCourse] = useState(200);

  const folded = course > 180 ? 360 - course : course;
  const trace = correctionWithTrace(course);
  const partner = course > 180 ? 360 - course : 360 - course;

  return (
    <InteractiveCard
      title="Folding a course past half a circle"
      source="KH 13:5"
      blurb="the table stops at 180°, so bigger courses are read from their mirror"
    >
      <label className="block">
        <span className="text-xs font-bold text-[var(--color-text-secondary)]">
          Course — {course}°
        </span>
        <input
          type="range"
          min="181"
          max="359"
          value={course}
          onChange={(e) => setCourse(Number(e.target.value))}
          className="mt-1 w-full accent-[var(--color-accent)]"
          aria-label="Course in degrees, past 180"
        />
      </label>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="text-xs text-[var(--color-text-secondary)]">His example:</span>
        <PresetButton onClick={() => setCourse(200)}>200°</PresetButton>
      </div>

      <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="font-mono text-sm">
          360° − {course}° = <span className="text-[var(--color-accent)]">{folded}°</span>
        </div>
        <div className="mt-1 font-mono text-sm">
          The table at {folded}° gives{' '}
          <span className="font-bold text-[var(--color-gold)]">{formatMin(trace.correction)}</span>
        </div>
        {course === 200 && (
          <div className="mt-2 text-xs text-[var(--color-accent)]">
            ✓ KH 13:5 works exactly this: 200° folds to 160°, whose answer is 42 minutes.
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-[var(--color-border)] p-2">
          <div className="text-[var(--color-text-secondary)]">Course {folded}°</div>
          <div className="font-mono text-sm text-[var(--color-gold)]">
            {formatMin(trace.correction)}
          </div>
          <div className="mt-0.5 text-[10px] text-[var(--color-text-secondary)]">
            under 180° — <strong>subtracted</strong> from the mean
          </div>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] p-2">
          <div className="text-[var(--color-text-secondary)]">Course {course}°</div>
          <div className="font-mono text-sm text-[var(--color-gold)]">
            {formatMin(trace.correction)}
          </div>
          <div className="mt-0.5 text-[10px] text-[var(--color-text-secondary)]">
            over 180° — <strong>added</strong> to the mean
          </div>
        </div>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Notice what does <em>not</em> fold. The two courses share a correction of the same size,
        but not the same direction — halacha 2 settled that, and the folding rule does not undo
        it. Same distance from the far point, opposite side of the circle.
      </p>
    </InteractiveCard>
  );
}
