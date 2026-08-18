/**
 * FoldPractice — try the fold yourself. [R] KH 13:6
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching interactive)
 * ═══════════════════════════════════════════════════════════════════
 *
 * KH 13:6 is 13:5 again with a different number — 300° folds to 60°,
 * whose answer is 1°41' — and closes "similar procedures should be
 * followed in calculating other figures". The halacha is not stating a
 * new rule; it is having the student practise one.
 *
 * So this card practises rather than re-explaining. A second widget
 * demonstrating the fold would only repeat the one above it.
 */
import React, { useState } from 'react';
import InteractiveCard from './InteractiveCard';
import { correctionWithTrace } from '../../../lib/maslulTable';

function formatMin(deg) {
  const total = Math.round(deg * 60);
  const d = Math.floor(total / 60);
  const m = total - d * 60;
  return d > 0 ? `${d}° ${m}'` : `${m}'`;
}

/** Courses past 180° whose mirror lands on a tabulated row, so the
 *  answer is a clean lookup and not an interpolation. */
const QUESTIONS = [300, 200, 250, 280, 340, 220, 260, 320, 190, 210];

export default function FoldPractice() {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);

  const course = QUESTIONS[index % QUESTIONS.length];
  const folded = 360 - course;
  const correct = Number(answer) === folded;

  const next = () => {
    setIndex((i) => i + 1);
    setAnswer('');
    setChecked(false);
  };

  return (
    <InteractiveCard
      title="Fold it yourself"
      source="KH 13:6"
      blurb="the same rule again with fresh numbers — which is what this halacha is for"
    >
      <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
        This halacha repeats the previous one with a new figure and ends "similar procedures
        should be followed". It is practice, so here is some.
      </p>

      <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="text-sm">
          The course is <span className="font-mono font-bold text-[var(--color-gold)]">{course}°</span>.
          Which row of the table do you read?
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm text-[var(--color-text-secondary)]">360° − {course}° =</span>
          <input
            type="number"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setChecked(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && setChecked(true)}
            className="w-20 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-right font-mono text-sm"
            aria-label="Your answer, in degrees"
          />
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
          <div className={`mt-2 text-xs ${correct ? 'text-[var(--color-accent)]' : 'text-[var(--color-gold)]'}`}>
            {correct ? (
              <>
                ✓ Yes — {folded}°, and the table there gives{' '}
                <strong>{formatMin(correctionWithTrace(course).correction)}</strong>, which you then{' '}
                <strong>add</strong> to the mean position because the course is over 180°.
              </>
            ) : (
              <>
                Not quite. 360 − {course} = <strong>{folded}</strong>. Take the course away from a
                full circle, and read the table at what is left.
              </>
            )}
          </div>
        )}
      </div>
    </InteractiveCard>
  );
}
