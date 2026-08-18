/**
 * EpochCounter — days elapsed since the Rambam's starting point. [R] KH 11:16
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **crossing** (fixed calendar → astronomical)
 *  SURFACE CATEGORY: internal UI (teaching interactive)
 * ═══════════════════════════════════════════════════════════════════
 *
 * KH 11:16 fixes the origin every later calculation is measured from:
 * the eve of Thursday, 3 Nisan 4938. Every mean position in chapters
 * 12-17 is "the position at that moment, plus the daily motion times
 * the number of days since". This card produces that number.
 *
 * It calls the engine's own `daysFromEpoch` rather than differencing
 * dates, which matters more than it looks: the count is a *Hebrew*
 * calendar day count, and routing it through civil dates has produced
 * off-by-one bugs in this project before. See engine/epochDays.js for
 * why that boundary is drawn where it is.
 */
import React, { useState, useMemo } from 'react';
import InteractiveCard from './InteractiveCard';
import { daysFromEpoch, HDate } from '../../../engine/epochDays';
import { CONSTANTS } from '../../../engine/constants';

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function EpochCounter() {
  const [iso, setIso] = useState(todayIso);

  const info = useMemo(() => {
    const parts = iso.split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
    const [y, m, d] = parts;
    // Construct at noon local time so a timezone shift cannot slide the
    // date across a midnight boundary before hebcal sees it.
    const date = new Date(y, m - 1, d, 12, 0, 0);
    if (Number.isNaN(date.getTime())) return null;
    try {
      const hd = new HDate(date);
      // hd.toString() is the same rendering the engine's own epoch step
      // uses (see engine/sunCalculations.js), so the two agree on screen.
      return { days: daysFromEpoch(date), hebrew: hd.toString() };
    } catch {
      return null;
    }
  }, [iso]);

  const { year, month, day } = CONSTANTS.EPOCH_HEBREW;

  return (
    <InteractiveCard
      title="How many days since the starting point?"
      source="KH 11:16"
      blurb="every mean position in chapters 12-17 is counted from this one moment"
    >
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="text-xs font-bold text-[var(--color-text-secondary)]">
          The starting point (העיקר)
        </div>
        <div className="mt-1 text-sm">
          The eve of Thursday, <strong>{day} {month} {year}</strong> from creation
        </div>
        <div className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
          = year 1489 of contracts, and 1109 years after the destruction of the Second Temple.
        </div>
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-bold text-[var(--color-text-secondary)]">
          Count forward to
        </span>
        <input
          type="date"
          value={iso}
          onChange={(e) => setIso(e.target.value)}
          className="mt-1 block rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 font-mono text-sm"
        />
      </label>

      {info ? (
        <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
          <div className="font-mono text-2xl font-bold text-[var(--color-gold)]">
            {info.days.toLocaleString()}
          </div>
          <div className="text-xs text-[var(--color-text-secondary)]">
            days from the starting point to {info.hebrew}
          </div>
        </div>
      ) : (
        <div className="mt-3 text-xs text-[var(--color-text-secondary)]">
          Enter a valid date.
        </div>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        This is a whole-day count on the Hebrew calendar, which is what KH 12:1 asks for — not
        an elapsed span of mean lunar months, and not a difference between civil dates. A
        Hebrew date begins at nightfall, so the day this returns is the one that was current on
        the evening of the date you chose.
      </p>
    </InteractiveCard>
  );
}
