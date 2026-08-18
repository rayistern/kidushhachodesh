/**
 * BetweenDays — KH 8:7-9's one tricky step, on its own card.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **fixed-calendar** — [R] KH 8:7-9
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * "Days between the two weekdays" counts EXCLUSIVELY — Thursday to
 * Monday is three (Friday, Shabbat, Sunday), not four. His own worked
 * example turns on it, a first draft of this project's tests got it
 * wrong, and a reader asked for it as its own calculator. The pickers
 * offer only the four days Rosh HaShanah can fall on (never Sunday,
 * Wednesday or Friday — chapter 7), and the verdict row shows what the
 * gap means for a common year and a leap year — including the pairs
 * the fixed calendar never produces.
 */
import React, { useState } from 'react';
import InteractiveCard from '../../text/interactives/InteractiveCard';

const ALLOWED = [2, 3, 5, 7]; // Monday, Tuesday, Thursday, Shabbat
const DAY_NAMES = ['—', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Shabbat'];

/** Days strictly between two weekdays, walking forward (KH 8:7). */
export function daysBetween(from, to) {
  return (((to - from - 1) % 7) + 7) % 7;
}

/** KH 8:7-8 — what a gap means, per year kind. null = cannot occur. */
export function shapeForGap(between, leap) {
  const table = leap
    ? { 4: 'lacking', 5: 'in order', 6: 'complete' }
    : { 2: 'lacking', 3: 'in order', 4: 'complete' };
  return table[between] ?? null;
}

export default function BetweenDays() {
  const [from, setFrom] = useState(5); // his example: Thursday…
  const [to, setTo] = useState(2); // …to Monday
  const between = daysBetween(from, to);

  const walked = [];
  for (let i = 1; i <= between; i++) walked.push(DAY_NAMES[((from - 1 + i) % 7) + 1]);

  const common = shapeForGap(between, false);
  const leap = shapeForGap(between, true);

  const Picker = ({ value, onChange, label }) => (
    <div>
      <div className="text-xs font-bold text-[var(--color-text-secondary)]">{label}</div>
      <div className="mt-1 flex gap-1">
        {ALLOWED.map((d) => (
          <button
            key={d}
            onClick={() => onChange(d)}
            className={`rounded px-2 py-1 text-xs ${
              value === d
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
            }`}
          >
            {DAY_NAMES[d]}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <InteractiveCard
      title="Counting the days between"
      source="KH 8:7-9"
      blurb="between means BETWEEN — Thursday to Monday is three, not four"
      defaultOpen
    >
      <div className="flex flex-wrap gap-4">
        <Picker value={from} onChange={setFrom} label="This Rosh HaShanah" />
        <Picker value={to} onChange={setTo} label="Next Rosh HaShanah" />
      </div>
      <p className="mt-1 text-[10px] text-[var(--color-text-secondary)]">
        Only four days to pick from, because Rosh HaShanah never falls on Sunday, Wednesday or
        Friday (chapter 7).
      </p>

      <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="text-[11px] text-[var(--color-text-secondary)]">
          {DAY_NAMES[from]} → {DAY_NAMES[to]}: the days strictly between are{' '}
          {between === 0 ? 'none at all' : walked.join(', ')}
        </div>
        <div className="mt-0.5 font-mono text-xl font-bold text-[var(--color-gold)]">
          {between} between
        </div>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5 text-xs">
          <div className="text-[10px] text-[var(--color-text-secondary)]">if the year is common</div>
          {common ? (
            <div className="font-bold text-[var(--color-accent)]">the year runs {common}</div>
          ) : (
            <div className="text-[var(--color-text-secondary)]">
              cannot occur — no common year produces this pair; the postponements forbid it
            </div>
          )}
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5 text-xs">
          <div className="text-[10px] text-[var(--color-text-secondary)]">if the year is leap</div>
          {leap ? (
            <div className="font-bold text-[var(--color-accent)]">the year runs {leap}</div>
          ) : (
            <div className="text-[var(--color-text-secondary)]">
              cannot occur — no leap year produces this pair; the postponements forbid it
            </div>
          )}
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        The counting is exclusive on both ends, and that is the whole trap: his example (8:9) runs
        Thursday to Monday and counts <em>three</em> — Friday, Shabbat, Sunday — where the
        instinct says four. Common years use gaps of 2, 3 and 4; leap years 4, 5 and 6; anything
        else simply never happens, which is one of the quiet jobs chapter 7's postponements do.
      </p>
    </InteractiveCard>
  );
}
