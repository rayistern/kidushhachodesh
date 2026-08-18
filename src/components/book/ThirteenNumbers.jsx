/**
 * ThirteenNumbers — the whole method's foundations, on one page.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **editorial** — NOT the Rambam, NOT a translation.
 *  SURFACE CATEGORY: teaching commentary (standalone article)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Grew out of a reader's question — "what are the most fundamental
 * numbers to calculate?" — whose answer turned out to be short enough
 * to be an article and load-bearing enough to deserve one: three
 * numbers run the calendar, five positions with five speeds run the
 * astronomy, and every evening they funnel into one number.
 *
 * Every figure on this page is rendered FROM the engine's constants,
 * not typed in, so the article cannot drift from the code — pinned in
 * thirteenNumbers.test.jsx. The counting-to-thirteen framing is this
 * book's; the numbers themselves are his, each with its chapter.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import SiteCredit from '../layout/SiteCredit';
import { CONSTANTS } from '../../engine/constants';
import {
  BAHARAD,
  SYNODIC_MONTH_PARTS,
  PARTS_PER_DAY,
  PARTS_PER_HOUR,
} from '../../engine/fixedCalendar/constants';

// The month, decomposed from the engine's single parts figure.
const MONTH_DAYS = Math.floor(SYNODIC_MONTH_PARTS / PARTS_PER_DAY);
const MONTH_HOURS = Math.floor((SYNODIC_MONTH_PARTS % PARTS_PER_DAY) / PARTS_PER_HOUR);
const MONTH_PARTS = SYNODIC_MONTH_PARTS % PARTS_PER_HOUR;

/** d-m-s object → the book's inline style: 13° 10′ 35″. */
function dms({ degrees, minutes, seconds }) {
  const s = Math.round(seconds * 100) / 100;
  return `${degrees}° ${minutes}′ ${s ? `${s}″` : ''}`.trim();
}

const SUN = CONSTANTS.SUN;
const MOON = CONSTANTS.MOON;
const NODE = CONSTANTS.NODE;

/** The five running quantities: anchor at the epoch, speed, and where he states them. */
const PAIRS = [
  {
    name: "The sun's mean place",
    hebrew: 'אמצע השמש',
    epoch: `${dms(SUN.START_POSITION)} of the 1st sign`,
    rate: `${dms(SUN.MEAN_MOTION_PER_DAY)} a day`,
    ref: 'KH 12:1-2',
    note: 'He prints the rate as 59′ 8″; his own worked example and his 10-day table both need the extra third of a second, so that is the operative figure.',
  },
  {
    name: "The sun's slow point (apogee)",
    hebrew: 'גובה השמש',
    epoch: `${dms(SUN.APOGEE_START)} of the 3rd sign`,
    rate: '1.5″ every 10 days',
    ref: 'KH 12:2',
    note: 'The crawl of the whole solar circle — about a degree in seventy years.',
  },
  {
    name: "The moon's mean place",
    hebrew: 'אמצע הירח',
    epoch: `${dms(MOON.START_POSITION)} of the 2nd sign`,
    rate: `${dms(MOON.MEAN_MOTION_PER_DAY)} a day`,
    ref: 'KH 14:1, 14:4',
    note: 'The fastest thing in the sky — a whole circle in under a month.',
  },
  {
    name: "The moon's place on its own wobble (maslul)",
    hebrew: 'אמצע המסלול',
    epoch: dms(MOON.MASLUL_START),
    rate: `${dms(MOON.MASLUL_MEAN_MOTION)} a day`,
    ref: 'KH 14:3-4',
    note: 'Slightly slower than the moon itself, which is why the wobble slides.',
  },
  {
    name: 'The crossing point (node)',
    hebrew: 'הראש',
    epoch: dms(NODE.START_POSITION),
    rate: `${dms(NODE.DAILY_MOTION)} a day — backwards`,
    ref: 'KH 16:2-3',
    note: "Where the moon's tilted path cuts the sun's road; the only one that runs against the traffic.",
  },
];

export default function ThirteenNumbers() {
  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold">Thirteen numbers</h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Everything the nineteen chapters do stands on thirteen numbers the Rambam states
              outright — and funnels into one.
            </p>
          </div>
          <Link to="/book" className="shrink-0 text-sm text-[var(--color-accent)] hover:underline">
            ← The book
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-base font-bold">One pattern, everywhere</h2>
          <p className="mt-2">
            Strip away the tables and the vocabulary and every calculation in the whole method is
            the same move: <strong>take an anchor, add a speed times the days elapsed, throw away
            whole circles</strong>. It is how you read a clock — you don't ask where the hand has
            been, only where it started and how fast it turns. So the method's real foundations
            are exactly its anchors and its speeds, and there are thirteen of them.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold">The calendar's three (chapter 6)</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>
              <strong>
                The month: {MONTH_DAYS} days, {MONTH_HOURS} hours, {MONTH_PARTS} parts
              </strong>{' '}
              — the
              mean time from one conjunction to the next (KH 6:3). The single most important
              number in the system; chapters 6 through 10 are nothing but multiples of it with
              the weeks thrown away.
            </li>
            <li>
              <strong>
                The anchor: molad of Tishrei, year one — day {BAHARAD.dayOfWeek} (Monday),{' '}
                {BAHARAD.hours} hours, {BAHARAD.parts} parts
              </strong>{' '}
              — <span className="hebrew-text">בהר"ד</span> (KH 6:8). Every molad ever calculated
              is this number plus whole months.
            </li>
            <li>
              <strong>Seven leap years in every nineteen</strong> (KH 6:10-11) — the one number
              that ties the moon's months to the sun's seasons, so Pesach stays in spring.
            </li>
          </ol>
          <p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">
            Everything else in the fixed calendar — the year remainders, the cycle remainder, the
            four postponements — is derived from these three or is a rule about them, not a new
            measurement. The{' '}
            <Link to="/book/6" className="text-[var(--color-accent)] hover:underline">
              molad ladder in chapter 6
            </Link>{' '}
            is the three of them at work.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold">The astronomy's five pairs (chapters 12-16)</h2>
          <p className="mt-2">
            The sighting calculation adds one moment — <strong>the epoch</strong>, the eve of
            Thursday, 3 Nisan 4938 (KH 11:16) — and for five quantities, where each stood that
            evening and how fast it moves. Five anchors, five speeds: ten numbers.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-[13px]">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-secondary)]">
                  <th className="py-1 pr-3 font-bold">quantity</th>
                  <th className="py-1 pr-3 font-bold">at the epoch</th>
                  <th className="py-1 pr-3 font-bold">speed</th>
                  <th className="py-1 font-bold">stated at</th>
                </tr>
              </thead>
              <tbody>
                {PAIRS.map((p) => (
                  <tr key={p.name} className="border-b border-[var(--color-border)]/40 align-top">
                    <td className="py-1.5 pr-3">
                      {p.name} <span className="hebrew-text text-[var(--color-text-secondary)]">{p.hebrew}</span>
                      <div className="text-[11px] text-[var(--color-text-secondary)]">{p.note}</div>
                    </td>
                    <td className="py-1.5 pr-3 font-mono whitespace-nowrap">{p.epoch}</td>
                    <td className="py-1.5 pr-3 font-mono whitespace-nowrap">{p.rate}</td>
                    <td className="py-1.5 font-mono text-[var(--color-text-secondary)] whitespace-nowrap">{p.ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold">What the famous tables are not</h2>
          <p className="mt-2">
            The correction tables — the sun's (KH 13), the moon's (KH 15), the latitude rule with
            its 5° ceiling (KH 16), chapter 17's by-sign tables — are <em>not</em> further
            fundamentals. They are fixed recipes applied to the running numbers above: look up,
            share out, add or subtract. Nothing in them is measured anew; once the thirteen are
            set, the tables never change.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold">Thirteen in, one out</h2>
          <p className="mt-2">
            Each evening the machinery exists to produce just three working numbers —{' '}
            <strong>the sun's true place, the moon's true place, and the moon's height off the
            sun's road</strong>. From those come the gap (
            <span className="hebrew-text">אורך ראשון</span>) and the height (
            <span className="hebrew-text">רוחב ראשון</span>), and after{' '}
            <Link to="/book/17" className="text-[var(--color-accent)] hover:underline">
              chapter 17's chain
            </Link>{' '}
            of corrections, the single number the verdict reads:{' '}
            <span className="hebrew-text">קשת הראייה</span>, the arc of sighting. Thirteen numbers
            in; a yes or a no out.
          </p>
        </section>

        <p className="border-t border-[var(--color-border)] pt-3 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
          Every number on this page is the Rambam's, from the chapter cited beside it — and this
          page renders them from the same constants the calculators run on, so the two cannot
          disagree. The framing — counting the foundations to thirteen — is this book's, not his.
        </p>
        <SiteCredit />
      </main>
    </div>
  );
}
