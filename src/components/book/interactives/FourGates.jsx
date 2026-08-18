/**
 * FourGates — KH 7's four postponements, walked one gate at a time.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **fixed-calendar** — [R] KH 7:1-5
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The molad proposes a day; the four rules dispose. The card walks a
 * chosen year through each rule, shows which fired, and then — the
 * point of the whole exercise — checks the result against the
 * calendar actually in use. lib/fixedYear pins that agreement across
 * 400 years; this card lets the reader watch it happen on any one.
 */
import React, { useState } from 'react';
import InteractiveCard, { PresetButton } from '../../text/interactives/InteractiveCard';
import { moladTishrei, roshHashanah, actualRoshHashanahDay } from '../../../lib/fixedYear';
import { isHebrewLeapYear } from '../../../engine/fixedCalendar/months';

const DAY_NAMES = ['—', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Shabbat'];

const RULES = [
  {
    id: 'molad-zaken',
    name: 'The old molad',
    hebrew: 'מולד זקן',
    ref: 'KH 7:2',
    test: 'molad at noon (18h from evening) or later',
    effect: 'push Rosh HaShanah one day',
  },
  {
    id: 'gatrad',
    name: 'The Tuesday rule',
    hebrew: 'ג"ט ר"ד',
    ref: 'KH 7:4',
    test: 'common year, molad Tuesday at 9h 204p or later',
    effect: 'Rosh HaShanah moves to Thursday',
  },
  {
    id: 'betutkpat',
    name: 'The after-leap Monday rule',
    hebrew: 'בט"ו תקפ"ט',
    ref: 'KH 7:5',
    test: 'year after a leap year, molad Monday at 15h 589p or later',
    effect: 'Rosh HaShanah moves to Tuesday',
  },
  {
    id: 'lo-adu',
    name: 'Never Sunday, Wednesday, Friday',
    hebrew: 'לא אד"ו ראש',
    ref: 'KH 7:1',
    test: 'the day reached so far is one of the three',
    effect: 'push one more day',
  },
];

export default function FourGates() {
  const [year, setYear] = useState(5786);
  const molad = moladTishrei(year);
  const result = roshHashanah(year);
  const actual = actualRoshHashanahDay(year);

  return (
    <InteractiveCard
      title="The molad proposes; four rules dispose"
      source="KH 7:1-5"
      blurb="from a molad to the day Rosh HaShanah actually falls"
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
        {/* One preset per behaviour, found by scanning rather than invented. */}
        <PresetButton onClick={() => setYear(5787)} title="No rule fires">no rule (5787)</PresetButton>
        <PresetButton onClick={() => setYear(5786)} title="Molad at 18h 187p">old molad (5786)</PresetButton>
        <PresetButton onClick={() => setYear(5788)} title="Molad on a Friday">אד"ו (5788)</PresetButton>
        <PresetButton onClick={() => setYear(5789)} title="Tuesday 9h 368p, common year">
          Tuesday rule (5789)
        </PresetButton>
        <PresetButton onClick={() => setYear(5688)} title="Monday 16h 271p after a leap year">
          after-leap (5688)
        </PresetButton>
      </div>

      <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="text-[11px] text-[var(--color-text-secondary)]">
          The molad of Tishrei {year} {isHebrewLeapYear(year) ? '(a leap year)' : isHebrewLeapYear(year - 1) ? '(follows a leap year)' : ''}
        </div>
        <div className="mt-0.5 font-mono text-lg font-bold">
          {DAY_NAMES[molad.day]}, {molad.hours}h {molad.parts}p
        </div>
      </div>

      <ol className="mt-3 space-y-1.5">
        {RULES.map((rule) => {
          const fired = result.applied.includes(rule.id);
          return (
            <li
              key={rule.id}
              className={`rounded border px-2.5 py-1.5 text-xs ${
                fired
                  ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10'
                  : 'border-[var(--color-border)] bg-[var(--color-bg)] opacity-70'
              }`}
            >
              <span className="font-bold">
                {rule.name} <span className="hebrew-text">{rule.hebrew}</span>
              </span>{' '}
              <span className="font-mono text-[10px] opacity-60">{rule.ref}</span>
              <span className="mt-0.5 block text-[11px] text-[var(--color-text-secondary)]">
                {rule.test} → {rule.effect} —{' '}
                <strong className={fired ? 'text-[var(--color-gold)]' : ''}>
                  {fired ? 'FIRED' : 'not this year'}
                </strong>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-3 rounded-lg border-2 border-[var(--color-accent)]/50 bg-[var(--color-bg)] p-3">
        <div className="text-[11px] text-[var(--color-text-secondary)]">
          Rosh HaShanah {year} therefore falls on
        </div>
        <div className="mt-0.5 text-xl font-bold text-[var(--color-accent)]">
          {DAY_NAMES[result.day]}
        </div>
        <div className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
          {result.day === actual ? (
            <span className="text-[var(--color-accent)]">
              ✓ and that is the day the calendar in use puts it — his rules, checked against 400
              consecutive years, never miss once.
            </span>
          ) : (
            <span>✗ disagrees with the calendar in use — which would be a bug in this card.</span>
          )}
        </div>
      </div>
    </InteractiveCard>
  );
}
