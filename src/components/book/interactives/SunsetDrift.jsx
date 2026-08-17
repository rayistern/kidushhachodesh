/**
 * SunsetDrift — why the season correction exists at all. [R] KH 14:5-6
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **editorial** — this is an EXPLANATION, not the Rambam's.
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * KH 14:5 gives a table and no reason. This figure offers the reason —
 * and it is important to be exact about whose reason it is.
 *
 * What the text says: the number wanted is the moon's mean about twenty
 * minutes after sunset (14:6). That much is his.
 *
 * What is inferred here: sunset drifts through the year, so "twenty
 * minutes after sunset" is a different hour in June than in December;
 * the moon moves about half a degree an hour; and a correction keyed to
 * the sun's position is a correction keyed to the season, which is a
 * correction keyed to how late sunset is. He does not say this. The
 * chart is a modern check on a proposed reading, not evidence about his
 * method, and the caption says so.
 *
 * ── The mismatch that used to be here ──
 * While the engine shipped Sefaria's printed reading, the table was
 * lopsided (+15' at most on one side, −30' on the other) against a
 * nearly symmetric drift, and this caption said so. On 2026-08-17 the
 * engine adopted the Yemenite reading, +30' for 60°–120°, and the
 * mismatch dissolved: the mean gap between the two curves falls from
 * 8.4' to 6.0'. That improvement is a *consequence* of the textual
 * decision, not a reason for it — the case rests on the manuscripts.
 * See OPEN_QUESTIONS.md Q8 and SeasonBands.
 */
import React, { useMemo } from 'react';
import InteractiveCard from '../../text/interactives/InteractiveCard';
import { CONSTANTS } from '../../../engine/constants';
import { dmsToDecimal } from '../../../engine/dmsUtils';
import { jerusalemSunsetHours, meanJerusalemSunsetHours } from '../../../lib/modernAstronomy';

// Arcminutes of moon travel per hour.
const MOON_PER_HOUR = (dmsToDecimal(CONSTANTS.MOON.MEAN_MOTION_PER_DAY) / 24) * 60;

/** The sun's approximate longitude on a day of the year (0° ≈ 20 March). */
function sunLongitudeForDay(dayOfYear) {
  return (((dayOfYear - 79) / 365.2422) * 360 + 360) % 360;
}

/** The Rambam's correction, in arcminutes, for a sun longitude. */
function correctionAt(longitude) {
  const row = CONSTANTS.SEASON_CORRECTIONS.find(
    (r) => longitude >= r.sunFrom && longitude < r.sunTo,
  );
  return row ? row.adjustment * 60 : 0;
}

export default function SunsetDrift() {
  const { points, meanSunset } = useMemo(() => {
    const mean = meanJerusalemSunsetHours();
    const pts = [];
    for (let d = 1; d <= 365; d += 1) {
      const sunset = jerusalemSunsetHours(d);
      pts.push({
        day: d,
        // Arcminutes of moon travel owed to sunset being off the average.
        implied: (sunset - mean) * MOON_PER_HOUR,
        rambam: correctionAt(sunLongitudeForDay(d)),
        sunsetHours: sunset,
      });
    }
    return { points: pts, meanSunset: mean };
  }, []);

  const latest = points.reduce((a, b) => (b.sunsetHours > a.sunsetHours ? b : a));
  const earliest = points.reduce((a, b) => (b.sunsetHours < a.sunsetHours ? b : a));
  const swingMinutes = (latest.sunsetHours - earliest.sunsetHours) * 60;

  return (
    <InteractiveCard
      title="Why the time of year comes into it"
      source="KH 14:5-6 · editorial reading"
      blurb="the answer is wanted at sunset, and sunset moves"
      defaultOpen
    >
      <Chart points={points} />

      <div className="mt-3 grid gap-2 sm:grid-cols-3 text-xs">
        <Stat label="Sunset swings by" value={`${swingMinutes.toFixed(0)} min`} note="across the year, in Jerusalem" />
        <Stat
          label="That is worth"
          value={`±${((swingMinutes / 2 / 60) * MOON_PER_HOUR).toFixed(0)}′`}
          note="of moon travel"
        />
        <Stat label="His biggest nudge" value="±30′" note="which is about 55 minutes of time" />
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        The two lines rise and fall together, and his steps land where sunset is most extreme —
        around midsummer and midwinter. Later sunset means more time has passed since the
        position was worked out, so the moon has travelled further, so you add. Earlier sunset,
        subtract. That is the whole of it: not the sun pulling on the moon, but a clock
        correction wearing the sun's clothes.
      </p>

      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        The steps are symmetric, and so is the drift: he reaches +30′ at midsummer and −30′ at
        midwinter, where the silver line reaches about +35′ and −38′. That symmetry is not
        automatic — the standard printed editions read +15′ where this site reads +30′, which
        would leave the gold line stopping half way up in summer while still touching −30′ in
        winter. The next figure sets the two readings side by side.
      </p>

      <p className="mt-2 text-[10px] leading-relaxed text-[var(--color-text-secondary)] opacity-70">
        Editor's note: KH 14:6 says the number wanted is the moon's mean about twenty minutes
        after sunset — that is the Rambam's. The explanation that the table therefore tracks
        sunset is a reading offered here, not something he states. The sunset curve is modern
        (NOAA's algorithm), plotted as a check on that reading, not as evidence about his method.
      </p>
    </InteractiveCard>
  );
}

function Stat({ label, value, note }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2">
      <div className="text-[var(--color-text-secondary)]">{label}</div>
      <div className="font-mono text-base font-bold text-[var(--color-gold)]">{value}</div>
      <div className="text-[10px] text-[var(--color-text-secondary)]">{note}</div>
    </div>
  );
}

function Chart({ points }) {
  const w = 520;
  const h = 190;
  const padL = 34;
  const padR = 10;
  const padT = 12;
  const padB = 26;

  const span = 42; // arcminutes shown above and below zero
  const x = (day) => padL + ((day - 1) / 364) * (w - padL - padR);
  const y = (arcmin) => padT + ((span - arcmin) / (2 * span)) * (h - padT - padB);

  const line = (key) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.day).toFixed(1)} ${y(p[key]).toFixed(1)}`).join(' ');

  const months = [
    { d: 1, label: 'Jan' },
    { d: 91, label: 'Apr' },
    { d: 182, label: 'Jul' },
    { d: 274, label: 'Oct' },
  ];

  return (
    <figure>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img"
        aria-label="Sunset drift through the year plotted against the Rambam's season correction; the two rise and fall together">
        <line x1={padL} y1={y(0)} x2={w - padR} y2={y(0)} stroke="var(--color-border)" strokeWidth="1" />
        {/* Guides at every step he uses, not just the outer pair. With only
            +-30 drawn, the gold line touching -30 while stopping half way to
            +30 was there to be seen but easy to miss — which is the whole
            point about where each step sits. Guides at every value he
            uses, so the +30' and -30' plateaus are both readable. */}
        {[30, 15, -15, -30].map((v) => (
          <g key={v}>
            <line
              x1={padL}
              y1={y(v)}
              x2={w - padR}
              y2={y(v)}
              stroke="var(--color-border)"
              strokeWidth="1"
              strokeDasharray={Math.abs(v) === 30 ? '2 4' : '1 5'}
            />
            <text x={2} y={y(v) + 3} fontSize="8" fill="var(--color-text-secondary)">
              {v > 0 ? `+${v}′` : `${v}′`}
            </text>
          </g>
        ))}


        <text x={10} y={y(0) + 3} fontSize="8" fill="var(--color-text-secondary)">0</text>

        {/* What sunset drift alone would ask for */}
        <path d={line('implied')} fill="none" stroke="var(--color-silver)" strokeWidth="1.5" />
        {/* What the Rambam actually prescribes */}
        <path d={line('rambam')} fill="none" stroke="var(--color-gold)" strokeWidth="2" />

        {months.map((m) => (
          <text key={m.d} x={x(m.d)} y={h - 8} fontSize="8" fill="var(--color-text-secondary)" textAnchor="middle">
            {m.label}
          </text>
        ))}
      </svg>
      <figcaption className="mt-1 flex flex-wrap gap-3 text-[11px] text-[var(--color-text-secondary)]">
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 bg-[var(--color-silver)]" /> what sunset drift
          alone would ask for
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 bg-[var(--color-gold)]" /> the Rambam's steps
        </span>
      </figcaption>
    </figure>
  );
}
