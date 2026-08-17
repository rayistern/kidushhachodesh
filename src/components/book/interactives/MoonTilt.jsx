/**
 * MoonTilt — the moon's circle, tilted against the sun's. [R] KH 16:1
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The picture that undoes the assumption every earlier chapter made.
 * Drawn as an edge-on view — the sun's track as a straight line across
 * the middle, the moon's as a wave crossing it twice — because that is
 * the view in which "five degrees north" and "five degrees south" are
 * literally up and down.
 *
 * The head and tail are the two crossings. Drag the moon along and the
 * height changes; it is nil at the crossings and greatest a quarter of
 * a circle from each, which is the whole content of KH 16:9.
 *
 * The vertical scale is exaggerated. Five degrees against a 360-degree
 * circuit is a shallow wave, and drawn true the tilt would be invisible
 * — which is exactly why it is easy to forget it is there.
 */
import React, { useState } from 'react';
import InteractiveCard from '../../text/interactives/InteractiveCard';
import { GALGAL_NOTEH_INCLINATION_DEG } from '../../../engine/constants';
import { calculateMoonLatitude } from '../../../engine/moonCalculations';
import { formatDms } from '../../../engine/dmsUtils';

const MAX_LATITUDE = GALGAL_NOTEH_INCLINATION_DEG;

/**
 * Latitude for a bare course, via the engine's own KH 16:11 lookup.
 *
 * `calculateMoonLatitude` takes the moon's true longitude and the head's
 * position and derives the course itself, so putting the head at zero
 * makes the longitude argument *be* the course. That is a little
 * indirect, and it is worth it: the four-way folding of KH 16:13-18 and
 * the table interpolation stay in one place rather than being copied
 * into a figure where they could drift.
 */
function latitudeAt(course) {
  return calculateMoonLatitude(((course % 360) + 360) % 360, 0).result;
}

export default function MoonTilt() {
  const [course, setCourse] = useState(60);
  const latitude = latitudeAt(course);

  return (
    <InteractiveCard
      title="The moon's circle is tilted against the sun's"
      source="KH 16:1, 16:9"
      blurb="up to five degrees above or below — and nil at the two crossings"
      defaultOpen
    >
      <Wave course={course} latitude={latitude} />

      <label className="mt-3 block">
        <span className="text-xs font-bold text-[var(--color-text-secondary)]">
          How far the moon has travelled past the up-crossing — {course}°
        </span>
        <input
          type="range"
          min="0"
          max="360"
          value={course}
          onChange={(e) => setCourse(Number(e.target.value))}
          className="mt-1 w-full accent-[var(--color-accent)]"
          aria-label="Course of the latitude, in degrees"
        />
      </label>

      <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="text-xs text-[var(--color-text-secondary)]">
          Height off the sun's track <span className="hebrew-text">(רוחב הירח)</span>
        </div>
        <div className="mt-0.5 font-mono text-xl font-bold text-[var(--color-gold)]">
          {Math.abs(latitude) < 0.005 ? 'none' : formatDms(Math.abs(latitude))}
        </div>
        <div className="text-sm">
          {Math.abs(latitude) < 0.005 ? (
            <span className="text-[var(--color-accent)]">
              on the crossing point — the moon is exactly on the sun's track
            </span>
          ) : latitude > 0 ? (
            <span className="text-[var(--color-accent)]">above the line — "northerly"</span>
          ) : (
            <span className="text-[var(--color-gold)]">below the line — "southerly"</span>
          )}
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Note what happens twice. The height climbs to five degrees, comes back to nothing at the
        tail, sinks to five degrees the other way, and returns to nothing at the head. Two rises
        and two falls in one lap — which is why this chapter's folding rules divide the circle
        into four rather than mirroring it in two, as chapters 13 and 15 did.
      </p>
      <p className="mt-2 text-[10px] leading-relaxed text-[var(--color-text-secondary)] opacity-70">
        The up-and-down is drawn far larger than life. Five degrees against a full circuit is a
        very shallow wave — which is precisely why it is easy to forget the tilt is there at all.
      </p>
    </InteractiveCard>
  );
}

function Wave({ course, latitude }) {
  const w = 520;
  const h = 150;
  const midY = h / 2;
  const amplitude = 46; // exaggerated; really 5° against 360°

  const x = (deg) => (deg / 360) * w;
  const y = (lat) => midY - (lat / MAX_LATITUDE) * amplitude;

  const path = [];
  for (let d = 0; d <= 360; d += 2) {
    path.push(`${d === 0 ? 'M' : 'L'} ${x(d).toFixed(1)} ${y(latitudeAt(d)).toFixed(1)}`);
  }

  return (
    <figure>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img"
        aria-label="The sun's track drawn as a straight line with the moon's tilted path crossing it twice, at the head and the tail">
        {/* the sun's track */}
        <line x1="0" y1={midY} x2={w} y2={midY} stroke="var(--color-gold)" strokeWidth="2" />
        <text x="4" y={midY - 5} fontSize="9" fill="var(--color-gold)">
          the sun's track
        </text>

        {/* the moon's tilted circle, edge-on */}
        <path d={path.join(' ')} fill="none" stroke="var(--color-silver)" strokeWidth="1.5" />

        {/* the crossings */}
        {[
          { deg: 0, label: 'up-crossing', hebrew: 'ראש · head' },
          { deg: 180, label: 'down-crossing', hebrew: 'זנב · tail' },
          { deg: 360, label: 'up-crossing', hebrew: '' },
        ].map(({ deg, label, hebrew }, i) => (
          <g key={i}>
            <circle cx={x(deg)} cy={midY} r="4" fill="var(--color-accent)" />
            <text x={x(deg)} y={midY + 18} fontSize="9" textAnchor="middle" fill="var(--color-accent)">
              {label}
            </text>
            {hebrew && (
              <text x={x(deg)} y={midY + 29} fontSize="9" textAnchor="middle" fill="var(--color-accent)" opacity="0.7">
                {hebrew}
              </text>
            )}
          </g>
        ))}

        {/* extremes */}
        <text x={x(90)} y={y(MAX_LATITUDE) - 6} fontSize="8" textAnchor="middle" fill="var(--color-text-secondary)">
          5° above
        </text>
        <text x={x(270)} y={y(-MAX_LATITUDE) + 12} fontSize="8" textAnchor="middle" fill="var(--color-text-secondary)">
          5° below
        </text>

        {/* the moon, and a dropped line to the track */}
        <line x1={x(course)} y1={midY} x2={x(course)} y2={y(latitude)} stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx={x(course)} cy={y(latitude)} r="6" fill="var(--color-silver)" stroke="var(--color-bg)" strokeWidth="1.5" />
      </svg>
      <figcaption className="mt-1 text-center text-[11px] text-[var(--color-text-secondary)]">
        Seen edge-on, so above and below the line really are north and south of the sun's track.
      </figcaption>
    </figure>
  );
}
