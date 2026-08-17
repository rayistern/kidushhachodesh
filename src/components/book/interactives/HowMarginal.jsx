/**
 * HowMarginal — a verdict is not one thing. [R] KH 18:3-4
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching figure)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Chapter 17 returns a yes or a no. Chapter 18 says the yes has a
 * strength: the further past the thresholds a night falls, the larger
 * the crescent and the easier it is to catch — and the court should
 * scrutinise testimony accordingly.
 *
 * So this card takes the same two numbers KH 17:15-21 uses and reports
 * the *margin* rather than only the verdict. The margin is a genuine
 * quantity: how many degrees past the required minimum the night sits.
 *
 * ── What is and is not the Rambam's here ──
 * The verdict, the thresholds and the trade are his. Grouping the
 * margins into bands and attaching advice to them ("cross-examine
 * hard") is editorial — he gives one worked case at 18:4 and a
 * principle, not a scale. The card says which is which, because dressing
 * an invented scale as his would be exactly the kind of false precision
 * this chapter warns against.
 */
import React, { useState } from 'react';
import InteractiveCard, { PresetButton } from '../../text/interactives/InteractiveCard';
import { CONSTANTS } from '../../../engine/constants';
import { formatDms } from '../../../engine/dmsUtils';

const TABLE = CONSTANTS.KITZEI_HAREIYAH_TABLE;

/** The KH 17:15-21 verdict, plus how far past the line it fell. */
function assess(arc, orech) {
  if (arc <= 9) return { visible: false, margin: arc - 9, rule: 'KH 17:15 — 9° or less is never seen' };
  if (arc > 14) return { visible: true, margin: arc - 14, rule: 'KH 17:15 — above 14° is always seen' };
  const row = TABLE.find((r) => arc > r.kashtFromExclusive && arc <= r.kashtUpTo);
  if (!row) return { visible: false, margin: 0, rule: 'outside the table' };
  return {
    visible: orech >= row.orechMin,
    margin: orech - row.orechMin,
    rule: `arc ${row.kashtFromExclusive}°–${row.kashtUpTo}° needs a gap of ${row.orechMin}°`,
    row,
  };
}

/** Editorial bands — see the header note. Not the Rambam's. */
function counsel(margin) {
  if (margin < 0) return null;
  if (margin < 0.5)
    return {
      label: 'As marginal as a yes can be',
      advice:
        'The crescent will be very thin. In summer, or from low ground, treat the testimony with suspicion and cross-examine closely.',
      tone: 'gold',
    };
  if (margin < 2)
    return {
      label: 'Clears the line, but not by much',
      advice:
        'Seeing it is plausible, and easier in the rainy season or from high ground. Worth asking the witnesses where they stood.',
      tone: 'gold',
    };
  return {
    label: 'Comfortably clear',
    advice: 'The moon will be obvious. Testimony that it was seen needs no special scrutiny.',
    tone: 'accent',
  };
}

export default function HowMarginal() {
  // KH 18:4's own case: arc 9° 5', gap exactly 13°.
  const [arc, setArc] = useState(9.083);
  const [orech, setOrech] = useState(13);

  const result = assess(arc, orech);
  const advice = counsel(result.margin);
  const isHisCase = Math.abs(arc - 9.083) < 0.005 && Math.abs(orech - 13) < 0.005;

  return (
    <InteractiveCard
      title="How close to the line did it fall?"
      source="KH 18:3-4"
      blurb="the same yes can mean 'look hard from a hilltop' or 'you could hardly miss it'"
      defaultOpen
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold text-[var(--color-text-secondary)]">
            Arc of sighting — {formatDms(arc)}
          </span>
          <input
            type="range"
            min="8"
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
            Gap to the sun — {formatDms(orech)}
          </span>
          <input
            type="range"
            min="8"
            max="20"
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
            setArc(9.083);
            setOrech(13);
          }}
          title="The case the Rambam puts at KH 18:4"
        >
          His case — arc 9° 5′, gap exactly 13°
        </PresetButton>
      </div>

      <Crescent margin={result.margin} visible={result.visible} />

      <div
        className={`mt-3 rounded-lg border p-3 ${
          result.visible
            ? 'border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10'
            : 'border-[var(--color-border)] bg-[var(--color-bg)]'
        }`}
      >
        <div className="flex flex-wrap items-baseline gap-x-3">
          <span
            className={`text-xl font-bold ${result.visible ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'}`}
          >
            {result.visible ? 'Seen' : 'Not seen'}
          </span>
          {result.visible && (
            <span className="font-mono text-sm text-[var(--color-gold)]">
              past the line by {formatDms(Math.max(0, result.margin))}
            </span>
          )}
        </div>
        <div className="mt-0.5 font-mono text-[11px] text-[var(--color-text-secondary)]">
          {result.rule}
        </div>
        {isHisCase && (
          <div className="mt-1.5 text-xs text-[var(--color-accent)]">
            ✓ This is the case KH 18:4 puts — a yes, by exactly nothing. The narrowest the table
            allows.
          </div>
        )}
      </div>

      {advice && (
        <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
          <div
            className={`text-sm font-bold ${advice.tone === 'accent' ? 'text-[var(--color-accent)]' : 'text-[var(--color-gold)]'}`}
          >
            {advice.label}
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
            {advice.advice}
          </p>
        </div>
      )}

      <p className="mt-3 text-[10px] leading-relaxed text-[var(--color-text-secondary)] opacity-70">
        Editor's note: the verdict, the thresholds and the margin are the Rambam's. Sorting the
        margin into three bands with advice attached is not — he gives one worked case and a
        principle, and the bands here are a way of showing that principle, not a scale he
        supplies.
      </p>
    </InteractiveCard>
  );
}

/** A crescent that thickens with the margin — the point of KH 18:3. */
function Crescent({ margin, visible }) {
  const size = 108;
  const cx = size / 2;
  const cy = size / 2;
  const r = 34;
  // Wider margin, fatter crescent. Purely illustrative of "the moon
  // will appear large", not a computed illuminated fraction.
  const thickness = Math.max(0.06, Math.min(0.5, 0.06 + Math.max(0, margin) * 0.09));
  const offset = r * 2 * (1 - thickness);

  return (
    <figure className="mt-3 flex items-center justify-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
        aria-label={`A crescent moon, thicker the further past the threshold the night falls`}>
        <defs>
          <mask id="kh-crescent-mask">
            <rect width={size} height={size} fill="black" />
            <circle cx={cx} cy={cy} r={r} fill="white" />
            <circle cx={cx - offset} cy={cy} r={r} fill="black" />
          </mask>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="var(--color-card)" />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill={visible ? 'var(--color-gold)' : 'var(--color-text-secondary)'}
          fillOpacity={visible ? 0.9 : 0.3}
          mask="url(#kh-crescent-mask)"
        />
      </svg>
      <figcaption className="max-w-[220px] text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Illustrative only. KH 18:3 says the crescent grows with the arc and the gap — this shows
        that relationship, not a computed shape.
      </figcaption>
    </figure>
  );
}
