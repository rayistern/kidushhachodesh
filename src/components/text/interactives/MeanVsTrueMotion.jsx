/**
 * MeanVsTrueMotion — why uniform motion looks uneven. [R] KH 11:13-15
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching interactive)
 * ═══════════════════════════════════════════════════════════════════
 *
 * KH 11:13-15 states the idea the whole rest of the book runs on: each
 * body moves at one unchanging speed in its own orbit, but the orbit is
 * not centred on the earth, so measured against the constellations its
 * progress appears to speed up and slow down. The uniform rate is the
 * *mean* motion (אמצע); what an observer on earth actually sees is the
 * *true* position (מקום אמיתי).
 *
 * The geometry drawn here is the simple eccentric: a circle whose
 * centre C is displaced from the earth E. The body moves at a constant
 * angular rate about C — genuinely uniform — while the angle subtended
 * at E runs ahead of or behind it. The gap between the two rays is the
 * correction (מסלול) that KH 13 tabulates for the sun and KH 15 for the
 * moon.
 *
 * ── On the numbers shown ──
 * The eccentricity is not decorative. KH 13:4's correction table peaks
 * at 1°59' when the maslul is 90°, and for a simple eccentric the peak
 * equation is arctan(e/R) — so e/R = tan(1°59') reproduces the
 * Rambam's own table to within about a minute of arc across its whole
 * range. The card shows that comparison live rather than asserting it,
 * because it is the evidence that this picture really is the model
 * behind his tables and not merely a picture that resembles it.
 *
 * The displayed geometry exaggerates the offset by default (at true
 * scale the displacement is ~3.5% of the radius and invisible); the
 * numbers are always computed from the real ratio, never the
 * exaggerated one. The label states which is which.
 */
import React, { useState, useMemo } from 'react';
import InteractiveCard from './InteractiveCard';
import { CONSTANTS } from '../../../engine/constants';

const DEG = Math.PI / 180;

// Peak of the Rambam's sun correction table (KH 13:4), in degrees.
const PEAK_CORRECTION = 1 + 59 / 60;
// Eccentricity ratio that reproduces that peak for a simple eccentric.
const ECCENTRICITY = Math.tan(PEAK_CORRECTION * DEG);

/**
 * Angle subtended at the earth by a body moving uniformly about the
 * displaced centre, and the correction between that and the mean.
 *
 * `alpha` is measured from apogee, the direction in which the orbit's
 * centre is displaced — the same origin the Rambam measures the maslul
 * from, which is why the result is directly comparable to his table.
 */
function equationOfCentre(alpha, eccentricity) {
  const rad = alpha * DEG;
  // Earth at the origin, centre displaced by `eccentricity` toward apogee.
  const x = eccentricity + Math.cos(rad);
  const y = Math.sin(rad);
  const trueAngle = Math.atan2(y, x) / DEG;
  let correction = alpha - trueAngle;
  // Fold into (-180, 180] so the sign reads as "ahead" or "behind".
  correction = ((correction + 540) % 360) - 180;
  return { trueAngle: ((trueAngle % 360) + 360) % 360, correction };
}

/** The Rambam's tabulated correction (KH 13:4), linearly interpolated. */
function rambamCorrection(alpha) {
  const table = CONSTANTS.SUN_MASLUL_CORRECTIONS;
  // The table runs 0-180°; beyond that the Rambam mirrors it.
  const folded = alpha > 180 ? 360 - alpha : alpha;
  for (let i = 0; i < table.length - 1; i++) {
    const lo = table[i];
    const hi = table[i + 1];
    if (folded >= lo.maslul && folded <= hi.maslul) {
      const t = (folded - lo.maslul) / (hi.maslul - lo.maslul);
      return lo.correction + t * (hi.correction - lo.correction);
    }
  }
  return 0;
}

function formatArc(deg) {
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const m = Math.round((abs - d) * 60);
  const sign = deg < 0 ? '−' : '';
  return m === 60 ? `${sign}${d + 1}° 0'` : `${sign}${d}° ${m}'`;
}

export default function MeanVsTrueMotion() {
  const [alpha, setAlpha] = useState(90);
  const [exaggerate, setExaggerate] = useState(true);

  const { trueAngle, correction } = useMemo(
    () => equationOfCentre(alpha, ECCENTRICITY),
    [alpha],
  );
  const tabulated = useMemo(() => rambamCorrection(alpha), [alpha]);
  // The Rambam's table is unsigned — it states a magnitude and KH 13:5
  // tells you whether to add or subtract. Compare magnitudes.
  const discrepancy = Math.abs(Math.abs(correction) - tabulated);

  return (
    <InteractiveCard
      title="Uniform motion, uneven appearance"
      source="KH 11:13-15"
      blurb="the orbit is not centred on the earth, so a constant speed looks variable from here"
    >
      <div className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)]">
        <EccentricDiagram
          alpha={alpha}
          trueAngle={trueAngle}
          eccentricity={exaggerate ? 0.42 : ECCENTRICITY}
        />

        <div className="min-w-0">
          <label className="block">
            <span className="text-xs font-bold text-[var(--color-text-secondary)]">
              Mean position, measured from apogee (מסלול) — {alpha}°
            </span>
            <input
              type="range"
              min="0"
              max="359"
              value={alpha}
              onChange={(e) => setAlpha(Number(e.target.value))}
              className="mt-1 w-full accent-[var(--color-accent)]"
              aria-label="Mean position measured from apogee, in degrees"
            />
          </label>

          <dl className="mt-3 space-y-1.5 text-sm">
            <Row
              term="Mean (אמצע)"
              value={`${alpha}°`}
              hint="uniform — equal angles in equal times, about the orbit's own centre"
              color="var(--color-silver)"
            />
            <Row
              term="True (אמיתי)"
              value={`${trueAngle.toFixed(2)}°`}
              hint="what the observer on earth measures against the constellations"
              color="var(--color-gold)"
            />
            <Row
              term="Correction"
              value={formatArc(correction)}
              hint={
                Math.abs(correction) < 0.005
                  ? 'nil — at apogee and perigee the two rays coincide'
                  : correction > 0
                    ? 'the true position lags behind the mean'
                    : 'the true position runs ahead of the mean'
              }
              color="var(--color-accent)"
            />
          </dl>

          <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
            <div className="text-xs font-bold text-[var(--color-text)]">
              Against the Rambam's own table
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-[var(--color-text-secondary)]">This geometry</div>
                <div className="font-mono text-sm text-[var(--color-gold)]">
                  {formatArc(Math.abs(correction))}
                </div>
              </div>
              <div>
                <div className="text-[var(--color-text-secondary)]">KH 13:4 table</div>
                <div className="font-mono text-sm text-[var(--color-accent)]">
                  {formatArc(tabulated)}
                </div>
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
              They agree to within {formatArc(discrepancy)}. The correction table the Rambam
              gives for the sun in chapter 13 is what this displaced circle produces — chapter
              11 states the principle, and chapter 13 hands you the answers already worked out.
            </p>
          </div>

          <label className="mt-3 flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <input
              type="checkbox"
              checked={exaggerate}
              onChange={(e) => setExaggerate(e.target.checked)}
              className="accent-[var(--color-accent)]"
            />
            Exaggerate the displacement in the drawing
            {exaggerate && (
              <span className="text-[var(--color-gold)]">
                (true offset is {(ECCENTRICITY * 100).toFixed(1)}% of the radius)
              </span>
            )}
          </label>
          <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
            The drawing only; every number above uses the real ratio.
          </p>
        </div>
      </div>
    </InteractiveCard>
  );
}

function Row({ term, value, hint, color }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <dt className="flex items-center gap-1.5 font-bold" style={{ color }}>
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: color }}
        />
        {term}
      </dt>
      <dd className="font-mono">{value}</dd>
      <dd className="w-full text-[11px] text-[var(--color-text-secondary)]">{hint}</dd>
    </div>
  );
}

function EccentricDiagram({ alpha, trueAngle, eccentricity }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const R = 96;
  // Earth stays at the centre of the frame; the orbit's centre is
  // displaced toward apogee (drawn to the right).
  const offset = eccentricity * R;
  const centreX = cx + offset;
  const centreY = cy;

  const rad = alpha * DEG;
  const bodyX = centreX + R * Math.cos(rad);
  const bodyY = centreY - R * Math.sin(rad);

  // Extend both rays to a common outer circle — the sphere of the
  // constellations, against which both angles are read off (KH 11:14).
  const rSphere = R + 46;
  const meanTipX = centreX + rSphere * Math.cos(rad);
  const meanTipY = centreY - rSphere * Math.sin(rad);
  const trueRad = trueAngle * DEG;
  const trueTipX = cx + rSphere * Math.cos(trueRad);
  const trueTipY = cy - rSphere * Math.sin(trueRad);

  return (
    <figure className="mx-auto w-full max-w-[280px]">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full" role="img"
        aria-label="A circular orbit whose centre is displaced from the earth, showing the mean and true directions to the body diverging">
        {/* Sphere of the constellations */}
        <circle
          cx={cx}
          cy={cy}
          r={rSphere}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="1"
          strokeDasharray="2 4"
        />

        {/* The body's own orbit — a true circle, uniformly traversed */}
        <circle cx={centreX} cy={centreY} r={R} fill="none" stroke="var(--color-border)" strokeWidth="1.5" />

        {/* Apogee/perigee line through both centres */}
        <line
          x1={centreX - R}
          y1={centreY}
          x2={centreX + R}
          y2={centreY}
          stroke="var(--color-border)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <text x={centreX + R + 4} y={centreY - 5} fontSize="8" fill="var(--color-text-secondary)">
          apogee
        </text>

        {/* Mean ray — from the orbit's centre, the uniform angle */}
        <line x1={centreX} y1={centreY} x2={meanTipX} y2={meanTipY}
          stroke="var(--color-silver)" strokeWidth="1.5" strokeDasharray="4 3" />

        {/* True ray — from the earth, the observed angle */}
        <line x1={cx} y1={cy} x2={trueTipX} y2={trueTipY}
          stroke="var(--color-gold)" strokeWidth="2" />

        {/* Bodies */}
        <circle cx={centreX} cy={centreY} r="3" fill="var(--color-silver)" />
        <text x={centreX + 5} y={centreY + 12} fontSize="8" fill="var(--color-text-secondary)">
          orbit centre
        </text>

        <circle cx={cx} cy={cy} r="5.5" fill="var(--color-accent)" />
        <text x={cx - 26} y={cy + 16} fontSize="8" fill="var(--color-text-secondary)">
          earth
        </text>

        <circle cx={bodyX} cy={bodyY} r="6" fill="var(--color-gold)" />
      </svg>
      <figcaption className="mt-1 text-center text-[11px] text-[var(--color-text-secondary)]">
        Silver: the uniform angle at the orbit's centre. Gold: the angle actually seen from
        earth.
      </figcaption>
    </figure>
  );
}
