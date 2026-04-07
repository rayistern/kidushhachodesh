import React, { useEffect, useRef, useState } from 'react';
import { useCalculationStore } from '../../stores/calculationStore';
import { useVisualizationStore } from '../../stores/visualizationStore';
import { useUIStore } from '../../stores/uiStore';
import { liveAll } from '../../engine/liveLongitudes';
import { CONSTANTS } from '../../engine/constants';
import { formatDms } from '../../engine/dmsUtils';

/**
 * EclipticRibbon — a 360° unwound view of the zodiac with live markers
 * for the sun, moon, sun apogee (govah), and lunar ascending node (rosh).
 *
 * Bridges the abstract 3D positions with the actual longitude *number*.
 * Click any marker to drill down into the calculation chain for it.
 *
 * The ribbon updates 10× per second while the animation is playing so
 * markers slide smoothly. We compute positions directly from
 * `liveLongitudes.js` rather than re-running the engine.
 */
export default function EclipticRibbon() {
  const calculation = useCalculationStore((s) => s.calculation);
  const selectStep = useCalculationStore((s) => s.selectStep);
  const isPlaying = useVisualizationStore((s) => s.isPlaying);
  const animationDays = useVisualizationStore((s) => s.animationDays);
  const setHighlightedGalgal = useVisualizationStore((s) => s.setHighlightedGalgal);
  const pulseStep = useVisualizationStore((s) => s.pulseStep);
  const isWideViewport = useUIStore((s) => s.isWideViewport);
  const setRightPanel = useUIStore((s) => s.setRightPanel);
  const setLeftPanelOpen = useUIStore((s) => s.setLeftPanelOpen);
  const setRightPanelOpen = useUIStore((s) => s.setRightPanelOpen);

  // Force re-render at 10 Hz while playing for smooth marker motion.
  const [, force] = useState(0);
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => force((n) => n + 1), 100);
    return () => clearInterval(id);
  }, [isPlaying]);

  if (!calculation) return null;

  const days =
    calculation.daysFromEpoch +
    useVisualizationStore.getState().animationDays;
  const live = liveAll(days);

  const handleClickMarker = (stepId, galgalId) => {
    selectStep(stepId);
    if (galgalId) setHighlightedGalgal(galgalId);
    pulseStep(stepId);
    setRightPanel('drilldown');
    if (!isWideViewport) {
      setLeftPanelOpen(false);
      setRightPanelOpen(true);
    }
  };

  const markers = [
    {
      id: 'sun',
      stepId: 'sunTrueLongitude',
      galgalId: 'sun',
      lon: live.sun.trueLongitude,
      meanLon: live.sun.meanLongitude,
      label: '☉',
      hebrew: 'שמש',
      color: '#fde29a',
      ring: '#e4b94a',
      tooltip: `Sun (true)\n${formatDms(live.sun.trueLongitude)}\nmean: ${formatDms(live.sun.meanLongitude)}`,
      size: 22,
    },
    {
      id: 'moon',
      stepId: 'moonTrueLongitude',
      galgalId: 'moon',
      lon: live.moon.trueLongitude,
      meanLon: live.moon.meanLongitude,
      label: '☾',
      hebrew: 'ירח',
      color: '#e8e4d8',
      ring: '#b6c2d4',
      tooltip: `Moon (true)\n${formatDms(live.moon.trueLongitude)}\nmean: ${formatDms(live.moon.meanLongitude)}`,
      size: 22,
    },
    {
      id: 'apogee',
      stepId: 'sunApogee',
      galgalId: 'sun',
      lon: live.sun.apogee,
      label: '▲',
      hebrew: 'גובה',
      color: '#d8895a',
      ring: '#a8623a',
      tooltip: `Sun apogee (govah)\n${formatDms(live.sun.apogee)}`,
      size: 14,
    },
    {
      id: 'node',
      stepId: 'nodePosition',
      galgalId: 'moon',
      lon: live.moon.node,
      label: '☊',
      hebrew: 'ראש',
      color: '#c47588',
      ring: '#9c4f5f',
      tooltip: `Lunar node (rosh)\n${formatDms(live.moon.node)}`,
      size: 14,
    },
  ];

  // Sort markers by longitude so overlapping ones stack predictably.
  const sortedMarkers = [...markers].sort((a, b) => a.lon - b.lon);

  // Find current mazal of the sun for highlighting
  const sunMazalIdx = Math.floor(live.sun.trueLongitude / 30);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        background:
          'linear-gradient(180deg, rgba(24,28,32,0.95) 0%, rgba(31,36,44,0.95) 100%)',
        borderBottom: '1px solid var(--color-border)',
        padding: '8px 12px 4px 12px',
        userSelect: 'none',
      }}
      aria-label="Ecliptic ribbon"
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--color-text-secondary)',
          marginBottom: 4,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>Ecliptic / קו המזלות</span>
        <span style={{ opacity: 0.6, fontWeight: 500 }}>
          0° → 360°
        </span>
      </div>

      {/* Track */}
      <div
        style={{
          position: 'relative',
          height: 36,
          borderRadius: 6,
          overflow: 'hidden',
          background: 'rgba(0,0,0,0.35)',
          border: '1px solid rgba(120,140,180,0.18)',
        }}
      >
        {/* 12 mazal segments */}
        {CONSTANTS.CONSTELLATIONS.map((heb, i) => {
          const isCurrent = i === sunMazalIdx;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${(i / 12) * 100}%`,
                width: `${100 / 12}%`,
                height: '100%',
                borderRight:
                  i < 11 ? '1px dashed rgba(255,255,255,0.12)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                color: isCurrent ? 'var(--color-gold)' : 'rgba(255,255,255,0.45)',
                fontWeight: isCurrent ? 700 : 500,
                background: isCurrent
                  ? 'rgba(228,185,74,0.08)'
                  : 'transparent',
                fontFamily: "'Frank Ruhl Libre', serif",
                pointerEvents: 'none',
              }}
            >
              {heb}
            </div>
          );
        })}

        {/* Markers — absolute positioned along the track */}
        {sortedMarkers.map((m) => {
          const left = (m.lon / 360) * 100;
          return (
            <button
              key={m.id}
              onClick={() => handleClickMarker(m.stepId, m.galgalId)}
              title={m.tooltip}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: m.size,
                height: m.size,
                borderRadius: '50%',
                background: m.color,
                border: `2px solid ${m.ring}`,
                color: '#000',
                fontSize: m.size > 16 ? 13 : 9,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                boxShadow: `0 0 8px ${m.ring}66, 0 0 2px rgba(0,0,0,0.8)`,
                transition: 'transform 100ms ease',
                zIndex: m.size > 16 ? 3 : 2,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform =
                  'translate(-50%, -50%) scale(1.18)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = 'translate(-50%, -50%)')
              }
            >
              {m.label}
            </button>
          );
        })}

        {/* Mean position ghost markers (for sun & moon) — show the
            emtzoi position as a faint outline so the gap to the true
            position is visible. This is a teaser for the V2 ghost
            bodies feature. */}
        {[live.sun, live.moon].map((body, idx) => {
          const dot = idx === 0
            ? { color: '#e4b94a', label: '·', size: 8 }
            : { color: '#b6c2d4', label: '·', size: 8 };
          const left = (body.meanLongitude / 360) * 100;
          return (
            <div
              key={`mean-${idx}`}
              title={`mean: ${formatDms(body.meanLongitude)}`}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: dot.size,
                height: dot.size,
                borderRadius: '50%',
                border: `1px dashed ${dot.color}`,
                background: 'transparent',
                pointerEvents: 'none',
                opacity: 0.55,
                zIndex: 1,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
