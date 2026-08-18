/**
 * The next-Rosh-Chodesh preset.
 *
 * "Today" on the sighting-chain cards usually landed mid-month, where
 * the doubled gap sits outside KH 15:2's window and the cards answer a
 * question nobody asked. The preset that replaced it must land on an
 * evening where the question is live — and the reader's own phrasing,
 * "the 29th or 30th", is the requirement: the fixed calendar often puts
 * the eve after the 29th before the mean conjunction, so the live
 * evening may be the next one, or occasionally the one after that.
 */
import { describe, it, expect } from 'vitest';
import { HDate } from '../engine/epochDays';
import { nextSightingNight } from './sightingNight';
import { getFullCalculation } from '../engine/pipeline';

describe('nextSightingNight', () => {
  it('lands inside the 5°-62° window for 36 consecutive months', () => {
    // The whole point of the preset. Before the multi-evening logic,
    // 3 of 24 sampled months landed at a doubled gap near 360.
    let d = new Date(2026, 7, 18);
    for (let m = 0; m < 36; m++) {
      const sn = nextSightingNight(d);
      const doubled = getFullCalculation(sn.date).moon.doubleElongation;
      expect(doubled, sn.hebrew).toBeGreaterThanOrEqual(5);
      expect(doubled, sn.hebrew).toBeLessThanOrEqual(62);
      d = new Date(sn.date);
      d.setDate(d.getDate() + 1);
    }
  });

  it('lands on a 29th, a 30th, or just after Rosh Chodesh', () => {
    // Elul is always 29 days, so its three candidates are 29 Elul,
    // 1 Tishrei and 2 Tishrei — the third can legitimately be day 2.
    let d = new Date(2026, 7, 18);
    for (let m = 0; m < 36; m++) {
      const sn = nextSightingNight(d);
      expect([29, 30, 1, 2], sn.hebrew).toContain(new HDate(sn.date).getDate());
      d = new Date(sn.date);
      d.setDate(d.getDate() + 1);
    }
  });

  it('never returns a date before the one asked from', () => {
    const from = new Date(2026, 7, 18);
    expect(nextSightingNight(from).date.getTime()).toBeGreaterThanOrEqual(from.getTime());
  });

  it('is at most about a month away', () => {
    for (const from of [new Date(2026, 0, 3), new Date(2026, 7, 18), new Date(2027, 11, 30)]) {
      const gap = (nextSightingNight(from).date - from) / 86400000;
      expect(gap, from.toDateString()).toBeLessThanOrEqual(33);
    }
  });
});
