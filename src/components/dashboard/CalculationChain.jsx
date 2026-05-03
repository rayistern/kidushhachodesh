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
  const drillBreadcrumb = useCalculationStore((s) => s.drillBreadcrumb);
  const drillIntoInput = useCalculationStore((s) => s.drillIntoInput);
  const drillBack = useCalculationStore((s) => s.drillBack);

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
          <Breadcrumb
            crumbs={drillBreadcrumb}
            currentId={selectedStep.id}
            stepMap={calculation.stepMap}
            onJumpToRoot={() => selectStep(null)}
            onBack={drillBack}
          />
          <StepDetail
            step={selectedStep}
            onClickInput={(refId) => drillIntoInput(selectedStep.id, refId)}
          />
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
          <StepGroup label="Visibility (KH 17 chain)" hebrewLabel="חשבונות הראייה" steps={steps.filter(s => ['elongation', 'orechSheni', 'rochavSheni', 'orechShlishi', 'orechRevii', 'mnatGovahHaMedinah', 'keshetHaReiyah', 'moonVisibility', 'seasonalInfo'].includes(s.id))} onSelect={selectStep} />
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

// ─── Crossing Callout ──────────────────────────────────────────
// Rendered only at the daysFromEpoch step. Shows the integer civil-day
// count side-by-side with the mean-synodic-time equivalent — the exact
// comparison that produced the user report on 2026-04-23 (they had
// computed the mean-synodic number and fed it into KH 12:1, which
// actually wants the civil-day count). See docs/OPEN_QUESTIONS.md Q1.

function CrossingCallout({ info }) {
  const { civilDays, wholeMoladot, meanSynodicDays, driftDays, synodicInterval } = info;
  const crossing = REGIME_INFO.crossing;
  return (
    <div
      className="mb-3 p-3 rounded-lg"
      style={{
        backgroundColor: crossing.color + '10',
        border: `1px solid ${crossing.color}40`,
      }}
    >
      <div
        className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"
        style={{ color: crossing.color }}
      >
        ⚠ Regime Crossing — {crossing.short}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded bg-[var(--color-card)] border border-[var(--color-border)]">
          <div className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wide mb-0.5">
            Civil days (KH 6-10)
          </div>
          <div className="font-mono text-sm font-bold text-[var(--color-text)]">
            {civilDays.toLocaleString()}
          </div>
          <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">
            What KH 12:1 actually wants ✓
          </div>
        </div>
        <div className="p-2 rounded bg-[var(--color-card)] border border-[var(--color-border)] opacity-80">
          <div className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wide mb-0.5">
            Mean-synodic days (KH 6:3)
          </div>
          <div className="font-mono text-sm font-bold text-[var(--color-text-secondary)]">
            {meanSynodicDays.toFixed(3).toLocaleString()}
          </div>
          <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">
            {wholeMoladot.toLocaleString()} × {synodicInterval.toFixed(4)}
          </div>
        </div>
      </div>
      <div className="text-[11px] text-[var(--color-text-secondary)] mt-2 leading-snug">
        These are different quantities. The fixed calendar's dehiyot
        (KH 7) accumulate ~{driftDays.toFixed(3)} days of drift from
        the mean-molad clock over this interval. Don't feed the
        mean-synodic number into KH 12:1 — that's the trap.{' '}
        <a
          href="https://github.com/rayistern/kidushhachodesh/blob/main/docs/OPEN_QUESTIONS.md#q1-what-day-count-does-the-rambams-astronomical-pipeline-actually-want"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          style={{ color: crossing.color }}
        >
          Full writeup ↗
        </a>
      </div>
    </div>
  );
}

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

// ─── Breadcrumb ────────────────────────────────────────────────
// Shows the drill-down history. Empty breadcrumb = user selected
// this step from outside (sidebar click); "← Show all steps"
// returns to the chain overview. Non-empty breadcrumb = user drilled
// in via input clicks; each crumb is clickable and jumps back.

function Breadcrumb({ crumbs, currentId, stepMap, onJumpToRoot, onBack }) {
  return (
    <div className="flex items-center gap-1 mb-3 text-xs flex-wrap">
      <button
        onClick={onJumpToRoot}
        className="text-[var(--color-accent)] hover:underline"
      >
        &larr; All steps
      </button>
      {crumbs.length > 0 && (
        <>
          <span className="text-[var(--color-text-secondary)]">/</span>
          {crumbs.map((id, i) => {
            const step = stepMap[id];
            return (
              <React.Fragment key={`${id}-${i}`}>
                <button
                  onClick={onBack}
                  className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:underline truncate max-w-[120px]"
                  title={`Back to ${step?.name || id}`}
                >
                  {step?.name || id}
                </button>
                <span className="text-[var(--color-text-secondary)]">/</span>
              </React.Fragment>
            );
          })}
          <span className="text-[var(--color-text)] font-medium truncate max-w-[140px]">
            {stepMap[currentId]?.name || currentId}
          </span>
        </>
      )}
    </div>
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
      {/* Crossing callout — for the one step that bridges regimes.
          See issue #8 and docs/OPEN_QUESTIONS.md Q1. */}
      {step.crossingInfo && <CrossingCallout info={step.crossingInfo} />}

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
            // Clickable only when the input links to an upstream step
            // via refId. Plain numeric inputs (constants, lookups) are
            // not drillable. The click routes through `drillIntoInput`
            // in the store, which enforces regime discipline (R3).
            const isClickable = !!input.refId;
            const handleClick = isClickable && onClickInput ? () => onClickInput(input.refId) : undefined;
            return (
              <div
                key={key}
                onClick={handleClick}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={isClickable && handleClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } } : undefined}
                className={`flex justify-between py-1 border-b border-[var(--color-border)] border-opacity-30 text-xs ${
                  isClickable ? 'cursor-pointer hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] -mx-1 px-1 rounded' : ''
                }`}
                title={isClickable ? 'Drill into this input' : undefined}
              >
                <span className="text-[var(--color-text-secondary)] flex items-center gap-1">
                  {input.label || key}
                  {input.unit && <span className="opacity-50 ml-1">({input.unit})</span>}
                  {isClickable && <span className="opacity-50 text-[9px]">→</span>}
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
