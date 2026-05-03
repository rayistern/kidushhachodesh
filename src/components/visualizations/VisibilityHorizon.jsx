import React from 'react';
import { useCalculationStore } from '../../stores/calculationStore';
import { formatDms } from '../../engine/dmsUtils';
import MoladTimeline from './MoladTimeline';

/**
 * VisibilityHorizon — side-view of the western horizon at sunset for
 * the current calendar date. Used to evaluate whether the new crescent
 * moon can be sighted (Rambam KH 17).
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** (KH 17-19, downstream of KH 11-17)
 *  SURFACE CATEGORY: internal visualization
 * ═══════════════════════════════════════════════════════════════════
 * All four visibility conditions are astronomical-pipeline outputs.
 * (Note: the embedded `<MoladTimeline />` inside this component is
 * itself mixed-regime; see MoladTimeline.jsx's header.)
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
  const elongation = moon.elongation || 0;        // אורך ראשון (KH 17:1)
  const orechSheni = moon.orechSheni;             // KH 17:5
  const rochavSheni = moon.rochavSheni;           // KH 17:7-9 (signed)
  const orechShlishi = moon.orechShlishi;         // KH 17:10-11
  const orechRevii = moon.orechRevii;             // KH 17:12a
  const mnatGovah = moon.mnatGovahHaMedinah;      // KH 17:12b
  const keshetHaReiyah = moon.keshetHaReiyah;     // KH 17:12c
  const latitude = moon.latitude || 0;            // רוחב ראשון (signed: + north / − south)
  const isVisible = moon.isVisible;
  const verdictPath = moon.visibilityPath || '';

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

  // The seven steps of the Rambam's KH 17 chain, in order.
  // Each row shows the Rambam's name in Hebrew, the chapter:halacha
  // citation, the value our engine produces, and a short note.
  const direction = latitude >= 0 ? 'צפוני' : 'דרומי';
  const rochavSheniDir = (rochavSheni ?? 0) >= 0 ? 'צפוני' : 'דרומי';
  const chainSteps = [
    { he: 'אורך ראשון',         en: 'First longitude (elongation)',
      ref: 'KH 17:1',  value: elongation },
    { he: 'אורך שני',           en: 'Second longitude (after parallax in lon.)',
      ref: 'KH 17:5',  value: orechSheni },
    { he: 'רוחב שני',           en: `Second latitude (${rochavSheniDir})`,
      ref: 'KH 17:7-9', value: rochavSheni != null ? Math.abs(rochavSheni) : null },
    { he: 'אורך שלישי',         en: 'Third longitude (after מעגל הירח)',
      ref: 'KH 17:10-11', value: orechShlishi },
    { he: 'אורך רביעי',         en: 'Fourth longitude (after long/short setting)',
      ref: 'KH 17:12',  value: orechRevii },
    { he: 'מנת גובה המדינה',    en: '⅔ × |רוחב ראשון| (ארץ ישראל)',
      ref: 'KH 17:12-14', value: mnatGovah },
    { he: 'קשת הראיה',          en: `Arc of vision (${direction === 'צפוני' ? '+' : '−'} מנת גובה)`,
      ref: 'KH 17:12,15', value: keshetHaReiyah, isFinal: true },
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
          {isVisible ? '✓ ודאי יראה — Rosh Chodesh tonight' : '✗ אינו נראה'}
        </div>
        {verdictPath && (
          <div className="text-[10px] text-[var(--color-text-secondary)] mt-1 hebrew-text leading-snug">
            {verdictPath}
          </div>
        )}
      </div>

      {/* Molad timeline */}
      <MoladTimeline />

      {/* KH 17 chain — seven steps from אורך ראשון to קשת הראיה */}
      <div className="mt-4 space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
          חשבונות הראייה — KH 17 chain
        </div>
        {chainSteps.map((s) => (
          <div
            key={s.he}
            className="flex items-center justify-between p-2 rounded bg-[var(--color-card)] border"
            style={{
              borderColor: s.isFinal ? (isVisible ? '#4ef7a1aa' : '#f74e4eaa') : 'var(--color-border)',
              borderWidth: s.isFinal ? 2 : 1,
            }}
          >
            <div className="min-w-0 flex-1">
              <div className="text-xs text-[var(--color-text)] hebrew-text" style={{ direction: 'rtl' }}>
                {s.he}
              </div>
              <div className="text-[9px] text-[var(--color-text-secondary)] truncate">
                {s.en}
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <div className="text-xs font-mono text-[var(--color-text)]">
                {s.value != null ? formatDms(s.value) : '—'}
              </div>
              <div className="text-[9px] text-[var(--color-text-secondary)] opacity-60">
                {s.ref}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
