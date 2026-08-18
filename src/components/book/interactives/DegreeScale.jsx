/**
 * DegreeScale — how big is a degree, actually? [R] KH 11:7
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **editorial** — the measuring anchors are not the Rambam's.
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Every number in this book is an angle, and a reader with no astronomy
 * behind them has no sense of how big one is. Chapter 11 said a minute
 * of arc is about a coin seen across a room, which helps for minutes and
 * not at all for the twenty and thirty degree figures that turn up from
 * chapter 15 onward.
 *
 * So: the standard hand anchors, which need no equipment and work for
 * anybody. Held at arm's length, a little finger covers about a degree,
 * a fist about ten, a spread hand about twenty. They are approximate by
 * nature — bigger hands sit on longer arms, which is why the trick works
 * across people — and the card says so rather than implying precision it
 * does not have.
 */
import React, { useState } from 'react';
import InteractiveCard from '../../text/interactives/InteractiveCard';

// Conventional rules of thumb, in degrees. Not the Rambam's, and not
// exact — see the note in the header and on screen.
const ANCHORS = [
  { deg: 0.5, label: 'the moon itself', hint: 'the full moon is about half a degree wide' },
  { deg: 1, label: 'your little finger', hint: 'held out at arm’s length' },
  { deg: 5, label: 'three middle fingers', hint: 'together, at arm’s length' },
  { deg: 10, label: 'your closed fist', hint: 'knuckles across, at arm’s length' },
  { deg: 20, label: 'a spread hand', hint: 'thumb tip to little-finger tip' },
  { deg: 90, label: 'horizon to straight up', hint: 'a quarter of the whole circle' },
];

export default function DegreeScale() {
  const [deg, setDeg] = useState(25);

  const fists = deg / 10;
  const moons = deg / 0.5;
  const upFraction = (deg / 90) * 100;

  return (
    <InteractiveCard
      title="How big is a degree?"
      source="KH 11:7 · editorial aid"
      blurb="everything in this book is an angle, so it helps to be able to see one"
      defaultOpen
    >
      <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
        Hold your arm straight out and look past your hand. Because a bigger hand sits on a
        longer arm, these work for almost anyone without measuring a thing.
      </p>

      <ul className="mt-3 space-y-1">
        {ANCHORS.map((a) => (
          <li key={a.deg} className="flex items-baseline gap-2 text-xs">
            <span className="w-12 shrink-0 text-right font-mono font-bold text-[var(--color-gold)]">
              {a.deg}°
            </span>
            <span className="min-w-0">
              <span className="text-[var(--color-text)]">{a.label}</span>
              <span className="text-[var(--color-text-secondary)]"> — {a.hint}</span>
            </span>
          </li>
        ))}
      </ul>

      <label className="mt-4 block">
        <span className="text-xs font-bold text-[var(--color-text-secondary)]">
          Try a size — {deg}°
        </span>
        <input
          type="range"
          min="1"
          max="90"
          value={deg}
          onChange={(e) => setDeg(Number(e.target.value))}
          className="mt-1 w-full accent-[var(--color-accent)]"
          aria-label="An angle in degrees"
        />
      </label>

      <Arc deg={deg} />

      <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-xs leading-relaxed">
        <div>
          <strong className="font-mono text-[var(--color-gold)]">{deg}°</strong> is about{' '}
          <strong className="text-[var(--color-text)]">
            {fists < 1 ? 'less than one fist' : `${fists.toFixed(1)} fists`}
          </strong>{' '}
          held at arm's length.
        </div>
        <div className="mt-1 text-[var(--color-text-secondary)]">
          That is {Math.round(moons)} full moons laid side by side, and{' '}
          {upFraction.toFixed(0)}% of the way from the horizon to straight overhead.
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Worth carrying forward. When chapter 17 says the moon must be more than nine degrees from
        the sun to be seen at all, that is about <strong>one fist</strong>. When it says fifteen
        degrees is certain, that is a fist and a half. The whole question turns on distances you
        could measure with your hand.
      </p>
      <p className="mt-2 text-[10px] leading-relaxed text-[var(--color-text-secondary)] opacity-70">
        Editor's note: these anchors are the conventional stargazers' rules of thumb, not the
        Rambam's — he gives no such aid. They are approximate by design.
      </p>
    </InteractiveCard>
  );
}

/** The angle drawn as an actual opening, against the 90° quarter. */
function Arc({ deg }) {
  const w = 300;
  const h = 150;
  const ox = 24;
  const oy = h - 20;
  const r = 112;
  const rad = (d) => (d * Math.PI) / 180;
  const pt = (d, radius = r) => [ox + radius * Math.cos(rad(d)), oy - radius * Math.sin(rad(d))];

  const [qx, qy] = pt(90);
  const [ax, ay] = pt(deg);

  return (
    <figure className="mt-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[300px]" role="img"
        aria-label={`An angle of ${deg} degrees opened from the horizon, against the full quarter to overhead`}>
        {/* the ground, and straight up */}
        <line x1={ox} y1={oy} x2={ox + r} y2={oy} stroke="var(--color-border)" strokeWidth="1.5" />
        <line x1={ox} y1={oy} x2={qx} y2={qy} stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" />
        <text x={ox + r - 24} y={oy + 13} fontSize="8" fill="var(--color-text-secondary)">
          horizon
        </text>
        <text x={qx + 4} y={qy + 10} fontSize="8" fill="var(--color-text-secondary)">
          overhead
        </text>

        {/* the angle itself */}
        <path
          d={`M ${ox} ${oy} L ${ox + r} ${oy} A ${r} ${r} 0 0 0 ${ax} ${ay} Z`}
          fill="var(--color-accent)"
          fillOpacity="0.18"
        />
        <line x1={ox} y1={oy} x2={ax} y2={ay} stroke="var(--color-gold)" strokeWidth="2" />

        {/* a moon at that height, to scale-ish */}
        <circle cx={ax} cy={ay} r="4" fill="var(--color-silver)" />

        <text
          x={ox + 52 * Math.cos(rad(deg / 2))}
          y={oy - 52 * Math.sin(rad(deg / 2))}
          fontSize="10"
          fill="var(--color-gold)"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {deg}°
        </text>
      </svg>
    </figure>
  );
}
