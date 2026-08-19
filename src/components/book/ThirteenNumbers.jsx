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
          <h2 className="text-base font-bold">Start at the window</h2>
          <p className="mt-2">
            Stand at a west-facing window — or on the mountaintop, with KH 18:1's watchers — on
            the evening after the 29th of the month. One question: <strong>will a thin crescent
            show tonight?</strong> Everything below exists to answer it, and it is worth feeling
            how much the innocent question actually demands (
            <Link to="/sky" className="text-[var(--color-accent)] hover:underline">
              the Sky page
            </Link>{' '}
            draws all of it on the window itself).
          </p>
          <p className="mt-2">
            Knowing where the moon is isn't enough. A crescent that thin shows only against a
            sky dark enough to lose to it — so first you must know <strong>how dark it will be,
            and when</strong>: that is, exactly where the sun is and when it goes down. And the
            sun refuses to be simple about it. It does not run at one speed — some stretches of
            the year it hurries, others it drags — so its true place is never quite where an
            even-paced sun would be. And it does not set in one place: watch from the same
            window through a year and the setting point swings along the horizon, and with it the{' '}
            <strong>angle</strong> the sun's path cuts down through the horizon — which sets how
            fast the sky darkens, and how a given separation between moon and sun translates
            into the moon standing clear of the glow or drowning in it.
          </p>
          <p className="mt-2">
            The moon is worse. Everything the sun does wrong it does too — its own drag and
            hurry, faster and bigger — and then one more: it does not even ride the sun's road,
            but a path tilted against it, so it stands now above the road, now below, by up to
            ten of the sun's widths. So the window question needs three things the eye cannot
            supply in advance: where the sun truly is, where the moon truly is, and how the two
            will sit against the horizon at dusk. The whole method is the shortest honest path
            to those three — and the path runs through exactly thirteen numbers.
          </p>
        </section>

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
          <h2 className="text-base font-bold">The two odd ones, and why they earn their place</h2>
          <p className="mt-2">
            Where the sun and the moon are needs no argument. The <strong>maslul</strong> is the
            same story as the sun's slow point, told of the moon: the moon also drags and hurries
            around its circle, and the maslul is where it currently stands in that
            drag-and-hurry cycle — chapter 15's correction is looked up by it, just as chapter
            13's is looked up by the sun's distance from the slow point. The remaining two look
            like bookkeeping and are anything but.
          </p>
          <p className="mt-2">
            <strong>The slow point (apogee)</strong> is where the sun's unevenness is anchored.
            The sun drags near that point and hurries opposite it, and{' '}
            <Link to="/book/13" className="text-[var(--color-accent)] hover:underline">
              chapter 13's correction
            </Link>{' '}
            is looked up entirely by the sun's distance from it — reaching{' '}
            <strong>1° 59′</strong> at ninety degrees away. Skip it and you are stuck with the
            pretend sun, wrong by up to two degrees — and that error lands one-for-one in{' '}
            <strong>the gap</strong> (moon minus sun), on which the verdict lives, with its
            thresholds only single degrees apart. It is also why the seasons run unequal lengths;
            and its crawl of a degree per seventy years is stated so the method would not quietly
            expire — by now it has drifted a whole sign's worth of thirteen degrees.
          </p>
          <p className="mt-2">
            <strong>The crossing point (node)</strong> is where the moon's tilt is anchored. The
            moon does not ride the sun's road; its path is tilted against it, and{' '}
            <Link to="/book/16" className="text-[var(--color-accent)] hover:underline">
              chapter 16
            </Link>{' '}
            turns the moon's distance from the crossing into its <strong>height off the road —
            up to 5°, north or south</strong>. That one number is the heaviest lever in the
            verdict: it decides whether the crescent hangs above the road or below it at dusk,
            and in the chain's last step two thirds of it swing the arc by more than three
            degrees between a northern moon and a southern one. It also explains why there is no
            eclipse of the sun every month — the monthly pass almost always sails above or below,
            and only a meeting near a crossing truly lines up. And because the crossing walks{' '}
            <em>backwards</em> (his 3′ 11″ a day works out to a full lap in about 18.6 years),
            the pattern of high-riding and low-riding crescents slides slowly through the years.
          </p>
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
