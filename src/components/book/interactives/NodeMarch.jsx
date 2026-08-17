/**
 * NodeMarch — the head, walking backwards. [R] KH 16:2-3
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * KH 16:3 gives an instruction that makes no sense on its own: work the
 * head's progress out exactly like the sun's and the moon's, then
 * subtract the whole thing from 360. Nothing else in the book is
 * treated that way.
 *
 * The reason is one sentence back in 16:1 — the head travels *against*
 * the order of the signs. This card makes the flip visible: the running
 * total climbing one way, the actual position sliding the other, and
 * the two always summing to a full circle.
 *
 * It also gives the reality check the reader has come to expect. The
 * head's lap takes a little over eighteen and a half years, which is a
 * real and well-measured cycle, so his rate can be held against the
 * modern figure. It comes out close.
 */
import React, { useState, useMemo } from 'react';
import InteractiveCard, { PresetButton } from '../../text/interactives/InteractiveCard';
import { CONSTANTS } from '../../../engine/constants';
import { calculateNodePosition } from '../../../engine/moonCalculations';
import { meanLongitudeByPeriodBlocks } from '../../../engine/periodBlocks';
import { dmsToDecimal, formatDms, normalizeDegrees } from '../../../engine/dmsUtils';
import { zodiacPosition } from '../../../engine/zodiac';
import { daysFromEpoch } from '../../../engine/epochDays';

const DAILY = dmsToDecimal(CONSTANTS.NODE.DAILY_MOTION);
// The modern nodal regression period, in days. A standard constant of
// lunar theory, quoted rather than derived — this project has no lunar
// theory of its own to derive it from.
const MODERN_CYCLE_DAYS = 6798.383;

function todayDays() {
  const now = new Date();
  return daysFromEpoch(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12));
}

export default function NodeMarch() {
  const [days, setDays] = useState(29);

  const { runningTotal, head, tail } = useMemo(() => {
    // The total you build by adding the published chunks — a distance
    // travelled, not yet a position.
    const total = meanLongitudeByPeriodBlocks(
      days,
      CONSTANTS.NODE_PERIOD_BLOCKS,
      CONSTANTS.NODE.DAILY_MOTION,
      dmsToDecimal(CONSTANTS.NODE.START_POSITION),
    ).result;
    const position = calculateNodePosition(days).result;
    return { runningTotal: total, head: position, tail: normalizeDegrees(position + 180) };
  }, [days]);

  const headSign = zodiacPosition(head);
  const tailSign = zodiacPosition(tail);

  const cycleDays = 360 / DAILY;
  const cycleYears = cycleDays / 365.25;
  const modernYears = MODERN_CYCLE_DAYS / 365.25;

  return (
    <InteractiveCard
      title="The up-crossing walks backwards"
      source="KH 16:2-3"
      blurb="which is the whole reason you subtract from 360"
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
        <PresetButton onClick={() => setDays(29)} title="The example of KH 16:4-5">
          His example (29)
        </PresetButton>
        <PresetButton onClick={() => setDays(todayDays())}>Today</PresetButton>
      </div>

      <Dial head={head} tail={tail} />

      <div className="mt-3 space-y-1 font-mono text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-[var(--color-text-secondary)]">Running total, added up</span>
          <span>{formatDms(runningTotal)}</span>
        </div>
        <div className="flex justify-between gap-4 border-b border-[var(--color-border)] pb-1">
          <span className="text-[var(--color-text-secondary)]">Taken from a full circle</span>
          <span>360° − {formatDms(runningTotal)}</span>
        </div>
        <div className="flex justify-between gap-4 pt-1">
          <span className="font-bold">The up-crossing is at</span>
          <span className="font-bold text-[var(--color-gold)]">{formatDms(head)}</span>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2">
          <div className="text-[var(--color-text-secondary)]">The up-crossing — head <span className="hebrew-text">ראש</span></div>
          <div className="text-sm">
            <span className="font-bold">{headSign.translit}</span>{' '}
            <span className="hebrew-text text-[var(--color-accent)]">{headSign.hebrew}</span>,{' '}
            {formatDms(headSign.degreesInto)}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2">
          <div className="text-[var(--color-text-secondary)]">The down-crossing — tail <span className="hebrew-text">זנב</span></div>
          <div className="text-sm">
            <span className="font-bold">{tailSign.translit}</span>{' '}
            <span className="hebrew-text text-[var(--color-accent)]">{tailSign.hebrew}</span>,{' '}
            {formatDms(tailSign.degreesInto)}
          </div>
        </div>
      </div>

      {days === 29 && (
        <div className="mt-2 text-xs text-[var(--color-accent)]">
          ✓ KH 16:5 states exactly this: the head at 27° 30′ in Betulah, the tail opposite it in
          Dagim.
        </div>
      )}

      <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="text-xs font-bold text-[var(--color-text)]">How long is one lap?</div>
        <div className="mt-1.5 grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-[var(--color-text-secondary)]">At his rate of {formatDms(DAILY)} a day</div>
            <div className="font-mono text-sm text-[var(--color-gold)]">
              {cycleYears.toFixed(2)} years
            </div>
          </div>
          <div>
            <div className="text-[var(--color-text-secondary)]">Modern measurement</div>
            <div className="font-mono text-sm text-[var(--color-silver)]">
              {modernYears.toFixed(2)} years
            </div>
          </div>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
          A gap of about {Math.abs(cycleDays - MODERN_CYCLE_DAYS).toFixed(0)} days across an
          eighteen-year cycle — roughly {(
            (Math.abs(cycleDays - MODERN_CYCLE_DAYS) / MODERN_CYCLE_DAYS) * 100
          ).toFixed(2)}% out. This is the slowest thing he tracks apart from the sun's far point,
          and it is the cycle that governs when eclipses can happen.
        </p>
      </div>
    </InteractiveCard>
  );
}

/** The circle of signs, with head and tail marked opposite each other. */
function Dial({ head, tail }) {
  const size = 190;
  const cx = size / 2;
  const cy = size / 2;
  const r = 66;
  const point = (radius, deg) => {
    const rad = (deg * Math.PI) / 180;
    return [cx + radius * Math.cos(rad), cy - radius * Math.sin(rad)];
  };

  const [hx, hy] = point(r, head);
  const [tx, ty] = point(r, tail);

  return (
    <figure className="mx-auto mt-3 w-full max-w-[190px]">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full" role="img"
        aria-label="The circle of the signs with the head and tail marked at opposite points">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-border)" strokeWidth="1.5" />
        {Array.from({ length: 12 }, (_, i) => {
          const [x1, y1] = point(r - 5, i * 30);
          const [x2, y2] = point(r + 3, i * 30);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-border)" strokeWidth="1" />;
        })}

        {/* the axis through both crossings */}
        <line x1={hx} y1={hy} x2={tx} y2={ty} stroke="var(--color-accent)" strokeWidth="1.5" strokeDasharray="4 3" />

        {/* the direction of travel — backwards through the signs */}
        <path
          d={`M ${point(r + 16, head + 14)[0]} ${point(r + 16, head + 14)[1]} A ${r + 16} ${r + 16} 0 0 1 ${point(r + 16, head + 40)[0]} ${point(r + 16, head + 40)[1]}`}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="1.5"
        />
        <text
          x={point(r + 26, head + 27)[0]}
          y={point(r + 26, head + 27)[1]}
          fontSize="8"
          fill="var(--color-gold)"
          textAnchor="middle"
          dominantBaseline="central"
        >
          ←
        </text>

        <circle cx={hx} cy={hy} r="5" fill="var(--color-accent)" />
        <circle cx={tx} cy={ty} r="4" fill="var(--color-silver)" />
        <text x={cx} y={cy - 4} fontSize="8" textAnchor="middle" fill="var(--color-text-secondary)">
          head &amp; tail
        </text>
        <text x={cx} y={cy + 7} fontSize="8" textAnchor="middle" fill="var(--color-text-secondary)">
          always opposite
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-[11px] text-[var(--color-text-secondary)]">
        The gold arrow shows the direction the head travels — against the order of the signs.
      </figcaption>
    </figure>
  );
}
