/**
 * CorrectionTable — KH 13:4's table, drawn and read. [R] KH 13:4-8
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching interactive)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The table arrives as nineteen lines of prose, which hides the two
 * things about it that matter: it is a smooth arch rising to 1°59' at
 * 90° and falling back to nothing at 180°, and past 180° it runs
 * backwards (13:5-6). Plotted, both are obvious at a glance.
 *
 * The interpolation panel reproduces the reasoning of 13:7 rather than
 * only its answer — his own worked courses, 65° and 67°, are presets.
 */
import React, { useState, useMemo } from 'react';
import InteractiveCard, { PresetButton } from './InteractiveCard';
import { CONSTANTS } from '../../../engine/constants';
import { correctionWithTrace } from '../../../lib/maslulTable';
import { formatDms } from '../../../engine/dmsUtils';

const TABLE = CONSTANTS.SUN_MASLUL_CORRECTIONS;
const PEAK = 1 + 59 / 60;

function formatMin(deg) {
  const total = Math.round(deg * 60 * 100) / 100;
  const d = Math.floor(total / 60);
  const m = total - d * 60;
  const mStr = Number.isInteger(m) ? m : m.toFixed(1);
  return d > 0 ? `${d}° ${mStr}'` : `${mStr}'`;
}

export default function CorrectionTable() {
  const [course, setCourse] = useState(65);

  const trace = useMemo(() => correctionWithTrace(course), [course]);

  return (
    <InteractiveCard
      title="The correction table, drawn"
      source="KH 13:4-8"
      blurb="an arch to 1°59' at 90°, nothing at 0° and 180°, and mirrored past half a circle"
    >
      <label className="block">
        <span className="text-xs font-bold text-[var(--color-text-secondary)]">
          Course (מסלול) — {course}°
        </span>
        <input
          type="range"
          min="0"
          max="360"
          value={course}
          onChange={(e) => setCourse(Number(e.target.value))}
          className="mt-1 w-full accent-[var(--color-accent)]"
          aria-label="Course in degrees"
        />
      </label>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="text-xs text-[var(--color-text-secondary)]">His worked courses:</span>
        {[65, 67, 200, 300].map((c) => (
          <PresetButton key={c} onClick={() => setCourse(c)}>
            {c}°
          </PresetButton>
        ))}
      </div>

      <CorrectionCurve course={course} correction={trace.correction} />

      <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-xs text-[var(--color-text-secondary)]">
            Correction for a course of {course}°
          </span>
          <span className="font-mono text-lg font-bold text-[var(--color-gold)]">
            {formatMin(trace.correction)}
          </span>
        </div>

        <div className="mt-2 space-y-1 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
          {trace.mirrored && (
            <div>
              <span className="font-mono text-[var(--color-gold)]">KH 13:5</span> — past 180°, so
              subtract from a full circle: 360° − {course}° = {trace.effective}°, and read the
              table there.
            </div>
          )}
          {trace.correction === 0 ? (
            <div>
              <span className="font-mono text-[var(--color-gold)]">KH 13:3</span> — at{' '}
              {trace.effective}° there is no correction at all. The mean position is the true
              position.
            </div>
          ) : trace.exact ? (
            <div>
              <span className="font-mono text-[var(--color-gold)]">KH 13:4</span> — {trace.effective}°
              is tabulated directly. No interpolation needed.
            </div>
          ) : (
            <div>
              <span className="font-mono text-[var(--color-gold)]">KH 13:7</span> — between{' '}
              {trace.lo.maslul}° ({formatMin(trace.lo.correction)}) and {trace.hi.maslul}° (
              {formatMin(trace.hi.correction)}) there are{' '}
              {formatMin(trace.hi.correction - trace.lo.correction)} across ten degrees, so each
              degree adds {formatMin(trace.perDegree)}. That is{' '}
              {trace.effective - trace.lo.maslul} × {formatMin(trace.perDegree)} ={' '}
              {formatMin(trace.correction - trace.lo.correction)} on top of{' '}
              {formatMin(trace.lo.correction)}.
            </div>
          )}
          <div>
            <span className="font-mono text-[var(--color-gold)]">KH 13:2</span> —{' '}
            {trace.correction === 0
              ? 'nothing to apply.'
              : course < 180
                ? 'the course is under 180°, so this is subtracted from the mean position.'
                : 'the course is over 180°, so this is added to the mean position.'}
          </div>
        </div>
      </div>
    </InteractiveCard>
  );
}

/**
 * The nineteen tabulated points, and the curve the Rambam's
 * interpolation rule draws between them across the full circle.
 */
function CorrectionCurve({ course, correction }) {
  const w = 480;
  const h = 150;
  const padL = 34;
  const padR = 8;
  const padT = 10;
  const padB = 20;

  const x = (deg) => padL + (deg / 360) * (w - padL - padR);
  const y = (corr) => padT + (1 - corr / PEAK) * (h - padT - padB);

  // Sample the interpolation rule itself rather than drawing a smooth
  // spline — the piecewise-linear shape IS what KH 13:7 specifies.
  const path = useMemo(() => {
    const pts = [];
    for (let d = 0; d <= 360; d += 1) {
      pts.push(`${d === 0 ? 'M' : 'L'} ${x(d).toFixed(2)} ${y(correctionWithTrace(d).correction).toFixed(2)}`);
    }
    return pts.join(' ');
  }, []);

  return (
    <figure className="mt-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img"
        aria-label="The sun correction table plotted against course, rising to 1 degree 59 minutes at 90 degrees and mirrored past 180">
        {/* Zero line and the 180° axis of mirroring */}
        <line x1={padL} y1={y(0)} x2={w - padR} y2={y(0)} stroke="var(--color-border)" strokeWidth="1" />
        <line x1={x(180)} y1={padT} x2={x(180)} y2={y(0)} stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" />

        {/* Peak reference */}
        <line x1={padL} y1={y(PEAK)} x2={w - padR} y2={y(PEAK)} stroke="var(--color-border)" strokeWidth="1" strokeDasharray="2 4" />
        <text x={2} y={y(PEAK) + 3} fontSize="8" fill="var(--color-text-secondary)">1°59'</text>
        <text x={14} y={y(0) + 3} fontSize="8" fill="var(--color-text-secondary)">0</text>

        <path d={path} fill="none" stroke="var(--color-accent)" strokeWidth="1.5" />

        {/* The nineteen values he actually publishes, plus their mirrors */}
        {TABLE.map((row) => (
          <g key={row.maslul}>
            <circle cx={x(row.maslul)} cy={y(row.correction)} r="2.5" fill="var(--color-accent)" />
            {row.maslul !== 0 && row.maslul !== 180 && (
              <circle
                cx={x(360 - row.maslul)}
                cy={y(row.correction)}
                r="2.5"
                fill="var(--color-accent)"
                fillOpacity="0.4"
              />
            )}
          </g>
        ))}

        {/* Current reading */}
        <line x1={x(course)} y1={padT} x2={x(course)} y2={y(0)} stroke="var(--color-gold)" strokeWidth="1" />
        <circle cx={x(course)} cy={y(correction)} r="4" fill="var(--color-gold)" />

        {[0, 90, 180, 270, 360].map((d) => (
          <text key={d} x={x(d)} y={h - 6} fontSize="8" textAnchor="middle" fill="var(--color-text-secondary)">
            {d}°
          </text>
        ))}
      </svg>
      <figcaption className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
        Solid dots are the nineteen values KH 13:4 publishes; faded dots are their mirrors past
        180°, which he does not print but instructs you to derive (13:5-6). The line is his
        interpolation rule (13:7), which is why it is straight between dots rather than curved.
      </figcaption>
    </figure>
  );
}
