/**
 * InterpolatePractice — try the sharing-out yourself. [R] KH 13:8
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching interactive)
 * ═══════════════════════════════════════════════════════════════════
 *
 * KH 13:8 repeats 13:7 with 67° and then generalises twice over: to any
 * course "that has both units and tens", and to the moon's table as
 * well as the sun's. So it is a practice halacha, and the card
 * practises — including on courses drawn from across the table, since
 * the per-degree rate changes with where you are on the arch and a
 * student who only ever works 65° will not have noticed.
 */
import React, { useState } from 'react';
import InteractiveCard from './InteractiveCard';
import { correctionWithTrace } from '../../../lib/maslulTable';

function formatMin(deg) {
  const total = Math.round(deg * 60 * 100) / 100;
  const d = Math.floor(total / 60);
  const m = total - d * 60;
  const mStr = Number.isInteger(m) ? m : m.toFixed(1);
  return d > 0 ? `${d}° ${mStr}'` : `${mStr}'`;
}

// Spread across the arch: steep near the ends, nearly flat near 90°.
const QUESTIONS = [67, 23, 95, 142, 38, 116, 74, 8, 159, 51];

export default function InterpolatePractice() {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);

  const course = QUESTIONS[index % QUESTIONS.length];
  const trace = correctionWithTrace(course);
  const exactMinutes = trace.correction * 60;
  // Accept anything inside half a minute — the Rambam's own answers are
  // whole minutes, and KH 13:10 discards finer detail outright.
  const correct = Math.abs(Number(answer) - exactMinutes) <= 0.5;

  const next = () => {
    setIndex((i) => i + 1);
    setAnswer('');
    setChecked(false);
  };

  return (
    <InteractiveCard
      title="Interpolate it yourself"
      source="KH 13:8"
      blurb="any course with both tens and units — and the same method serves the moon's table later"
    >
      <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
        This halacha works 67° and then widens the rule twice: to any course with tens and
        units, and to the moon's table as well as the sun's. Practice on courses from across the
        arch — the per-degree rate is not the same everywhere.
      </p>

      <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="text-sm">
          Course <span className="font-mono font-bold text-[var(--color-gold)]">{course}°</span>.
          What is the correction, in minutes?
        </div>

        {trace.lo && (
          <div className="mt-1 font-mono text-[11px] text-[var(--color-text-secondary)]">
            table: {trace.lo.maslul}° → {formatMin(trace.lo.correction)} &nbsp;·&nbsp;{' '}
            {trace.hi.maslul}° → {formatMin(trace.hi.correction)}
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            type="number"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setChecked(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && setChecked(true)}
            className="w-24 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-right font-mono text-sm"
            aria-label="Your answer, in minutes of arc"
          />
          <span className="font-mono text-xs text-[var(--color-text-secondary)]">minutes</span>
          <button
            onClick={() => setChecked(true)}
            disabled={answer === ''}
            className="rounded bg-[var(--color-accent)] px-2 py-1 text-xs text-white disabled:opacity-40"
          >
            Check
          </button>
          <button
            onClick={next}
            className="rounded border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-card)]"
          >
            Another
          </button>
        </div>

        {checked && (
          <div className={`mt-2 text-xs leading-relaxed ${correct ? 'text-[var(--color-accent)]' : 'text-[var(--color-gold)]'}`}>
            {correct ? '✓ ' : ''}
            {trace.lo ? (
              <>
                {formatMin(trace.hi.correction - trace.lo.correction)} across ten degrees is{' '}
                {formatMin(trace.perDegree)} per degree. {course}° is{' '}
                {trace.effective - trace.lo.maslul} past {trace.lo.maslul}°, giving{' '}
                <strong>{formatMin(trace.correction)}</strong> — that is{' '}
                {exactMinutes.toFixed(1)} minutes.
              </>
            ) : (
              <>The answer is {formatMin(trace.correction)}.</>
            )}
          </div>
        )}
      </div>
    </InteractiveCard>
  );
}
