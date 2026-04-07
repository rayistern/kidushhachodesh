import React from 'react';
import { useCalculationStore } from '../../stores/calculationStore';
import { formatDms } from '../../engine/dmsUtils';
import MoladTimeline from './MoladTimeline';

/**
 * VisibilityHorizon — side-view of the western horizon at sunset for
 * the current calendar date. Used to evaluate whether the new crescent
 * moon can be sighted (Rambam KH 17).
 *
 * The diagram shows:
 *   • Horizon line
 *   • Sun below the horizon (sunset has occurred)
 *   • Moon above the horizon at its elongation distance from the sun
 *   • The arc of vision (קשת הראיה) shaded
 *   • The four conditions of ch 17 as a checklist with the live value
 *     for each one — green if satisfied, red if not.
 *
 * Pedagogically, this is the climax of the astronomical chapters:
 * the entire model exists to answer the question "can the bet din
 * see the new moon tonight?"
 */
export default function VisibilityHorizon() {
  const calculation = useCalculationStore((s) => s.calculation);

  if (!calculation) {
    return (
      <div className="p-4 text-sm text-[var(--color-text-secondary)]">
        Loading visibility data...
      </div>
    );
  }

  const { moon } = calculation;
  const elongation = moon.elongation || 0;
  const firstVisAngle = moon.firstVisibilityAngle || 0;
  const latitude = moon.latitude || 0;
  const isVisible = moon.isVisible;

  // Diagram dimensions
  const width = 320;
  const height = 200;
  const horizonY = height - 50;
  const sunX = width / 2;
  // Show the moon to the EAST of the sun (left in the western horizon view)
  // at a distance proportional to elongation. 1° ≈ 5px.
  const elongationPx = Math.min(elongation, 30) * 5;
  const moonX = sunX - elongationPx;
  // Latitude shifts the moon up or down
  const latPx = (latitude || 0) * 5;
  const moonY = horizonY - elongationPx + latPx;
  const sunY = horizonY + 25; // sun has set 5° below horizon

  // Conditions per KH 17 — shown as a checklist below the diagram
  const conditions = [
    {
      label: 'Elongation',
      hebrew: 'אורך ראשון',
      value: formatDms(elongation),
      threshold: '> 9° (KH 17:3)',
      ok: elongation > 9,
    },
    {
      label: 'First visibility angle',
      hebrew: 'זווית הראיה',
      value: formatDms(firstVisAngle),
      threshold: '> 12° (KH 17:3-5)',
      ok: firstVisAngle > 12,
    },
    {
      label: 'Moon latitude',
      hebrew: 'רוחב הירח',
      value: formatDms(Math.abs(latitude)),
      threshold: '< 6° (KH 17:7)',
      ok: Math.abs(latitude) < 6,
    },
  ];

  return (
    <div className="p-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
        Crescent Visibility{' '}
        <span className="hebrew-text font-normal opacity-60">ראיית הירח</span>
      </h3>
      <div className="text-[10px] text-[var(--color-text-secondary)] mb-3 opacity-70">
        Rambam KH 17 — can the bet din sight the new moon tonight from
        Jerusalem?
      </div>

      {/* Horizon diagram */}
      <div className="rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] p-2 mb-3">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
          {/* Sky gradient */}
          <defs>
            <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#1a2a3a" />
              <stop offset="60%" stopColor="#3a4a5a" />
              <stop offset="100%" stopColor="#7a5a3a" />
            </linearGradient>
            <linearGradient id="ground" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2a1a0a" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width={width} height={horizonY} fill="url(#sky)" />
          <rect
            x="0"
            y={horizonY}
            width={width}
            height={height - horizonY}
            fill="url(#ground)"
          />

          {/* Horizon line */}
          <line
            x1="0"
            y1={horizonY}
            x2={width}
            y2={horizonY}
            stroke="#c9a06a"
            strokeWidth="1.5"
          />
          <text
            x={width - 6}
            y={horizonY - 4}
            fill="#c9a06a"
            fontSize="9"
            textAnchor="end"
            opacity="0.7"
          >
            horizon (אופק)
          </text>

          {/* Cardinal direction */}
          <text
            x="6"
            y={horizonY + 14}
            fill="#c9a06a"
            fontSize="9"
            opacity="0.7"
          >
            E ←
          </text>
          <text
            x={width - 6}
            y={horizonY + 14}
            fill="#c9a06a"
            fontSize="9"
            textAnchor="end"
            opacity="0.7"
          >
            → W
          </text>

          {/* Arc of vision — wedge from sun to moon */}
          {isVisible && (
            <path
              d={`M ${sunX} ${horizonY} L ${moonX} ${moonY} L ${sunX} ${moonY} Z`}
              fill="#4ef7a1"
              fillOpacity="0.12"
              stroke="#4ef7a1"
              strokeWidth="0.5"
              strokeOpacity="0.4"
            />
          )}

          {/* Sun (below horizon) */}
          <circle
            cx={sunX}
            cy={sunY}
            r="9"
            fill="#fde29a"
            opacity="0.55"
          />
          <circle
            cx={sunX}
            cy={sunY}
            r="6"
            fill="#e4b94a"
          />
          <text
            x={sunX}
            y={sunY + 22}
            fill="#fde29a"
            fontSize="9"
            textAnchor="middle"
          >
            ☉ sun
          </text>

          {/* Moon (above horizon, possibly) */}
          {moonY < horizonY ? (
            <>
              <circle
                cx={moonX}
                cy={moonY}
                r="7"
                fill="#e8e4d8"
                opacity="0.85"
              />
              {/* Crescent shadow */}
              <circle
                cx={moonX + 2.5}
                cy={moonY}
                r="6"
                fill="#1a2a3a"
                opacity="0.85"
              />
              <text
                x={moonX}
                y={moonY - 10}
                fill="#e8e4d8"
                fontSize="9"
                textAnchor="middle"
              >
                ☾ moon
              </text>
            </>
          ) : (
            <text
              x={width / 2}
              y={horizonY - 30}
              fill="#888"
              fontSize="10"
              textAnchor="middle"
            >
              moon below horizon
            </text>
          )}

          {/* Elongation marker */}
          {moonY < horizonY && (
            <>
              <line
                x1={sunX}
                y1={horizonY - 2}
                x2={moonX}
                y2={horizonY - 2}
                stroke="#4ea1f7"
                strokeWidth="1"
                strokeOpacity="0.7"
              />
              <text
                x={(sunX + moonX) / 2}
                y={horizonY - 6}
                fill="#4ea1f7"
                fontSize="9"
                textAnchor="middle"
                opacity="0.85"
              >
                {formatDms(elongation)}
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Verdict */}
      <div
        className="rounded-lg p-3 mb-3 border-2"
        style={{
          backgroundColor: isVisible ? '#0f2818' : '#2a1010',
          borderColor: isVisible ? '#4ef7a1' : '#f74e4e',
        }}
      >
        <div
          className="text-sm font-bold"
          style={{ color: isVisible ? '#4ef7a1' : '#f74e4e' }}
        >
          {isVisible ? '✓ Visible — Rosh Chodesh tonight' : '✗ Not visible'}
        </div>
        <div className="text-[10px] text-[var(--color-text-secondary)] mt-1">
          {isVisible
            ? 'The bet din could in principle accept witness testimony tonight.'
            : 'The four conditions of KH 17 are not all satisfied.'}
        </div>
      </div>

      {/* Molad timeline */}
      <MoladTimeline />

      {/* Conditions checklist */}
      <div className="mt-4 space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
          Conditions (KH 17)
        </div>
        {conditions.map((c) => (
          <div
            key={c.label}
            className="flex items-center justify-between p-2 rounded bg-[var(--color-card)] border"
            style={{
              borderColor: c.ok ? '#4ef7a155' : '#f74e4e55',
            }}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span
                className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold flex-shrink-0"
                style={{
                  backgroundColor: c.ok ? '#4ef7a1' : '#f74e4e',
                  color: '#000',
                }}
              >
                {c.ok ? '✓' : '✗'}
              </span>
              <div className="min-w-0">
                <div className="text-xs text-[var(--color-text)] truncate">
                  {c.label}
                </div>
                <div className="text-[9px] text-[var(--color-text-secondary)] hebrew-text">
                  {c.hebrew}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <div className="text-xs font-mono text-[var(--color-text)]">
                {c.value}
              </div>
              <div className="text-[9px] text-[var(--color-text-secondary)] opacity-60">
                {c.threshold}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
