/**
 * TekufahFinder — running the chapter backwards. [R] KH 13:11
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching interactive)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The chapter closes by pointing out what the reader has just gained:
 * being able to find the sun's true place on any day means being able
 * to ask the reverse — on what day does the sun *reach* a given place?
 * The equinoxes and solstices are that question asked at 0°, 90°, 180°
 * and 270°.
 *
 * ── Why the answer is a day and not a time ──
 * A first version of this card bisected for the instant of crossing and
 * printed a clock time. That was false precision, and wrong twice over:
 * KH 12:1 counts *whole days* from the epoch (the period-block
 * decomposition floors), and KH 13:9 rounds the course to whole degrees
 * before reading the table. The Rambam's true longitude is therefore a
 * step function of the day count — constant within a day — so there is
 * nothing between two days to search. Bisection duly "converged" onto a
 * discontinuity and reported an hour that meant nothing.
 *
 * So his column reports the first whole day on which the sun has
 * reached or passed the season's longitude, which is the finest answer
 * his method actually carries.
 *
 * The modern reference *is* continuous, so the instant beside it is
 * genuine and is bisected properly. That contrast is the point rather
 * than an embarrassment: it shows what resolution the method has.
 */
import React, { useState, useMemo } from 'react';
import InteractiveCard from './InteractiveCard';
import { calculateSunMeanLongitude, calculateSunApogee } from '../../../engine/sunCalculations';
import { trueFromMean } from '../../../lib/maslulTable';
import { daysFromEpoch, dateFromEpochDays } from '../../../engine/epochDays';
import { modernSunLongitude } from '../../../lib/modernAstronomy';

const SEASONS = [
  { longitude: 0, name: 'Spring equinox', hebrew: 'תקופת ניסן' },
  { longitude: 90, name: 'Summer solstice', hebrew: 'תקופת תמוז' },
  { longitude: 180, name: 'Autumn equinox', hebrew: 'תקופת תשרי' },
  { longitude: 270, name: 'Winter solstice', hebrew: 'תקופת טבת' },
];

/** Signed distance to a target longitude, folded into (−180, 180]. */
const offsetTo = (longitude, target) => ((longitude - target + 540) % 360) - 180;

/** The sun's true longitude, by the Rambam's method, N days after the epoch. */
function rambamLongitude(days) {
  const mean = calculateSunMeanLongitude(days).result;
  const apogee = calculateSunApogee(days).result;
  return trueFromMean(mean, apogee).trueLongitude;
}

/**
 * First whole day, on or after `from`, when the Rambam's true sun has
 * reached or passed `target`. Whole-day steps only — see the note above
 * on why there is nothing finer to find.
 */
function findRambamDay(target, from) {
  let prev = offsetTo(rambamLongitude(from), target);
  for (let d = from + 1; d <= from + 400; d++) {
    const cur = offsetTo(rambamLongitude(d), target);
    if (prev < 0 && cur >= 0) return d;
    prev = cur;
  }
  return null;
}

/**
 * The actual instant the sun reaches `target`, by bisection on the
 * modern reference — which, unlike the Rambam's, is a continuous
 * function of time and can genuinely be resolved to minutes.
 */
function findActualInstant(target, fromMs) {
  const off = (ms) => offsetTo(modernSunLongitude(new Date(ms)), target);
  const DAY = 86400000;
  let lo = fromMs;
  let prev = off(lo);
  for (let i = 1; i <= 400; i++) {
    const t = fromMs + i * DAY;
    const cur = off(t);
    if (prev < 0 && cur >= 0) {
      let a = t - DAY;
      let b = t;
      for (let j = 0; j < 50; j++) {
        const mid = (a + b) / 2;
        if (off(mid) < 0) a = mid;
        else b = mid;
      }
      return new Date((a + b) / 2);
    }
    prev = cur;
    lo = t;
  }
  return null;
}

function todayDays() {
  const now = new Date();
  return daysFromEpoch(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12));
}

export default function TekufahFinder() {
  const [fromDays, setFromDays] = useState(todayDays);

  const results = useMemo(
    () =>
      SEASONS.map((season) => {
        const day = findRambamDay(season.longitude, fromDays);
        const rambamDate = day === null ? null : dateFromEpochDays(day);
        const actual = findActualInstant(season.longitude, dateFromEpochDays(fromDays).getTime());

        let gapDays = null;
        if (rambamDate && actual) {
          // Compare the Rambam's day against the actual crossing's day.
          const actualDayStart = Date.UTC(
            actual.getUTCFullYear(),
            actual.getUTCMonth(),
            actual.getUTCDate(),
          );
          gapDays = Math.round((rambamDate.getTime() - actualDayStart) / 86400000);
        }

        return { ...season, day, rambamDate, actual, gapDays };
      }),
    [fromDays],
  );

  return (
    <InteractiveCard
      title="Finding the true equinox and solstice"
      source="KH 13:11"
      blurb="the chapter run backwards — not where on a given day, but on what day for a given place"
    >
      <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
        A season begins when the sun's true position reaches an exact quarter of the circle.
        Since you can now find that position for any day, you can hunt for the day it arrives —
        forwards or backwards from the starting point, as the halacha says.
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label>
          <span className="block text-xs font-bold text-[var(--color-text-secondary)]">
            Searching forward from day
          </span>
          <input
            type="number"
            min="0"
            value={fromDays}
            onChange={(e) => setFromDays(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
            className="mt-1 w-32 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-right font-mono text-sm"
          />
        </label>
        <span className="pb-1 text-[11px] text-[var(--color-text-secondary)]">
          = {dateFromEpochDays(fromDays).toISOString().slice(0, 10)}
        </span>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[420px] text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-secondary)]">
              <th className="py-1 pr-2 font-bold">Season</th>
              <th className="py-1 pr-2 font-bold">At</th>
              <th className="py-1 pr-2 font-bold">Rambam's method</th>
              <th className="py-1 font-bold">Actually</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.longitude} className="border-b border-[var(--color-border)]/40">
                <td className="py-1 pr-2">
                  <span className="block">{r.name}</span>
                  <span className="hebrew-text block text-[var(--color-accent)]">{r.hebrew}</span>
                </td>
                <td className="py-1 pr-2 font-mono text-[var(--color-text-secondary)]">
                  {r.longitude}°
                </td>
                <td className="py-1 pr-2 font-mono text-[var(--color-gold)]">
                  {r.rambamDate ? r.rambamDate.toISOString().slice(0, 10) : '—'}
                  {r.day !== null && (
                    <span className="block text-[10px] text-[var(--color-text-secondary)]">
                      day {r.day.toLocaleString()}
                    </span>
                  )}
                </td>
                <td className="py-1 font-mono text-[var(--color-silver)]">
                  {r.actual ? r.actual.toISOString().slice(0, 10) : '—'}
                  {r.actual && (
                    <span className="block text-[10px] text-[var(--color-text-secondary)]">
                      {r.actual.toISOString().slice(11, 16)} UTC
                      {r.gapDays !== null && r.gapDays !== 0 && (
                        <>
                          {' · '}
                          {r.gapDays > 0 ? `${r.gapDays}d late` : `${-r.gapDays}d early`}
                        </>
                      )}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        His column is a date and not a time, and that is not a shortcoming of the card. KH 12:1
        counts whole days from the starting point and KH 13:9 reads the table to whole degrees,
        so his true longitude only changes once a day — there is no instant inside a day for the
        method to name. The modern figure is continuous, so it can be given to the minute.
      </p>
      <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Where the two land a day apart, that is the half-degree lag of his solar model showing
        up as a whole day, since the sun covers only about a degree a day. Half a degree of
        position becomes half a day of timing, which rounds to one or none.
      </p>
      <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        These are the tekufot of the sun's <em>true</em> position, which is what this chapter
        computes. They are not the tekufah of Shmuel or of Rav Ada from chapters 9 and 10 —
        those are fixed arithmetic schemes, evenly spaced on purpose, which drift from the true
        sun by design. Two different questions sharing a name.
      </p>
    </InteractiveCard>
  );
}
