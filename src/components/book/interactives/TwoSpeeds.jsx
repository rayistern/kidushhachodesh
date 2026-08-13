/**
 * TwoSpeeds — the two rates, and what each one is a month of.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** — [R] KH 14:1, 14:3
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The chapter's two rates differ by six and a half minutes of arc a day
 * and are the single easiest thing to confuse in the whole book. The way
 * to make them stick is not to stare at the digits but to ask what each
 * one is a *month* of — run each to a full circle and they separate into
 * two familiar, unmistakably different questions.
 *
 * ── The reality check ──
 * Those two circuits turn out to be the sidereal month (once round the
 * sky) and the anomalistic month (nearest point to nearest point), and
 * the Rambam's values land within seconds of the modern figures. That is
 * worth showing plainly: elsewhere in this book his sun trails reality by
 * half a degree, and a reader who has met that should also meet this.
 *
 * The modern month lengths below are standard published constants, not
 * computed here — there is no lunar theory in this repo, and inventing
 * one to check two numbers would be worse than citing them. Sources are
 * named on screen.
 */
import React from 'react';
import InteractiveCard from '../../text/interactives/InteractiveCard';
import { CONSTANTS } from '../../../engine/constants';
import { dmsToDecimal, formatDms } from '../../../engine/dmsUtils';

// Standard modern values, in days. Both are conventional constants of
// lunar theory (e.g. Meeus, Astronomical Algorithms, ch. 49).
const MODERN = {
  sidereal: 27.321661,
  anomalistic: 27.554550,
};

const ROWS = [
  {
    key: 'mean',
    rate: CONSTANTS.MOON.MEAN_MOTION_PER_DAY,
    name: "The moon's mean",
    hebrew: 'אמצע הירח',
    ref: 'KH 14:1',
    question: 'How long to go once round the sky and back to the same star?',
    modern: MODERN.sidereal,
    modernName: 'sidereal month',
  },
  {
    key: 'anomaly',
    rate: CONSTANTS.MOON.MASLUL_MEAN_MOTION,
    name: 'The mean within its path',
    hebrew: 'אמצע המסלול',
    ref: 'KH 14:3',
    question: 'How long from the moon at its nearest until it is nearest again?',
    modern: MODERN.anomalistic,
    modernName: 'anomalistic month',
  },
];

/** Days for a rate to complete a full circle. */
function circuitDays(rateDms) {
  return 360 / dmsToDecimal(rateDms);
}

function daysAndHours(days) {
  const whole = Math.floor(days);
  const hours = (days - whole) * 24;
  return `${whole} days ${hours.toFixed(0)} hours`;
}

export default function TwoSpeeds() {
  const difference =
    dmsToDecimal(CONSTANTS.MOON.MEAN_MOTION_PER_DAY) -
    dmsToDecimal(CONSTANTS.MOON.MASLUL_MEAN_MOTION);

  return (
    <InteractiveCard
      title="Two speeds, two questions"
      source="KH 14:1, 14:3"
      blurb="they differ by six minutes of arc a day — and by a whole question"
      defaultOpen
    >
      <div className="space-y-3">
        {ROWS.map((row) => {
          const circuit = circuitDays(row.rate);
          const gapSeconds = Math.abs(circuit - row.modern) * 86400;
          return (
            <div
              key={row.key}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3"
            >
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm font-bold">{row.name}</span>
                <span className="hebrew-text text-sm text-[var(--color-accent)]">{row.hebrew}</span>
                <span className="font-mono text-[10px] text-[var(--color-gold)]">{row.ref}</span>
              </div>

              <div className="mt-1 font-mono text-lg font-bold text-[var(--color-gold)]">
                {formatDms(dmsToDecimal(row.rate))} <span className="text-xs font-normal">a day</span>
              </div>

              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{row.question}</p>

              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[var(--color-border)] pt-2 text-xs">
                <div>
                  <div className="text-[var(--color-text-secondary)]">One full circle takes</div>
                  <div className="font-mono text-sm">{daysAndHours(circuit)}</div>
                  <div className="font-mono text-[10px] text-[var(--color-text-secondary)]">
                    {circuit.toFixed(5)} days
                  </div>
                </div>
                <div>
                  <div className="text-[var(--color-text-secondary)]">
                    Modern {row.modernName}
                  </div>
                  <div className="font-mono text-sm text-[var(--color-silver)]">
                    {row.modern.toFixed(5)} days
                  </div>
                  <div className="text-[10px] text-[var(--color-accent)]">
                    off by {gapSeconds.toFixed(1)} seconds
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-xs leading-relaxed">
        <div>
          The two rates differ by only{' '}
          <strong className="font-mono text-[var(--color-text)]">{formatDms(difference)}</strong> a
          day — which is why they are so easy to mix up, and why it matters to hold on to what
          each one is asking.
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Worth pausing on those last two figures. His moon rates are right to within a few seconds
        per month, eight and a half centuries ago. His <em>sun</em>, as chapter 13 showed, sits
        about half a degree behind reality. The moon is where his model is at its most impressive.
      </p>
      <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--color-text-secondary)] opacity-70">
        Modern month lengths are standard published constants of lunar theory (Meeus,
        <em> Astronomical Algorithms</em>, ch. 49), quoted rather than computed — this project
        has no lunar theory of its own to check them against.
      </p>
    </InteractiveCard>
  );
}
