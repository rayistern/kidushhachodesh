/**
 * SeasonLadder — KH 9-10: two traditions for the solar year, side by side.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **fixed-calendar** — [R] KH 9:1-5, 10:1-5
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Shmuel's year (365d 6h exactly) and Rav Adda's (365d 5h 997p 48m,
 * the year that makes the 19-year cycle come out EXACT — pinned in
 * ch910.test.js). The card shows each tradition's constants, the
 * weekday-and-hour of tekufat Nisan for any year by Shmuel's method,
 * and the honest row: both run ahead of the real sun, and the Rambam
 * says so himself at 10:7.
 *
 * Moments (רגעים) are 1/76 of a chelek — Rav Adda's system needs a
 * finer unit precisely because his year is not a round number of
 * quarter-days.
 */
import React, { useState, useMemo } from 'react';
import InteractiveCard, { PresetButton } from '../../text/interactives/InteractiveCard';
import { PARTS_PER_HOUR, PARTS_PER_DAY } from '../../../engine/fixedCalendar/constants';
import {
  shmuelNisanRd,
  addaNisanRd,
  rambamTrueNisanRd,
  realNisanRd,
  rdToDate,
} from '../../../lib/tekufotCompare';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Shabbat'];
const WEEK_PARTS = 7 * PARTS_PER_DAY;

/**
 * Shmuel's tekufat Nisan for a Hebrew year, as weekday/hour/parts.
 *
 * Anchor (KH 9:3): the tekufah of Nisan of year 1 fell 7d 9h 642p
 * BEFORE the molad of Nisan of year 1 (BaHaRaD + 6 months). Each year
 * adds exactly 365¼ days = 52 weeks + 1d 6h.
 */
export function shmuelTekufatNisan(year) {
  // Molad Nisan year 1, in parts within the week: BaHaRaD + 6 months.
  const BAHARAD = 1 * PARTS_PER_DAY + 5 * PARTS_PER_HOUR + 204; // day index 1 = Monday
  const MONTH = 29 * PARTS_PER_DAY + 12 * PARTS_PER_HOUR + 793;
  const moladNisan1 = (BAHARAD + 6 * MONTH) % WEEK_PARTS;
  const anchor =
    ((moladNisan1 - (7 * PARTS_PER_DAY + 9 * PARTS_PER_HOUR + 642)) % WEEK_PARTS + WEEK_PARTS) %
    WEEK_PARTS;
  // 365¼ days mod the week = 1d 6h.
  const YEARLY = 1 * PARTS_PER_DAY + 6 * PARTS_PER_HOUR;
  const parts = (anchor + (year - 1) * YEARLY) % WEEK_PARTS;
  const dayIndex = Math.floor(parts / PARTS_PER_DAY);
  const rest = parts - dayIndex * PARTS_PER_DAY;
  return {
    dayIndex,
    dayName: DAY_NAMES[dayIndex],
    hours: Math.floor(rest / PARTS_PER_HOUR),
    parts: rest % PARTS_PER_HOUR,
  };
}

const TRADITIONS = [
  {
    name: "Shmuel's year",
    ref: 'KH 9:1',
    year: '365 days, 6 hours exactly',
    season: '91 days, 7½ hours',
    cycle: 'overshoots the 19-year cycle by 1h 485p',
    repeat: 'repeats its weekdays every 28 years',
  },
  {
    name: "Rav Adda's year",
    ref: 'KH 10:1',
    year: '365d 5h 997p and 48 moments',
    season: '91d 7h 519p 31m',
    cycle: 'fits the 19-year cycle EXACTLY — zero left over',
    repeat: 'a moment (רגע) is 1/76 of a part',
  },
];

export default function SeasonLadder() {
  const [year, setYear] = useState(4930); // his own worked year, KH 9:5
  const t = shmuelTekufatNisan(year);

  return (
    <InteractiveCard
      title="Two years for one sun"
      source="KH 9:1-5, 10:1-5"
      blurb="Shmuel's round quarter-day against Rav Adda's exact fit"
      defaultOpen
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {TRADITIONS.map((tr) => (
          <div key={tr.name} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
            <div className="text-xs font-bold">
              {tr.name} <span className="font-mono text-[10px] opacity-60">{tr.ref}</span>
            </div>
            <div className="mt-1 font-mono text-sm text-[var(--color-gold)]">{tr.year}</div>
            <div className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
              a season: {tr.season}
              <br />
              {tr.cycle}
              <br />
              {tr.repeat}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="block">
          <span className="text-xs font-bold text-[var(--color-text-secondary)]">
            Tekufat Nisan (Shmuel) for Hebrew year
          </span>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Math.max(1, Math.floor(Number(e.target.value) || 4930)))}
            className="mt-1 block w-28 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 font-mono text-sm"
          />
        </label>
        <PresetButton onClick={() => setYear(4930)} title="The year of his own example, KH 9:5">
          His year (4930)
        </PresetButton>
        <PresetButton onClick={() => setYear(5786)}>This era (5786)</PresetButton>
      </div>
      <div className="mt-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="font-mono text-lg font-bold text-[var(--color-gold)]">
          {t.dayName}, {t.hours}h {t.parts}p
        </div>
        <div className="text-[11px] text-[var(--color-text-secondary)]">
          anchor 7–9–642 before the first molad of Nisan, plus 1 day 6 hours per year — each
          Shmuel year is exactly 52 weeks and a quarter-day and a day, so only the weekday walk
          matters.
        </div>
      </div>

      {/* The real numbers, at the reader's request: the same tekufah
          four ways — his two traditions, his own true sun (the third
          and finest method, KH 13:11), and the sky. Heavy scans, so
          memoized on the year. */}
      {(() => {
        const rows = useMemo(() => {
          const real = realNisanRd(year);
          const fmt = (rd) => {
            if (rd == null) return { date: '—', gap: '' };
            const d = rdToDate(rd);
            return {
              date: d.toISOString().slice(0, 10),
              gap: real == null ? '' : `${rd - real >= 0 ? '+' : '−'}${Math.abs(rd - real).toFixed(1)}d vs the sky`,
            };
          };
          return [
            { who: "Shmuel (this chapter's)", tag: '[R]', ...fmt(shmuelNisanRd(year)) },
            { who: "Rav Adda (chapter 10's)", tag: '[R]', ...fmt(addaNisanRd(year)) },
            { who: "the Rambam's own true sun (13:11)", tag: '[R]', ...fmt(rambamTrueNisanRd(year)) },
            { who: 'the real sky', tag: '[M]', ...fmt(real) },
          ];
        }, [year]);
        return (
          <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
            <div className="text-xs font-bold text-[var(--color-text-secondary)]">
              The real numbers — tekufat Nisan of {year}, four ways
            </div>
            <table className="mt-1.5 w-full text-xs">
              <tbody>
                {rows.map((r) => (
                  <tr key={r.who} className="border-b border-[var(--color-border)]/40 last:border-0">
                    <td className="py-1 pr-2 text-[var(--color-text-secondary)]">{r.who}</td>
                    <td className="py-1 pr-2 font-mono text-[var(--color-gold)]">{r.date}</td>
                    <td className="py-1 font-mono text-[10px] text-[var(--color-text-secondary)]">{r.gap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--color-text-secondary)]">
              Dates are civil (proleptic Gregorian). His own true-sun method beats both traditions
              by an order of magnitude — and Shmuel's drift went unnoticed for centuries because
              his year IS the Julian year, exactly 365¼ days, so the civil calendar drifted in
              lockstep with him until the Gregorian reform.
            </p>
          </div>
        );
      })()}

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        The honest row, in his own words (KH 10:7): <em>both</em> reckonings run on the mean sun (the pretend, steady-average sun),
        and against the true sun the spring equinox falls about two days earlier than either
        computes. And both years are longer than the real one — Shmuel's by about 11 minutes a
        year, Rav Adda's by about 6½ — so the computed seasons drift later against the real sky
        by roughly a day per 128 and 232 years respectively. He knew the first fact and said it;
        the drift is what it looks like eight centuries on.
      </p>
    </InteractiveCard>
  );
}
