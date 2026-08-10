/**
 * SexagesimalArithmetic — add and subtract angles. [R] KH 11:10-12
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching interactive)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The point of this one is the *trace*, not the answer. KH 11:12 walks
 * through a subtraction one borrow at a time, and the step list here
 * reproduces that narration for whatever numbers the reader enters —
 * so the "add a whole circle first" rule (KH 11:11) is visible as a
 * step rather than buried in a result.
 *
 * The Rambam's own example is the default state, so the card opens
 * showing numbers the reader can check against the text directly.
 * Its correctness is pinned in lib/sexagesimal.test.js.
 */
import React, { useState, useMemo } from 'react';
import InteractiveCard, { DmsInput, PresetButton } from './InteractiveCard';
import {
  addSexagesimal,
  subtractSexagesimal,
  formatSexagesimal,
} from '../../../lib/sexagesimal';

// KH 11:12, verbatim: 100° 20' 30" − 200° 50' 40" = 259° 29' 50".
const RAMBAM_EXAMPLE = {
  a: { degrees: 100, minutes: 20, seconds: 30 },
  b: { degrees: 200, minutes: 50, seconds: 40 },
};

export default function SexagesimalArithmetic() {
  const [mode, setMode] = useState('subtract');
  const [a, setA] = useState(RAMBAM_EXAMPLE.a);
  const [b, setB] = useState(RAMBAM_EXAMPLE.b);

  const { result, steps, addedCircle } = useMemo(
    () => (mode === 'add' ? addSexagesimal(a, b) : subtractSexagesimal(a, b)),
    [mode, a, b],
  );

  const matchesRambam =
    mode === 'subtract' &&
    a.degrees === RAMBAM_EXAMPLE.a.degrees &&
    a.minutes === RAMBAM_EXAMPLE.a.minutes &&
    a.seconds === RAMBAM_EXAMPLE.a.seconds &&
    b.degrees === RAMBAM_EXAMPLE.b.degrees &&
    b.minutes === RAMBAM_EXAMPLE.b.minutes &&
    b.seconds === RAMBAM_EXAMPLE.b.seconds;

  return (
    <InteractiveCard
      title="Add and subtract in degrees, minutes, seconds"
      source="KH 11:10-12"
      blurb="carry at sixty, drop full circles, and borrow a circle when subtracting a larger angle"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded border border-[var(--color-border)]">
          {['add', 'subtract'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`px-3 py-1 text-xs capitalize transition-colors ${
                mode === m
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <PresetButton
          onClick={() => {
            setMode('subtract');
            setA(RAMBAM_EXAMPLE.a);
            setB(RAMBAM_EXAMPLE.b);
          }}
          title="Load the subtraction the Rambam works through in KH 11:12"
        >
          Load KH 11:12 example
        </PresetButton>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DmsInput label={mode === 'add' ? 'First angle' : 'Subtract from'} value={a} onChange={setA} />
        <DmsInput label={mode === 'add' ? 'Second angle' : 'Subtract this'} value={b} onChange={setB} />
      </div>

      <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="font-mono text-sm text-[var(--color-text-secondary)]">
          {formatSexagesimal(a)} {mode === 'add' ? '+' : '−'} {formatSexagesimal(b)} =
        </div>
        <div className="mt-1 font-mono text-xl font-bold text-[var(--color-gold)]">
          {formatSexagesimal(result)}
        </div>
        {matchesRambam && (
          <div className="mt-2 text-xs text-[var(--color-accent)]">
            ✓ This is the answer stated in KH 11:12.
          </div>
        )}
        {addedCircle && !matchesRambam && (
          <div className="mt-2 text-xs text-[var(--color-text-secondary)]">
            A full circle was added first, per KH 11:11.
          </div>
        )}
      </div>

      <ol className="mt-3 space-y-2">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-2 text-xs leading-relaxed">
            <span className="shrink-0 font-mono text-[var(--color-gold)]">{i + 1}.</span>
            <span>
              <strong className="text-[var(--color-text)]">{step.label}: </strong>
              <span className="text-[var(--color-text-secondary)]">{step.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </InteractiveCard>
  );
}
