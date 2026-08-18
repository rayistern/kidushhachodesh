/**
 * SunApogee — the slowest thing in the book. [R] KH 12:2
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching interactive)
 * ═══════════════════════════════════════════════════════════════════
 *
 * KH 12:2 introduces the govah — the point in the sun's orbit furthest
 * from the earth — and says it moves, about one degree in seventy years.
 * At the epoch it stood at 26° 45' 8" in Teomim.
 *
 * It matters because chapter 13 measures the maslul *from* the apogee:
 * the correction that turns the mean position into the true one depends
 * on the sun's distance from this point, so a slowly moving apogee means
 * the correction for a given calendar date slowly changes too. It is
 * also the one quantity in the chapter where the Rambam's own aside —
 * that it has since moved into Sartan — can be checked against his rate.
 *
 * The published per-block figures are 1.5" per 10 days, 15" per 100,
 * 2' 30" per 1,000, 25' per 10,000: a flat 0.15" per day, which is what
 * the engine uses. An earlier version of this project had it at 1.5" per
 * day, ten times too fast; see the note on APOGEE_MOTION_PER_DAY and
 * docs/OPEN_QUESTIONS.md Q7.
 */
import React, { useState, useMemo } from 'react';
import InteractiveCard, { PresetButton } from './InteractiveCard';
import { CONSTANTS } from '../../../engine/constants';
import { dmsToDecimal, normalizeDegrees, formatDms } from '../../../engine/dmsUtils';
import { zodiacPosition, ordinalSuffix } from '../../../engine/zodiac';
import { daysFromEpoch } from '../../../engine/epochDays';

const EPOCH_APOGEE =
  dmsToDecimal(CONSTANTS.SUN.APOGEE_START) + CONSTANTS.SUN.APOGEE_CONSTELLATION * 30;
const RATE = CONSTANTS.SUN.APOGEE_MOTION_PER_DAY; // degrees per day

function todayDays() {
  const now = new Date();
  return daysFromEpoch(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12));
}

export default function SunApogee() {
  const [days, setDays] = useState(todayDays);

  const { longitude, travelled, years } = useMemo(() => {
    const moved = RATE * days;
    return {
      travelled: moved,
      longitude: normalizeDegrees(EPOCH_APOGEE + moved),
      years: days / 365.25,
    };
  }, [days]);

  const pos = zodiacPosition(longitude);
  const epochPos = zodiacPosition(EPOCH_APOGEE);
  // KH 12:2 gives the rate as "about one degree in seventy years"; check
  // that characterisation against the per-block figures he publishes.
  const yearsPerDegree = 1 / (RATE * 365.25);
  // How far it has drifted by now, so the footnote's "about twelve
  // degrees" can be checked on screen rather than taken on trust.
  const longitudeDriftToday = RATE * todayDays();

  return (
    <InteractiveCard
      title="The apogee, and how slowly it moves"
      source="KH 12:2"
      blurb="about one degree in seventy years — and chapter 13 measures the correction from it"
    >
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="text-xs font-bold text-[var(--color-text-secondary)]">
          At the starting point (KH 12:2)
        </div>
        <div className="mt-0.5 font-mono text-sm">
          {formatDms(dmsToDecimal(CONSTANTS.SUN.APOGEE_START))} in{' '}
          <span className="font-sans">{epochPos.translit}</span>{' '}
          <span className="hebrew-text text-[var(--color-accent)]">{epochPos.hebrew}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label>
          <span className="block text-xs font-bold text-[var(--color-text-secondary)]">
            Days from the starting point
          </span>
          <input
            type="number"
            min="0"
            value={days}
            onChange={(e) => setDays(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
            className="mt-1 w-36 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-right font-mono text-sm"
          />
        </label>
        <PresetButton onClick={() => setDays(todayDays())} title="Days from the epoch to today">
          Today
        </PresetButton>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
          <div className="text-xs text-[var(--color-text-secondary)]">
            Moved since the epoch <span className="font-normal">(a distance, not a place)</span>
          </div>
          <div className="font-mono text-lg font-bold text-[var(--color-gold)]">
            {formatDms(travelled)}
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)]">
            {/* Spelled out because the DMS form of a tiny value reads as its
                largest digit: "0° 0′ 15″" gets taken for fifteen degrees. */}
            = {(travelled * 3600).toFixed(0)} arcseconds, over {years.toFixed(1)} years
          </div>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
          <div className="text-xs text-[var(--color-text-secondary)]">
            Apogee now stands at <span className="font-normal">(a place)</span>
          </div>
          {/* The absolute longitude, NOT pos.degreesInto. Chapter 13
              subtracts this figure from the sun's mean, so the card must
              show the number that calculation consumes — the two pages
              previously disagreed by a whole 60°, which is the sign offset. */}
          <div className="font-mono text-lg font-bold text-[var(--color-gold)]">
            {formatDms(longitude)}
          </div>
          <div className="text-[11px]">
            = {formatDms(pos.degreesInto)} into the{' '}
            <span className="font-bold">
              {pos.index + 1}
              {ordinalSuffix(pos.index + 1)}
            </span>{' '}
            sign (<span className="font-bold">{pos.translit}</span>{' '}
            <span className="hebrew-text text-[var(--color-accent)]">{pos.hebrew}</span>)
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[300px] text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-secondary)]">
              <th className="py-1 pr-3 font-bold">Interval</th>
              <th className="py-1 font-bold">Apogee moves</th>
              <th className="py-1 pl-3 font-bold">in arcseconds</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {[
              ['p10', '10 days'],
              ['p100', '100 days'],
              ['p1000', '1,000 days'],
              ['p10000', '10,000 days'],
              ['p29', '29 days'],
              ['p354', '354 days'],
            ].map(([key, label]) => (
              <tr key={key} className="border-b border-[var(--color-border)]/40">
                <td className="py-1 pr-3 text-[var(--color-text-secondary)]">{label}</td>
                <td className="py-1">
                  {formatDms(dmsToDecimal(CONSTANTS.SUN_APOGEE_PERIOD_BLOCKS[key]))}
                </td>
                {/* Every row of this table is under half an arcminute, so
                    the DMS column is all leading zeros and the eye latches
                    onto the last number. The plain count removes the doubt. */}
                <td className="py-1 pl-3 text-[var(--color-text-secondary)]">
                  {(dmsToDecimal(CONSTANTS.SUN_APOGEE_PERIOD_BLOCKS[key]) * 3600).toFixed(1)}″
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Those blocks work out to a flat 0.15" per day — one degree every{' '}
        {yearsPerDegree.toFixed(0)} years, which is the "approximately seventy" he states. It is
        the slowest motion in the book.
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        {/* This card previously credited the twelve-degree remark to the
            Rambam. It is Touger's footnote 10 on KH 12:2 — "since more than
            800 years have passed since the composition of the Mishneh Torah"
            is not something its author could write. */}
        A note in Touger's translation (footnote 10 to KH 12:2, not the Rambam) observes that in
        the 800-odd years since he wrote, the apogee has moved about twelve degrees and now sits
        in Sartan. That checks out: the rate above puts it {longitudeDriftToday.toFixed(1)}&deg; on
        from its starting point, in the 4th sign.
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Does he actually use the moved value, or just the starting one? He uses the moved one —
        KH 13:9 says to take "the apogee of the sun <em>at this time</em>, which is
        86&deg;&nbsp;45&prime;&nbsp;23&Prime;", the starting figure plus its 15&Prime;. Though over
        his own hundred days it makes no difference to the answer: the next sentence rounds the
        course to whole degrees, so 15&Prime; cannot survive. The drift only starts to matter over
        centuries — by now it shifts the sun's true position by about a sixth of a degree.
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Why it is tracked at all: chapter 13 measures the maslul — the argument of the correction
        — as the sun's distance from this point. Move the apogee and every correction shifts with
        it.
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Two numbers on this card are easy to confuse, because one is tiny and one is large. The
        movement is measured in <em>arcseconds</em> — 15 of them in a hundred days. The position
        is measured in <em>degrees</em> — a little over 86 of them. The movement is the difference
        between the position then and the position now, which is why a hundred days takes
        86&deg;&nbsp;45&prime;&nbsp;8&Prime; to 86&deg;&nbsp;45&prime;&nbsp;23&Prime; and no
        further. Chapter 13's subtraction uses the large one.
      </p>
    </InteractiveCard>
  );
}
