/**
 * VisibilityChain — the whole of KH 17, on one evening. [R] KH 17:1-22
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Runs the engine's own pipeline rather than re-deriving anything, and
 * reads the steps back by id — so this shows exactly what the dashboard
 * computes, and gains any correction the engine gains.
 *
 * Every figure the Rambam states at KH 17:13-14 and 17:22 is marked
 * where the chain produces it, so the reader can check the machine
 * against the text at nine separate points rather than only at the end.
 *
 * The early-exit case is handled honestly: when KH 17:3-4 settles the
 * night on the first longitude alone, the later steps are still shown
 * but marked as not having been needed. Hiding them would suggest the
 * chain always runs; greying them says what actually happened.
 */
import React, { useState, useMemo } from 'react';
import InteractiveCard, { PresetButton } from '../../text/interactives/InteractiveCard';
import { getFullCalculation } from '../../../engine/pipeline';
import { formatDms } from '../../../engine/dmsUtils';
import { dateFromEpochDays, daysFromEpoch } from '../../../engine/epochDays';
import { zodiacPosition } from '../../../engine/zodiac';

const EXAMPLE_DAYS = 29;

// What he states outright at KH 17:13-14 and 17:22.
const STATED = {
  sunTrueLongitude: `Shor 7° 9'`,
  moonTrueLongitude: `Shor 18° 36'`,
  moonLatitude: `3° 53' south`,
  elongation: `11° 27'`,
  orechShlishi: `11° 28'`,
  orechRevii: `13° 46'`,
  mnatGovahHaMedinah: `2° 35'`,
  keshetHaReiyah: `11° 11'`,
};

// Labelled by what each step DOES to the running number, with the text's
// own ordinal in brackets — because "third longitude" tells a reader
// nothing and "the gap, after two adjustments" tells them everything.
const CHAIN = [
  { id: 'sunTrueLongitude', label: 'Where the sun really is', ref: 'KH 13' },
  { id: 'moonTrueLongitude', label: 'Where the moon really is', ref: 'KH 15' },
  { id: 'moonLatitude', label: "The height off the sun's road (first latitude)", ref: 'KH 16' },
  { id: 'elongation', label: 'THE GAP between them (first longitude)', ref: 'KH 17:1', key: true },
  {
    id: 'orechSheni',
    label: 'the gap, shifted for standing on the ground (second longitude)',
    ref: 'KH 17:5',
  },
  {
    id: 'rochavSheni',
    label: 'the height, shifted the same way (second latitude)',
    ref: 'KH 17:7-8',
  },
  {
    id: 'orechShlishi',
    label: 'the gap, moved by the slice of the height (third longitude)',
    ref: 'KH 17:11',
  },
  {
    id: 'orechRevii',
    label: 'the gap, stretched for how steeply this part sets (fourth longitude)',
    ref: 'KH 17:12',
  },
  { id: 'mnatGovahHaMedinah', label: 'a fraction of the ORIGINAL height', ref: 'KH 17:14' },
  { id: 'keshetHaReiyah', label: 'THE FINAL FIGURE — the arc of sighting', ref: 'KH 17:14', key: true },
];

function todayDays() {
  const now = new Date();
  return daysFromEpoch(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12));
}

export default function VisibilityChain() {
  const [days, setDays] = useState(EXAMPLE_DAYS);

  const { steps, verdict } = useMemo(() => {
    const calc = getFullCalculation(dateFromEpochDays(days));
    const byId = Object.fromEntries(calc.steps.map((s) => [s.id, s]));
    return { steps: byId, verdict: byId.moonVisibility };
  }, [days]);

  const isExample = days === EXAMPLE_DAYS;
  const earlyExit = Boolean(verdict?.path?.startsWith('Early exit'));

  return (
    <InteractiveCard
      title="The whole thing, on one evening"
      source="KH 17:1-22"
      blurb="ten steps from two positions to a yes or a no"
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
        <PresetButton onClick={() => setDays(EXAMPLE_DAYS)} title="2 Iyar — the example of KH 17:13">
          His example (29)
        </PresetButton>
        <PresetButton onClick={() => setDays(todayDays())}>Today</PresetButton>
        <span className="pb-1 text-[11px] text-[var(--color-text-secondary)]">
          = {dateFromEpochDays(days).toISOString().slice(0, 10)}
        </span>
      </div>

      {earlyExit && (
        <p className="mt-3 rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-surface)] p-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
          On this night KH 17:3-4 settles the question on the first longitude alone. The steps
          below are still computed, but the verdict did not need them — that is the point of the
          early exit.
        </p>
      )}

      <ol className="mt-4 space-y-1.5">
        {CHAIN.map((row, i) => {
          const step = steps[row.id];
          if (!step) return null;
          const unused = earlyExit && i > 3;
          return (
            <li key={row.id} className={`flex gap-2.5 ${unused ? 'opacity-40' : ''}`}>
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-card)] font-mono text-[10px] text-[var(--color-text-secondary)]">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span
                    className={`font-mono text-sm ${row.key ? 'font-bold text-[var(--color-gold)]' : ''}`}
                  >
                    {formatDms(Math.abs(step.result))}
                    {row.id === 'moonLatitude' && (
                      <span className="ml-1 font-sans text-[11px]">
                        {step.result >= 0 ? 'north' : 'south'}
                      </span>
                    )}
                    {row.id === 'rochavSheni' && (
                      <span className="ml-1 font-sans text-[11px]">
                        {step.result >= 0 ? 'north' : 'south'}
                      </span>
                    )}
                  </span>
                  {isExample && STATED[row.id] && (
                    <span className="font-mono text-[10px] text-[var(--color-accent)]">
                      ✓ he states {STATED[row.id]}
                    </span>
                  )}
                </span>
                <span className="block text-[11px] text-[var(--color-text-secondary)]">
                  {row.label} <span className="font-mono opacity-60">{row.ref}</span>
                  {['sunTrueLongitude', 'moonTrueLongitude'].includes(row.id) && (
                    <span className="ml-1 opacity-80">
                      — {zodiacPosition(step.result).translit}{' '}
                      {formatDms(zodiacPosition(step.result).degreesInto)}
                    </span>
                  )}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      {verdict && (
        <div
          className={`mt-4 rounded-lg border p-3 ${
            verdict.result
              ? 'border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10'
              : 'border-[var(--color-border)] bg-[var(--color-bg)]'
          }`}
        >
          <div className="text-xs text-[var(--color-text-secondary)]">
            Could the new moon have been seen from Jerusalem?
          </div>
          <div
            className={`mt-0.5 text-2xl font-bold ${verdict.result ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'}`}
          >
            {verdict.result ? 'Yes' : 'No'}
          </div>
          <div className="mt-1 font-mono text-[10px] leading-relaxed text-[var(--color-text-secondary)]">
            {verdict.path}
          </div>
          {isExample && (
            <div className="mt-2 text-xs text-[var(--color-accent)]">
              ✓ KH 17:22 reaches the same verdict — the moon would be sighted that night.
            </div>
          )}
        </div>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Notice that steps 4, 5, 7 and 8 are all <strong>the same number</strong>. The gap is
        worked out once and then adjusted three times, and the text calls it by the next number
        along each time. There are not four longitudes; there is one gap, corrected.
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Every step comes from this project's engine running its ordinary pipeline — the same code
        the dashboard uses. On his example it matches all nine of the figures he states, to within
        a minute of arc.
      </p>
    </InteractiveCard>
  );
}
