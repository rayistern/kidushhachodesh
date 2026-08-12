/**
 * InterpolateRows — sharing out the difference. [R] KH 13:7
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching interactive)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The table is published every ten degrees. KH 13:7 works 65°: between
 * 60° (1°41') and 70° (1°51') lie ten minutes across ten degrees, so a
 * degree is worth a minute, and 65° gives 1°46'.
 *
 * The card draws the two bracketing rows as a strip so "five degrees
 * along, so five minutes up" is something to see rather than only to
 * follow. Note the per-degree rate is not a constant across the table —
 * it is 2' near the ends and under 1' near the peak — which is why the
 * halacha computes it from the neighbours each time rather than giving
 * one number.
 */
import React, { useState } from 'react';
import InteractiveCard, { PresetButton } from './InteractiveCard';
import { correctionWithTrace } from '../../../lib/maslulTable';

function formatMin(deg) {
  const total = Math.round(deg * 60 * 100) / 100;
  const d = Math.floor(total / 60);
  const m = total - d * 60;
  const mStr = Number.isInteger(m) ? m : m.toFixed(1);
  return d > 0 ? `${d}° ${mStr}'` : `${mStr}'`;
}

export default function InterpolateRows() {
  const [course, setCourse] = useState(65);
  const trace = correctionWithTrace(course);

  if (trace.exact || !trace.lo) {
    return (
      <InteractiveCard
        title="Reading between the rows"
        source="KH 13:7"
        blurb="the table is published every ten degrees — everything between is shared out"
      >
        <Slider course={course} setCourse={setCourse} />
        <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
          {course}° is tabulated directly — nothing to share out. Move the slider off a multiple
          of ten.
        </p>
      </InteractiveCard>
    );
  }

  const along = trace.effective - trace.lo.maslul;
  const gap = trace.hi.correction - trace.lo.correction;

  return (
    <InteractiveCard
      title="Reading between the rows"
      source="KH 13:7"
      blurb="the table is published every ten degrees — everything between is shared out"
    >
      <Slider course={course} setCourse={setCourse} />

      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="text-xs text-[var(--color-text-secondary)]">His example:</span>
        <PresetButton onClick={() => setCourse(65)}>65°</PresetButton>
      </div>

      {/* The bracket, as a strip */}
      <div className="mt-4">
        <div className="relative h-10">
          <div className="absolute inset-x-0 top-4 h-px bg-[var(--color-border)]" />
          <div
            className="absolute top-[13px] h-[9px] w-px bg-[var(--color-accent)]"
            style={{ left: '0%' }}
          />
          <div
            className="absolute top-[13px] h-[9px] w-px bg-[var(--color-accent)]"
            style={{ left: '100%' }}
          />
          <div
            className="absolute top-2 h-[17px] w-[3px] rounded bg-[var(--color-gold)]"
            style={{ left: `calc(${(along / 10) * 100}% - 1.5px)` }}
          />
          <span className="absolute left-0 top-0 -translate-x-1/2 font-mono text-[10px] text-[var(--color-text-secondary)]">
            {trace.lo.maslul}°
          </span>
          <span className="absolute right-0 top-0 translate-x-1/2 font-mono text-[10px] text-[var(--color-text-secondary)]">
            {trace.hi.maslul}°
          </span>
          <span
            className="absolute top-6 -translate-x-1/2 font-mono text-[10px] font-bold text-[var(--color-gold)]"
            style={{ left: `${(along / 10) * 100}%` }}
          >
            {trace.effective}°
          </span>
        </div>
        <div className="flex justify-between font-mono text-[11px] text-[var(--color-accent)]">
          <span>{formatMin(trace.lo.correction)}</span>
          <span>{formatMin(trace.hi.correction)}</span>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-xs leading-relaxed">
        <div>
          Between {trace.lo.maslul}° and {trace.hi.maslul}° the answer moves{' '}
          <strong className="text-[var(--color-text)]">{formatMin(gap)}</strong> across ten
          degrees — so each degree is worth{' '}
          <strong className="text-[var(--color-text)]">{formatMin(trace.perDegree)}</strong>.
        </div>
        <div className="mt-1">
          {trace.effective}° is {along} past {trace.lo.maslul}°, so add {along} ×{' '}
          {formatMin(trace.perDegree)} = {formatMin(along * trace.perDegree)} to{' '}
          {formatMin(trace.lo.correction)}:
        </div>
        <div className="mt-1 font-mono text-base font-bold text-[var(--color-gold)]">
          {formatMin(trace.correction)}
        </div>
        {course === 65 && (
          <div className="mt-2 text-[var(--color-accent)]">
            ✓ KH 13:7 reaches exactly this: "the angle of a course of 65 degrees will be 1 degree
            and 46 minutes".
          </div>
        )}
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        The per-degree rate is not fixed across the table — it is about 2' a degree near the
        ends and under 1' near the peak, because the arch flattens at the top. That is why the
        halacha works it out from the two neighbours each time instead of quoting one number.
      </p>
    </InteractiveCard>
  );
}

function Slider({ course, setCourse }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-[var(--color-text-secondary)]">
        Course — {course}°
      </span>
      <input
        type="range"
        min="1"
        max="179"
        value={course}
        onChange={(e) => setCourse(Number(e.target.value))}
        className="mt-1 w-full accent-[var(--color-accent)]"
        aria-label="Course in degrees"
      />
    </label>
  );
}
