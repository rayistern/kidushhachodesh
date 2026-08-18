/**
 * QuickVerdict — the early exit of KH 17:3-4.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Put before the long chain deliberately. KH 17:3-4 settles most nights
 * on the first longitude alone, and a reader who does not know that
 * meets the eight remaining steps as an unavoidable slog rather than as
 * the rare case they are.
 *
 * The two halves of the sky get very different thresholds — 9/15 in one,
 * 10/24 in the other — and which applies depends only on where the moon
 * is. Showing both bars at once makes that asymmetry impossible to miss,
 * and it is the sort of thing that silently ruins an answer if the wrong
 * one is used.
 */
import React, { useState } from 'react';
import InteractiveCard, { PresetButton } from '../../text/interactives/InteractiveCard';
import { CONSTANTS } from '../../../engine/constants';
import { formatDms } from '../../../engine/dmsUtils';
import { zodiacPosition } from '../../../engine/zodiac';
import { getFullCalculation } from '../../../engine/pipeline';
import { dateFromEpochDays, daysFromEpoch } from '../../../engine/epochDays';
import { nextSightingNight } from '../../../lib/sightingNight';

const { capricornGemini, cancerSagittarius } = CONSTANTS.EARLY_EXIT_THRESHOLDS;

/** KH 17:4's split: G'di through Teomim, versus Sartan through Keshet. */
function halfFor(moonLongitude) {
  const n = ((moonLongitude % 360) + 360) % 360;
  // G'di starts at 270°, Teomim ends at 90°.
  const capricornToGemini = n >= 270 || n < 90;
  return capricornToGemini
    ? { ...capricornGemini, name: "G'di through Teomim", id: 'cg' }
    : { ...cancerSagittarius, name: 'Sartan through Keshet', id: 'cs' };
}

/** Tonight = the evening beginning the NEXT Hebrew day (see SkyPage). */
function tonightDays() {
  const now = new Date();
  return daysFromEpoch(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)) + 1;
}

export default function QuickVerdict() {
  // His worked evening (day 29): moon ~48°36' (Shor), first longitude
  // ~11°27' — but taken FROM the engine, not typed in, since the card
  // presents them as computed.
  const [example] = useState(() => {
    const calc = getFullCalculation(dateFromEpochDays(29));
    return {
      lon: ((calc.moon.trueLongitude % 360) + 360) % 360,
      gap: calc.moon.elongation,
    };
  });
  const [moonLongitude, setMoonLongitude] = useState(example.lon);
  const [orech, setOrech] = useState(example.gap);
  // The night the sliders were computed FROM — null once a slider is
  // moved by hand, so the card never claims engine authority for a
  // hand-set number.
  const [nightDays, setNightDays] = useState(29);

  // The calculator: both inputs from the engine for a chosen night —
  // the moon's true place (ch. 15) and the first longitude (KH 17:1).
  const applyNight = (d) => {
    const calc = getFullCalculation(dateFromEpochDays(d));
    setMoonLongitude(((calc.moon.trueLongitude % 360) + 360) % 360);
    setOrech(calc.moon.elongation);
    setNightDays(d);
  };
  const byHand = (setter) => (e) => {
    setter(Number(e.target.value));
    setNightDays(null);
  };
  const eve = nightDays != null ? new Date(dateFromEpochDays(nightDays) - 86400000) : null;

  const half = halfFor(moonLongitude);
  const sign = zodiacPosition(moonLongitude);

  // A crescent question needs the moon AHEAD of the sun and near it.
  const noCrescent = orech > 180;
  const offChart = !noCrescent && orech > 30;
  const settled =
    orech <= half.invisibleMax ? 'not-seen' : orech > half.visibleMin ? 'seen' : 'undecided';

  return (
    <InteractiveCard
      title="Most nights are settled right here"
      source="KH 17:3-4"
      blurb="two thresholds on the gap alone — and they differ by half the sky"
      defaultOpen
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-[var(--color-text-secondary)]">
          Compute a real night:
        </span>
        <PresetButton onClick={() => applyNight(29)} title="2 Iyar 4938 — the evening KH 17 works through">
          His example (29)
        </PresetButton>
        <PresetButton
          onClick={() => applyNight(nextSightingNight().days)}
          title="The evening after the 29th — the night the court would look"
        >
          Next Rosh Chodesh
        </PresetButton>
        <PresetButton onClick={() => applyNight(tonightDays())}>Tonight</PresetButton>
      </div>
      <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
        {nightDays != null ? (
          <>
            The night of <strong>{eve.toISOString().slice(0, 10)}</strong> — both numbers below
            computed by the engine: the moon's place from chapter 15, the gap from KH 17:1.
          </>
        ) : (
          <>Set by hand — slide freely; the presets above return to a computed night.</>
        )}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold text-[var(--color-text-secondary)]">
            Where the moon is — {sign.translit} {formatDms(sign.degreesInto)}
          </span>
          <input
            type="range"
            min="0"
            max="359"
            step="1"
            value={moonLongitude}
            onChange={byHand(setMoonLongitude)}
            className="mt-1 w-full accent-[var(--color-silver)]"
            aria-label="The moon's position in degrees"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-[var(--color-text-secondary)]">
            The gap to the sun — {formatDms(orech)}
          </span>
          <input
            type="range"
            min="0"
            max="30"
            step="0.05"
            value={Math.min(orech, 30)}
            onChange={byHand(setOrech)}
            className="mt-1 w-full accent-[var(--color-gold)]"
            aria-label="First longitude in degrees"
          />
        </label>
      </div>

      <div className="mt-4 space-y-3">
        <Bar
          title={`G'di through Teomim`}
          thresholds={capricornGemini}
          orech={orech}
          active={half.id === 'cg'}
        />
        <Bar
          title="Sartan through Keshet"
          thresholds={cancerSagittarius}
          orech={orech}
          active={half.id === 'cs'}
        />
      </div>

      <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="text-xs text-[var(--color-text-secondary)]">
          The moon is in {sign.translit}, so the thresholds in force are{' '}
          <strong className="text-[var(--color-text)]">{half.name}</strong> —{' '}
          {half.invisibleMax}° and {half.visibleMin}° ({half.source})
        </div>
        <div className="mt-1 text-lg font-bold">
          {noCrescent ? (
            <span className="text-[var(--color-text-secondary)]">No crescent to judge yet</span>
          ) : (
            <>
              {settled === 'not-seen' && (
                <span className="text-[var(--color-text-secondary)]">
                  Settled: cannot be seen
                </span>
              )}
              {settled === 'seen' && (
                <span className="text-[var(--color-accent)]">Settled: will be seen</span>
              )}
              {settled === 'undecided' && (
                <span className="text-[var(--color-gold)]">Not settled — the long chain is needed</span>
              )}
            </>
          )}
        </div>
        <div className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">
          {noCrescent
            ? `The moon still trails the sun on this night — conjunction has not passed, so the early exit has nothing to rule on. Try the next evening.`
            : offChart
              ? `The gap is ${formatDms(orech)} — off this chart's 30° and far past every threshold: a mid-month moon, trivially seen.`
              : settled === 'undecided'
                ? `Between ${half.invisibleMax}° and ${half.visibleMin}°, so everything from the parallax corrections onward has to be worked out.`
                : 'No further calculation needed. The Rambam says so in as many words.'}
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Move the moon across the boundary — from Teomim into Sartan, or from Keshet into G'di —
        and watch the thresholds jump. The undecided band is nearly two and a half times wider in
        one half of the sky than the other, which is why the chapter insists you check where the
        moon is before you reach for any number.
      </p>
    </InteractiveCard>
  );
}

function Bar({ title, thresholds, orech, active }) {
  const max = 30;
  const pct = (v) => `${(Math.min(v, max) / max) * 100}%`;

  return (
    <div className={active ? '' : 'opacity-40'}>
      <div className="flex items-baseline justify-between text-[11px]">
        <span className={active ? 'font-bold text-[var(--color-text)]' : 'text-[var(--color-text-secondary)]'}>
          {title}
        </span>
        <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
          {thresholds.source}
        </span>
      </div>
      <div className="relative mt-1 h-6 overflow-hidden rounded bg-[var(--color-card)]">
        <div
          className="absolute inset-y-0 left-0 bg-[var(--color-text-secondary)]/25"
          style={{ width: pct(thresholds.invisibleMax) }}
        />
        <div
          className="absolute inset-y-0 bg-[var(--color-gold)]/25"
          style={{
            left: pct(thresholds.invisibleMax),
            width: `${((thresholds.visibleMin - thresholds.invisibleMax) / max) * 100}%`,
          }}
        />
        <div
          className="absolute inset-y-0 right-0 bg-[var(--color-accent)]/30"
          style={{ left: pct(thresholds.visibleMin) }}
        />
        <div
          className="absolute inset-y-0 w-[2px] bg-[var(--color-text)]"
          style={{ left: pct(orech) }}
        />
      </div>
      <div className="mt-0.5 flex justify-between font-mono text-[9px] text-[var(--color-text-secondary)]">
        <span>never seen ≤ {thresholds.invisibleMax}°</span>
        <span>must calculate</span>
        <span>always seen &gt; {thresholds.visibleMin}°</span>
      </div>
    </div>
  );
}
