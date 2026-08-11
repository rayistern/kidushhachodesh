/**
 * HiddenThird — the daily rate the printed text rounds away. [R] KH 12:1
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching interactive)
 * ═══════════════════════════════════════════════════════════════════
 *
 * KH 12:1 prints the sun's mean daily motion as 59' 8". Multiply that
 * by ten and you get 9° 51' 20" — but the ten-day figure he prints in
 * the very same halacha is 9° 51' 23". The three seconds are not an
 * error in either number: the operative rate is 59' 8⅓", and the
 * printed daily figure is his display rounding. His own table gives the
 * missing third away.
 *
 * This is not a reading invented here. It is a ruling recorded in this
 * project on 2026-08-05 ("Rambam wins", audit finding #5), forced by
 * KH 15:8's worked example, and pinned by rambamWorkedExamples.test.js
 * and maslulHanachon.test.js. See the comment on
 * CONSTANTS.SUN.MEAN_MOTION_PER_DAY.
 *
 * The card shows both candidate rates against every block he publishes,
 * because the case for 8⅓" is cumulative — at ten days the flat rate is
 * off by 3 seconds and easy to dismiss; at ten thousand days it is off
 * by nearly a degree.
 */
import React from 'react';
import InteractiveCard from './InteractiveCard';
import { CONSTANTS } from '../../../engine/constants';
import { dmsToDecimal, normalizeDegrees, formatDms } from '../../../engine/dmsUtils';

const FLAT = { degrees: 0, minutes: 59, seconds: 8 };
const OPERATIVE = CONSTANTS.SUN.MEAN_MOTION_PER_DAY; // 59' 8.333"

const BLOCKS = [
  { key: 'p10', days: 10, label: '10 days' },
  { key: 'p100', days: 100, label: '100 days' },
  { key: 'p1000', days: 1000, label: '1,000 days' },
  { key: 'p10000', days: 10000, label: '10,000 days' },
  { key: 'p29', days: 29, label: '29 days' },
  { key: 'p354', days: 354, label: '354 days (regular year)' },
];

/** Signed arcsecond gap between a computed value and the published one. */
function gapArcsec(rate, days, published) {
  return (normalizeDegrees(dmsToDecimal(rate) * days) - published) * 3600;
}

function formatGap(arcsec) {
  const rounded = Math.round(arcsec * 10) / 10;
  if (Math.abs(rounded) < 0.05) return '—';
  const sign = rounded > 0 ? '+' : '−';
  const abs = Math.abs(rounded);
  if (abs < 60) return `${sign}${abs.toFixed(1)}"`;
  const m = Math.floor(abs / 60);
  const s = Math.round(abs - m * 60);
  return `${sign}${m}' ${s}"`;
}

export default function HiddenThird() {
  const rows = BLOCKS.map((b) => {
    const published = dmsToDecimal(CONSTANTS.SUN_MEAN_PERIOD_BLOCKS[b.key]);
    return {
      ...b,
      published,
      flatGap: gapArcsec(FLAT, b.days, published),
      operativeGap: gapArcsec(OPERATIVE, b.days, published),
    };
  });

  return (
    <InteractiveCard
      title={`Why the daily motion is 59' 8⅓", not 59' 8"`}
      source="KH 12:1"
      blurb="the printed daily figure is rounded — his own ten-day figure reveals the missing third"
    >
      <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
        KH 12:1 prints the sun's mean daily motion as{' '}
        <span className="font-mono">59' 8"</span>. Ten times that is{' '}
        <span className="font-mono">9° 51' 20"</span> — but the ten-day figure printed in the same
        halacha is <span className="font-mono">9° 51' 23"</span>. Below, each block he publishes
        is compared against both candidate rates.
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[440px] text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-secondary)]">
              <th className="py-1 pr-2 font-bold">Block</th>
              <th className="py-1 pr-2 font-bold">Rambam's figure</th>
              <th className="py-1 pr-2 font-bold">
                Using 59' 8"
              </th>
              <th className="py-1 font-bold">Using 59' 8⅓"</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((r) => {
              const operativeWins = Math.abs(r.operativeGap) < Math.abs(r.flatGap);
              return (
                <tr key={r.key} className="border-b border-[var(--color-border)]/40">
                  <td className="py-1 pr-2 text-[var(--color-text-secondary)]">{r.label}</td>
                  <td className="py-1 pr-2">{formatDms(r.published)}</td>
                  <td className="py-1 pr-2 text-red-400">{formatGap(r.flatGap)}</td>
                  <td
                    className={`py-1 ${operativeWins ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'}`}
                  >
                    {formatGap(r.operativeGap)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        The flat rate drifts steadily — three seconds at ten days, more than half a degree at ten
        thousand. The rate with the third stays within half a minute of arc across the whole
        table. What remains is real but small, and KH 11:5-6 says as much in advance: where an
        approximation cannot change whether the moon is seen, he does not chase it.
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        The 354-day row leans the other way by about five seconds, which is the one place the
        published blocks are not quite self-consistent — a regular year is not a round number of
        blocks, and he rounded it on its own terms.
      </p>
    </InteractiveCard>
  );
}
