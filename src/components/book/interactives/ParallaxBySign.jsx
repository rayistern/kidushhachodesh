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
import React, { useState, useMemo } from 'react';
import InteractiveCard, { PresetButton } from '../../text/interactives/InteractiveCard';
import { CONSTANTS } from '../../../engine/constants';
import { zodiacPosition, ordinalSuffix } from '../../../engine/zodiac';
import {
  calculateNodePosition,
  calculateMoonLatitude,
  calculateMoonMeanLongitude,
  calculateSeasonCorrection,
  calculateMoonMaslul,
  calculateDoubleElongation,
  calculateMaslulHanachon,
  lookupMoonMaslulCorrection,
  calculateMoonTrueLongitude,
} from '../../../engine/moonCalculations';
import { calculateSunMeanLongitude, calculateSunApogee } from '../../../engine/sunCalculations';
import { trueFromMean } from '../../../lib/maslulTable';
import { formatDms, normalizeDegrees } from '../../../engine/dmsUtils';
import { nextSightingNight } from '../../../lib/sightingNight';

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
  // Driven by a night, not by assertions. A first version had sign
  // buttons and a bare "the moon is north" checkbox; a reader asked how
  // anyone would know which way to set it. They would not — both facts
  // are computed, so both now come from the engine for a chosen night.
  const [days, setDays] = useState(29); // his worked evening

  const night = useMemo(() => {
    const sunMean = calculateSunMeanLongitude(days).result;
    const sunTrue = trueFromMean(sunMean, calculateSunApogee(days).result).trueLongitude;
    const moonAdj = normalizeDegrees(
      calculateMoonMeanLongitude(days).result + calculateSeasonCorrection(sunTrue).result,
    );
    const hanachon = calculateMaslulHanachon(
      calculateMoonMaslul(days).result,
      calculateDoubleElongation(moonAdj, sunMean).result,
    );
    const correction = lookupMoonMaslulCorrection(hanachon.result);
    const moonTrue = calculateMoonTrueLongitude(
      moonAdj,
      hanachon.result,
      correction.result,
      correction.direction,
    ).result;
    const latitude = calculateMoonLatitude(moonTrue, calculateNodePosition(days).result).result;
    return { moonTrue, latitude };
  }, [days]);

  const index = Math.floor(normalizeDegrees(night.moonTrue) / 30);
  const north = night.latitude >= 0;
  const lon = LON[index].chalakim;
  const lat = LAT[index].chalakim;

  return (
    <InteractiveCard
      title="The two tables that are read by sign"
      source="KH 17:5, 17:8"
      blurb="the change in appearance — שינוי המראה — split into sideways and vertical"
      defaultOpen
    >
      <div className="flex flex-wrap items-end gap-2">
        <label className="block">
          <span className="text-xs font-bold text-[var(--color-text-secondary)]">
            Days from the starting point
          </span>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(Number(e.target.value) || 0)}
            className="mt-1 block w-32 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 font-mono text-sm"
          />
        </label>
        <PresetButton onClick={() => setDays(29)} title="2 Iyar — the example of KH 17:8-9">
          His example (29)
        </PresetButton>
        <PresetButton
          onClick={() => setDays(nextSightingNight().days)}
          title="The evening after the 29th — the night the court would look"
        >
          Next Rosh Chodesh
        </PresetButton>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        On this night the moon stands at{' '}
        <strong className="font-mono">{formatDms(night.moonTrue)}</strong> — the{' '}
        <strong>
          {index + 1}
          {ordinalSuffix(index + 1)}
        </strong>{' '}
        sign, where sighting nights fall in {SIGHTING_MONTHS[index]} — and sits{' '}
        <strong className="font-mono">{formatDms(Math.abs(night.latitude))}</strong>{' '}
        <strong>{north ? 'north' : 'south'}</strong> of the road. Both computed, neither chosen: the sign comes from chapter 15's calculation of where the moon stands, and north-or-south from chapter 16's calculation of its height off the road.
      </p>

      <Curves index={index} />
      <ParallaxSplit index={index} north={north} />

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

/** √(lon² + lat²) for a sign — the whole shift the two tables split. */
export function wholeShiftArcmin(index) {
  return Math.hypot(LON[index].chalakim, LAT[index].chalakim);
}

/**
 * The mechanism the two curves only hint at, drawn as the triangle it
 * is. The whole change in appearance is one shift of nearly constant
 * size — √(lon² + lat²) stays within 56′–61′ across all twelve signs,
 * which is the moon's own parallax showing through his tables — and
 * what varies by sign is only how it SPLITS against the belt's slant:
 * along the belt (off the gap) and across it (onto the height). The
 * belt's drawn slant is derived from the two table values themselves,
 * so the figure asserts nothing the tables don't say.
 */
function ParallaxSplit({ index, north }) {
  const w = 520;
  const h = 200;
  const lon = LON[index].chalakim;
  const lat = LAT[index].chalakim;
  const whole = wholeShiftArcmin(index);
  const scale = 1.7; // px per arcminute
  const mx = 330;
  const my = 28;
  // The whole shift points straight down (toward the horizon). The
  // along-belt component leaves it at α, where cos α = lon / whole —
  // small α means a steep belt taking nearly the whole shift sideways
  // along itself.
  const alpha = Math.acos(lon / whole);
  const beltDir = { x: -Math.sin(alpha), y: Math.cos(alpha) };
  const A = { x: mx + beltDir.x * lon * scale, y: my + beltDir.y * lon * scale };
  const D = { x: mx, y: my + whole * scale };
  const beltFrom = { x: mx - beltDir.x * 34, y: my - beltDir.y * 34 };
  const beltTo = { x: mx + beltDir.x * (lon * scale + 40), y: my + beltDir.y * (lon * scale + 40) };
  const horizonY = h - 22;

  return (
    <figure className="mt-3">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        role="img"
        aria-label="One shift of nearly constant size, pointing toward the horizon, split into a component along the belt and a component across it; the split follows the belt's slant for the chosen sign"
      >
        <line x1="0" y1={horizonY} x2={w} y2={horizonY} stroke="var(--color-border)" strokeWidth="1.5" />
        <text x="6" y={horizonY + 13} fontSize="8" fill="var(--color-text-secondary)">
          toward the horizon
        </text>

        {/* the belt through the moon, at the slant the two values imply */}
        <line x1={beltFrom.x} y1={beltFrom.y} x2={beltTo.x} y2={beltTo.y} stroke="var(--color-gold)" strokeWidth="1" strokeOpacity="0.45" />
        <text
          x={beltTo.x + 4}
          y={beltTo.y + 4}
          fontSize="8"
          fill="var(--color-gold)"
          fillOpacity="0.8"
        >
          the belt
        </text>

        {/* the whole shift, and its two parts */}
        <line x1={mx} y1={my} x2={D.x} y2={D.y} stroke="var(--color-silver)" strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1={mx} y1={my} x2={A.x} y2={A.y} stroke="var(--color-accent)" strokeWidth="2.5" />
        <line x1={A.x} y1={A.y} x2={D.x} y2={D.y} stroke="var(--color-gold)" strokeWidth="2.5" />

        <circle cx={mx} cy={my} r="5" fill="var(--color-silver)" stroke="var(--color-bg)" strokeWidth="1.5" />
        <text x={mx + 10} y={my + 3} fontSize="9" fill="var(--color-text)">
          the moon, where it truly is
        </text>
        <circle cx={D.x} cy={D.y} r="3.5" fill="var(--color-silver)" fillOpacity="0.7" />
        <text x={D.x + 8} y={D.y + 3} fontSize="9" fill="var(--color-text-secondary)">
          where it is seen — {whole.toFixed(0)}′ away
        </text>

        <text
          x={(mx + A.x) / 2 - 8}
          y={(my + A.y) / 2}
          fontSize="9"
          textAnchor="end"
          fill="var(--color-accent)"
        >
          along the belt: {lon === 60 ? "1° 0" : lon}′ off the gap
        </text>
        <text x={(A.x + D.x) / 2 + 8} y={(A.y + D.y) / 2 + 3} fontSize="9" fill="var(--color-gold)">
          across it: {lat}′ onto the height ({north ? 'north tonight, so off' : 'south tonight, so on'})
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-[11px] text-[var(--color-text-secondary)]">
        The two tables are one triangle. The dashed shift toward the horizon is nearly the same
        size in every sign — 56′ to 61′, the moon's own parallax showing through — and the sign
        only decides how it splits against the belt's slant. Steep belt: nearly all of it lands
        along the belt, off the gap. Shallow belt: most of it lands across, onto the height.
      </figcaption>
    </figure>
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
