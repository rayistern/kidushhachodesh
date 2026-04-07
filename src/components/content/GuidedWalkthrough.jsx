import React, { useState, useEffect, useRef } from 'react';
import { WALKTHROUGHS } from '../../content/walkthroughs';
import { useCalculationStore } from '../../stores/calculationStore';
import { useVisualizationStore } from '../../stores/visualizationStore';
import { useUIStore } from '../../stores/uiStore';

/**
 * GuidedWalkthrough (D4) — runs a scripted layman tour. Each step
 * declaratively drives the 3D scene (camera, time, ghosts, trails,
 * solo) and the calculation chain. Optional Rambam cross-link button.
 */
export default function GuidedWalkthrough({ initialId }) {
  const [walkId, setWalkId] = useState(initialId || 'moon-tonight');
  const walkthrough = WALKTHROUGHS[walkId];
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // Stores
  const selectStep = useCalculationStore((s) => s.selectStep);
  const pulseStep = useVisualizationStore((s) => s.pulseStep);
  const setCameraPreset = useVisualizationStore((s) => s.setCameraPreset);
  const setAnimationDays = useVisualizationStore((s) => s.setAnimationDays);
  const setAnimationSpeed = useVisualizationStore((s) => s.setAnimationSpeed);
  const setIsPlaying = useVisualizationStore((s) => s.setIsPlaying);
  const toggleGhosts = useVisualizationStore((s) => s.toggleGhosts);
  const toggleTrails = useVisualizationStore((s) => s.toggleTrails);
  const showGhosts = useVisualizationStore((s) => s.showGhosts);
  const showTrails = useVisualizationStore((s) => s.showTrails);
  const soloGalgal = useVisualizationStore((s) => s.soloGalgal);
  const resetGalgalVisibility = useVisualizationStore((s) => s.resetGalgalVisibility);

  const setRightPanel = useUIStore((s) => s.setRightPanel);
  const setActiveChapter = useUIStore((s) => s.setActiveChapter);

  // Reset to first step when switching tours.
  useEffect(() => { setIdx(0); }, [walkId]);

  // Apply step actions whenever idx changes.
  const lastApplied = useRef(-1);
  useEffect(() => {
    if (!walkthrough) return;
    if (lastApplied.current === idx) return;
    lastApplied.current = idx;
    const step = walkthrough.steps[idx];
    if (!step) return;

    if (step.stepId) {
      selectStep(step.stepId);
      pulseStep(step.stepId);
    }
    if (step.cameraPreset) setCameraPreset(step.cameraPreset);

    const a = step.scene || {};
    if (a.showAll) resetGalgalVisibility();
    if (a.solo) soloGalgal(a.solo);
    if (typeof a.animationDays === 'number') setAnimationDays(a.animationDays);
    if (typeof a.speed === 'number') setAnimationSpeed(a.speed);
    if (typeof a.play === 'boolean') setIsPlaying(a.play);
    // Ghosts/trails: only toggle if the requested state differs from current
    if (typeof a.ghosts === 'boolean' && a.ghosts !== showGhosts) toggleGhosts();
    if (typeof a.trails === 'boolean' && a.trails !== showTrails) toggleTrails();
  }, [idx, walkthrough]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-advance while playing — slower than before so users can read.
  useEffect(() => {
    if (!playing || !walkthrough) return;
    const t = setTimeout(() => {
      setIdx((i) => {
        const next = i + 1;
        if (next >= walkthrough.steps.length) {
          setPlaying(false);
          return i;
        }
        return next;
      });
    }, 7000);
    return () => clearTimeout(t);
  }, [playing, idx, walkthrough]);

  if (!walkthrough) return null;
  const step = walkthrough.steps[idx];
  const total = walkthrough.steps.length;
  const progress = ((idx + 1) / total) * 100;

  const openRambam = () => {
    if (!step.rambam) return;
    setActiveChapter(step.rambam.chapter);
    setRightPanel('rambam');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header — title + tour picker toggle */}
      <div className="p-3 border-b border-[var(--color-border)]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-[var(--color-text)]">{walkthrough.title}</div>
            {walkthrough.hebrewTitle && (
              <div className="hebrew-text text-sm text-[var(--color-accent)]">{walkthrough.hebrewTitle}</div>
            )}
          </div>
          <button
            onClick={() => setShowPicker((v) => !v)}
            className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            title="Switch tour"
          >
            {showPicker ? 'close' : 'tours ▾'}
          </button>
        </div>

        {showPicker && (
          <div className="mt-2 space-y-1">
            {Object.entries(WALKTHROUGHS).map(([id, w]) => (
              <button
                key={id}
                onClick={() => { setWalkId(id); setShowPicker(false); setPlaying(false); }}
                className={`w-full text-left text-xs p-2 rounded border ${
                  id === walkId
                    ? 'border-[var(--color-accent)] bg-[var(--color-card)]'
                    : 'border-[var(--color-border)] hover:bg-[var(--color-card)]'
                }`}
              >
                <div className="font-semibold">{w.title}</div>
                <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">{w.summary}</div>
              </button>
            ))}
          </div>
        )}

        <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] mt-2">
          Step {idx + 1} of {total}
        </div>
        <div className="h-1 bg-[var(--color-card)] rounded mt-1 overflow-hidden">
          <div
            className="h-full bg-[var(--color-accent)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Body — narration text + Rambam link */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-line">
          {step.text}
        </div>

        {step.rambam && (
          <button
            onClick={openRambam}
            className="mt-4 w-full text-left p-2 rounded border border-[var(--color-border)] bg-[var(--color-card)] hover:bg-[var(--color-surface)] transition-colors"
          >
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)]">
              Open in Rambam reader
            </div>
            <div className="text-xs text-[var(--color-accent)] mt-0.5">
              📖 {step.rambam.label}
            </div>
          </button>
        )}

        <div className="mt-4 text-[10px] text-[var(--color-text-secondary)] italic">
          💡 The 3D scene and side panels update automatically as the tour advances.
        </div>
      </div>

      {/* Footer — Prev / Play / Next */}
      <div className="flex items-center justify-between gap-2 p-3 border-t border-[var(--color-border)]">
        <button
          onClick={() => { setPlaying(false); setIdx((i) => Math.max(0, i - 1)); }}
          disabled={idx === 0}
          className="px-3 py-2 rounded text-xs font-mono bg-[var(--color-card)] border border-[var(--color-border)] disabled:opacity-40 min-h-[36px]"
        >
          ← Prev
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="px-4 py-2 rounded text-xs font-bold bg-[var(--color-accent)] text-white min-h-[36px]"
        >
          {playing ? '⏸ Pause' : '▶ Auto-play'}
        </button>
        <button
          onClick={() => { setPlaying(false); setIdx((i) => Math.min(total - 1, i + 1)); }}
          disabled={idx >= total - 1}
          className="px-3 py-2 rounded text-xs font-mono bg-[var(--color-card)] border border-[var(--color-border)] disabled:opacity-40 min-h-[36px]"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
