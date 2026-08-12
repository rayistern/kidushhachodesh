/**
 * SunTruePosition — the whole KH 13 procedure, step by step.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching interactive)
 * ═══════════════════════════════════════════════════════════════════
 *
 * KH 13:1-2 gives the procedure in four moves — mean position, apogee,
 * subtract to get the course, correct — and 13:9-10 works it through
 * for the same day chapter 12 used. That continuity is the point of
 * defaulting to N=100: the reader watches chapter 12's answer
 * (105° 37' 25") become chapter 13's answer (104° 59' 25").
 *
 * The card follows the text rather than the engine where the two part
 * company. KH 13:9 says to discard the minutes of the course before
 * reading the table; the engine interpolates at the exact course, which
 * is more precise but lands 16" away from the figure he prints. The
 * toggle shows both and names which is which — see lib/maslulTable.js.
 */
import React, { useState, useMemo } from 'react';
import InteractiveCard, { PresetButton } from './InteractiveCard';
import { calculateSunMeanLongitude, calculateSunApogee, lookupMaslulCorrection } from '../../../engine/sunCalculations';
import { formatDms, normalizeDegrees } from '../../../engine/dmsUtils';
import { zodiacPosition, ordinalSuffix } from '../../../engine/zodiac';
import { trueFromMean } from '../../../lib/maslulTable';
import { daysFromEpoch, dateFromEpochDays } from '../../../engine/epochDays';
import {
  modernSunLongitude,
  nightfallUTC,
  angularDifference,
} from '../../../lib/modernAstronomy';

const RAMBAM_EXAMPLE_DAYS = 100;

function todayDays() {
  const now = new Date();
  return daysFromEpoch(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12));
}

export default function SunTruePosition() {
  const [days, setDays] = useState(RAMBAM_EXAMPLE_DAYS);
  const [followText, setFollowText] = useState(true);

  const calc = useMemo(() => {
    const mean = calculateSunMeanLongitude(days).result;
    const apogee = calculateSunApogee(days).result;
    const viaText = trueFromMean(mean, apogee);

    // The engine's route: interpolate at the exact course, no rounding.
    const exactCourse = normalizeDegrees(mean - apogee);
    const engineCorrection = lookupMaslulCorrection(exactCourse).result;
    const engineTrue = normalizeDegrees(
      exactCourse < 180 ? mean - engineCorrection : mean + engineCorrection,
    );

    return { mean, apogee, viaText, exactCourse, engineCorrection, engineTrue };
  }, [days]);

  const { mean, apogee, viaText, engineCorrection, engineTrue } = calc;
  const trueLongitude = followText ? viaText.trueLongitude : engineTrue;
  const correction = followText ? viaText.correction : engineCorrection;
  const pos = zodiacPosition(trueLongitude);
  const isExample = days === RAMBAM_EXAMPLE_DAYS;
  const gapArcsec = Math.abs(viaText.trueLongitude - engineTrue) * 3600;

  return (
    <InteractiveCard
      title="The true position of the sun"
      source="KH 13:1-2, 13:9-10"
      blurb="mean position, less the apogee, gives the course — and the course gives the correction"
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
          title="The example worked in KH 13:9-10 — the same day as chapter 12's"
        >
          KH 13:9 example (100)
        </PresetButton>
        <PresetButton onClick={() => setDays(todayDays())}>Today</PresetButton>
      </div>

      <ol className="mt-4 space-y-2">
        <Step
          n={1}
          label="Mean position of the sun"
          ref_="KH 12:1-2"
          value={formatDms(mean)}
          stated={isExample ? `105° 37' 25"` : null}
        />
        <Step
          n={2}
          label="Apogee of the sun"
          ref_="KH 12:2"
          value={formatDms(apogee)}
          stated={isExample ? `86° 45' 23"` : null}
        />
        <Step
          n={3}
          label="Course — the mean less the apogee (מסלול)"
          ref_="KH 13:1"
          value={formatDms(viaText.rawCourse)}
          stated={isExample ? `18° 52' 2"` : null}
        />
        {followText && (
          <Step
            n={4}
            label="Course read to whole degrees — minutes under thirty are dropped"
            ref_="KH 13:9"
            value={`${viaText.course}°`}
            stated={isExample ? '19°' : null}
          />
        )}
        <Step
          n={followText ? 5 : 4}
          label={
            viaText.exact || !followText
              ? 'Correction for that course (מנת המסלול)'
              : `Correction, interpolated between ${viaText.lo.maslul}° and ${viaText.hi.maslul}°`
          }
          ref_="KH 13:4-8"
          value={formatDms(correction)}
          stated={isExample && followText ? `38'` : null}
        />
        <Step
          n={followText ? 6 : 5}
          label={
            viaText.direction === 'none'
              ? 'The course is 0° or 180° — mean and true coincide'
              : viaText.direction === 'subtract'
                ? 'Course is under 180°, so the correction is subtracted'
                : 'Course is over 180°, so the correction is added'
          }
          ref_="KH 13:2-3"
          value={formatDms(trueLongitude)}
          stated={isExample && followText ? `104° 59' 25"` : null}
          emphasis
        />
      </ol>

      <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="text-xs text-[var(--color-text-secondary)]">
          True position of the sun (מקום השמש האמיתי)
        </div>
        <div className="mt-1 font-mono text-xl font-bold text-[var(--color-gold)]">
          {formatDms(trueLongitude)}
        </div>
        <div className="mt-1.5 text-sm">
          <span className="font-bold">{pos.translit}</span>{' '}
          <span className="hebrew-text text-[var(--color-accent)]">{pos.hebrew}</span>, in the{' '}
          {pos.ordinalDegree}
          {ordinalSuffix(pos.ordinalDegree)} degree — {formatDms(pos.degreesInto)} into the sign.
        </div>
        {isExample && followText && (
          <div className="mt-2 text-xs text-[var(--color-accent)]">
            ✓ KH 13:10 states this result: "fifteen degrees less 35 seconds in the constellation
            of Cancer".
          </div>
        )}
      </div>

      <ActualSun days={days} rambamLongitude={trueLongitude} />

      <label className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)]">
        <input
          type="checkbox"
          checked={followText}
          onChange={(e) => setFollowText(e.target.checked)}
          className="accent-[var(--color-accent)]"
        />
        Read the table the way KH 13:9 says to — whole degrees only
      </label>
      <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        {followText ? (
          <>
            Unchecked, the course is used exactly as computed and the table interpolated at that
            value. That is more precise, and is what this project's engine does — but it is not
            the text's instruction, and here it lands {gapArcsec.toFixed(0)}" away from the
            figure the Rambam prints.
          </>
        ) : (
          <>
            Now interpolating at the exact course, which is what the engine does. The Rambam
            instructs otherwise in KH 13:9, and his printed answer follows his own rule — the two
            differ by {gapArcsec.toFixed(0)}" here. He discards seconds outright in the very next
            halacha, so the gap is well inside his tolerance.
          </>
        )}
      </p>
    </InteractiveCard>
  );
}

/**
 * Where the sun actually was, beside where the Rambam's method puts it.
 *
 * This is a comparison, not a correction. His answer is not being
 * marked wrong — the point is that a reader should be able to see the
 * size of the gap rather than take the model's fidelity on trust.
 *
 * The reference is Meeus's low-accuracy solar position (~0.01°), which
 * is roughly two percent of the difference being reported, so the
 * measurement is comfortably finer than the thing measured. See
 * lib/modernAstronomy.js for the frame and timing caveats.
 */
function ActualSun({ days, rambamLongitude }) {
  const { modern, gap, civilDate } = useMemo(() => {
    const d = dateFromEpochDays(days);
    // The Rambam's positions are for the beginning of the night, so the
    // reference is taken at nightfall in Jerusalem on the same day.
    const instant = nightfallUTC(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
    const lon = modernSunLongitude(instant);
    return {
      modern: lon,
      gap: angularDifference(rambamLongitude, lon),
      civilDate: d.toISOString().slice(0, 10),
    };
  }, [days, rambamLongitude]);

  const arcmin = Math.abs(gap) * 60;

  return (
    <div className="mt-4 rounded-lg border border-[var(--color-silver)]/30 bg-[var(--color-bg)] p-3">
      <div className="text-xs font-bold text-[var(--color-text)]">
        And where was the sun actually?
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
        <div>
          <div className="text-[var(--color-text-secondary)]">Rambam's method</div>
          <div className="font-mono text-sm text-[var(--color-gold)]">
            {formatDms(rambamLongitude)}
          </div>
        </div>
        <div>
          <div className="text-[var(--color-text-secondary)]">Modern astronomy</div>
          <div className="font-mono text-sm text-[var(--color-silver)]">{formatDms(modern)}</div>
        </div>
        <div>
          <div className="text-[var(--color-text-secondary)]">Difference</div>
          <div className="font-mono text-sm text-[var(--color-accent)]">
            {gap < 0 ? '−' : '+'}
            {arcmin.toFixed(0)}′
          </div>
        </div>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        On {civilDate}, his method places the sun about {arcmin.toFixed(0)} arcminutes{' '}
        {gap < 0 ? 'behind' : 'ahead of'} where it actually was — a little over{' '}
        {(Math.abs(gap) * 2).toFixed(1)} solar diameters. That gap stays inside about a degree
        across the whole 848 years since his epoch, and does not accumulate.
      </p>
      <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        It not growing is the more telling fact. Precession carries the equinox some 11.8° over
        that span, so a model anchored to the fixed stars would have drifted by that much. His
        does not, which places his longitudes in the tropical frame — measured from the equinox
        point, as modern longitudes are.
      </p>
      <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--color-text-secondary)] opacity-70">
        Reference: Meeus, <em>Astronomical Algorithms</em> ch. 25, accurate to about 0.01°.
        Compared at an approximate Jerusalem nightfall, since he reckons positions from the
        beginning of the night; the sun moves ~2.5′ an hour, so that convention is worth a few
        arcminutes of the figure above.
      </p>
    </div>
  );
}

function Step({ n, label, ref_, value, stated, emphasis }) {
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
            <span className="font-mono text-[10px] text-[var(--color-accent)]">
              ✓ stated: {stated}
            </span>
          )}
        </span>
        <span className="block text-[11px] text-[var(--color-text-secondary)]">
          {label} <span className="font-mono opacity-60">{ref_}</span>
        </span>
      </span>
    </li>
  );
}
