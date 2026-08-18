/**
 * YearShapeCard — KH 8: two Rosh HaShanahs fix every month between them.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **fixed-calendar** — [R] KH 8:5-10
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The month grid is generated from KH 8:5-6's rule (alternate from
 * Tishrei; Marcheshvan and Kislev carry the adjustment), and the
 * card's totals are pinned against the year's true length in
 * ch8.test.js — so the picture cannot drift from the calendar.
 */
import React, { useState } from 'react';
import InteractiveCard, { PresetButton } from '../../text/interactives/InteractiveCard';
import { roshHashanah, actualRoshHashanahDay, yearShape } from '../../../lib/fixedYear';

const DAY_NAMES = ['—', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Shabbat'];

/** KH 8:5-6 — the month lengths for a year of a given shape. */
export function monthGrid(shape) {
  const months = [
    ['Tishrei', 30],
    ['Marcheshvan', shape.cheshvanFull ? 30 : 29],
    ['Kislev', shape.kislevFull ? 30 : 29],
    ['Tevet', 29],
    ["Sh'vat", 30],
  ];
  if (shape.leap) {
    months.push(['Adar I', 30], ['Adar II', 29]);
  } else {
    months.push(['Adar', 29]);
  }
  months.push(['Nisan', 30], ['Iyar', 29], ['Sivan', 30], ['Tammuz', 29], ['Av', 30], ['Elul', 29]);
  return months;
}

export default function YearShapeCard() {
  const [year, setYear] = useState(5786);
  const shape = yearShape(year);
  const thisRH = actualRoshHashanahDay(year);
  const nextRH = actualRoshHashanahDay(year + 1);
  const between = (((nextRH - thisRH - 1) % 7) + 7) % 7;
  const grid = monthGrid(shape);
  const total = grid.reduce((a, [, n]) => a + n, 0);

  const kindName =
    shape.kind === 'lacking' ? 'lacking (חסרה)' : shape.kind === 'complete' ? 'complete (שלמה)' : 'in order (כסדרה)';

  return (
    <InteractiveCard
      title="Two Rosh HaShanahs fix every month between them"
      source="KH 8:5-10"
      blurb="the year's whole shape from one weekday gap"
      defaultOpen
    >
      <div className="flex flex-wrap items-end gap-2">
        <label className="block">
          <span className="text-xs font-bold text-[var(--color-text-secondary)]">Hebrew year</span>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Math.max(2, Math.floor(Number(e.target.value) || 5786)))}
            className="mt-1 block w-28 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 font-mono text-sm"
          />
        </label>
        <PresetButton onClick={() => setYear(5786)}>5786</PresetButton>
        <PresetButton onClick={() => setYear(4938)} title="The epoch year of chapters 11-19">
          His year (4938)
        </PresetButton>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5">
          <div className="text-[10px] text-[var(--color-text-secondary)]">Rosh HaShanah {year}</div>
          <div className="font-mono text-sm font-bold">{DAY_NAMES[thisRH]}</div>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5">
          <div className="text-[10px] text-[var(--color-text-secondary)]">Rosh HaShanah {year + 1}</div>
          <div className="font-mono text-sm font-bold">{DAY_NAMES[nextRH]}</div>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5">
          <div className="text-[10px] text-[var(--color-text-secondary)]">days between the two weekdays</div>
          <div className="font-mono text-sm font-bold text-[var(--color-gold)]">{between}</div>
        </div>
      </div>

      {/* HOW we know it is (or is not) a leap year — a reader pointed
          out the card asserted it without the derivation, and the whole
          diagram hinges on it. KH 6:11: position in the 19-year cycle. */}
      <div className="mt-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5 text-[11px] text-[var(--color-text-secondary)]">
        Leap or common? Divide by nineteen: {year} = {Math.floor((year - 1) / 19)} full cycles +
        year <strong className="font-mono">{((year - 1) % 19) + 1}</strong> of the next. The leap
        positions are 3, 6, 8, 11, 14, 17, 19 —{' '}
        <strong>
          {((year - 1) % 19) + 1} is {shape.leap ? 'one of them: a leap year' : 'not one of them: a common year'}
        </strong>{' '}
        (KH 6:11).
      </div>

      <div className="mt-2 rounded-lg border-2 border-[var(--color-accent)]/50 bg-[var(--color-bg)] p-3">
        <div className="text-[11px] text-[var(--color-text-secondary)]">
          So {year} is {shape.leap ? 'a leap year' : 'a common year'} of {shape.length} days —
        </div>
        <div className="mt-0.5 text-lg font-bold text-[var(--color-accent)]">{kindName}</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {grid.map(([name, len]) => (
          <div
            key={name}
            className={`rounded border px-2 py-1 text-center text-[11px] ${
              len === 30
                ? 'border-[var(--color-gold)]/60 bg-[var(--color-gold)]/10'
                : 'border-[var(--color-border)] bg-[var(--color-bg)]'
            }`}
          >
            <div>{name}</div>
            <div className="font-mono font-bold">{len}</div>
          </div>
        ))}
      </div>
      <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
        Gold = full (30 days). Total: <strong className="font-mono">{total}</strong> days — the
        months alternate from Tishrei on, and only Marcheshvan and Kislev ever change, which is
        the whole adjusting room the calendar has (KH 8:5-6).
      </p>
    </InteractiveCard>
  );
}
