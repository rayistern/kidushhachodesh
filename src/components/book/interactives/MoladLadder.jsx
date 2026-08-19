/**
 * MoladLadder — KH 6's whole method: one anchor, one interval, addition.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **fixed-calendar** — [R] KH 6:3-15
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Everything KH 6 does is adding one triple of numbers to another in
 * mixed units (7 weekdays / 24 hours / 1080 parts). The card shows the
 * published remainders, his own worked addition (6:7), and the live
 * molad of Tishrei for any year — with the day-hour-part triple the
 * chapters do all their arithmetic in.
 */
import React, { useState } from 'react';
import InteractiveCard, { PresetButton } from '../../text/interactives/InteractiveCard';
import { moladTishrei, moladTishreiLadder } from '../../../lib/fixedYear';

const DAY_NAMES = ['—', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Shabbat'];

/** The remainders he publishes, mod the week. */
const REMAINDERS = [
  { label: 'one month', triple: '1 – 12 – 793', ref: 'KH 6:5', note: '29d 12h 793p, with the four whole weeks thrown away' },
  { label: 'a common year (12 months)', triple: '4 – 8 – 876', ref: 'KH 6:5', note: 'twelve months, whole weeks thrown away' },
  { label: 'a leap year (13 months)', triple: '5 – 21 – 589', ref: 'KH 6:5', note: 'thirteen months, whole weeks thrown away' },
  { label: 'a 19-year cycle', triple: '2 – 16 – 595', ref: 'KH 6:12', note: 'twelve common + seven leap years' },
];

const t = (x) => `${x.day} – ${x.hours} – ${x.parts}`;

export default function MoladLadder() {
  const [year, setYear] = useState(5786);
  const molad = moladTishrei(year);
  const ladder = moladTishreiLadder(year);

  return (
    <InteractiveCard
      title="One anchor, one interval, and addition"
      source="KH 6:3-15"
      blurb="the molad of any month of any year, from arithmetic a child can check"
      defaultOpen
    >
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="text-xs font-bold text-[var(--color-text-secondary)]">
          The anchor — BaHaRaD (KH 6:8)
        </div>
        <div className="mt-0.5 font-mono text-sm">
          molad of Tishrei, year 1: <strong>Monday, 5 hours, 204 parts</strong>{' '}
          <span className="hebrew-text text-[var(--color-accent)]">בהר"ד</span>
        </div>
        <div className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">
          Hours count from the evening (6 PM); 1080 parts make an hour. Every molad ever is this
          anchor plus whole months of 29d 12h 793p.
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[360px] text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-secondary)]">
              <th className="py-1 pr-3 font-bold">Add, for…</th>
              <th className="py-1 pr-3 font-bold">day – hour – parts</th>
              <th className="py-1 font-bold" />
            </tr>
          </thead>
          <tbody>
            {REMAINDERS.map((r) => (
              <tr key={r.label} className="border-b border-[var(--color-border)]/40">
                <td className="py-1 pr-3">{r.label}</td>
                <td className="py-1 pr-3 font-mono text-[var(--color-gold)]">{r.triple}</td>
                <td className="py-1 text-[10px] text-[var(--color-text-secondary)]">
                  {r.note} <span className="font-mono opacity-60">{r.ref}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="text-xs font-bold text-[var(--color-text-secondary)]">
          His worked addition (KH 6:7)
        </div>
        <div className="mt-1 font-mono text-sm leading-relaxed">
          Nisan&nbsp;&nbsp;1 – 17 – 107
          <br />
          +&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1 – 12 – 793
          <br />
          <span className="text-[var(--color-gold)]">Iyar&nbsp;&nbsp;&nbsp;3 – 5 – 900</span>
        </div>
        <div className="mt-1 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
          Parts: 107 + 793 = 900, no carry. Hours: 17 + 12 = 29 — an extra day, five hours left.
          Days: 1 + 1, plus the carried day, is 3. The same borrow-and-carry as chapter 11's
          sixties, with different bases — sevens, twenty-fours, and 1080s.
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="block">
          <span className="text-xs font-bold text-[var(--color-text-secondary)]">
            Molad of Tishrei for Hebrew year
          </span>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Math.max(2, Math.floor(Number(e.target.value) || 5786)))}
            className="mt-1 block w-28 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 font-mono text-sm"
          />
        </label>
        <PresetButton onClick={() => setYear(5786)}>This era (5786)</PresetButton>
        <PresetButton onClick={() => setYear(4938)} title="The epoch year of chapters 11-19">
          His year (4938)
        </PresetButton>
      </div>
      <div className="mt-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="text-xs font-bold text-[var(--color-text-secondary)]">
          The whole ladder, climbed for Tishrei {year} (KH 6:12-14)
        </div>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[420px] font-mono text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-secondary)]">
                <th className="py-1 pr-3 font-bold">step</th>
                <th className="py-1 pr-3 font-bold">adds</th>
                <th className="py-1 font-bold">running total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--color-border)]/40">
                <td className="py-1 pr-3">
                  start at the anchor <span className="hebrew-text">בהר"ד</span>
                </td>
                <td className="py-1 pr-3 text-[var(--color-text-secondary)]">—</td>
                <td className="py-1">{t(ladder.anchor)}</td>
              </tr>
              {ladder.steps.map((s) => (
                <tr key={s.label} className="border-b border-[var(--color-border)]/40">
                  <td className="py-1 pr-3">
                    + {s.count} {s.label} × {t(s.each)}
                  </td>
                  <td className="py-1 pr-3 text-[var(--color-text-secondary)]">{t(s.add)}</td>
                  <td className="py-1">{t(s.running)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 border-t border-[var(--color-border)] pt-2 font-mono text-lg font-bold text-[var(--color-gold)]">
          {DAY_NAMES[molad.day]}, {molad.hours}h {molad.parts}p
        </div>
        <div className="mt-1 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
          Year {year} sits {ladder.remainderYears === 0 ? 'exactly at the start of' : `${ladder.remainderYears} year${ladder.remainderYears === 1 ? '' : 's'} into`}{' '}
          cycle {ladder.cycles + 1}
          {ladder.remainderYears > 0 && (
            <>
              ; of those, {ladder.leapYears === 0 ? 'none are' : ladder.leapYears === 1 ? `position ${ladder.leapPositions[0]} is` : `positions ${ladder.leapPositions.join(', ')} are`}{' '}
              leap (KH 6:11's seven: 3, 6, 8, 11, 14, 17, 19)
            </>
          )}
          . Each "adds" column is count × remainder with whole weeks already thrown away — every
          multiplication is just repeated addition mod the week, checkable by hand. Chapter 7 turns
          the final triple into the day Rosh HaShanah actually falls.
        </div>
      </div>
    </InteractiveCard>
  );
}
