/**
 * MoonTruePosition — the whole KH 15 chain. [R] KH 15:1-9
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Nine steps, every one of which the Rambam states a value for in his
 * worked example at KH 15:8-9 — so the card defaults to that day
 * (N = 29, the second of Iyar) and marks each stated figure.
 *
 * Every step comes from the engine's own functions, in the order
 * pipeline.js calls them, so what the reader sees here is what the
 * dashboard computes. Two places deserve care and get it:
 *
 *  - the season correction reads the sun's TRUE longitude, while the
 *    double elongation subtracts the sun's MEAN. Both are correct per
 *    the text and it is an easy thing to get backwards.
 *  - the adjusted mean (moon mean + season) has no step object of its
 *    own in the pipeline; it is computed inline there, and inline here,
 *    which is why it carries no source chip.
 */
import React, { useState, useMemo } from 'react';
import InteractiveCard, { PresetButton } from '../../text/interactives/InteractiveCard';
import {
  calculateMoonMeanLongitude,
  calculateSeasonCorrection,
  calculateMoonMaslul,
  calculateDoubleElongation,
  calculateMaslulHanachon,
  lookupMoonMaslulCorrection,
  calculateMoonTrueLongitude,
} from '../../../engine/moonCalculations';
import { calculateSunMeanLongitude, calculateSunApogee } from '../../../engine/sunCalculations';
import { trueFromMean } from '../../../lib/maslulTable';
import { formatDms, normalizeDegrees } from '../../../engine/dmsUtils';
import { zodiacPosition, ordinalSuffix } from '../../../engine/zodiac';
import { daysFromEpoch } from '../../../engine/epochDays';
import { nextSightingNight } from '../../../lib/sightingNight';

const EXAMPLE_DAYS = 29;

// The figures the Rambam states outright at KH 15:8-9.
const STATED = {
  sunMean: `35° 38' 33"`,
  moonAtSighting: `53° 36' 39"`,
  withinPath: `103° 21' 46"`,
  elongation: `17° 58' 6"`,
  doubled: `35° 56' 12"`,
  hanachon: `108° 21'`,
  correction: `5° 1'`,
  result: `18° 36' into Shor`,
};

export default function MoonTruePosition() {
  const [days, setDays] = useState(EXAMPLE_DAYS);

  const calc = useMemo(() => {
    const sunMean = calculateSunMeanLongitude(days).result;
    const sunTrue = trueFromMean(sunMean, calculateSunApogee(days).result).trueLongitude;

    const moonRaw = calculateMoonMeanLongitude(days).result;
    // KH 14:5 keys off the sun's TRUE longitude...
    const season = calculateSeasonCorrection(sunTrue).result;
    const moonAtSighting = normalizeDegrees(moonRaw + season);

    const withinPath = calculateMoonMaslul(days).result;
    // ...while KH 15:1 subtracts the sun's MEAN. Not a slip.
    const elongation = normalizeDegrees(moonAtSighting - sunMean);
    const doubled = calculateDoubleElongation(moonAtSighting, sunMean).result;

    const hanachon = calculateMaslulHanachon(withinPath, doubled);
    const correction = lookupMoonMaslulCorrection(hanachon.result);
    const trueLongitude = calculateMoonTrueLongitude(
      moonAtSighting,
      hanachon.result,
      correction.result,
      correction.direction,
    ).result;

    return {
      sunMean,
      moonRaw,
      season,
      moonAtSighting,
      withinPath,
      elongation,
      doubled,
      nudge: hanachon.result - withinPath,
      hanachon: hanachon.result,
      correction: correction.result,
      direction: correction.direction,
      trueLongitude,
    };
  }, [days]);

  const pos = zodiacPosition(calc.trueLongitude);
  const isExample = days === EXAMPLE_DAYS;
  const s = (key) => (isExample ? STATED[key] : null);

  return (
    <InteractiveCard
      title="The moon's true position, step by step"
      source="KH 15:1-9"
      blurb="nine steps, and he states a value for every one of them"
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
        <PresetButton onClick={() => setDays(EXAMPLE_DAYS)} title="2 Iyar — the example of KH 15:8">
          His example (29)
        </PresetButton>
        <PresetButton
          onClick={() => setDays(nextSightingNight().days)}
          title="The evening after the 29th — the night the court would look"
        >
          Next Rosh Chodesh ({nextSightingNight().hebrew.replace(/ \d+$/, '')})
        </PresetButton>
      </div>

      <ol className="mt-4 space-y-2">
        <Step n={1} label="The sun's average position" ref_="KH 12" value={formatDms(calc.sunMean)} stated={s('sunMean')} how="from chapter 12's tables — speed × days, plus the start" />
        <Step n={2} label="The moon's average — where the arm points" ref_="KH 14:1-4" value={formatDms(calc.moonRaw)} how="from chapter 14's tables, the same way" />
        <Step
          n={3}
          label={`Nudged to the moment of sighting (${calc.season === 0 ? 'no change' : formatDms(calc.season)})`}
          ref_="KH 14:5"
          value={formatDms(calc.moonAtSighting)}
          stated={s('moonAtSighting')}
          how="= step 2 + the season nudge"
        />
        <Step n={4} label="The moon within its path — where it sits round the small circle" ref_="KH 14:3" value={formatDms(calc.withinPath)} stated={s('withinPath')} how="from chapter 14's tables — the second of its two numbers" />
        <Step n={5} label="How far the moon has pulled away from the sun" ref_="KH 15:1" value={formatDms(calc.elongation)} stated={s('elongation')} how="= step 3 − step 1" />
        <Step n={6} label="Doubled — now measured from the far point instead of the sun" ref_="KH 15:1" value={formatDms(calc.doubled)} stated={s('doubled')} how="= step 5 × 2" />
        <Step
          n={7}
          label={`The correct course — the nudge step 6 earns, added on`}
          ref_="KH 15:3"
          value={formatDms(calc.hanachon)}
          stated={s('hanachon')}
          how={`= step 4 + ${calc.nudge === 0 ? 'nothing (step 6 is under 6°)' : `${Math.round(calc.nudge)}° (looked up by step 6)`}`}
        />
        <Step n={8} label="The fix, from the big table" ref_="KH 15:6" value={formatDms(calc.correction)} stated={s('correction')} how="looked up by step 7 — nothing is added yet" />
        <Step
          n={9}
          label={
            calc.direction === 'add'
              ? 'The answer. Step 7 is over 180°, so the fix is added'
              : 'The answer. Step 7 is under 180°, so the fix is taken off'
          }
          ref_="KH 15:4"
          value={formatDms(calc.trueLongitude)}
          emphasis
          how={`= step 3 ${calc.direction === 'add' ? '+' : '−'} step 8`}
        />
      </ol>

      <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="text-xs text-[var(--color-text-secondary)]">
          Where the moon really is <span className="hebrew-text">(מקום הירח האמיתי)</span>
        </div>
        <div className="mt-1 font-mono text-xl font-bold text-[var(--color-gold)]">
          {formatDms(calc.trueLongitude)}
        </div>
        <div className="mt-1 text-sm">
          <span className="font-bold">{pos.translit}</span>{' '}
          <span className="hebrew-text text-[var(--color-accent)]">{pos.hebrew}</span>, {pos.ordinalDegree}
          {ordinalSuffix(pos.ordinalDegree)} degree — {formatDms(pos.degreesInto)} into the sign.
        </div>
        {isExample && (
          <div className="mt-2 text-xs text-[var(--color-accent)]">
            ✓ KH 15:9 states this result: {STATED.result}.
          </div>
        )}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Step 3 reads the sun's <em>true</em> position to pick its nudge, while step 5 subtracts
        the sun's <em>average</em>. Both are what the text says, and mixing them up is the
        easiest mistake to make here — so both are labelled.
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        A small difference from his arithmetic: he truncates the correct course to 108 before
        reading the table and gets 5° 1′, where this computes at the exact course and gets a few
        seconds less. The two land on the same answer once the seconds are dropped, which
        KH 15:9 tells you to do.
      </p>
    </InteractiveCard>
  );
}

function Step({ n, label, ref_, value, stated, emphasis, how }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-card)] font-mono text-[10px] text-[var(--color-text-secondary)]">
        {n}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className={`font-mono text-sm ${emphasis ? 'font-bold text-[var(--color-gold)]' : ''}`}>
            {value}
          </span>
          {stated && (
            <span className="font-mono text-[10px] text-[var(--color-accent)]">✓ he states {stated}</span>
          )}
        </span>
        <span className="block text-[11px] text-[var(--color-text-secondary)]">
          {label} <span className="font-mono opacity-60">{ref_}</span>
        </span>
        {/* Where this step's number comes from, in terms of the steps
            above it. Without this the chain's plumbing was invisible —
            a reader saw nine values and had to guess what fed what. */}
        {how && (
          <span className="block font-mono text-[10px] text-[var(--color-accent)] opacity-80">
            {how}
          </span>
        )}
      </span>
    </li>
  );
}
