import React from 'react';
import { useCalendarStore } from '../../stores/calendarStore';
import { useCalculationStore } from '../../stores/calculationStore';
import { moladsAround, findTrueConjunction } from '../../engine/moladTimeline';

/**
 * MoladTimeline — horizontal strip showing mean moladot before & after
 * the current calendar date, plus the corresponding TRUE conjunctions.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **mixed** — fixed-calendar ticks + astronomical overlays
 *  SURFACE CATEGORY: internal visualization (labeling layer per Q3)
 * ═══════════════════════════════════════════════════════════════════
 * Mean molad ticks are fixed-calendar output (KH 6:3, BaHaRaD-anchored
 * via `moladsAround`). True conjunction markers are astronomical output
 * (from the KH 11-17 pipeline). The *comparison* between them is the
 * pedagogical payload — a visible demonstration of the ~14h mean-vs-
 * true gap. See docs/OPEN_QUESTIONS.md Q3 (labeling layer scope) and
 * Q6 (timezone anchoring caveat on BaHaRaD).
 *
 * The mean molad (from the fixed 29d 12h 793p interval) and the true
 * conjunction (when sun and moon actually share a longitude) can differ
 * by up to ~14 hours. The strip makes that gap visible: each mean
 * molad gets a marker, and the true conjunction gets a slightly offset
 * marker connected by a small line.
 *
 * Click a molad → jump the calendar to that date.
 */
export default function MoladTimeline() {
  const setDate = useCalendarStore((s) => s.setDate);
  const calculation = useCalculationStore((s) => s.calculation);

  if (!calculation) return null;

  const anchor = calculation.daysFromEpoch;
  const moladot = moladsAround(anchor, 4); // 9 markers total

  // Compute true conjunction for each
  const enriched = moladot.map((m) => ({
    ...m,
    trueDays: findTrueConjunction(m.daysFromEpoch),
  }));

  // Time range for the strip: from first to last mean molad
  const minDays = enriched[0].daysFromEpoch;
  const maxDays = enriched[enriched.length - 1].daysFromEpoch;
  const range = maxDays - minDays;

  const xFor = (days) => ((days - minDays) / range) * 100;

  // Convert days-from-epoch to a JS Date. The epoch is 3 Nisan 4938 AM =
  // Thursday, 30 March 1178 CE (proleptic Gregorian) — see engine constants.
  const epoch = new Date(Date.UTC(1178, 2, 30));
  const dateFor = (days) => {
    const d = new Date(epoch);
    d.setUTCDate(d.getUTCDate() + days);
    return d;
  };

  const handleClickMolad = (days) => {
    setDate(dateFor(days));
  };

  return (
    <div className="rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] p-3 mt-4">
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-xs font-bold text-[var(--color-text-secondary)]">
          Molad Timeline{' '}
          <span className="hebrew-text font-normal opacity-60">(מולדות)</span>
        </div>
        <div className="text-[10px] opacity-50">±4 months</div>
      </div>

      <div className="text-[10px] text-[var(--color-text-secondary)] mb-2 opacity-70">
        Mean molad (●) vs true conjunction (○) — the gap is the eccentricity
        correction made visible.
      </div>

      {/* Strip */}
      <div
        style={{
          position: 'relative',
          height: 56,
          marginTop: 4,
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 6,
          padding: '0 8px',
        }}
      >
        {/* Center axis */}
        <div
          style={{
            position: 'absolute',
            left: 8,
            right: 8,
            top: '50%',
            height: 1,
            background: 'rgba(255,255,255,0.18)',
          }}
        />

        {/* Anchor (current date) marker */}
        <div
          style={{
            position: 'absolute',
            left: `calc(${xFor(anchor)}% - 1px + 8px)`,
            top: 4,
            bottom: 4,
            width: 2,
            background: 'var(--color-accent)',
            opacity: 0.7,
          }}
          title="Today"
        />

        {/* Mean & true molad markers */}
        {enriched.map((m, i) => {
          const meanX = xFor(m.daysFromEpoch);
          const trueX = xFor(m.trueDays);
          const isCurrent = m.index === 0;
          const date = dateFor(m.daysFromEpoch);
          return (
            <React.Fragment key={i}>
              {/* Connector line between mean and true */}
              <div
                style={{
                  position: 'absolute',
                  left: `calc(${Math.min(meanX, trueX)}% + 8px)`,
                  width: `calc(${Math.abs(trueX - meanX)}% + 1px)`,
                  top: '50%',
                  height: 2,
                  background: '#b6c2d4',
                  opacity: 0.4,
                }}
              />
              {/* Mean molad — solid */}
              <button
                onClick={() => handleClickMolad(m.daysFromEpoch)}
                style={{
                  position: 'absolute',
                  left: `calc(${meanX}% + 8px)`,
                  top: 'calc(50% - 8px)',
                  transform: 'translateX(-50%)',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: isCurrent ? 'var(--color-accent)' : '#b6c2d4',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  zIndex: 2,
                  boxShadow: isCurrent ? '0 0 8px var(--color-accent)' : 'none',
                }}
                title={`Mean molad: ${date.toDateString()}`}
              />
              {/* True conjunction — outline circle */}
              <div
                style={{
                  position: 'absolute',
                  left: `calc(${trueX}% + 8px)`,
                  top: 'calc(50% - 6px)',
                  transform: 'translateX(-50%)',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: 'transparent',
                  border: '1.5px solid #4ef7a1',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
                title={`True conjunction: ${dateFor(m.trueDays).toDateString()}`}
              />
              {/* Date label below */}
              {(isCurrent || i % 2 === 0) && (
                <div
                  style={{
                    position: 'absolute',
                    left: `calc(${meanX}% + 8px)`,
                    bottom: -2,
                    transform: 'translateX(-50%)',
                    fontSize: 8,
                    color: isCurrent ? 'var(--color-accent)' : 'rgba(255,255,255,0.5)',
                    whiteSpace: 'nowrap',
                    fontFamily: 'monospace',
                    fontWeight: isCurrent ? 700 : 400,
                  }}
                >
                  {date.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="text-[10px] text-[var(--color-text-secondary)] mt-3 opacity-60">
        Click any molad to jump the calendar to that date.
      </div>
    </div>
  );
}
