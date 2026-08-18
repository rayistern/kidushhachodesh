/**
 * EastWest — what a sighting elsewhere proves. [R] KH 18:13-16
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Four statements in the text, of which two carry information and two
 * do not, and the useful pair is the opposite of what a reader guesses.
 * Prose makes that hard to hold; a truth table makes it obvious.
 *
 * The underlying fact is one sentence: a place to the west meets the
 * same evening later, by which time the moon has pulled further from
 * the sun and is easier to catch; a place to the east meets it earlier
 * and harder. So westward sightings are the *easy* case and eastward
 * ones the *hard* case — and only reports from the hard case can settle
 * the easy one.
 *
 * The reader picks an observation and the card says what follows,
 * rather than presenting four rules to memorise.
 */
import React, { useState } from 'react';
import InteractiveCard from '../../text/interactives/InteractiveCard';

const OBSERVATIONS = [
  {
    id: 'east-seen',
    where: 'east',
    seen: true,
    statement: 'It WAS seen somewhere east of the land',
    conclusion: 'Then it was certainly seen in the land.',
    informative: true,
    why: 'The east meets the evening earlier, when the moon is tighter to the sun and harder to catch. If it cleared that harder test, it clears the easier one here.',
    source: 'KH 18:15',
  },
  {
    id: 'east-unseen',
    where: 'east',
    seen: false,
    statement: 'It was NOT seen anywhere east of the land',
    conclusion: 'Then nothing follows. It may still have been seen here.',
    informative: false,
    why: 'Failing the harder test says nothing about the easier one. Conditions here are more favourable, not less.',
    source: 'KH 18:15',
  },
  {
    id: 'west-seen',
    where: 'west',
    seen: true,
    statement: 'It WAS seen somewhere west of the land',
    conclusion: 'Then nothing follows. It may or may not have been seen here.',
    informative: false,
    why: 'The west meets the evening later, with the moon further from the sun. Passing the easier test says nothing about the harder one.',
    source: 'KH 18:13',
  },
  {
    id: 'west-unseen',
    where: 'west',
    seen: false,
    statement: 'It was NOT seen on the mountains west of the land',
    conclusion: 'Then it was certainly not seen in the land.',
    informative: true,
    why: 'If even the easier conditions failed, the harder ones here cannot have succeeded.',
    source: 'KH 18:14',
  },
];

export default function EastWest() {
  const [selected, setSelected] = useState(OBSERVATIONS[0]);

  return (
    <InteractiveCard
      title="What a sighting somewhere else proves"
      source="KH 18:13-16"
      blurb="four statements, and only two of them tell you anything"
      defaultOpen
    >
      <Map where={selected.where} seen={selected.seen} informative={selected.informative} />

      <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {OBSERVATIONS.map((o) => (
          <button
            key={o.id}
            onClick={() => setSelected(o)}
            className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
              selected.id === o.id
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                : 'border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-accent)]/50'
            }`}
          >
            {o.statement}
          </button>
        ))}
      </div>

      <div
        className={`mt-3 rounded-lg border p-3 ${
          selected.informative
            ? 'border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10'
            : 'border-[var(--color-border)] bg-[var(--color-bg)]'
        }`}
      >
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span
            className={`text-sm font-bold ${selected.informative ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'}`}
          >
            {selected.informative ? 'This settles it' : 'This tells you nothing'}
          </span>
          <span className="font-mono text-[10px] text-[var(--color-gold)]">{selected.source}</span>
        </div>
        <div className="mt-1 text-sm">{selected.conclusion}</div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
          {selected.why}
        </p>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Notice which two are the useful ones. A <strong>sighting</strong> from the east settles
        the question; a <strong>failure</strong> from the west settles it. A sighting from the
        west and a failure from the east both tell you nothing at all — which is the reverse of
        what most people would guess, and the reason the Rambam sets all four out separately.
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        All of it holds only for places at the land's own latitude — roughly 30 to 35 degrees
        north. Further north or south and the reasoning does not carry, because the belt meets
        the horizon at a different angle there.
      </p>
    </InteractiveCard>
  );
}

function Map({ where, seen, informative }) {
  const w = 460;
  const h = 120;
  const groundY = 78;
  const centre = w / 2;
  const offset = 150;
  const otherX = where === 'east' ? centre + offset : centre - offset;

  return (
    <figure>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img"
        aria-label="The land of Israel with a place to its east and west, showing which direction meets the evening earlier">
        <line x1="20" y1={groundY} x2={w - 20} y2={groundY} stroke="var(--color-border)" strokeWidth="1.5" />

        {/* which way the evening travels */}
        <text x={centre} y="16" fontSize="9" textAnchor="middle" fill="var(--color-text-secondary)">
          evening arrives this way →
        </text>
        <line x1={centre - 120} y1="24" x2={centre + 120} y2="24" stroke="var(--color-text-secondary)" strokeWidth="1" opacity="0.4" />

        {/* east and west labels */}
        <text x={centre + offset} y={groundY + 26} fontSize="9" textAnchor="middle" fill="var(--color-text-secondary)">
          east — earlier, harder
        </text>
        <text x={centre - offset} y={groundY + 26} fontSize="9" textAnchor="middle" fill="var(--color-text-secondary)">
          west — later, easier
        </text>

        {/* the land */}
        <circle cx={centre} cy={groundY} r="9" fill="var(--color-accent)" />
        <text x={centre} y={groundY - 16} fontSize="9" textAnchor="middle" fill="var(--color-accent)">
          the land
        </text>

        {/* the other place */}
        <circle
          cx={otherX}
          cy={groundY}
          r="7"
          fill={seen ? 'var(--color-gold)' : 'var(--color-card)'}
          stroke={seen ? 'none' : 'var(--color-text-secondary)'}
          strokeWidth="1.5"
        />
        <text x={otherX} y={groundY - 14} fontSize="9" textAnchor="middle" fill={seen ? 'var(--color-gold)' : 'var(--color-text-secondary)'}>
          {seen ? 'seen' : 'not seen'}
        </text>

        {/* the implication arrow, only when there is one */}
        {informative && (
          <>
            <line
              x1={otherX + (where === 'east' ? -18 : 18)}
              y1={groundY - 30}
              x2={centre + (where === 'east' ? 18 : -18)}
              y2={groundY - 30}
              stroke="var(--color-accent)"
              strokeWidth="1.5"
            />
            <text
              x={(otherX + centre) / 2}
              y={groundY - 35}
              fontSize="9"
              textAnchor="middle"
              fill="var(--color-accent)"
            >
              {seen ? 'so: seen here too' : 'so: not seen here either'}
            </text>
          </>
        )}
      </svg>
    </figure>
  );
}
