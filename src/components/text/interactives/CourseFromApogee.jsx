/**
 * CourseFromApogee — the subtraction KH 13:1 opens with.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching interactive)
 * ═══════════════════════════════════════════════════════════════════
 *
 * One step, deliberately: mean position, less apogee, gives the course.
 * The rest of the chapter is a function of this single number, and the
 * halacha does nothing else, so neither does this card.
 *
 * The subtraction is shown in sexagesimal with its borrows, because
 * that is the arithmetic KH 11:11-12 taught and this is the first place
 * in the book where the reader has to actually use it.
 */
import React, { useState, useMemo } from 'react';
import InteractiveCard, { PresetButton } from './InteractiveCard';
import { calculateSunMeanLongitude, calculateSunApogee } from '../../../engine/sunCalculations';
import { formatDms, normalizeDegrees } from '../../../engine/dmsUtils';
import { decimalToSexagesimal, subtractSexagesimal, formatSexagesimal } from '../../../lib/sexagesimal';
import { daysFromEpoch } from '../../../engine/epochDays';

function todayDays() {
  const now = new Date();
  return daysFromEpoch(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12));
}

export default function CourseFromApogee() {
  const [days, setDays] = useState(100);

  const { mean, apogee, course, steps } = useMemo(() => {
    const m = calculateSunMeanLongitude(days).result;
    const a = calculateSunApogee(days).result;
    const { steps: trace } = subtractSexagesimal(decimalToSexagesimal(m), decimalToSexagesimal(a));
    return { mean: m, apogee: a, course: normalizeDegrees(m - a), steps: trace };
  }, [days]);

  return (
    <InteractiveCard
      title="Take the apogee away from the mean"
      source="KH 13:1"
      blurb="one subtraction — and everything else in the chapter depends on its answer"
    >
      <div className="flex flex-wrap items-end gap-3">
        <label>
          <span className="block text-xs font-bold text-[var(--color-text-secondary)]">
            Days from the starting point
          </span>
          <input
            type="number"
            min="0"
            value={days}
            onChange={(e) => setDays(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
            className="mt-1 w-32 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-right font-mono text-sm"
          />
        </label>
        <PresetButton onClick={() => setDays(100)}>KH 13:9 example (100)</PresetButton>
        <PresetButton onClick={() => setDays(todayDays())}>Today</PresetButton>
      </div>

      <div className="mt-4 space-y-1 font-mono text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-[var(--color-text-secondary)]">Mean position</span>
          <span>{formatDms(mean)}</span>
        </div>
        <div className="flex justify-between gap-4 border-b border-[var(--color-border)] pb-1">
          <span className="text-[var(--color-text-secondary)]">− Apogee</span>
          <span>{formatDms(apogee)}</span>
        </div>
        <div className="flex justify-between gap-4 pt-1">
          <span className="font-bold">Course (מסלול)</span>
          <span className="font-bold text-[var(--color-gold)]">{formatDms(course)}</span>
        </div>
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-[var(--color-accent)]">
          Show the subtraction, borrow by borrow (KH 11:11-12)
        </summary>
        <ol className="mt-2 space-y-1.5">
          {steps.map((s, i) => (
            <li key={i} className="text-[11px] leading-relaxed">
              <strong className="text-[var(--color-text)]">{s.label}: </strong>
              <span className="text-[var(--color-text-secondary)]">{s.detail}</span>
            </li>
          ))}
        </ol>
      </details>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        The course answers one question: how far round from its far point has the sun come? Its
        size sets how big the correction is, and whether it is over or under 180° sets which way
        the correction is applied.
      </p>
    </InteractiveCard>
  );
}
