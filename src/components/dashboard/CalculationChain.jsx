import React, { useState } from 'react';
import { useCalculationStore } from '../../stores/calculationStore';
import { useUIStore } from '../../stores/uiStore';
import { formatDms } from '../../engine/dmsUtils';
import { CONSTANTS, SOURCE_TYPES } from '../../engine/constants';
import MaslulGraph from '../visualizations/MaslulGraph';
import { tourForStep } from '../../content/walkthroughs';

/** Parse a "KH 14:3" / "KH 17:9-11" style ref → { chapter, halacha } */
function parseRambamRef(ref) {
  if (!ref) return null;
  const m = ref.match(/(\d+)\s*:\s*(\d+)/);
  if (!m) return null;
  return { chapter: parseInt(m[1], 10), halacha: parseInt(m[2], 10) };
}

/**
 * Displays the full calculation derivation chain.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** drill-down renderer
 * ═══════════════════════════════════════════════════════════════════
 * Currently renders only astronomical steps (KH 11-17 pipeline). The
 * `daysFromEpoch` step is the one crossing step — it has upstream
 * inputs from the fixed calendar (KH 6-10) and should be rendered as
 * a labeled crossing point, not an ordinary internal step.
 * See docs/OPEN_QUESTIONS.md Q1 and Q2.
 *
 * TODO (ROADMAP Phase 3 / D2): when input-click chaining is wired up,
 * each chain must stay within one regime. A fixed-calendar step must
 * not link to an astronomical step or vice versa — except at the
 * `daysFromEpoch` crossing, which is allowed BY DESIGN and should be
 * visually distinct.
 *
 * Each step shows:
 *   - Source badge (color-coded: blue=Rambam, amber=interpolated, purple=deduced, green=Losh)
 *   - Hebrew + English name
 *   - Result value
 *   - Expandable teaching note (from Rabbi Zajac / Rabbi Losh classes)
 */
export default function CalculationChain() {
  const calculation = useCalculationStore((s) => s.calculation);
  const selectedStepId = useCalculationStore((s) => s.selectedStepId);
  const selectStep = useCalculationStore((s) => s.selectStep);

  if (!calculation) {
    return (
      <div className="p-4 text-sm text-[var(--color-text-secondary)]">
        Loading calculations...
      </div>
    );
  }

  const steps = calculation.steps;
  const selectedStep = selectedStepId ? calculation.stepMap[selectedStepId] : null;

  return (
    <div className="p-3">
      {/* Source legend */}
      <SourceLegend />

      {selectedStep ? (
        /* Focused view: show selected step in detail */
        <div>
          <button
            onClick={() => selectStep(null)}
            className="text-xs text-[var(--color-accent)] hover:underline mb-3"
          >
            &larr; Show all steps
          </button>
          <StepDetail step={selectedStep} onClickInput={selectStep} />
        </div>
      ) : (
        /* Overview: show all steps */
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">
            Calculation Chain
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mb-3">
            Click any step to see its full derivation and teaching notes
          </p>

          {/* Group steps by category */}
          <StepGroup label="Sun" hebrewLabel="השמש" steps={steps.filter(s => s.id.startsWith('sun') || s.id === 'daysFromEpoch')} onSelect={selectStep} />
          <StepGroup label="Moon" hebrewLabel="הירח" steps={steps.filter(s => s.id.startsWith('moon') || s.id === 'doubleElongation' || s.id === 'maslulHanachon' || s.id === 'nodePosition')} onSelect={selectStep} />
          <StepGroup label="Visibility" hebrewLabel="ראייה" steps={steps.filter(s => ['elongation', 'firstVisibilityAngle', 'moonVisibility', 'seasonalInfo'].includes(s.id))} onSelect={selectStep} />
        </div>
      )}

      {/* Maslul correction graphs — interactive sine charts */}
      <div className="mt-4 space-y-3">
        <MaslulGraph
          title="Sun Maslul Correction"
          hebrewTitle="מנת מסלול השמש"
          reference="KH 13:4"
          table={CONSTANTS.SUN_MASLUL_CORRECTIONS}
          currentMaslul={calculation.sun.maslul}
          color="#e4b94a"
          height={90}
        />
        <MaslulGraph
          title="Moon Maslul Correction"
          hebrewTitle="מנת מסלול הירח"
          reference="KH 15:4-6"
          table={CONSTANTS.MOON_MASLUL_CORRECTIONS}
          currentMaslul={calculation.moon.maslulHanachon}
          color="#b6c2d4"
          height={90}
        />

        <CorrectionTable
          title="Sun Correction Table"
          hebrewTitle="מנת מסלול השמש"
          reference="KH 13:4"
          table={CONSTANTS.SUN_MASLUL_CORRECTIONS}
          selectedMaslul={calculation.sun.maslul}
          maxCorrection="~2° at 90°"
        />
        <CorrectionTable
          title="Moon Correction Table"
          hebrewTitle="מנת מסלול הירח"
          reference="KH 15:4-6"
          table={CONSTANTS.MOON_MASLUL_CORRECTIONS}
          selectedMaslul={calculation.moon.maslulHanachon}
          maxCorrection="~5°8' at 100°"
        />
      </div>
    </div>
  );
}

// ─── Source Legend ─────────────────────────────────────────────

function SourceLegend() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
        >
          {expanded ? '▾' : '▸'} Source Color Key
        </button>
        {/* Q6 / roadmap R6: link to the open-questions doc. Surfaces
            the regime separation (KH 6-10 vs 11-17) and the 309,716 /
            309,717 crossing-point trap. */}
        <a
          href="https://github.com/rayistern/kidushhachodesh/blob/main/docs/OPEN_QUESTIONS.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
          title="Open questions, unresolved methodology, and known traps"
        >
          Methodology notes ↗
        </a>
      </div>
      {expanded && (
        <div className="mt-1 p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] grid grid-cols-2 gap-1">
          {Object.entries(SOURCE_TYPES).map(([key, info]) => (
            <div key={key} className="flex items-center gap-1.5 text-[10px]">
              <SourceBadge source={key} />
              <span className="text-[var(--color-text-secondary)]">{info.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Source Badge ──────────────────────────────────────────────

function SourceBadge({ source }) {
  const info = SOURCE_TYPES[source] || SOURCE_TYPES.rambam;
  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 rounded-sm text-[9px] font-bold flex-shrink-0"
      style={{ backgroundColor: info.color + '25', color: info.color, border: `1px solid ${info.color}50` }}
      title={info.description}
    >
      {info.icon}
    </span>
  );
}

// ─── Regime Badge ──────────────────────────────────────────────
// Per docs/OPEN_QUESTIONS.md Q2: the Rambam keeps two computational
// systems separate (fixed calendar KH 6-10 vs astronomical KH 11-17).
// This badge labels each step with its regime so the reader can see at
// a glance which system they're looking at. The `crossing` tag is
// reserved for the one step (daysFromEpoch) that bridges them — see
// issue #8 for the dedicated crossing-point UI treatment.

const REGIME_INFO = {
  astronomical: {
    label: 'Astronomical',
    short: 'KH 11-17',
    color: '#ddaa33',
    description: 'Astronomical pipeline (KH 11-17). Independent of the fixed calendar.',
  },
  'fixed-calendar': {
    label: 'Fixed Calendar',
    short: 'KH 6-10',
    color: '#8899bb',
    description: 'Fixed calendar (KH 6-10). Hillel II arithmetic — BaHaRaD + dehiyot.',
  },
  crossing: {
    label: 'Crossing',
    short: 'KH 6-10 → KH 11-17',
    color: '#b74ef7',
    description: 'The one step where fixed-calendar output feeds the astronomical pipeline. See methodology notes Q1-Q2.',
  },
};

function RegimeBadge({ regime }) {
  if (!regime || !REGIME_INFO[regime]) return null;
  const info = REGIME_INFO[regime];
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[9px] font-medium flex-shrink-0"
      style={{ backgroundColor: info.color + '20', color: info.color, border: `1px solid ${info.color}40` }}
      title={info.description}
    >
      {info.short}
    </span>
  );
}

// ─── Step Group ───────────────────────────────────────────────

function StepGroup({ label, hebrewLabel, steps, onSelect }) {
  if (steps.length === 0) return null;
  return (
    <div className="mb-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1 flex items-center gap-1">
        {label} <span className="hebrew-text font-normal opacity-60">{hebrewLabel}</span>
      </div>
      {steps.map((step) => (
        <StepCard key={step.id} step={step} onClick={() => onSelect(step.id)} />
      ))}
    </div>
  );
}

// ─── Step Card ────────────────────────────────────────────────

function StepCard({ step, onClick }) {
  const resultDisplay = typeof step.result === 'boolean'
    ? (step.result ? 'Yes' : 'No')
    : typeof step.result === 'object'
    ? JSON.stringify(step.result)
    : step.formatted || (typeof step.result === 'number' ? step.result.toFixed(4) : String(step.result));

  const sourceInfo = SOURCE_TYPES[step.source] || SOURCE_TYPES.rambam;

  return (
    <div
      onClick={onClick}
      className="p-3 mb-1.5 rounded-lg bg-[var(--color-card)] border cursor-pointer hover:border-[var(--color-accent)] active:border-[var(--color-accent)] transition-colors min-h-[44px]"
      style={{ borderColor: `${sourceInfo.color}30` }}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-start gap-1.5 min-w-0">
          <SourceBadge source={step.source} />
          <div className="min-w-0">
            <div className="text-xs font-medium text-[var(--color-text)] truncate">{step.name}</div>
            <div className="hebrew-text text-xs text-[var(--color-text-secondary)]">{step.hebrewName}</div>
          </div>
        </div>
        <div className="text-xs font-mono text-[var(--color-accent)] flex-shrink-0">
          {resultDisplay}
        </div>
      </div>
      {step.rambamRef && (
        <div className="text-[10px] text-[var(--color-text-secondary)] mt-1 opacity-60 ml-5">
          {step.rambamRef}
        </div>
      )}
    </div>
  );
}

// ─── Step Detail (Expanded) ──────────────────────────────────

function StepDetail({ step, onClickInput }) {
  const [showTeaching, setShowTeaching] = useState(true);
  const sourceInfo = SOURCE_TYPES[step.source] || SOURCE_TYPES.rambam;
  const setRightPanel = useUIStore((s) => s.setRightPanel);
  const setActiveChapter = useUIStore((s) => s.setActiveChapter);
  const refTarget = parseRambamRef(step.rambamRef);
  const tourId = tourForStep(step.id);
  const openRambam = () => {
    if (refTarget) setActiveChapter(refTarget.chapter);
    setRightPanel('rambam');
  };
  const openTour = () => setRightPanel('walkthrough');

  return (
    <div
      className="rounded-lg bg-[var(--color-card)] border p-4"
      style={{ borderColor: `${sourceInfo.color}50` }}
    >
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <SourceBadge source={step.source} />
          <h3 className="text-sm font-bold text-[var(--color-text)]">{step.name}</h3>
          <RegimeBadge regime={step.regime} />
        </div>
        <div className="hebrew-text text-base text-[var(--color-accent)]">{step.hebrewName}</div>
        {step.rambamRef && (
          <div className="text-xs mt-1" style={{ color: sourceInfo.color }}>
            Rambam: {step.rambamRef}
          </div>
        )}
        {step.sourceNote && (
          <div className="text-[10px] text-[var(--color-text-secondary)] mt-1 italic">
            {step.sourceNote}
          </div>
        )}

        {/* Cross-links: open this step in the Rambam reader, or take a guided tour. */}
        <div className="flex gap-2 mt-2">
          {(refTarget || step.rambamRef) && (
            <button
              onClick={openRambam}
              className="text-[10px] px-2 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-card)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            >
              📖 Read in Rambam
            </button>
          )}
          {tourId && (
            <button
              onClick={openTour}
              className="text-[10px] px-2 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-card)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            >
              🎬 Take a tour
            </button>
          )}
        </div>
      </div>

      {/* Teaching Note (from classes) */}
      {step.teachingNote && (
        <div className="mb-3">
          <button
            onClick={() => setShowTeaching(!showTeaching)}
            className="text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1"
            style={{ color: SOURCE_TYPES.losh.color }}
          >
            {showTeaching ? '▾' : '▸'} Teaching Note
          </button>
          {showTeaching && (
            <div
              className="p-2.5 rounded-lg text-xs leading-relaxed"
              style={{
                backgroundColor: SOURCE_TYPES.losh.color + '08',
                borderLeft: `3px solid ${SOURCE_TYPES.losh.color}40`,
                color: 'var(--color-text-secondary)',
              }}
            >
              {step.teachingNote}
            </div>
          )}
        </div>
      )}

      {/* Formula */}
      {step.formula && (
        <div className="mb-3 p-2 rounded bg-[var(--color-surface)] font-mono text-xs text-[var(--color-text-secondary)]">
          {step.formula}
        </div>
      )}

      {/* Inputs */}
      {step.inputs && (
        <div className="mb-3">
          <div className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
            Inputs
          </div>
          {Object.entries(step.inputs).map(([key, input]) => {
            const isClickable = typeof input.value === 'number';
            return (
              <div
                key={key}
                className={`flex justify-between py-1 border-b border-[var(--color-border)] border-opacity-30 text-xs ${
                  isClickable ? 'cursor-pointer hover:text-[var(--color-accent)]' : ''
                }`}
              >
                <span className="text-[var(--color-text-secondary)]">
                  {input.label || key}
                  {input.unit && <span className="opacity-50 ml-1">({input.unit})</span>}
                </span>
                <span className="font-mono text-[var(--color-text)]">
                  {typeof input.value === 'number' ? input.value.toFixed(4) : String(input.value)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Result */}
      <div
        className="p-2 rounded"
        style={{
          backgroundColor: sourceInfo.color + '10',
          border: `1px solid ${sourceInfo.color}30`,
        }}
      >
        <div className="text-xs text-[var(--color-text-secondary)]">Result</div>
        <div className="text-lg font-bold font-mono" style={{ color: sourceInfo.color }}>
          {step.formatted || (typeof step.result === 'number' ? step.result.toFixed(4) : String(step.result))}
          {step.unit && step.unit !== '' && step.unit !== 'boolean' && (
            <span className="text-xs ml-1 opacity-60">{step.unit}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Correction Table (reusable for Sun and Moon) ────────────

function CorrectionTable({ title, hebrewTitle, reference, table, selectedMaslul, maxCorrection }) {
  const [expanded, setExpanded] = useState(false);
  const effectiveMaslul = selectedMaslul != null
    ? (selectedMaslul <= 180 ? selectedMaslul : 360 - selectedMaslul)
    : null;

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1 flex items-center gap-1">
          {expanded ? '▾' : '▸'} {title}
          <span className="hebrew-text font-normal opacity-60">({hebrewTitle})</span>
          <span className="font-normal opacity-40 ml-auto">max: {maxCorrection}</span>
        </h4>
      </button>
      {expanded && (
        <>
          <div className="text-[10px] text-[var(--color-text-secondary)] mb-1">
            {reference} — <SourceBadge source="rambam" /> Values at 10° intervals from the Rambam.
            Between entries: <SourceBadge source="approximated" /> interpolated.
          </div>
          <div className="rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[var(--color-surface)]">
                  <th className="px-2 py-1 text-left text-[var(--color-text-secondary)]">Maslul</th>
                  <th className="px-2 py-1 text-right text-[var(--color-text-secondary)]">Correction</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row, i) => {
                  const isActive = effectiveMaslul != null && effectiveMaslul >= row.maslul &&
                    (i === table.length - 1 || effectiveMaslul < table[i + 1].maslul);
                  return (
                    <tr
                      key={row.maslul}
                      className={isActive ? 'bg-[var(--color-accent)] bg-opacity-15' : ''}
                    >
                      <td className="px-2 py-0.5 font-mono">{row.maslul}°</td>
                      <td className="px-2 py-0.5 text-right font-mono">
                        {formatDms(row.correction)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {effectiveMaslul != null && (
            <div className="text-[10px] text-[var(--color-text-secondary)] mt-1">
              Current: {formatDms(selectedMaslul)} (effective: {formatDms(effectiveMaslul)})
            </div>
          )}
        </>
      )}
    </div>
  );
}
