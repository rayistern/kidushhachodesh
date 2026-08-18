/**
 * MoonMeanByBlocks — the moon's average position on a chosen day.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** — [R] KH 14:2, 14:4
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The same machinery chapter 12 used for the sun, with the moon's
 * tables. Deliberately the *same shape* on screen as the chapter-12
 * card, because the point being made in the prose is "you already know
 * how to do this part".
 *
 * Uses the engine's own `meanLongitudeByPeriodBlocks`, so the answer
 * here is the answer the dashboard computes — and it uses the Rambam's
 * block decomposition rather than rate × days, which is a pedagogical
 * requirement recorded in docs/OPEN_QUESTIONS.md Q4, not a stylistic
 * choice.
 */
import React, { useState, useMemo } from 'react';
import InteractiveCard, { PresetButton } from '../../text/interactives/InteractiveCard';
import { CONSTANTS } from '../../../engine/constants';
import { meanLongitudeByPeriodBlocks } from '../../../engine/periodBlocks';
import { dmsToDecimal, formatDms } from '../../../engine/dmsUtils';
import { zodiacPosition, ordinalSuffix } from '../../../engine/zodiac';
import { daysFromEpoch } from '../../../engine/epochDays';

const EPOCH_MEAN =
  dmsToDecimal(CONSTANTS.MOON.START_POSITION) + CONSTANTS.MOON.START_CONSTELLATION * 30;

function todayDays() {
  const now = new Date();
  return daysFromEpoch(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12));
}

export default function MoonMeanByBlocks() {
  const [days, setDays] = useState(29);

  const calc = useMemo(
    () =>
      meanLongitudeByPeriodBlocks(
        days,
        CONSTANTS.MOON_MEAN_PERIOD_BLOCKS,
        CONSTANTS.MOON.MEAN_MOTION_PER_DAY,
        EPOCH_MEAN,
      ),
    [days],
  );

  const c = calc.contributions;
  const { k, j, i, h, d } = calc.decomposition;
  const pos = zodiacPosition(calc.result);

  const rows = [
    { n: 10000, count: k, each: c.block10000, total: c.contrib_k },
    { n: 1000, count: j, each: c.block1000, total: c.contrib_j },
    { n: 100, count: i, each: c.block100, total: c.contrib_i },
    { n: 10, count: h, each: c.block10, total: c.contrib_h },
    { n: 1, count: d, each: c.dailyRate, total: c.contrib_d },
  ];

  return (
    <InteractiveCard
      title="Where the moon's small circle has got to"
      source="KH 14:2, 14:4"
      blurb="chapter 12's method again, with the moon's tables"
      defaultOpen
    >
      <div className="flex flex-wrap items-end gap-3">
        <label>
          <span className="block text-xs font-bold text-[var(--color-text-secondary)]">
            Days since the starting point
          </span>
          <input
            type="number"
            min="0"
            value={days}
            onChange={(e) => setDays(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
            className="mt-1 w-32 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-right font-mono text-sm"
          />
        </label>
        <PresetButton onClick={() => setDays(29)} title="The day the Rambam works through in KH 15:8">
          His example (29)
        </PresetButton>
        <PresetButton onClick={() => setDays(todayDays())}>Today</PresetButton>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[360px] text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-secondary)]">
              <th className="py-1 pr-2 font-bold">Chunk</th>
              <th className="py-1 pr-2 font-bold">How many</th>
              <th className="py-1 pr-2 font-bold">Moon travels</th>
              <th className="py-1 font-bold">Comes to</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((r) => (
              <tr
                key={r.n}
                className={`border-b border-[var(--color-border)]/40 ${r.count === 0 ? 'opacity-35' : ''}`}
              >
                <td className="py-1 pr-2">{r.n === 1 ? '1 day' : `${r.n.toLocaleString()} days`}</td>
                <td className="py-1 pr-2">{r.count}</td>
                <td className="py-1 pr-2 text-[var(--color-text-secondary)]">{formatDms(r.each)}</td>
                <td className="py-1">{formatDms(r.total)}</td>
              </tr>
            ))}
            <tr className="border-b border-[var(--color-border)]/40">
              <td className="py-1 pr-2" colSpan={3}>
                Where it started, at the epoch
              </td>
              <td className="py-1">{formatDms(EPOCH_MEAN)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="text-xs text-[var(--color-text-secondary)]">
          The moon's mean — where the small circle has got to
          <span className="hebrew-text"> (אמצע הירח)</span>
        </div>
        <div className="mt-1 font-mono text-xl font-bold text-[var(--color-gold)]">
          {formatDms(calc.result)}
        </div>
        <div className="mt-1 text-sm">
          <span className="font-bold">{pos.translit}</span>{' '}
          <span className="hebrew-text text-[var(--color-accent)]">{pos.hebrew}</span>, {pos.ordinalDegree}
          {ordinalSuffix(pos.ordinalDegree)} degree
        </div>
        {days === 29 && (
          <div className="mt-2 text-xs text-[var(--color-accent)]">
            ✓ The Rambam works this very day in KH 15:8 and states 53° 21' 39".
          </div>
        )}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Notice there is no multiplying by a big number anywhere. That is the whole idea of the
        chunks: he pre-computed how far the moon travels in ten days, a hundred, a thousand, so
        that anyone could work out any date with nothing harder than adding up.
      </p>
    </InteractiveCard>
  );
}
