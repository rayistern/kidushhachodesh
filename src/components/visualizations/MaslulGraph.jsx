import React from 'react';
import { formatDms } from '../../engine/dmsUtils';

/**
 * MaslulGraph — SVG chart of the Rambam's maslul correction table.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** (KH 11-17)
 *  SURFACE CATEGORY: **Rambam-surface** — renders the Rambam's own
 *                    published correction tables (KH 13:4, 15:4-6)
 * ═══════════════════════════════════════════════════════════════════
 * These tables belong to the Rambam himself. Per docs/OPEN_QUESTIONS.md
 * Q4 ("stay true to the source"), we present them as-is — mirroring
 * across the 180° axis per his explicit instruction (KH 13:7-8, 15:7),
 * not deriving correction values from any other formula. The live dot
 * shows WHERE in the Rambam's table the current maslul lands.
 *
 * The Rambam gives the table for maslul 0-180° in 10° steps. For maslul
 * 180-360° we mirror it (KH 13:7-8 and 15:7) so the curve is the full
 * sinusoidal shape across one complete anomalistic cycle. A live dot
 * marks the current maslul, making it visible WHERE in the cycle the
 * body currently sits.
 *
 * Click any maslul value (x-axis) to drill down.
 */
export default function MaslulGraph({
  table,
  currentMaslul,
  height = 100,
  color = '#4ea1f7',
  title,
  hebrewTitle,
  reference,
  unit = '°',
}) {
  const width = 320;
  const padX = 28;
  const padY = 14;
  const innerW = width - 2 * padX;
  const innerH = height - 2 * padY;

  // Build the full 0-360 curve by mirroring the table about 180.
  // For each integer maslul 0..360 we look up (or interpolate) the
  // correction. To keep this cheap and smooth we sample every 5°.
  const samples = [];
  for (let m = 0; m <= 360; m += 5) {
    samples.push({ m, c: lookupCorrection(m, table) });
  }

  // Find max correction for y-axis scaling
  const maxC = Math.max(...samples.map((s) => Math.abs(s.c)));
  const xFor = (m) => padX + (m / 360) * innerW;
  const yFor = (c) => padY + innerH - (Math.abs(c) / (maxC || 1)) * innerH;

  // Build SVG path
  const path = samples
    .map((s, i) => `${i === 0 ? 'M' : 'L'} ${xFor(s.m).toFixed(1)} ${yFor(s.c).toFixed(1)}`)
    .join(' ');

  // Current dot position
  const currentC = currentMaslul != null ? lookupCorrection(currentMaslul, table) : null;
  const dotX = currentMaslul != null ? xFor(currentMaslul) : null;
  const dotY = currentC != null ? yFor(currentC) : null;

  return (
    <div className="rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] p-2">
      <div className="flex items-baseline justify-between mb-1">
        <div className="text-xs font-bold text-[var(--color-text-secondary)]">
          {title}{' '}
          {hebrewTitle && (
            <span className="hebrew-text font-normal opacity-60">({hebrewTitle})</span>
          )}
        </div>
        <div className="text-[10px] opacity-50">{reference}</div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        style={{ display: 'block' }}
      >
        {/* Baseline */}
        <line
          x1={padX}
          y1={padY + innerH}
          x2={padX + innerW}
          y2={padY + innerH}
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
        />
        {/* 0/90/180/270/360 ticks */}
        {[0, 90, 180, 270, 360].map((m) => (
          <g key={m}>
            <line
              x1={xFor(m)}
              y1={padY}
              x2={xFor(m)}
              y2={padY + innerH}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            <text
              x={xFor(m)}
              y={padY + innerH + 11}
              fill="rgba(255,255,255,0.45)"
              fontSize="9"
              textAnchor="middle"
              fontFamily="monospace"
            >
              {m}°
            </text>
          </g>
        ))}

        {/* The curve */}
        <path d={path} fill="none" stroke={color} strokeWidth="1.8" />

        {/* Filled area under curve (very subtle) */}
        <path
          d={`${path} L ${xFor(360)} ${padY + innerH} L ${xFor(0)} ${padY + innerH} Z`}
          fill={color}
          fillOpacity="0.08"
        />

        {/* Max-correction label */}
        <text
          x={padX - 4}
          y={padY + 8}
          fill="rgba(255,255,255,0.45)"
          fontSize="9"
          textAnchor="end"
          fontFamily="monospace"
        >
          {formatDms(maxC)}
        </text>

        {/* Current position dot */}
        {dotX != null && (
          <g>
            <line
              x1={dotX}
              y1={padY}
              x2={dotX}
              y2={padY + innerH}
              stroke={color}
              strokeWidth="1"
              strokeOpacity="0.45"
            />
            <circle
              cx={dotX}
              cy={dotY}
              r="4.5"
              fill={color}
              stroke="#fff"
              strokeWidth="1.2"
            />
          </g>
        )}
      </svg>

      {currentMaslul != null && (
        <div className="text-[10px] text-[var(--color-text-secondary)] mt-1 flex justify-between font-mono">
          <span>maslul: {formatDms(currentMaslul)}</span>
          <span style={{ color }}>correction: {formatDms(currentC)}{unit}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Linear interpolation across the table, mirrored beyond 180°.
 * Same logic as the engine's lookup but pure-numbers.
 */
function lookupCorrection(maslul, table) {
  const effective = maslul <= 180 ? maslul : 360 - maslul;
  for (let i = 0; i < table.length - 1; i++) {
    const cur = table[i];
    const nxt = table[i + 1];
    if (effective >= cur.maslul && effective <= nxt.maslul) {
      const ratio = (effective - cur.maslul) / (nxt.maslul - cur.maslul || 1);
      return cur.correction + ratio * (nxt.correction - cur.correction);
    }
  }
  return 0;
}
