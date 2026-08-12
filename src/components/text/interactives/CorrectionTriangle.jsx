/**
 * CorrectionTriangle — the figure Touger's KH 13:2 footnote refers to.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching diagram)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The footnote on KH 13:2 proves why the correction is *subtracted*
 * from the mean position rather than being an arbitrary convention, and
 * says "refer to the accompanying diagram". That diagram is a figure in
 * the Moznaim print edition; it is not in the digitised text, so the
 * note points at a picture the reader cannot see.
 *
 * Sefaria's copy of the note is also damaged: its conclusion renders as
 * "Hence, b equals c a", having lost the plus sign somewhere in the
 * markup. Stated correctly it is b = c + a, which is the whole point.
 *
 * The letters are Touger's, on the triangle earth–centre–sun, every
 * angle measured from the apsidal line:
 *
 *   b  angle at the orbit's CENTRE — the course (maslul)
 *   c  angle at the EARTH — the true position
 *   a  angle at the SUN — the correction (מנת המסלול)
 *   d  the triangle's third angle at the centre, supplementary to b
 *
 *   a + c + d = 180°   (angles of a triangle)
 *       b + d = 180°   (b and d on a straight line)
 *   ⇒       b = c + a  ⇒  c = b − a
 *
 * So the true position is the course less the correction. Add the
 * apogee's longitude to both sides and that is KH 13:2's rule exactly.
 *
 * The offset of the centre is drawn far larger than life — at true
 * scale (~3.5% of the radius) the three points are nearly collinear and
 * no angle is legible. Every number shown is computed from the real
 * ratio; only the picture is exaggerated, and the caption says so.
 */
import React, { useState, useMemo } from 'react';
import InteractiveCard from './InteractiveCard';

const DEG = Math.PI / 180;

// Same eccentricity as the KH 11:13-15 card: the ratio that reproduces
// the 1°59' peak of the KH 13:4 table.
const ECCENTRICITY = Math.tan((1 + 59 / 60) * DEG);
// Exaggerated purely for legibility of the drawn angles.
const DRAWN_ECCENTRICITY = 0.4;

/**
 * The three angles of the figure, for a given course.
 *
 * `a` is folded into (−180, 180]. Without that, a course of 360° yields
 * an angle at the earth of 0° and so a "correction" of 360° rather than
 * nothing — the figure's own slider cannot reach that value, but the
 * geometry should be right regardless of who calls it.
 */
function solve(course, eccentricity) {
  const rad = course * DEG;
  // Earth at the origin, centre displaced toward apogee (+x).
  const bx = eccentricity + Math.cos(rad);
  const by = Math.sin(rad);
  const c = Math.atan2(by, bx) / DEG; // angle at the earth
  const a = ((course - c + 540) % 360) - 180;
  return { b: course, c, a, d: 180 - course };
}

export default function CorrectionTriangle() {
  const [course, setCourse] = useState(60);

  // Numbers from the real ratio; the drawing uses the exaggerated one.
  const real = useMemo(() => solve(course, ECCENTRICITY), [course]);
  const drawn = useMemo(() => solve(course, DRAWN_ECCENTRICITY), [course]);

  return (
    <InteractiveCard
      title="The diagram the footnote asks you to refer to"
      source="KH 13:2, Touger's note"
      blurb="why the correction is subtracted — two lines of geometry, and a figure the digitised text lost"
    >
      <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
        The note on this halacha proves that the correction is taken{' '}
        <em>away</em> from the mean position, rather than that being a bare
        convention — and refers to a diagram printed in the Moznaim edition that the
        digitised text does not carry. Its conclusion also arrives damaged, as "Hence, b equals
        c a": a lost plus sign. It should read{' '}
        <strong className="text-[var(--color-text)]">b = c + a</strong>.
      </p>

      <div className="mt-4 grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)]">
        <TriangleFigure course={course} drawn={drawn} />

        <div className="min-w-0">
          <label className="block">
            <span className="text-xs font-bold text-[var(--color-text-secondary)]">
              Course (מסלול) — {course}°
            </span>
            <input
              type="range"
              min="1"
              max="179"
              value={course}
              onChange={(e) => setCourse(Number(e.target.value))}
              className="mt-1 w-full accent-[var(--color-accent)]"
              aria-label="Course in degrees"
            />
          </label>

          <dl className="mt-3 space-y-1 text-xs">
            <Letter letter="b" color="var(--color-accent)" name="at the centre — the course">
              {real.b.toFixed(2)}°
            </Letter>
            <Letter letter="c" color="var(--color-gold)" name="at the earth — the true position">
              {real.c.toFixed(2)}°
            </Letter>
            <Letter letter="a" color="var(--color-silver)" name="at the sun — the correction">
              {real.a.toFixed(2)}°
            </Letter>
            <Letter letter="d" color="var(--color-text-secondary)" name="third angle, on a line with b">
              {real.d.toFixed(2)}°
            </Letter>
          </dl>

          <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 font-mono text-[11px] leading-relaxed">
            <div>
              a + c + d = {real.a.toFixed(2)} + {real.c.toFixed(2)} + {real.d.toFixed(2)} ={' '}
              <span className="text-[var(--color-accent)]">
                {(real.a + real.c + real.d).toFixed(2)}°
              </span>
            </div>
            <div>
              b + d = {real.b.toFixed(2)} + {real.d.toFixed(2)} ={' '}
              <span className="text-[var(--color-accent)]">{(real.b + real.d).toFixed(2)}°</span>
            </div>
            <div className="mt-1 border-t border-[var(--color-border)] pt-1">
              b = c + a = {real.c.toFixed(2)} + {real.a.toFixed(2)} ={' '}
              <span className="text-[var(--color-gold)]">{(real.c + real.a).toFixed(2)}°</span>
            </div>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
            Rearranged, <span className="font-mono">c = b − a</span>: the true position is the
            course less the correction. Add the apogee's longitude to both sides and that is the
            rule this halacha states — while the course is under 180°, the true position always
            sits a little behind the mean.
          </p>
        </div>
      </div>
    </InteractiveCard>
  );
}

function Letter({ letter, color, name, children }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <dt className="font-mono font-bold" style={{ color }}>
        {letter}
      </dt>
      <dd className="font-mono">{children}</dd>
      <dd className="text-[var(--color-text-secondary)]">{name}</dd>
    </div>
  );
}

function TriangleFigure({ course, drawn }) {
  const size = 280;
  const cx = 92;
  const cy = 168;
  const R = 108;
  const offset = DRAWN_ECCENTRICITY * R;

  const E = { x: cx, y: cy };
  const C = { x: cx + offset, y: cy };
  const rad = course * DEG;
  const B = { x: C.x + R * Math.cos(rad), y: C.y - R * Math.sin(rad) };

  // Sampled arcs rather than SVG elliptical arcs — no flag arithmetic to
  // get wrong when the screen's y axis is inverted.
  const arc = (P, from, to, r) => {
    const steps = 20;
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
      pts.push(`${(P.x + r * Math.cos(t)).toFixed(2)} ${(P.y - r * Math.sin(t)).toFixed(2)}`);
    }
    return `M ${pts.join(' L ')}`;
  };

  const angleOf = (from, to) => (Math.atan2(from.y - to.y, to.x - from.x) * 180) / Math.PI;

  const eToB = angleOf(E, B);
  const cToB = angleOf(C, B);
  const bToE = angleOf(B, E);
  const bToC = angleOf(B, C);

  const label = (P, from, to, r, text, color) => {
    const mid = ((from + to) / 2) * DEG;
    return (
      <text
        x={P.x + r * Math.cos(mid)}
        y={P.y - r * Math.sin(mid)}
        fontSize="12"
        fontWeight="bold"
        fill={color}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {text}
      </text>
    );
  };

  return (
    <figure className="mx-auto w-full max-w-[280px]">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full" role="img"
        aria-label="Triangle joining the earth, the orbit's centre and the sun, with the angles labelled a, b, c and d">
        {/* Apsidal line, extended past the centre so the exterior angle
            b has a visible arm to open from. */}
        <line x1={E.x - 24} y1={E.y} x2={C.x + R + 20} y2={C.y}
          stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" />

        {/* The triangle */}
        <polygon
          points={`${E.x},${E.y} ${C.x},${C.y} ${B.x},${B.y}`}
          fill="var(--color-accent)"
          fillOpacity="0.07"
          stroke="none"
        />
        <line x1={E.x} y1={E.y} x2={B.x} y2={B.y} stroke="var(--color-gold)" strokeWidth="1.5" />
        <line x1={C.x} y1={C.y} x2={B.x} y2={B.y} stroke="var(--color-accent)" strokeWidth="1.5" />

        {/* b — exterior angle at the centre, from the apogee direction */}
        <path d={arc(C, 0, cToB, 30)} fill="none" stroke="var(--color-accent)" strokeWidth="1.5" />
        {label(C, 0, cToB, 40, 'b', 'var(--color-accent)')}

        {/* d — interior angle at the centre, supplementary to b */}
        <path d={arc(C, cToB, 180, 18)} fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.5" />
        {label(C, cToB, 180, 27, 'd', 'var(--color-text-secondary)')}

        {/* c — at the earth */}
        <path d={arc(E, 0, eToB, 34)} fill="none" stroke="var(--color-gold)" strokeWidth="1.5" />
        {label(E, 0, eToB, 44, 'c', 'var(--color-gold)')}

        {/* a — at the sun */}
        <path d={arc(B, bToE, bToC, 22)} fill="none" stroke="var(--color-silver)" strokeWidth="1.5" />
        {label(B, bToE, bToC, 32, 'a', 'var(--color-silver)')}

        {/* Vertices */}
        <circle cx={E.x} cy={E.y} r="5" fill="var(--color-accent)" />
        <text x={E.x - 8} y={E.y + 15} fontSize="8" fill="var(--color-text-secondary)" textAnchor="middle">
          earth
        </text>
        <circle cx={C.x} cy={C.y} r="3.5" fill="var(--color-silver)" />
        <text x={C.x + 4} y={C.y + 15} fontSize="8" fill="var(--color-text-secondary)">
          centre
        </text>
        <circle cx={B.x} cy={B.y} r="5.5" fill="var(--color-gold)" />
        <text x={B.x} y={B.y - 11} fontSize="8" fill="var(--color-text-secondary)" textAnchor="middle">
          sun
        </text>
        <text x={C.x + R + 8} y={C.y - 6} fontSize="8" fill="var(--color-text-secondary)" textAnchor="end">
          apogee
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-[11px] text-[var(--color-text-secondary)]">
        The centre's offset is drawn far larger than life so the angles are legible; at true
        scale it is about 3.5% of the radius. The figures beside use the real ratio.
      </figcaption>
    </figure>
  );
}
