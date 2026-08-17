/**
 * ParallaxBySign — the two twelve-row tables of KH 17:5 and 17:8.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * This is where chapter 11's promise comes due. That chapter argued the
 * mazalot are named because chapter 17 looks corrections up by sign
 * rather than by degree; these are the tables it meant.
 *
 * Both are plotted as well as tabulated, because the shape is the
 * argument. Neither is a list of unrelated numbers — each rises and
 * falls once round the circle, in opposite phase to the other, which is
 * what you would expect if they are the sideways and vertical parts of
 * one shift being divided differently as the belt's angle to the
 * horizon changes.
 *
 * The longitude table is always subtracted (KH 17:6). The latitude one
 * is subtracted when the moon is north and added when south (KH 17:7) —
 * a sign rule that is easy to invert, so the card states which case is
 * in force rather than only the magnitude.
 *
 * The Rambam's own name for what these tables correct is שינוי המראה,
 * "the change in appearance" — the gap between where the moon truly is
 * and where it is seen. That is used in preference to "parallax", which
 * is the modern term for the same thing and not his.
 */
import React, { useState } from 'react';
import InteractiveCard from '../../text/interactives/InteractiveCard';
import { CONSTANTS } from '../../../engine/constants';
import { zodiacPosition } from '../../../engine/zodiac';

const LON = CONSTANTS.PARALLAX_LON_BY_MAZAL;
const LAT = CONSTANTS.PARALLAX_LAT_BY_MAZAL;

/**
 * Which civil months a sighting night finds the moon in each sign —
 * measured over eight years of sighting nights, two adjacent months per
 * sign, marching round the year. Meaningful ONLY on sighting nights
 * (the moon laps the whole circle every month); pinned in ch17.test.js.
 */
const SIGHTING_MONTHS = [
  'Mar–Apr', 'Apr–May', 'May–Jun', 'Jun–Jul', 'Jul–Aug', 'Aug–Sep',
  'Sep–Oct', 'Oct–Nov', 'Nov–Dec', 'Dec–Jan', 'Jan–Feb', 'Feb–Mar',
];

const MAX = Math.max(...LON.map((r) => r.chalakim), ...LAT.map((r) => r.chalakim));

export default function ParallaxBySign() {
  const [index, setIndex] = useState(1); // Shor — his worked evening
  const [north, setNorth] = useState(false);

  const sign = zodiacPosition(index * 30 + 15);
  const lon = LON[index].chalakim;
  const lat = LAT[index].chalakim;

  return (
    <InteractiveCard
      title="The two tables that are read by sign"
      source="KH 17:5, 17:8"
      blurb="the change in appearance — שינוי המראה — split into sideways and vertical"
      defaultOpen
    >
      <div className="flex flex-wrap items-center gap-1">
        {CONSTANTS.CONSTELLATION_TRANSLIT.map((name, i) => (
          <button
            key={name}
            onClick={() => setIndex(i)}
            className={`rounded px-1.5 py-0.5 text-[11px] transition-colors ${
              i === index
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
            }`}
          >
            {name}
            <span className="ml-1 opacity-60">{i + 1}</span>
          </button>
        ))}
      </div>
      <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
        The {index + 1}
        {['st', 'nd', 'rd'][index] ?? 'th'} sign — where sighting nights find the moon in{' '}
        <strong>{SIGHTING_MONTHS[index]}</strong>, roughly.
      </p>

      <Curves index={index} />

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
          <div className="text-[11px] text-[var(--color-text-secondary)]">
            Taken off the gap — KH 17:5
          </div>
          <div className="font-mono text-lg font-bold text-[var(--color-accent)]">
            − {lon === 60 ? "1° 0'" : `${lon}'`}
          </div>
          <div className="text-[10px] text-[var(--color-text-secondary)]">
            always subtracted, giving the second longitude
          </div>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
          <div className="text-[11px] text-[var(--color-text-secondary)]">
            Applied to the height — KH 17:8
          </div>
          <div className="font-mono text-lg font-bold text-[var(--color-gold)]">
            {north ? '−' : '+'} {lat}'
          </div>
          <div className="text-[10px] text-[var(--color-text-secondary)]">
            {north
              ? 'moon is north, so it is subtracted'
              : 'moon is south, so it is added'}
          </div>
        </div>
      </div>

      <label className="mt-2 flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
        <input
          type="checkbox"
          checked={north}
          onChange={(e) => setNorth(e.target.checked)}
          className="accent-[var(--color-accent)]"
        />
        The moon is north of the sun's track
      </label>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Look at the two curves rather than the two lists. Each rises and falls once around the
        circle, and they run in opposite phase — where one is largest the other is smallest. That
        is what you would expect if they are the sideways and the vertical parts of one change in
        appearance, divided differently as the belt tilts against the horizon. They are not twelve
        unrelated numbers apiece.
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        On the evening the Rambam works, the moon is in <strong>Shor</strong> — a full degree off
        the gap, the largest of the twelve, and ten minutes onto the height.
      </p>
    </InteractiveCard>
  );
}

function Curves({ index }) {
  const w = 480;
  const h = 140;
  const padL = 30;
  const padR = 10;
  const padT = 12;
  const padB = 26;

  const x = (i) => padL + (i / 11) * (w - padL - padR);
  const y = (v) => padT + (1 - v / MAX) * (h - padT - padB);

  const line = (rows) => rows.map((r, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(r.chalakim)}`).join(' ');

  return (
    <figure className="mt-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img"
        aria-label="The two parallax tables plotted across the twelve signs; each rises and falls once, in opposite phase">
        <line x1={padL} y1={y(0)} x2={w - padR} y2={y(0)} stroke="var(--color-border)" strokeWidth="1" />
        <text x={2} y={y(60) + 3} fontSize="8" fill="var(--color-text-secondary)">60′</text>
        <text x={6} y={y(0) + 3} fontSize="8" fill="var(--color-text-secondary)">0</text>

        <path d={line(LON)} fill="none" stroke="var(--color-accent)" strokeWidth="2" />
        <path d={line(LAT)} fill="none" stroke="var(--color-gold)" strokeWidth="2" />

        {LON.map((r, i) => (
          <circle key={`lon${i}`} cx={x(i)} cy={y(r.chalakim)} r="2.5" fill="var(--color-accent)" />
        ))}
        {LAT.map((r, i) => (
          <circle key={`lat${i}`} cx={x(i)} cy={y(r.chalakim)} r="2.5" fill="var(--color-gold)" />
        ))}

        <line x1={x(index)} y1={padT} x2={x(index)} y2={y(0)} stroke="var(--color-text)" strokeWidth="1" opacity="0.5" />

        {CONSTANTS.CONSTELLATION_TRANSLIT.map((name, i) => (
          <text
            key={name}
            x={x(i)}
            y={h - 8}
            fontSize="7"
            textAnchor="middle"
            fill={i === index ? 'var(--color-text)' : 'var(--color-text-secondary)'}
          >
            {name.slice(0, 4)}
          </text>
        ))}
      </svg>
      <figcaption className="mt-1 flex flex-wrap gap-3 text-[11px] text-[var(--color-text-secondary)]">
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 bg-[var(--color-accent)]" /> off the gap (17:5)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 bg-[var(--color-gold)]" /> onto the height (17:8)
        </span>
      </figcaption>
    </figure>
  );
}
