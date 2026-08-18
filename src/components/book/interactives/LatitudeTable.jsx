/**
 * LatitudeTable — KH 16:11's table, and his three folding examples.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The table only runs to ninety degrees, and the reader has to know
 * three separate rules to use it anywhere else. The Rambam works one
 * example of each (150°, 200°, 300° at KH 16:16-18) and one
 * interpolation (53° at KH 16:12); all four are presets here.
 *
 * The plot runs the full circle rather than stopping at 90 with the
 * table, because the shape is the argument: two humps, one either side
 * of the line, which is what the four folds exist to reproduce from a
 * quarter-circle of data.
 */
import React, { useState } from 'react';
import InteractiveCard, { PresetButton } from '../../text/interactives/InteractiveCard';
import { CONSTANTS } from '../../../engine/constants';
import { calculateMoonLatitude } from '../../../engine/moonCalculations';
import { formatDms } from '../../../engine/dmsUtils';

const TABLE = CONSTANTS.MOON_LATITUDE_TABLE;
const MAX = Math.max(...TABLE.map((r) => r.latitude));

/** Latitude for a bare course, via the engine (see MoonTilt for why). */
const latitudeAt = (course) => calculateMoonLatitude(((course % 360) + 360) % 360, 0).result;

function formatMin(deg) {
  const total = Math.round(Math.abs(deg) * 60);
  const d = Math.floor(total / 60);
  const m = total - d * 60;
  return d > 0 ? `${d}° ${m}'` : `${m}'`;
}

export default function LatitudeTable() {
  const [course, setCourse] = useState(53);
  const latitude = latitudeAt(course);

  // The bracketing rows, for the interpolation walk-through.
  const folded = foldOf(course);
  const lo = [...TABLE].reverse().find((r) => r.distance <= folded.value);
  const hi = TABLE.find((r) => r.distance >= folded.value);
  const interpolating = lo && hi && lo.distance !== hi.distance;

  return (
    <InteractiveCard
      title="The table, and the three ways of folding into it"
      source="KH 16:11-18"
      blurb="only a quarter-circle of data, used across the whole circle"
      defaultOpen
    >
      <Plot course={course} latitude={latitude} />

      <label className="mt-3 block">
        <span className="text-xs font-bold text-[var(--color-text-secondary)]">
          Course of the latitude — {course}°
        </span>
        <input
          type="range"
          min="0"
          max="360"
          value={course}
          onChange={(e) => setCourse(Number(e.target.value))}
          className="mt-1 w-full accent-[var(--color-accent)]"
          aria-label="Course of the latitude in degrees"
        />
      </label>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="text-xs text-[var(--color-text-secondary)]">His examples:</span>
        {[
          { deg: 53, ref: '16:12' },
          { deg: 150, ref: '16:16' },
          { deg: 200, ref: '16:17' },
          { deg: 300, ref: '16:18' },
        ].map(({ deg, ref }) => (
          <PresetButton key={deg} onClick={() => setCourse(deg)} title={`KH ${ref}`}>
            {deg}°
          </PresetButton>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-xs leading-relaxed">
        <div>
          <span className="font-mono text-[var(--color-gold)]">{folded.rule}</span> — {folded.text}
        </div>
        {interpolating ? (
          <div className="mt-1 text-[var(--color-text-secondary)]">
            Between {lo.distance}° ({formatMin(lo.latitude)}) and {hi.distance}° (
            {formatMin(hi.latitude)}) the answer moves{' '}
            {formatMin(hi.latitude - lo.latitude)} across ten degrees — so{' '}
            {formatMin((hi.latitude - lo.latitude) / 10)} a degree.
          </div>
        ) : (
          <div className="mt-1 text-[var(--color-text-secondary)]">
            {folded.value}° is tabulated directly.
          </div>
        )}
        <div className="mt-1.5 font-mono text-base font-bold text-[var(--color-gold)]">
          {formatMin(latitude)}{' '}
          <span className="font-sans text-xs font-normal">
            {Math.abs(latitude) < 0.005 ? '' : latitude > 0 ? 'north' : 'south'}
          </span>
        </div>
        {course === 53 && (
          <div className="mt-1.5 text-[var(--color-accent)]">
            ✓ KH 16:12 works this one: 3 minutes a degree, so 53° gives 3° 59′.
          </div>
        )}
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[300px] text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-secondary)]">
              <th className="py-1 pr-3 font-bold">Course</th>
              <th className="py-1 font-bold">Height</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {TABLE.map((row) => {
              const active = Math.abs(row.distance - folded.value) < 5;
              return (
                <tr
                  key={row.distance}
                  className={`border-b border-[var(--color-border)]/40 ${active ? 'bg-[var(--color-accent)]/10' : ''}`}
                >
                  <td className="py-1 pr-3">{row.distance}°</td>
                  <td className="py-1 text-[var(--color-gold)]">
                    {row.latitude === 0 ? 'none' : formatMin(row.latitude)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </InteractiveCard>
  );
}

/** Which of the four rules applies, in the Rambam's own terms. */
function foldOf(course) {
  const c = ((course % 360) + 360) % 360;
  if (c <= 90) return { rule: 'KH 16:11', text: 'under 90°, read the table as it stands', value: Math.round(c) };
  if (c <= 180) return { rule: 'KH 16:13', text: `take it from 180: 180 − ${c} = ${180 - c}`, value: Math.round(180 - c) };
  if (c <= 270) return { rule: 'KH 16:14', text: `take 180 from it: ${c} − 180 = ${c - 180}`, value: Math.round(c - 180) };
  return { rule: 'KH 16:15', text: `take it from 360: 360 − ${c} = ${360 - c}`, value: Math.round(360 - c) };
}

function Plot({ course, latitude }) {
  const w = 500;
  const h = 150;
  const midY = h / 2;
  const amp = 48;
  const x = (deg) => 30 + (deg / 360) * (w - 40);
  const y = (lat) => midY - (lat / MAX) * amp;

  const path = [];
  for (let d = 0; d <= 360; d += 2) {
    path.push(`${d === 0 ? 'M' : 'L'} ${x(d).toFixed(1)} ${y(latitudeAt(d)).toFixed(1)}`);
  }

  return (
    <figure>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img"
        aria-label="The moon's latitude across a full circle: a hump north, then a hump south">
        <line x1="30" y1={midY} x2={w - 10} y2={midY} stroke="var(--color-gold)" strokeWidth="1.5" />
        {[90, 180, 270].map((d) => (
          <line key={d} x1={x(d)} y1="8" x2={x(d)} y2={h - 18} stroke="var(--color-border)" strokeWidth="1" strokeDasharray="2 4" />
        ))}
        <text x="2" y={y(MAX) + 3} fontSize="8" fill="var(--color-text-secondary)">5°N</text>
        <text x="2" y={y(-MAX) + 3} fontSize="8" fill="var(--color-text-secondary)">5°S</text>

        <path d={path.join(' ')} fill="none" stroke="var(--color-accent)" strokeWidth="2" />

        {/* the quarter-circle he actually tabulates */}
        {TABLE.map((row) => (
          <circle key={row.distance} cx={x(row.distance)} cy={y(row.latitude)} r="2.5" fill="var(--color-accent)" />
        ))}
        <text x={x(45)} y={y(MAX) - 8} fontSize="8" textAnchor="middle" fill="var(--color-accent)">
          the only part he tabulates
        </text>

        <line x1={x(course)} y1="8" x2={x(course)} y2={h - 18} stroke="var(--color-gold)" strokeWidth="1" />
        <circle cx={x(course)} cy={y(latitude)} r="4.5" fill="var(--color-gold)" />

        {[0, 90, 180, 270, 360].map((d) => (
          <text key={d} x={x(d)} y={h - 4} fontSize="8" textAnchor="middle" fill="var(--color-text-secondary)">
            {d}°
          </text>
        ))}
      </svg>
    </figure>
  );
}
