/**
 * MoonFromEquator — two tilts, combined. [R] KH 19:10-11
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * KH 19:10 phrases the combination as two cases — same direction, add;
 * opposite directions, subtract the smaller from the larger and keep the
 * larger's sign. With signed values it is one addition, but the card
 * shows the case that applied, because the halacha's phrasing is what a
 * reader has in front of them.
 *
 * Both inputs come from the engine where the engine has them: the moon's
 * true longitude and its latitude are the KH 15 and KH 16 chains. Only
 * the tilt table is book-local, since the engine stops at KH 17.
 */
import React, { useState, useMemo } from 'react';
import InteractiveCard, { PresetButton } from '../../text/interactives/InteractiveCard';
import { moonFromEquator, declinationAt } from '../../../lib/khDeclination';
import { getFullCalculation } from '../../../engine/pipeline';
import { dateFromEpochDays, daysFromEpoch } from '../../../engine/epochDays';
import { formatDms } from '../../../engine/dmsUtils';
import { zodiacPosition } from '../../../engine/zodiac';

const EXAMPLE_DAYS = 29;

function todayDays() {
  const now = new Date();
  return daysFromEpoch(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12));
}

export default function MoonFromEquator() {
  const [days, setDays] = useState(EXAMPLE_DAYS);

  const calc = useMemo(() => {
    const steps = Object.fromEntries(
      getFullCalculation(dateFromEpochDays(days)).steps.map((s) => [s.id, s]),
    );
    const moonLon = steps.moonTrueLongitude.result;
    const latitude = steps.moonLatitude.result;
    return { moonLon, latitude, ...moonFromEquator(moonLon, latitude) };
  }, [days]);

  const pos = zodiacPosition(calc.moonLon);
  const isExample = days === EXAMPLE_DAYS;
  const dir = (v) => (Math.abs(v) < 0.05 ? '' : v > 0 ? 'north' : 'south');

  return (
    <InteractiveCard
      title="Two tilts, added up"
      source="KH 19:10-11"
      blurb="how far the degree is from the equator, plus the moon's own height off the road"
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
        <PresetButton onClick={() => setDays(EXAMPLE_DAYS)} title="2 Iyar — the example of KH 19:11">
          His example (29)
        </PresetButton>
        <PresetButton onClick={() => setDays(todayDays())}>Today</PresetButton>
      </div>

      <div className="mt-4 space-y-1 font-mono text-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <span className="text-[var(--color-text-secondary)]">
            The moon stands at
            <span className="ml-2 font-sans text-[11px]">
              {pos.translit} {formatDms(pos.degreesInto)}
            </span>
          </span>
          <span>{formatDms(calc.moonLon)}</span>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <span className="text-[var(--color-text-secondary)]">That degree's tilt from the equator</span>
          <span>
            {Math.abs(calc.tilt).toFixed(1)}° <span className="font-sans text-[11px]">{dir(calc.tilt)}</span>
          </span>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-[var(--color-border)] pb-1">
          <span className="text-[var(--color-text-secondary)]">
            {calc.sameDirection ? '+' : '−'} the moon's own height off the road
          </span>
          <span>
            {formatDms(Math.abs(calc.latitude))}{' '}
            <span className="font-sans text-[11px]">{dir(calc.latitude)}</span>
          </span>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 pt-1">
          <span className="font-bold">Distance from the equator</span>
          <span className="font-bold text-[var(--color-gold)]">
            {Math.abs(calc.result).toFixed(1)}°{' '}
            <span className="font-sans text-xs font-normal">{dir(calc.result)}</span>
          </span>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-[11px] leading-relaxed">
        {calc.sameDirection ? (
          <>
            Both tilts point the same way, so KH 19:10 says to <strong>add</strong> them.
          </>
        ) : (
          <>
            The tilts point opposite ways, so KH 19:10 says to take the smaller from the larger
            and keep the larger's direction — here{' '}
            <strong>
              {Math.abs(calc.tilt) > Math.abs(calc.latitude) ? dir(calc.tilt) : dir(calc.latitude)}
            </strong>
            .
          </>
        )}
      </div>

      {isExample && (
        <div className="mt-2 text-xs text-[var(--color-accent)]">
          ✓ KH 19:11 works this evening: about 18° north for the degree, about 4° south for the
          moon, giving 14° north of the equator.
        </div>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Both inputs come from work already done — the moon's place from chapter 15, its height
        from chapter 16. Only the tilt of the degree is new, and that is the table above.
      </p>
    </InteractiveCard>
  );
}
