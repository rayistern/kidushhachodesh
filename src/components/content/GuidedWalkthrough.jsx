import React, { useState, useEffect } from 'react';
import { WALKTHROUGHS } from '../../content/walkthroughs';
import { useCalculationStore } from '../../stores/calculationStore';
import { useVisualizationStore } from '../../stores/visualizationStore';

/**
 * GuidedWalkthrough (D4) — steps through a scripted tour of the
 * calculation chain, selecting each calc step and swinging the camera
 * to the relevant preset. Minimal UI: Prev / Play / Next.
 */
export default function GuidedWalkthrough() {
  const [walkId, setWalkId] = useState('moon-tonight');
  const walkthrough = WALKTHROUGHS[walkId];
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const selectStep = useCalculationStore((s) => s.selectStep);
  const pulseStep = useVisualizationStore((s) => s.pulseStep);
  const setCameraPreset = useVisualizationStore((s) => s.setCameraPreset);

  // Apply the current step side-effects whenever idx changes.
  useEffect(() => {
    if (!walkthrough) return;
    const step = walkthrough.steps[idx];
    if (!step) return;
    if (step.stepId) {
      selectStep(step.stepId);
      pulseStep(step.stepId);
    }
    if (step.cameraPreset) setCameraPreset(step.cameraPreset);
  }, [idx, walkthrough, selectStep, pulseStep, setCameraPreset]);

  // Auto-advance while playing
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      setIdx((i) => {
        const next = i + 1;
        if (next >= walkthrough.steps.length) {
          setPlaying(false);
          return i;
        }
        return next;
      });
    }, 4500);
    return () => clearTimeout(t);
  }, [playing, idx, walkthrough]);

  if (!walkthrough) return null;
  const step = walkthrough.steps[idx];
  const total = walkthrough.steps.length;

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-[var(--color-border)]">
        <div className="text-sm font-bold text-[var(--color-text)]">{walkthrough.title}</div>
        {walkthrough.hebrewTitle && (
          <div className="hebrew-text text-sm text-[var(--color-accent)]">{walkthrough.hebrewTitle}</div>
        )}
        <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] mt-1">
          Step {idx + 1} of {total}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="text-sm text-[var(--color-text)] leading-relaxed">
          {step.text}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 p-3 border-t border-[var(--color-border)]">
        <button
          onClick={() => { setPlaying(false); setIdx((i) => Math.max(0, i - 1)); }}
          disabled={idx === 0}
          className="px-3 py-1 rounded text-xs font-mono bg-[var(--color-card)] border border-[var(--color-border)] disabled:opacity-40"
        >
          ← Prev
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="px-3 py-1 rounded text-xs font-mono bg-[var(--color-accent)] text-white"
        >
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button
          onClick={() => { setPlaying(false); setIdx((i) => Math.min(total - 1, i + 1)); }}
          disabled={idx >= total - 1}
          className="px-3 py-1 rounded text-xs font-mono bg-[var(--color-card)] border border-[var(--color-border)] disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
