/**
 * Epicycle — the small circle riding on the big one. [R] KH 14:1
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The figure the whole chapter rests on. KH 14:1 says the moon "revolves
 * in a small orbit that does not encompass the earth", and that small
 * orbit "itself rotates in a larger orbit that encompasses the earth" —
 * an epicycle, described in words and never drawn.
 *
 * Two rays, in two colours:
 *   silver  earth → centre of the small circle   = אמצע הירח
 *   gold    the moon itself, on the small circle = placed by אמצע המסלול
 *
 * Both driven by the real engine functions at a real day count, so the
 * numbers under the picture are the same ones the calculators below
 * produce.
 *
 * The small circle is drawn far larger than life. The Rambam gives its
 * radius as about 5° (KH 15:9, and CONSTANTS.GALGALIM); at that scale it
 * is a barely visible wobble and the figure teaches nothing. The caption
 * says so, and every number shown is computed from the real values.
 */
import React, { useState, useMemo } from 'react';
import InteractiveCard from '../../text/interactives/InteractiveCard';
import { calculateMoonMeanLongitude, calculateMoonMaslul } from '../../../engine/moonCalculations';
import { formatDms } from '../../../engine/dmsUtils';
import { zodiacPosition } from '../../../engine/zodiac';

const DEG = Math.PI / 180;

export default function Epicycle() {
  const [days, setDays] = useState(29);

  const { mean, anomaly } = useMemo(
    () => ({
      mean: calculateMoonMeanLongitude(days).result,
      anomaly: calculateMoonMaslul(days).result,
    }),
    [days],
  );

  const meanSign = zodiacPosition(mean);

  return (
    <InteractiveCard
      title="The small circle riding on the big one"
      source="KH 14:1"
      blurb="two things moving at once — and each one needs its own number"
      defaultOpen
    >
      <div className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)]">
        <Figure mean={mean} anomaly={anomaly} />

        <div className="min-w-0">
          <label className="block">
            <span className="text-xs font-bold text-[var(--color-text-secondary)]">
              Days since the starting point — {days.toLocaleString()}
            </span>
            <input
              type="range"
              min="0"
              max="60"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="mt-1 w-full accent-[var(--color-accent)]"
              aria-label="Days since the starting point"
            />
          </label>

          <dl className="mt-3 space-y-2 text-sm">
            <Reading
              colour="var(--color-silver)"
              term="Where the small circle has got to"
              hebrew="אמצע הירח"
              value={formatDms(mean)}
              note={`in ${meanSign.translit}`}
            />
            <Reading
              colour="var(--color-gold)"
              term="Where the moon sits on the small circle"
              hebrew="אמצע המסלול"
              value={formatDms(anomaly)}
              note="measured round the small circle from its far point, not round the sky"
            />
          </dl>

          <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
            Slide it and watch the two disagree. The silver arm sweeps round steadily, and the moon
            travels round the small circle at its own steady rate — so the faint line from the earth
            to the moon runs a little behind the arm, then catches up, then runs ahead, over and
            over. That swinging is what the second number is for, and it is why one number could
            never have been enough.
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
            The second number is counted from the <strong>far point</strong> of the small circle —
            the spot furthest from the earth — and that point turns along with the arm. So at 0° and
            again at 180° the moon lies exactly on the arm and the faint line merges with it: no
            disagreement at all. Those are precisely the two rows where his correction table (KH
            15:4-6) reads zero, which is how you can tell that is what the number counts from.
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
            Neither of these is yet "where the moon is". Combining them is chapter 15's job.
          </p>
        </div>
      </div>
    </InteractiveCard>
  );
}

function Reading({ colour, term, hebrew, value, note }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-bold" style={{ color: colour }}>
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: colour }}
        />
        {term}
        <span className="hebrew-text opacity-80">{hebrew}</span>
      </dt>
      <dd className="ml-3.5 font-mono text-sm">{value}</dd>
      <dd className="ml-3.5 text-[11px] text-[var(--color-text-secondary)]">{note}</dd>
    </div>
  );
}

function Figure({ mean, anomaly }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const R = 88; // big circle
  const r = 30; // small circle — exaggerated; really about 5°

  const meanRad = mean * DEG;
  // Centre of the small circle, carried round the big circle.
  const ex = cx + R * Math.cos(meanRad);
  const ey = cy - R * Math.sin(meanRad);

  // The moon on the rim of the small circle.
  //
  // The maslul is measured FROM THE APOGEE of the small circle — the
  // point furthest from the earth, which lies along the arm and turns
  // with it. So the moon's absolute direction is the arm's direction
  // less the maslul, not the maslul on its own.
  //
  // The engine settles both halves of this. KH 15:4-6's table gives a
  // correction of exactly 0 at maslul 0° and 0° at 180° — which happens
  // only if those two points are the ones lying on the earth-centre
  // line — and KH 15:6 subtracts the correction below 180°, so the moon
  // must appear *behind* the arm there. Drawing the maslul from a fixed
  // direction instead put the moon off the line at 0° and 180° and gave
  // it the wrong sign for half the circle.
  const moonRad = (mean - anomaly) * DEG;
  const mx = ex + r * Math.cos(moonRad);
  const my = ey - r * Math.sin(moonRad);

  return (
    <figure className="mx-auto w-full max-w-[280px]">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full"
        role="img"
        aria-label="The earth at the centre, a large circle around it, and a small circle riding on that large circle with the moon on its rim"
      >
        {/* The big circle the small one travels along */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--color-border)" strokeWidth="1.5" />

        {/* Arm from earth to the centre of the small circle */}
        <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="var(--color-silver)" strokeWidth="1.5" strokeDasharray="4 3" />

        {/* The small circle, and the moon on its rim */}
        <circle cx={ex} cy={ey} r={r} fill="var(--color-accent)" fillOpacity="0.08" stroke="var(--color-accent)" strokeWidth="1.2" />
        <line x1={ex} y1={ey} x2={mx} y2={my} stroke="var(--color-gold)" strokeWidth="1.2" />

        {/* Where you'd actually look to see the moon */}
        <line x1={cx} y1={cy} x2={mx} y2={my} stroke="var(--color-gold)" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />

        {/* The far point of the small circle — where the maslul counts
            from. It lies on the arm extended, so it turns with the arm;
            a reader asked where it was, having met it in chapter 15's
            one-to-two lock, and it was not drawn. */}
        <circle
          cx={ex + r * Math.cos(meanRad)}
          cy={ey - r * Math.sin(meanRad)}
          r="2.5"
          fill="none"
          stroke="var(--color-text-secondary)"
          strokeWidth="1.2"
        />
        <text
          x={ex + (r + 12) * Math.cos(meanRad)}
          y={ey - (r + 12) * Math.sin(meanRad) + 3}
          fontSize="7"
          textAnchor="middle"
          fill="var(--color-text-secondary)"
        >
          far point
        </text>

        <circle cx={ex} cy={ey} r="3" fill="var(--color-silver)" />
        <circle cx={mx} cy={my} r="6" fill="var(--color-gold)" />
        <circle cx={cx} cy={cy} r="6" fill="var(--color-accent)" />
        <text x={cx} y={cy + 18} fontSize="8" fill="var(--color-text-secondary)" textAnchor="middle">
          earth
        </text>
        <text x={mx} y={my - 11} fontSize="8" fill="var(--color-gold)" textAnchor="middle">
          moon
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-[11px] text-[var(--color-text-secondary)]">
        The small circle is drawn much bigger than it really is — the Rambam gives it a radius of
        about 5°, which at true scale is a wobble you could barely see. The numbers are real.
      </figcaption>
    </figure>
  );
}
