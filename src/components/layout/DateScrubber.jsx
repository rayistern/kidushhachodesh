import React, { useMemo } from 'react';
import { useCalendarStore } from '../../stores/calendarStore';
import { useCalculationStore } from '../../stores/calculationStore';
import { useVisualizationStore } from '../../stores/visualizationStore';
import { moladsAround, MOLAD_INTERVAL_DAYS } from '../../engine/moladTimeline';

/**
 * DateScrubber (D5) — horizontal slider that drags `animationDays`
 * (the visualization offset from the calendar date). When "snap to molad"
 * is on, the slider quantizes to the nearest mean molad.
 *
 * The slider does NOT mutate the calendar date; it only moves the live
 * scene forward and backward so the user can see how the sky changes.
 * Clicking "Reset" zeros the offset.
 */
const RANGE = 365; // ± days around calendar date

export default function DateScrubber() {
  // Don't subscribe to `animationDays` directly — it changes every
  // animation frame while playing, which would re-render the scrubber
  // (and its surrounding sidebar) at 60fps. Instead, hold our own
  // local "displayed" value and poll the store at 4Hz only while
  // playing. User drag still pushes through immediately via setAnimationDays.
  const setAnimationDays = useVisualizationStore((s) => s.setAnimationDays);
  const resetAnimation = useVisualizationStore((s) => s.resetAnimation);
  const isPlaying = useVisualizationStore((s) => s.isPlaying);
  const togglePlaying = useVisualizationStore((s) => s.togglePlaying);
  const calculation = useCalculationStore((s) => s.calculation);
  const currentDate = useCalendarStore((s) => s.currentDate);

  const [animationDays, setLocalDays] = React.useState(
    () => useVisualizationStore.getState().animationDays,
  );
  const [snap, setSnap] = React.useState(false);

  // Poll the store while playing; sync once on stop so the final
  // position lands accurately. Cheap subscription on isPlaying only.
  React.useEffect(() => {
    setLocalDays(useVisualizationStore.getState().animationDays);
    if (!isPlaying) return;
    const id = setInterval(() => {
      setLocalDays(useVisualizationStore.getState().animationDays);
    }, 250);
    return () => clearInterval(id);
  }, [isPlaying]);

  const daysFromEpoch = calculation?.daysFromEpoch ?? 0;

  // Nearest molad given the current offset (for snap mode and label).
  const snapTargets = useMemo(() => {
    if (!snap) return null;
    return moladsAround(daysFromEpoch, Math.ceil(RANGE / MOLAD_INTERVAL_DAYS) + 2);
  }, [snap, daysFromEpoch]);

  const onChange = (e) => {
    let next = Number(e.target.value);
    if (snap && snapTargets) {
      // Map the raw days-from-calendar-date to a molad offset.
      const target = daysFromEpoch + next;
      let best = snapTargets[0];
      for (const m of snapTargets) {
        if (Math.abs(m.daysFromEpoch - target) < Math.abs(best.daysFromEpoch - target)) {
          best = m;
        }
      }
      next = Math.round(best.daysFromEpoch - daysFromEpoch);
    }
    setAnimationDays(next);
    setLocalDays(next);
  };

  // Visible date = calendar + animationDays.
  const visible = useMemo(() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + Math.round(animationDays));
    return d;
  }, [currentDate, animationDays]);

  return (
    <div className="px-3 py-2 border-t border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold">
          Scrubber
        </span>
        <span className="text-[10px] font-mono text-[var(--color-text)]">
          {animationDays >= 0 ? '+' : ''}{Math.round(animationDays)}d → {visible.toISOString().slice(0, 10)}
        </span>
      </div>
      <input
        type="range"
        min={-RANGE}
        max={RANGE}
        step={1}
        value={Math.round(animationDays)}
        onChange={onChange}
        className="w-full accent-[var(--color-accent)]"
        aria-label="Date scrubber"
      />
      <div className="flex items-center justify-between gap-2 mt-1">
        <label className="flex items-center gap-1 text-[10px] text-[var(--color-text-secondary)] cursor-pointer">
          <input
            type="checkbox"
            checked={snap}
            onChange={(e) => setSnap(e.target.checked)}
          />
          Snap to molad
        </label>
        <div className="flex gap-1">
          <button
            onClick={togglePlaying}
            className="px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-border)]"
            aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            onClick={resetAnimation}
            className="px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-border)]"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
