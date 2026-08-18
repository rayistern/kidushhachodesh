/**
 * ParshaPairs — the bonus payoff of the year's shape: which Torah
 * portions get read together.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **editorial bonus** — NOT in KH 8; a downstream effect
 *  of the kevi'ah, computed with hebcal's sedra tables.
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The whole reading cycle must fit exactly between one Simchat Torah
 * and the next, and the year's shape decides how many Shabbatot that
 * span holds and how many of them the holidays swallow. Seven fixed
 * candidate pairs absorb the difference. This card shows the budget
 * arithmetic and the verdict for any year, Israel or diaspora.
 */
import React, { useState } from 'react';
import InteractiveCard, { PresetButton } from '../../text/interactives/InteractiveCard';
import hebcal from 'hebcal';
import { yearShape } from '../../../lib/fixedYear';

/** The seven pairs that ever combine, in reading order. */
export const CANDIDATE_PAIRS = [
  'Vayakhel–Pekudei',
  'Tazria–Metzora',
  'Achrei Mot–Kedoshim',
  'Behar–Bechukotai',
  'Chukat–Balak',
  'Matot–Masei',
  'Nitzavim–Vayeilech',
];

/**
 * Walk every Shabbat of a Hebrew year: which sedras are doubled, and
 * the budget (Shabbatot in the year, how many carry a regular reading).
 */
export function yearReadings(year, il) {
  const start = new hebcal.HDate(1, 'Tishrei', year).abs();
  const end = new hebcal.HDate(1, 'Tishrei', year + 1).abs();
  const doubles = [];
  let shabbatot = 0;
  let regular = 0;
  for (let a = start; a < end; a++) {
    if (((a % 7) + 7) % 7 !== 6) continue; // Shabbat (R.D. 1 = Monday)
    shabbatot++;
    const hd = new hebcal.HDate(new Date((a - 719163) * 86400000));
    hd.il = il;
    if (!hd.isSedra()) continue; // a holiday owns this Shabbat's reading
    regular++;
    const sedra = hd.getSedra('en');
    if (Array.isArray(sedra) && sedra.length > 1) doubles.push(sedra.join('–'));
  }
  return { doubles, shabbatot, regular, swallowed: shabbatot - regular };
}

export default function ParshaPairs() {
  const [year, setYear] = useState(5786);
  const [il, setIl] = useState(true);
  const shape = yearShape(year);
  const { doubles, shabbatot, regular, swallowed } = yearReadings(year, il);

  return (
    <InteractiveCard
      title="Bonus: which portions get read together"
      source="not in this chapter — a payoff of it"
      blurb="the year's shape decides what the whole world reads on Shabbat"
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
        <PresetButton onClick={() => setYear(5786)}>5786 (common)</PresetButton>
        <PresetButton onClick={() => setYear(5787)}>5787 (leap)</PresetButton>
        <label className="flex items-center gap-1.5 pb-1 text-xs text-[var(--color-text-secondary)]">
          <input type="checkbox" checked={il} onChange={(e) => setIl(e.target.checked)} className="accent-[var(--color-accent)]" />
          in the Land of Israel
        </label>
      </div>

      <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-xs">
        <span className="font-mono">
          {shabbatot} Shabbatot − {swallowed} taken by holidays = <strong>{regular}</strong> reading
          slots, for <strong>{regular + doubles.length}</strong> portions
        </span>
        <span className="ml-1 text-[var(--color-text-secondary)]">
          → <strong className="text-[var(--color-gold)]">{doubles.length}</strong> pairs must share
          a Shabbat this {shape.leap ? 'leap' : 'common'} year
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {CANDIDATE_PAIRS.map((pair) => {
          const joined = doubles.includes(pair);
          return (
            <div
              key={pair}
              className={`rounded border px-2 py-1 text-[11px] ${
                joined
                  ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10 font-bold'
                  : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] line-through opacity-60'
              }`}
            >
              {pair}
            </div>
          );
        })}
      </div>
      <p className="mt-1 text-[10px] text-[var(--color-text-secondary)]">
        Gold = read together this year; struck out = each on its own Shabbat. These seven are the
        only pairs that ever combine.
      </p>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Why these numbers: the Torah's portions must finish exactly at Simchat Torah, every year,
        no matter the shape. A leap year carries about four more Shabbatot, so most pairs split;
        a common year has fewer, so most combine. And which holidays land ON Shabbat — swallowing
        a reading slot — follows from the very weekday-of-Rosh-HaShanah this chapter computes. In
        the diaspora, holidays keep an extra day, so an eighth day of Pesach on Shabbat can put
        the diaspora one reading behind the Land of Israel until a pair like Chukat–Balak — which
        never combines in Israel — lets it catch up.
      </p>
    </InteractiveCard>
  );
}
