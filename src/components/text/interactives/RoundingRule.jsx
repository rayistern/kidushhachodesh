/**
 * RoundingRule — how coarse the course is allowed to be. [R] KH 13:9-10
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching interactive)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Two instructions, easy to skim past, that decide how precise the
 * whole chapter is:
 *
 *   13:9   the minutes of the *course* are discarded before the table
 *          is read — under thirty dropped, thirty or more carried.
 *   13:10  the seconds of a *position* are not to be attended to at
 *          all, in this or any sighting calculation.
 *
 * This is KH 11:5-6's licence being spent: he is not failing to be
 * precise, he is declining to be, having judged the residue incapable
 * of changing whether the moon is seen. The card puts a number on what
 * is given up so the reader can weigh that judgement instead of taking
 * it on faith.
 */
import React, { useState, useMemo } from 'react';
import InteractiveCard, { PresetButton } from './InteractiveCard';
import { roundCourse, correctionWithTrace } from '../../../lib/maslulTable';

function formatMin(deg) {
  const total = Math.round(deg * 60 * 100) / 100;
  const d = Math.floor(total / 60);
  const m = total - d * 60;
  const mStr = Number.isInteger(m) ? m : m.toFixed(2);
  return d > 0 ? `${d}° ${mStr}'` : `${mStr}'`;
}

export default function RoundingRule() {
  // The Rambam's own course, from the worked example: 18° 52' 2".
  const [degrees, setDegrees] = useState(18);
  const [minutes, setMinutes] = useState(52);

  const { rounded, roundedCorrection, exactCorrection, costArcsec } = useMemo(() => {
    const exact = degrees + minutes / 60;
    const r = roundCourse(exact);
    const rc = correctionWithTrace(r).correction;
    const ec = correctionWithTrace(exact).correction;
    return {
      rounded: r,
      roundedCorrection: rc,
      exactCorrection: ec,
      costArcsec: Math.abs(rc - ec) * 3600,
    };
  }, [degrees, minutes]);

  const carried = minutes >= 30;

  return (
    <InteractiveCard
      title="How much precision he deliberately throws away"
      source="KH 13:9-10"
      blurb="the course is read to whole degrees, and seconds are not attended to at all"
    >
      <div className="flex flex-wrap items-end gap-3">
        <label>
          <span className="block text-xs font-bold text-[var(--color-text-secondary)]">
            Course
          </span>
          <span className="mt-1 flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="179"
              value={degrees}
              onChange={(e) => setDegrees(Math.min(179, Math.max(0, Number(e.target.value) || 0)))}
              className="w-16 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-1.5 py-1 text-right font-mono text-sm"
              aria-label="Course degrees"
            />
            <span className="font-mono text-xs text-[var(--color-text-secondary)]">°</span>
            <input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => setMinutes(Math.min(59, Math.max(0, Number(e.target.value) || 0)))}
              className="w-16 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-1.5 py-1 text-right font-mono text-sm"
              aria-label="Course minutes"
            />
            <span className="font-mono text-xs text-[var(--color-text-secondary)]">'</span>
          </span>
        </label>
        <PresetButton
          onClick={() => {
            setDegrees(18);
            setMinutes(52);
          }}
          title="The course in his worked example"
        >
          His 18° 52'
        </PresetButton>
      </div>

      <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-xs leading-relaxed">
        <div>
          {minutes}′ is {carried ? 'thirty or more' : 'under thirty'}, so it{' '}
          {carried ? 'counts as another degree' : 'is dropped'}. Read the table at{' '}
          <strong className="font-mono text-[var(--color-gold)]">{rounded}°</strong>.
        </div>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div>
            <div className="text-[var(--color-text-secondary)]">His way — at {rounded}°</div>
            <div className="font-mono text-sm text-[var(--color-gold)]">
              {formatMin(roundedCorrection)}
            </div>
          </div>
          <div>
            <div className="text-[var(--color-text-secondary)]">
              Unrounded — at {degrees}° {minutes}′
            </div>
            <div className="font-mono text-sm text-[var(--color-silver)]">
              {formatMin(exactCorrection)}
            </div>
          </div>
        </div>
        <div className="mt-2 border-t border-[var(--color-border)] pt-2">
          The rounding costs{' '}
          <strong className="text-[var(--color-text)]">{costArcsec.toFixed(0)}″</strong> of the
          sun's position — {(costArcsec / 60).toFixed(2)} of a minute of arc.
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        The most this rule can ever cost is half a degree of course, and near the steepest part
        of the table that is worth about a minute of arc in the answer. Whether the new moon can
        be seen turns on angles of several degrees, so a minute cannot decide it.
      </p>
      <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        This is the licence of KH 11:5-6 being spent. He warned there that a reader would find
        approximations, and that they were chosen rather than overlooked — where the residue
        cannot change the verdict, he declines to chase it. Here is what that costs, in arcseconds.
      </p>
    </InteractiveCard>
  );
}
