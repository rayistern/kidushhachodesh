/**
 * SunMeanPosition — the period-block method. [R] KH 12:1-2
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching interactive)
 * ═══════════════════════════════════════════════════════════════════
 *
 * KH 12:1 hands the student a table of pre-computed motions — 10 days,
 * 100, 1,000, 10,000, plus 29 days and a 354-day regular year — and
 * KH 12:2 says how to use it: count the days from the epoch, break the
 * count into those blocks, look each one up, total them, add the sun's
 * position at the epoch, and drop whole circles.
 *
 * That decomposition is not a shortcut we invented for display. It is
 * the method, and the engine computes mean longitudes this way too;
 * this card calls the engine's own `meanLongitudeByPeriodBlocks` rather
 * than re-deriving it, so what the reader sees is what the dashboard
 * uses. See engine/periodBlocks.js and docs/OPEN_QUESTIONS.md Q4/Q7.
 *
 * The default state is the Rambam's worked example: 100 days from the
 * epoch, which he says lands the sun at 105° 37' 25" — Sartan, in the
 * sixteenth degree. Reproducing his stated answer is pinned in
 * SunMeanPosition.test.js.
 */
import React, { useState, useMemo } from 'react';
import InteractiveCard, { PresetButton } from './InteractiveCard';
import { CONSTANTS } from '../../../engine/constants';
import { meanLongitudeByPeriodBlocks } from '../../../engine/periodBlocks';
import { dmsToDecimal, formatDms } from '../../../engine/dmsUtils';
import { zodiacPosition, ordinalSuffix } from '../../../engine/zodiac';
import { daysFromEpoch } from '../../../engine/epochDays';

// Sun's mean longitude at the epoch, as an absolute ecliptic longitude.
// KH 12:2 states it as a position *within Aries*, so the constellation
// offset has to be added to get a longitude on the 360° circle.
const EPOCH_MEAN = dmsToDecimal(CONSTANTS.SUN.START_POSITION) + CONSTANTS.SUN.START_CONSTELLATION * 30;

// KH 12:2's own example: 100 days after the epoch, the eve of Sabbath,
// 14 Tammuz.
const RAMBAM_EXAMPLE_DAYS = 100;

function todayDays() {
  const now = new Date();
  return daysFromEpoch(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12));
}

export default function SunMeanPosition() {
  const [days, setDays] = useState(RAMBAM_EXAMPLE_DAYS);

  const calc = useMemo(
    () =>
      meanLongitudeByPeriodBlocks(
        days,
        CONSTANTS.SUN_MEAN_PERIOD_BLOCKS,
        CONSTANTS.SUN.MEAN_MOTION_PER_DAY,
        EPOCH_MEAN,
      ),
    [days],
  );

  const pos = zodiacPosition(calc.result);
  const { k, j, i, h, d } = calc.decomposition;
  const c = calc.contributions;

  const rows = [
    { n: 10000, count: k, each: c.block10000, total: c.contrib_k },
    { n: 1000, count: j, each: c.block1000, total: c.contrib_j },
    { n: 100, count: i, each: c.block100, total: c.contrib_i },
    { n: 10, count: h, each: c.block10, total: c.contrib_h },
    { n: 1, count: d, each: c.dailyRate, total: c.contrib_d },
  ];

  const matchesRambam = days === RAMBAM_EXAMPLE_DAYS;

  return (
    <InteractiveCard
      title="Where is the sun, on average, after N days?"
      source="KH 12:1-2"
      blurb="break the day count into the Rambam's blocks, look each up, total, add the epoch position"
    >
      <div className="flex flex-wrap items-end gap-3">
        <label>
          <span className="block text-xs font-bold text-[var(--color-text-secondary)]">
            Days from the starting point
          </span>
          <input
            type="number"
            min="0"
            value={days}
            onChange={(e) => setDays(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
            className="mt-1 w-32 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-right font-mono text-sm"
          />
        </label>
        <PresetButton
          onClick={() => setDays(RAMBAM_EXAMPLE_DAYS)}
          title="The example the Rambam works through in KH 12:2"
        >
          KH 12:2 example (100)
        </PresetButton>
        <PresetButton onClick={() => setDays(todayDays())} title="Days from the epoch to today">
          Today
        </PresetButton>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[380px] text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-secondary)]">
              <th className="py-1 pr-2 font-bold">Block</th>
              <th className="py-1 pr-2 font-bold">×</th>
              <th className="py-1 pr-2 font-bold">Motion per block</th>
              <th className="py-1 font-bold">Contribution</th>
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
                Position at the starting point (KH 12:2)
              </td>
              <td className="py-1">{formatDms(EPOCH_MEAN)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="text-xs text-[var(--color-text-secondary)]">
          Sum, with whole circles dropped — the sun's mean position (אמצע השמש)
        </div>
        <div className="mt-1 font-mono text-xl font-bold text-[var(--color-gold)]">
          {formatDms(calc.result)}
        </div>
        <div className="mt-1.5 text-sm">
          <span className="font-bold">{pos.translit}</span>{' '}
          <span className="hebrew-text text-[var(--color-accent)]">{pos.hebrew}</span>, in the{' '}
          {pos.ordinalDegree}
          {ordinalSuffix(pos.ordinalDegree)} degree — {formatDms(pos.degreesInto)} into the sign.
        </div>
        {matchesRambam && (
          <div className="mt-2 text-xs text-[var(--color-accent)]">
            ✓ KH 12:2 states this result: 105° 37' 25", "15 degrees and 37 minutes of the
            sixteenth degree" in Sartan.
          </div>
        )}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        This is the <em>mean</em> position — where the sun would be if it moved uniformly, which
        KH 11:15 says is not where you see it. Chapter 13 takes this number and corrects it to
        the true position.
      </p>
    </InteractiveCard>
  );
}
