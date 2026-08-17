/**
 * MoonLatitude — the height, and the four-way fold. [R] KH 16:10-19
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Two jobs. It runs the KH 16:19 chain for a chosen day — moon's true
 * position, head's position, course of the latitude, height, side — and
 * it makes the folding rule of KH 16:13-18 visible.
 *
 * The folding is the part worth care. A reader arriving from chapters
 * 13 and 15 has learned "past 180, subtract from 360" and will apply it
 * here, where it is wrong three quarters of the time. So the card names
 * which of the four rules is in force at the current course, and prints
 * the arithmetic rather than only the answer.
 */
import React, { useState, useMemo } from 'react';
import InteractiveCard, { PresetButton } from '../../text/interactives/InteractiveCard';
import {
  calculateNodePosition,
  calculateMoonLatitude,
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
import { zodiacPosition } from '../../../engine/zodiac';
import { daysFromEpoch } from '../../../engine/epochDays';

const EXAMPLE_DAYS = 29;

/** Which of KH 16:13-18's four rules applies, and what it does. */
function foldingRule(course) {
  const c = ((course % 360) + 360) % 360;
  if (c <= 90) return { rule: 'none', folded: c, text: 'under 90° — read the table directly', side: 'north' };
  if (c <= 180)
    return { rule: '180 −', folded: 180 - c, text: `180° − ${c.toFixed(0)}°`, side: 'north' };
  if (c <= 270)
    return { rule: '− 180', folded: c - 180, text: `${c.toFixed(0)}° − 180°`, side: 'south' };
  return { rule: '360 −', folded: 360 - c, text: `360° − ${c.toFixed(0)}°`, side: 'south' };
}

function todayDays() {
  const now = new Date();
  return daysFromEpoch(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12));
}

export default function MoonLatitude() {
  const [days, setDays] = useState(EXAMPLE_DAYS);

  const calc = useMemo(() => {
    const sunMean = calculateSunMeanLongitude(days).result;
    const sunTrue = trueFromMean(sunMean, calculateSunApogee(days).result).trueLongitude;
    const moonAdj = normalizeDegrees(
      calculateMoonMeanLongitude(days).result + calculateSeasonCorrection(sunTrue).result,
    );
    const hanachon = calculateMaslulHanachon(
      calculateMoonMaslul(days).result,
      calculateDoubleElongation(moonAdj, sunMean).result,
    );
    const correction = lookupMoonMaslulCorrection(hanachon.result);
    const moonTrue = calculateMoonTrueLongitude(
      moonAdj,
      hanachon.result,
      correction.result,
      correction.direction,
    ).result;

    const head = calculateNodePosition(days).result;
    const course = normalizeDegrees(moonTrue - head);
    const latitude = calculateMoonLatitude(moonTrue, head).result;

    return { moonTrue, head, course, latitude };
  }, [days]);

  const fold = foldingRule(calc.course);
  const isExample = days === EXAMPLE_DAYS;
  const moonSign = zodiacPosition(calc.moonTrue);
  const headSign = zodiacPosition(calc.head);

  return (
    <InteractiveCard
      title="How high, and on which side"
      source="KH 16:10-19"
      blurb="the moon's position less the up-crossing's — then a fold you have not seen before"
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
        <PresetButton onClick={() => setDays(EXAMPLE_DAYS)} title="2 Iyar — the example of KH 16:19">
          His example (29)
        </PresetButton>
        <PresetButton onClick={() => setDays(todayDays())}>Today</PresetButton>
      </div>

      <div className="mt-4 space-y-1 font-mono text-sm">
        <Row
          label="Where the moon really is"
          value={formatDms(calc.moonTrue)}
          note={`${moonSign.translit} ${formatDms(moonSign.degreesInto)}`}
        />
        <Row
          label="Where the up-crossing is (the head)"
          value={formatDms(calc.head)}
          note={`${headSign.translit} ${formatDms(headSign.degreesInto)}`}
          border
        />
        <Row label="How far past it the moon has come" value={formatDms(calc.course)} emphasis />
      </div>

      <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="text-xs font-bold text-[var(--color-text)]">
          Which fold applies (KH 16:13-18)
        </div>
        <div className="mt-1 grid grid-cols-4 gap-1 text-center text-[10px]">
          {[
            { range: '0–90', rule: 'none', label: 'as is' },
            { range: '90–180', rule: '180 −', label: '180 −' },
            { range: '180–270', rule: '− 180', label: '− 180' },
            { range: '270–360', rule: '360 −', label: '360 −' },
          ].map((band) => (
            <div
              key={band.range}
              className={`rounded p-1 ${band.rule === fold.rule ? 'bg-[var(--color-accent)]/25 text-[var(--color-text)]' : 'bg-[var(--color-card)] text-[var(--color-text-secondary)]'}`}
            >
              <div className="font-mono">{band.range}</div>
              <div className="font-mono opacity-80">{band.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 font-mono text-xs text-[var(--color-text-secondary)]">
          {fold.text} = <span className="text-[var(--color-gold)]">{fold.folded.toFixed(0)}°</span>{' '}
          — read the table there
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="text-xs text-[var(--color-text-secondary)]">
          Height off the sun's track <span className="hebrew-text">(רוחב הירח)</span>
        </div>
        <div className="mt-0.5 font-mono text-xl font-bold text-[var(--color-gold)]">
          {formatDms(Math.abs(calc.latitude))}
        </div>
        <div className="text-sm">
          {calc.latitude >= 0 ? (
            <span className="text-[var(--color-accent)]">
              north of the sun's road — "northerly"
            </span>
          ) : (
            <span className="text-[var(--color-gold)]">
              south of the sun's road — "southerly"
            </span>
          )}
        </div>
        {isExample && (
          <div className="mt-2 text-xs text-[var(--color-accent)]">
            ✓ KH 16:19 states this: 3° 53′, southerly.
          </div>
        )}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Watch the fold as you change the day. Chapters 13 and 15 had one rule for anything past
        half a circle; this chapter has three, because height rises and falls twice in a lap
        where those corrections rose and fell once. Carrying the old rule over here would give
        the wrong answer for three quarters of the circle.
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        {calc.latitude < 0
          ? 'South is the unhelpful verge. Working the same evening through chapter 17 with the moon south rather than north shrinks the arc of sighting by several degrees, which is often the whole difference between seen and unseen.'
          : 'North is the helpful verge. Working the same evening through chapter 17 with the moon north rather than south grows the arc of sighting by several degrees — often the whole difference between seen and unseen.'}
      </p>
    </InteractiveCard>
  );
}

function Row({ label, value, note, emphasis, border }) {
  return (
    <div
      className={`flex flex-wrap items-baseline justify-between gap-x-4 ${border ? 'border-b border-[var(--color-border)] pb-1' : ''} ${emphasis ? 'pt-1' : ''}`}
    >
      <span className={`text-[var(--color-text-secondary)] ${emphasis ? 'font-bold text-[var(--color-text)]' : ''}`}>
        {label}
      </span>
      <span className={emphasis ? 'font-bold text-[var(--color-gold)]' : ''}>
        {value}
        {note && (
          <span className="ml-2 font-sans text-[11px] text-[var(--color-text-secondary)]">
            {note}
          </span>
        )}
      </span>
    </div>
  );
}
