/**
 * SightingLimits — the two thresholds and the trade between them.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** — [R] KH 17:15-21
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * KH 17:15 gives two flat cutoffs and then, for the band between them,
 * five halachot that each pair an arc range with a minimum first
 * longitude. In prose that reads as five near-identical sentences and
 * the pattern is invisible.
 *
 * Plotted as a map with the arc on one axis and the first longitude on
 * the other, the pattern is the whole point: a staircase, where a
 * larger arc buys a smaller longitude and vice versa. It is the only
 * place in the book where two quantities are weighed against each other
 * rather than one being looked up.
 *
 * Both axes are draggable so a reader can find the boundary themselves,
 * and the Rambam's own worked evening is a preset sitting just inside
 * the visible side of it.
 */
import React, { useState } from 'react';
import InteractiveCard, { PresetButton } from '../../text/interactives/InteractiveCard';
import { CONSTANTS } from '../../../engine/constants';
import { formatDms } from '../../../engine/dmsUtils';

const TABLE = CONSTANTS.KITZEI_HAREIYAH_TABLE;

/** The KH 17:15-21 verdict, from the arc and the first longitude alone. */
function verdictFor(arc, orech) {
  if (arc <= 9) return { visible: false, why: 'KH 17:15 — an arc of 9° or less is never seen.' };
  if (arc > 14) return { visible: true, why: 'KH 17:15 — an arc above 14° is always seen.' };
  const row = TABLE.find((r) => arc > r.kashtFromExclusive && arc <= r.kashtUpTo);
  if (!row) return { visible: false, why: 'outside the tabulated band' };
  return {
    visible: orech >= row.orechMin,
    why: `Arc between ${row.kashtFromExclusive}° and ${row.kashtUpTo}° needs a first longitude of at least ${row.orechMin}° — this one is ${orech.toFixed(2)}°.`,
    row,
  };
}

export default function SightingLimits() {
  // His worked evening: arc 11°11', first longitude 11°27'.
  const [arc, setArc] = useState(11.19);
  const [orech, setOrech] = useState(11.45);

  const result = verdictFor(arc, orech);
  const isExample = Math.abs(arc - 11.19) < 0.01 && Math.abs(orech - 11.45) < 0.01;

  return (
    <InteractiveCard
      title="Where the line falls"
      source="KH 17:15-21"
      blurb="two cutoffs, and between them a trade between the arc and the gap"
      defaultOpen
    >
      <Map arc={arc} orech={orech} visible={result.visible} />

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold text-[var(--color-text-secondary)]">
            Arc of sighting — {formatDms(arc)}
          </span>
          <input
            type="range"
            min="7"
            max="17"
            step="0.01"
            value={arc}
            onChange={(e) => setArc(Number(e.target.value))}
            className="mt-1 w-full accent-[var(--color-accent)]"
            aria-label="Arc of sighting in degrees"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-[var(--color-text-secondary)]">
            First longitude — {formatDms(orech)}
          </span>
          <input
            type="range"
            min="7"
            max="17"
            step="0.01"
            value={orech}
            onChange={(e) => setOrech(Number(e.target.value))}
            className="mt-1 w-full accent-[var(--color-gold)]"
            aria-label="First longitude in degrees"
          />
        </label>
      </div>

      <div className="mt-1">
        <PresetButton
          onClick={() => {
            setArc(11.19);
            setOrech(11.45);
          }}
          title="The evening the Rambam works through"
        >
          His evening — arc 11° 11′, gap 11° 27′
        </PresetButton>
      </div>

      <div
        className={`mt-3 rounded-lg border p-3 ${
          result.visible
            ? 'border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10'
            : 'border-[var(--color-border)] bg-[var(--color-bg)]'
        }`}
      >
        <div
          className={`text-xl font-bold ${result.visible ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'}`}
        >
          {result.visible ? 'Seen' : 'Not seen'}
        </div>
        <div className="mt-0.5 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
          {result.why}
        </div>
        {isExample && (
          <div className="mt-1.5 text-xs text-[var(--color-accent)]">
            ✓ This is the case KH 17:22 works, and it reaches the same verdict.
          </div>
        )}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[320px] text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-secondary)]">
              <th className="py-1 pr-3 font-bold">If the arc is</th>
              <th className="py-1 pr-3 font-bold">the gap must reach</th>
              <th className="py-1 font-bold">halacha</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {TABLE.map((row, i) => {
              const active = arc > row.kashtFromExclusive && arc <= row.kashtUpTo;
              return (
                <tr
                  key={row.kashtUpTo}
                  className={`border-b border-[var(--color-border)]/40 ${active ? 'bg-[var(--color-accent)]/10' : ''}`}
                >
                  <td className="py-1 pr-3">
                    {row.kashtFromExclusive}°–{row.kashtUpTo}°
                  </td>
                  <td className="py-1 pr-3 text-[var(--color-gold)]">{row.orechMin}°</td>
                  <td className="py-1 text-[var(--color-text-secondary)]">17:{17 + i}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Read the table downwards and the trade is obvious: as the required arc rises by a degree,
        the required gap falls by one. A moon that stands well clear of the horizon can be seen
        with less separation from the sun; a moon further from the sun can be seen from lower
        down. Five sentences in the text, one staircase here.
      </p>
    </InteractiveCard>
  );
}

/** Arc against first longitude, with the seen/not-seen regions shaded. */
function Map({ arc, orech, visible }) {
  const w = 420;
  const h = 240;
  const padL = 40;
  const padB = 30;
  const padT = 12;
  const padR = 12;
  const lo = 7;
  const hi = 17;

  const x = (v) => padL + ((v - lo) / (hi - lo)) * (w - padL - padR);
  const y = (v) => h - padB - ((v - lo) / (hi - lo)) * (h - padT - padB);

  // Sample the verdict on a grid — cheap, and guaranteed to agree with
  // the same function the readout uses.
  const cells = [];
  const step = 0.25;
  for (let a = lo; a < hi; a += step) {
    for (let o = lo; o < hi; o += step) {
      if (verdictFor(a + step / 2, o + step / 2).visible) {
        cells.push(
          <rect
            key={`${a}-${o}`}
            x={x(a)}
            y={y(o + step)}
            width={x(a + step) - x(a)}
            height={y(o) - y(o + step)}
            fill="var(--color-accent)"
            fillOpacity="0.18"
          />,
        );
      }
    }
  }

  return (
    <figure>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img"
        aria-label="A map of the arc of sighting against the first longitude, with the region where the moon is seen shaded">
        {cells}

        {[9, 14].map((v) => (
          <line key={v} x1={x(v)} y1={padT} x2={x(v)} y2={h - padB} stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" />
        ))}

        <line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} stroke="var(--color-border)" strokeWidth="1" />
        <line x1={padL} y1={padT} x2={padL} y2={h - padB} stroke="var(--color-border)" strokeWidth="1" />

        {[8, 10, 12, 14, 16].map((v) => (
          <g key={v}>
            <text x={x(v)} y={h - padB + 12} fontSize="8" textAnchor="middle" fill="var(--color-text-secondary)">
              {v}°
            </text>
            <text x={padL - 6} y={y(v) + 3} fontSize="8" textAnchor="end" fill="var(--color-text-secondary)">
              {v}°
            </text>
          </g>
        ))}

        <text x={(w + padL) / 2} y={h - 4} fontSize="9" textAnchor="middle" fill="var(--color-text-secondary)">
          arc of sighting →
        </text>
        <text
          x={12}
          y={(h - padB + padT) / 2}
          fontSize="9"
          textAnchor="middle"
          fill="var(--color-text-secondary)"
          transform={`rotate(-90 12 ${(h - padB + padT) / 2})`}
        >
          first longitude →
        </text>

        <line x1={x(arc)} y1={padT} x2={x(arc)} y2={h - padB} stroke="var(--color-accent)" strokeWidth="1" opacity="0.5" />
        <line x1={padL} y1={y(orech)} x2={w - padR} y2={y(orech)} stroke="var(--color-gold)" strokeWidth="1" opacity="0.5" />
        <circle
          cx={x(arc)}
          cy={y(orech)}
          r="6"
          fill={visible ? 'var(--color-accent)' : 'var(--color-text-secondary)'}
          stroke="var(--color-bg)"
          strokeWidth="2"
        />
      </svg>
      <figcaption className="mt-1 text-center text-[11px] text-[var(--color-text-secondary)]">
        Shaded: the moon is seen. The staircase along the left edge is KH 17:17-21; the two
        dashed lines are the flat cutoffs of 17:15.
      </figcaption>
    </figure>
  );
}
