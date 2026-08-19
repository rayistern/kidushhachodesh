/**
 * SkyPage — the book's numbers, drawn on the sky outside your window.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **crossing** — [R] positions from the engine (the
 *  Rambam's sun and moon), [M] sky frame from modern geometry
 *  (lib/skyView). The page says so on itself.
 *  SURFACE CATEGORY: user-facing page (/sky)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Two reader requests in one view:
 *
 *   (b) The western horizon a chosen number of minutes after sunset —
 *       the belt crossing the sky at its evening slant, the sun below
 *       the horizon seen through a translucent earth, the moon where
 *       the engine puts it, the sign numbers along the belt.
 *   (c) A date stepper that can HOLD THE CLOCK: keep the same civil
 *       time while stepping days, so the sidereal fact becomes
 *       visible — the star frame (and the belt's grid) slides about a
 *       degree westward per night (a sidereal day is 23h 56m 4s), the
 *       sun roughly holds its place, and the moon leaps ~13° east.
 *
 * Everything positional comes from the engine's own pipeline at the
 * chosen day count; everything directional comes from lib/skyView.
 * Nothing here feeds back into any calculation.
 */
import React, { useMemo, useState } from 'react';
import UpstreamLink from '../layout/UpstreamLink';
import { LINKS } from '../../lib/upstreamLinks';
import SiteCredit from '../layout/SiteCredit';
import { Link } from 'react-router-dom';
import { getFullCalculation } from '../../engine/pipeline';
import { dateFromEpochDays, daysFromEpoch } from '../../engine/epochDays';
import { formatDms } from '../../engine/dmsUtils';
import { ordinalSuffix, zodiacPosition } from '../../engine/zodiac';
import { skyPosition, jdAt } from '../../lib/skyView';
import { modernSunLongitude, modernMoonPosition, angularDifference } from '../../lib/modernAstronomy';
import { sunsetUtcHours, israelUtcOffsetHours, formatClock, RAMBAM_REFERENCE } from '../../lib/localObserver';
import { nextSightingNight } from '../../lib/sightingNight';
import { assessEvening, DANJON_LIMIT_DEG } from '../../lib/moonVisibility';

const OBSERVER = { latitude: 31.78, longitude: 35.2137 };
const EXAMPLE_DAYS = 29;

function todayDays() {
  // TONIGHT: the evening beginning the NEXT Hebrew day. daysFromEpoch of
  // today's noon names the Hebrew day that began LAST night.
  const now = new Date();
  return daysFromEpoch(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)) + 1;
}

/**
 * The civil evening of day count N.
 *
 * The engine's N means THE EVENING BEGINNING Hebrew day N — the epoch
 * itself is "the eve of Thursday, 3 Nisan", i.e. Wednesday's civil
 * evening. dateFromEpochDays(N) returns the civil date of that Hebrew
 * day's DAYTIME, so the evening in question is the civil date before
 * it. A first version of this page paired N with the same civil date's
 * evening — one day late, which the real-sky toggle exposed as a 13°
 * moon jump on his own worked example. At the correct evening his moon
 * is within 1.3° of the real one, which is the accuracy his method is
 * famous for.
 */
export function eveningOf(days) {
  const daytime = dateFromEpochDays(days);
  const eve = new Date(daytime);
  eve.setDate(eve.getDate() - 1);
  return { daytime, eve };
}

/** Everything the view needs for one day count and one UTC hour. */
function sceneFor(days, utcHours, real) {
  const { daytime, eve } = eveningOf(days);
  const date = eve; // sunset, sky frame and modern instant: the true evening
  const calc = getFullCalculation(daytime); // engine positions: day count N
  const jd = jdAt(date, utcHours);
  // The instant, as a Date, for the modern theories.
  const instant = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0) + utcHours * 3600000);
  const rambam = {
    sunLon: calc.sun.trueLongitude,
    moonLon: calc.moon.trueLongitude,
    moonLat: calc.moon.latitude,
  };
  const modernMoon = modernMoonPosition(instant);
  const modern = {
    sunLon: modernSunLongitude(instant),
    moonLon: modernMoon.longitude,
    moonLat: modernMoon.latitude,
  };
  const pos = real ? modern : rambam;
  const sun = skyPosition(pos.sunLon, 0, jd, OBSERVER);
  const moon = skyPosition(pos.moonLon, pos.moonLat, jd, OBSERVER);
  // How far his positions sit from the real ones, for the readout.
  const delta = {
    sun: angularDifference(rambam.sunLon, modern.sunLon),
    moon: angularDifference(rambam.moonLon, modern.moonLon),
  };
  const shown = { sunLon: pos.sunLon, moonLon: pos.moonLon };
  // The belt, sampled — and each sample keeps its longitude so the sign
  // grid can be drawn on it.
  const belt = [];
  for (let lambda = 0; lambda < 360; lambda += 2) {
    belt.push({ lambda, ...skyPosition(lambda, 0, jd, OBSERVER) });
  }
  return { date, calc, jd, sun, moon, belt, delta, shown };
}

/**
 * KH 17's verdict, gated to sighting-shaped nights. Near conjunction
 * the chain's arcs wrap and the verdict is meaningless — a reader
 * caught it saying "could be seen" with the moon drawn ON the sun.
 * Only sighting-shaped nights get a verdict.
 */
function hisVerdictFor(calc) {
  const gap = calc.moon.elongation;
  const arc = calc.moon.keshetHaReiyah;
  const isCandidate = gap > 2.5 && gap < 40 && arc > 0 && arc < 40;
  return {
    gap,
    isCandidate,
    verdict: isCandidate
      ? calc.moon.visibilityVerdict === 'visible'
        ? 'could be seen'
        : 'not seen'
      : null,
  };
}

export default function SkyPage() {
  const [days, setDays] = useState(EXAMPLE_DAYS);
  const [minutes, setMinutes] = useState(20);
  // (c): when held, the UTC clock is frozen and date-stepping shows the
  // sidereal slide. null = follow sunset (b-mode).
  const [heldUtc, setHeldUtc] = useState(null);
  // Swap the drawn positions for the real ones — the reader's request.
  const [real, setReal] = useState(false);

  const { eve: date, daytime } = eveningOf(days);
  const sunsetUtc = sunsetUtcHours(date, { ...RAMBAM_REFERENCE }) ?? 15.5;
  const utcHours = heldUtc ?? sunsetUtc + minutes / 60;
  const offset = israelUtcOffsetHours(date);

  const scene = useMemo(() => sceneFor(days, utcHours, real), [days, utcHours, real]);

  const moonSign = Math.floor(((scene.shown.moonLon % 360) + 360) % 360 / 30) + 1;

  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold">The sky from your window</h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              The book's numbers, drawn where you would actually see them — facing west after
              sunset.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Link to="/book" className="text-sm text-[var(--color-accent)] hover:underline">
              ← The book
            </Link>
            <UpstreamLink href={LINKS.dashboard} className="text-sm text-[var(--color-accent)] hover:underline">
              Dashboard
            </UpstreamLink>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        <p className="mb-4 rounded-lg border-l-2 border-[var(--color-gold)]/50 bg-[var(--color-card)] px-3 py-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
          The sun and moon here are <strong>the Rambam's</strong> — the engine's own positions,
          the ones the <Link to="/book" className="text-[var(--color-accent)] hover:underline">book</Link>{' '}
          computes. The sky they are drawn onto — horizon, slant, hour — is modern geometry.
          Expect his sun to trail the real one by about half a degree.
        </p>

        {/* ── controls ── */}
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="block text-xs font-bold text-[var(--color-text-secondary)]">
              Days from the starting point
            </span>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
              className="mt-1 w-32 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-right font-mono text-sm"
            />
          </label>
          <div className="flex gap-1">
            <StepButton onClick={() => setDays((d) => Math.max(0, d - 1))}>−1 day</StepButton>
            <StepButton onClick={() => setDays((d) => d + 1)}>+1 day</StepButton>
          </div>
          <StepButton onClick={() => { setDays(EXAMPLE_DAYS); setHeldUtc(null); }}>
            His example (29)
          </StepButton>
          <StepButton onClick={() => { setDays(nextSightingNight().days); setHeldUtc(null); }}>
            Next Rosh Chodesh
          </StepButton>
          <StepButton onClick={() => { setDays(todayDays()); setHeldUtc(null); }}>Today</StepButton>
          <span className="pb-1 font-mono text-[11px] text-[var(--color-text-secondary)]">
            = the night of {scene.date.toISOString().slice(0, 10)}, beginning{' '}
            {daytime.toISOString().slice(0, 10)}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label className={`block min-w-56 ${heldUtc !== null ? 'opacity-40' : ''}`}>
            <span className="text-xs font-bold text-[var(--color-text-secondary)]">
              Minutes after sunset — {minutes} (sunset {formatClock(sunsetUtc + offset)}, so{' '}
              {formatClock(sunsetUtc + offset + minutes / 60)})
            </span>
            <input
              type="range"
              min="0"
              max="90"
              value={minutes}
              disabled={heldUtc !== null}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="mt-1 w-full accent-[var(--color-accent)]"
              aria-label="Minutes after sunset"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <input
              type="checkbox"
              checked={real}
              onChange={(e) => setReal(e.target.checked)}
              className="accent-[var(--color-accent)]"
            />
            <span>
              <strong>Show the actual sky</strong> — swap his positions for modern ones (Meeus).
              The verdict readout stays his either way; the actual moon never enters it.
            </span>
          </label>
          <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <input
              type="checkbox"
              checked={heldUtc !== null}
              onChange={(e) => setHeldUtc(e.target.checked ? utcHours : null)}
              className="accent-[var(--color-gold)]"
            />
            <span>
              <strong>Hold the clock</strong> at {formatClock(utcHours + offset)} while stepping
              days — a sidereal day is 23h 56m 4s, so at a fixed clock the belt slides about 1°
              west per night; watch the sun stay put and the moon leap ~13° east against it.
            </span>
          </label>
        </div>

        <SkyFigure scene={scene} real={real} />

        {/* ── readouts ── */}
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <Readout
            title={real ? 'Sun (actual)' : 'Sun (Rambam)'}
            value={`${formatDms(scene.shown.sunLon)} on the circle`}
            note={`altitude ${scene.sun.altitude.toFixed(1)}°, azimuth ${scene.sun.azimuth.toFixed(0)}° — ${scene.sun.altitude < -0.8 ? 'below the horizon' : 'setting'}${real ? ` · his sits ${scene.delta.sun >= 0 ? '+' : ''}${scene.delta.sun.toFixed(2)}° from this` : ''}`}
          />
          <Readout
            title={real ? 'Moon (actual)' : 'Moon (Rambam)'}
            value={`${formatDms(scene.shown.moonLon)} — the ${moonSign}${ordinalSuffix(moonSign)} sign`}
            note={`altitude ${scene.moon.altitude.toFixed(1)}°, azimuth ${scene.moon.azimuth.toFixed(0)}°${scene.moon.altitude < 0 ? ' — below the horizon tonight' : ''}${real ? ` · his sits ${scene.delta.moon >= 0 ? '+' : ''}${scene.delta.moon.toFixed(2)}° from this` : ''}`}
          />
          {(() => {
            const his = hisVerdictFor(scene.calc);
            return (
              <Readout
                title="Verdict that evening"
                value={his.isCandidate ? his.verdict : 'not a sighting night'}
                note={
                  his.isCandidate
                    ? "KH 17's rule, from the chain the book builds"
                    : `the moon is ${his.gap > 180 ? (360 - his.gap).toFixed(1) : his.gap.toFixed(1)}° from the sun — nowhere near a first crescent`
                }
              />
            );
          })()}
        </div>

        <p className="mt-4 max-w-3xl text-xs leading-relaxed text-[var(--color-text-secondary)]">
          The gold band is <strong>the belt of the signs</strong> — the sun's road — crossing the
          evening sky at that night's slant, numbered every 30°. It curves because it is a full
          circle round the whole sky, seen from inside: an arch climbing from the horizon toward
          its high point in the south, off the left edge of this window. (Flattening the dome onto
          a rectangle bends it a little further, the way flight paths curve on a map.) The faint region below the
          horizon is the earth, made see-through so the set sun stays visible. Step days with the
          clock held and the three speeds of the book appear: the grid drifts a degree a night,
          the sun barely moves against your window, the moon runs.
        </p>

        <ModernCheck eve={scene.date} his={hisVerdictFor(scene.calc)} />

        <SiteCredit />
      </main>
    </div>
  );
}

const MODERN_VERDICT_PROSE = {
  likely:
    'a crescent is there to look for — past 7° before sunset and still up after it.',
  challenging:
    'barely past the gate — 7° arrives only between sunset and moonset, the thinnest of crescents.',
  impossible: 'no sighting possible — the moon sets before opening 7° from the sun.',
  'no-crescent-yet': 'no crescent exists yet — conjunction falls after sunset this evening.',
  'daylight-only':
    'a daytime window only — the moon is past 7° but sets before the sun. Testimony of a sighting made while it is still day is admissible — the court itself sanctifies on one (KH 2:9) — but a crescent this thin defeats the naked eye against a daylit sky.',
  'not-crescent-night': 'not a first-crescent evening.',
  indeterminate: 'no moonset found near this sunset to test against.',
};

/** Yallop's bands, in words (NAO TN 69). */
const YALLOP_PROSE = {
  A: 'easily visible to the naked eye',
  B: 'visible to the naked eye in perfect conditions',
  C: 'optical aid may be needed to find it, then the eye can hold it',
  D: 'optical aid needed throughout — the eye alone will not catch it',
  E: 'not visible even with a telescope',
  F: 'not visible — below the Danjon limit',
};
const yallopSighted = (code) => code === 'A' || code === 'B' || code === 'C';

/**
 * The modern check, for information: does the crescent actually exist
 * by sunset, has it actually opened 7° (the Danjon limit), and does the
 * moon actually set late enough to leave a window — real Jerusalem
 * sunset, real moonset, Meeus positions throughout. COMPARISON ONLY:
 * the verdict above stays KH 17's, and nothing here feeds it.
 */
function ModernCheck({ eve, his }) {
  // Keyed on the timestamp: eveningOf builds a fresh Date each render.
  const check = useMemo(() => assessEvening(eve, OBSERVER), [eve.getTime()]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!check) return null;
  const offset = israelUtcOffsetHours(eve);
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // Same clock convention as the sunset slider above: UTC plus Israel's
  // legal offset, applied even to historical dates.
  const fmtInstant = (d) => {
    if (!d) return '—';
    const t = new Date(d.getTime() + offset * 3600000);
    return `${t.getUTCDate()} ${MONTHS[t.getUTCMonth()]}, ${formatClock(t.getUTCHours() + t.getUTCMinutes() / 60)}`;
  };
  // The full check trumps the gate for "would an eye catch it": bands
  // A-C count as sightable, D-F as not. Without a q value (moon down by
  // dusk, or no crescent), the coarse gate stands in.
  const modernSighted = check.yallop
    ? yallopSighted(check.yallop.code)
    : check.verdict === 'likely' || check.verdict === 'challenging';
  const comparable =
    his.isCandidate && check.verdict !== 'not-crescent-night' && check.verdict !== 'indeterminate';
  return (
    <section className="mt-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <h2 className="text-sm font-bold">Would it actually be seen? — the modern check, Jerusalem</h2>
      <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
        Everything above draws positions. This box asks the modern question directly for this
        evening: has conjunction actually happened, has the moon opened{' '}
        {DANJON_LIMIT_DEG}° from the sun — the <strong>Danjon limit</strong>, the least
        separation at which a naked eye has ever caught a crescent — and does the moon set late
        enough after the sun to leave a window. Real sunset, real moonset, Meeus positions.
        For information only: the verdict above stays KH 17's, and none of this feeds it.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout title="Conjunction (true molad)" value={fmtInstant(check.conjunction)} note="the actual sun-moon lineup, not the mean molad" />
        <Readout title={`Opens ${DANJON_LIMIT_DEG}° (Danjon limit)`} value={fmtInstant(check.sevenDeg)} note="~11-16 hours after conjunction, by the moon's speed" />
        <Readout
          title="Elongation at sunset"
          value={`${check.elongationAtSunset.toFixed(1)}°`}
          note={`sunset ${formatClock(check.sunsetUtc + offset)}, moonset ${
            check.moonsetUtc != null ? formatClock(check.moonsetUtc + offset) : '—'
          }${check.windowMinutes != null ? ` — a ${check.windowMinutes} min window` : ''}`}
        />
      </div>
      {check.yallop && (
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <Readout
            title="Best moment (Yallop)"
            value={formatClock(check.yallop.bestUtc + offset)}
            note={`sunset + 4/9 of the ${check.yallop.lagMinutes}-minute lag to moonset`}
          />
          <Readout
            title="Arc of vision vs crescent width"
            value={`${check.yallop.arcv.toFixed(1)}° over ${check.yallop.wPrime.toFixed(2)}′`}
            note="the moon's height above the sun then, against the lune's thickness"
          />
          <Readout
            title="q-test"
            value={`q = ${check.yallop.q.toFixed(3)} — band ${check.yallop.code}`}
            note={YALLOP_PROSE[check.yallop.code]}
          />
        </div>
      )}
      <p className="mt-3 text-xs leading-relaxed">
        <strong>Modern reading:</strong> {MODERN_VERDICT_PROSE[check.verdict]}
        {check.yallop && (
          <>
            {' '}
            The full q-test says the crescent is <strong>{YALLOP_PROSE[check.yallop.code]}</strong>{' '}
            (band {check.yallop.code}).
          </>
        )}
        {comparable && (
          <>
            {' '}
            KH 17 above says <strong>{his.verdict}</strong> —{' '}
            {modernSighted === (his.verdict === 'could be seen')
              ? 'the two agree this evening.'
              : 'the two split this evening. His moon carries about a degree of error and the criteria differ — his arc of sighting against a bare elongation limit — so borderline evenings can land on opposite sides.'}
          </>
        )}
      </p>
      <p className="mt-2 text-[10px] leading-relaxed text-[var(--color-text-secondary)]">
        Two criteria: the 7° gate asks whether a crescent <em>exists</em> to look for; Yallop's
        q-test — the criterion fitted to 295 recorded first sightings (NAO TN 69, 1997), weighing
        the moon's height above the sun against the crescent's width at the best moment of dusk —
        asks whether an eye would <em>catch</em> it, in bands A (easy) through F (below the Danjon
        limit). Cloud, dust and haze remain outside every criterion. Jerusalem stands here for
        the whole Land, the way the Rambam's own single reference does (KH 11:17) — checked
        across the classical span, from Dan to Beersheba, the q-test moves by at most one band,
        and only on knife-edge evenings, with the south slightly favoured; on any clear verdict
        every city agrees.
      </p>
    </section>
  );
}

function StepButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="rounded border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
    >
      {children}
    </button>
  );
}

function Readout({ title, value, note }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="text-[11px] text-[var(--color-text-secondary)]">{title}</div>
      <div className="mt-0.5 font-mono text-sm font-bold text-[var(--color-gold)]">{value}</div>
      <div className="mt-0.5 text-[10px] text-[var(--color-text-secondary)]">{note}</div>
    </div>
  );
}


/**
 * The moon's lit shape, as it would really look.
 *
 * Standard phase construction: the outer edge is the sun-facing
 * semicircle; the inner edge is the terminator, a half-ellipse whose
 * minor axis is r·|cos ε| for elongation ε — bowing toward the sun for
 * a crescent (ε < 90°), away from it for a gibbous moon. Drawn in a
 * frame whose +x axis points at the sun, then rotated on screen so the
 * bright limb faces the sun's actual drawn position — which makes the
 * horns' tilt of KH 19 emerge from geometry instead of being asserted.
 * Exported for the pins in skyPage.test.jsx.
 */
export function moonPhasePath(elongationDeg, r) {
  const e = ((elongationDeg % 360) + 360) % 360;
  const cos = Math.cos((e * Math.PI) / 180);
  const litFraction = (1 - cos) / 2;
  // Visibility floor: at this drawing size a true 1%-lit crescent is a
  // fraction of a pixel wide and the reader sees only the outline (day
  // 29 did exactly that). The reported litFraction stays honest; the
  // DRAWN sliver — lit or dark — is floored at ~a quarter of the radius
  // so the phase always reads. The moon is already ~4× real size, so
  // the drawing was schematic-scaled before this floor, not after it.
  const minSliver = r * 0.24;
  const a = Math.min(Math.abs(cos) * r, r - minSliver);
  // Outer: semicircle through +x (toward the sun). Inner: back along
  // the terminator — via +x for a crescent, via −x for a gibbous.
  const d =
    `M 0 ${-r} A ${r} ${r} 0 0 1 0 ${r} ` +
    `A ${a.toFixed(3)} ${r} 0 0 ${cos > 0 ? 0 : 1} 0 ${-r} Z`;
  return { d, litFraction };
}

/** The window itself: azimuth 195°–345°, altitude −28°–+65°. */
function SkyFigure({ scene, real }) {
  const w = 900;
  const h = 420;
  const AZ_MIN = 195;
  const AZ_MAX = 345;
  const ALT_MIN = -28;
  const ALT_MAX = 65;
  const x = (az) => ((az - AZ_MIN) / (AZ_MAX - AZ_MIN)) * w;
  const y = (alt) => ((ALT_MAX - alt) / (ALT_MAX - ALT_MIN)) * h;
  const horizonY = y(0);

  const inView = (p) =>
    p.azimuth > AZ_MIN - 4 && p.azimuth < AZ_MAX + 4 && p.altitude > ALT_MIN - 4 && p.altitude < ALT_MAX + 4;

  // Belt polyline segments (break where it leaves the window).
  const segments = [];
  let current = [];
  for (const p of scene.belt) {
    if (inView(p)) current.push(p);
    else if (current.length) {
      segments.push(current);
      current = [];
    }
  }
  if (current.length) segments.push(current);

  const signTicks = scene.belt.filter((p) => p.lambda % 30 === 0 && inView(p));
  const signMids = scene.belt.filter((p) => p.lambda % 30 === 14 && inView(p) && p.altitude > 2);

  return (
    <figure className="mt-4">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
        role="img"
        aria-label="The western sky after sunset: the belt of the signs crossing at its evening slant, the sun below the translucent horizon, the moon at the engine's position"
      >
        {/* the earth, made see-through */}
        <rect x="0" y={horizonY} width={w} height={h - horizonY} fill="var(--color-card)" fillOpacity="0.55" />
        <line x1="0" y1={horizonY} x2={w} y2={horizonY} stroke="var(--color-border)" strokeWidth="1.5" />

        {/* compass */}
        {[
          [202.5, 'SSW'],
          [225, 'SW'],
          [247.5, 'WSW'],
          [270, 'W'],
          [292.5, 'WNW'],
          [315, 'NW'],
          [337.5, 'NNW'],
        ].map(([az, label]) => (
          <g key={label}>
            <line x1={x(az)} y1={horizonY - 4} x2={x(az)} y2={horizonY + 4} stroke="var(--color-border)" strokeWidth="1" />
            <text x={x(az)} y={horizonY + 16} fontSize="11" textAnchor="middle" fill="var(--color-text-secondary)">
              {label}
            </text>
          </g>
        ))}
        <text x={10} y={horizonY + 32} fontSize="10" fill="var(--color-text-secondary)">
          below the line: the earth, made see-through
        </text>

        {/* the belt of the signs */}
        {segments.map((seg, i) => (
          <polyline
            key={i}
            points={seg.map((p) => `${x(p.azimuth).toFixed(1)},${y(p.altitude).toFixed(1)}`).join(' ')}
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="1.5"
            strokeOpacity="0.7"
          />
        ))}
        {signTicks.map((p) => (
          <circle key={p.lambda} cx={x(p.azimuth)} cy={y(p.altitude)} r="3" fill="var(--color-gold)" fillOpacity="0.8" />
        ))}
        {/* Number first, name second — the book's convention, on the sky:
            the reader asked for the mazal names alongside the numbers. */}
        {signMids.map((p) => (
          <g key={p.lambda}>
            <text
              x={x(p.azimuth)}
              y={y(p.altitude) - 18}
              fontSize="11"
              textAnchor="middle"
              fill="var(--color-gold)"
            >
              {Math.floor(p.lambda / 30) + 1}
            </text>
            <text
              x={x(p.azimuth)}
              y={y(p.altitude) - 7}
              fontSize="8"
              textAnchor="middle"
              fill="var(--color-gold)"
              fillOpacity="0.75"
            >
              {zodiacPosition(p.lambda).translit}
            </text>
          </g>
        ))}

        {/* the sun — his */}
        {inView(scene.sun) && (
          <g>
            <circle cx={x(scene.sun.azimuth)} cy={y(scene.sun.altitude)} r="11" fill="var(--color-gold)" fillOpacity={scene.sun.altitude < 0 ? 0.45 : 0.9} />
            <text x={x(scene.sun.azimuth)} y={y(scene.sun.altitude) + 24} fontSize="11" textAnchor="middle" fill="var(--color-gold)">
              {real ? 'Sun (actual)' : 'Sun (Rambam)'}
            </text>
          </g>
        )}

        {/* the moon — his — drawn at its true phase and tilt: the lit
            limb faces the sun's drawn position, the crescent's width
            follows the elongation. Size stays ~4× real so it is
            visible; shape and orientation are genuine. */}
        {inView(scene.moon) && (() => {
          const mxp = x(scene.moon.azimuth);
          const myp = y(scene.moon.altitude);
          const sunAngle =
            (Math.atan2(y(scene.sun.altitude) - myp, x(scene.sun.azimuth) - mxp) * 180) / Math.PI;
          const elong = ((scene.shown.moonLon - scene.shown.sunLon) % 360 + 360) % 360;
          const { d } = moonPhasePath(elong, 7);
          const dim = scene.moon.altitude < 0 ? 0.4 : 1;
          return (
            <g>
              <g transform={`translate(${mxp.toFixed(1)} ${myp.toFixed(1)}) rotate(${sunAngle.toFixed(1)})`}>
                <circle r="7" fill="var(--color-card)" fillOpacity={0.9 * dim} stroke="var(--color-silver)" strokeOpacity={0.35 * dim} strokeWidth="0.75" />
                <path d={d} fill="var(--color-silver)" fillOpacity={dim} />
              </g>
              <text x={mxp} y={myp - 12} fontSize="11" textAnchor="middle" fill="var(--color-silver)">
                {real ? 'Moon (actual)' : 'Moon (Rambam)'}
              </text>
            </g>
          );
        })()}
      </svg>
      <figcaption className="mt-1 text-center text-[11px] text-[var(--color-text-secondary)]">
        Facing west from Jerusalem's latitude. Positions his; sky frame modern.
      </figcaption>
    </figure>
  );
}
