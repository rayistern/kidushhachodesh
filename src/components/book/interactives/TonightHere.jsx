/**
 * TonightHere — his verdict, then a clock time to act on it.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **crossing** — [R] verdict from the engine (KH 17),
 *  [M] clock times from modern sunset, clearly separated on screen.
 *  SURFACE CATEGORY: internal UI (teaching interactive)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The layering is the whole design and is not cosmetic:
 *
 *   1. THE VERDICT comes from `getFullCalculation` untouched. It takes
 *      no observer, because his method takes none — KH 11:17 fixes one
 *      reference for everybody within six or seven days' journey.
 *   2. HIS MOMENT is sunset at the Jerusalem of KH 11:17 (his stated 32°
 *      north, no elevation) plus the third of an hour of KH 14:6.
 *   3. LOCAL OFFSETS are shown as adjustments to that, never as a
 *      replacement, so the reader can always see what he said and what
 *      was added.
 *
 * Karmiel turns out to differ from Jerusalem by between −4.5 and +1.2
 * minutes of sunset across the year — under 2.5 arcminutes of moon
 * travel, far below anything that moves a verdict. The offsets are here
 * to give a clock time, not to improve the answer, and the card says so.
 *
 * The one local fact with real weight is elevation, because KH 18:1
 * raises it himself: a watcher high up may catch what the calculation
 * calls marginal. 330 m is about 32 arcminutes of horizon dip, which is
 * larger than the margin on every borderline night we have measured.
 */
import React, { useMemo, useState } from 'react';
import InteractiveCard from '../../text/interactives/InteractiveCard';
import { getFullCalculation } from '../../../engine/pipeline';
import { CONSTANTS } from '../../../engine/constants';
import {
  KARMIEL,
  RAMBAM_REFERENCE,
  rambamWindow,
  localOffsets,
  formatClock,
  THIRD_OF_AN_HOUR_MINUTES,
} from '../../../lib/localObserver';
import { zodiacPosition, ordinalSuffix } from '../../../engine/zodiac';

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const signed = (n, digits = 1) => `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(digits)}`;

/** Which KH 17:3-4 half the moon is in, and hence which thresholds. */
function halfFor(longitude) {
  const n = ((longitude % 360) + 360) % 360;
  return n >= 270 || n < 90
    ? { key: 'capricornGemini', label: '10th sign through the 3rd' }
    : { key: 'cancerSagittarius', label: '4th sign through the 9th' };
}

export default function TonightHere() {
  const [iso, setIso] = useState(todayIso);
  const [lat, setLat] = useState(String(KARMIEL.latitude));
  const [lon, setLon] = useState(String(KARMIEL.longitude));
  const [elev, setElev] = useState(String(KARMIEL.elevationM));

  const observer = useMemo(
    () => ({
      name: 'here',
      latitude: Number(lat) || KARMIEL.latitude,
      longitude: Number(lon) || KARMIEL.longitude,
      elevationM: Number(elev) || 0,
    }),
    [lat, lon, elev],
  );

  const data = useMemo(() => {
    const parts = iso.split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
    const date = new Date(parts[0], parts[1] - 1, parts[2], 12);
    if (Number.isNaN(date.getTime())) return null;
    try {
      return {
        calc: getFullCalculation(date),
        base: rambamWindow(date),
        local: localOffsets(date, observer),
      };
    } catch {
      return null;
    }
  }, [iso, observer]);

  if (!data || !data.base || !data.local) {
    return (
      <InteractiveCard
        title="Tonight, where you are"
        source="KH 17 verdict · KH 14:6 moment"
        blurb="his answer, then a clock time to act on it"
      >
        <p className="text-sm text-[var(--color-text-secondary)]">Enter a valid date.</p>
      </InteractiveCard>
    );
  }

  const { calc, base, local } = data;
  const moon = calc.moon;
  const visible = moon.visibilityVerdict === 'visible';
  const half = halfFor(moon.trueLongitude);
  const thresholds = CONSTANTS.EARLY_EXIT_THRESHOLDS[half.key];
  const band = CONSTANTS.KITZEI_HAREIYAH_TABLE.find(
    (r) => moon.keshetHaReiyah > r.kashtFromExclusive && moon.keshetHaReiyah <= r.kashtUpTo,
  );
  // How much slack the deciding quantity has. Below about a fifth of a
  // degree, every verdict we have tested was fragile.
  const slack = band
    ? moon.elongation - band.orechMin
    : visible
      ? moon.elongation - thresholds.visibleMin
      : thresholds.invisibleMax - moon.keshetHaReiyah;
  const marginal = Math.abs(slack) < 0.5;
  const pos = zodiacPosition(moon.trueLongitude);

  return (
    <InteractiveCard
      title="Tonight, where you are"
      source="KH 17 verdict · KH 14:6 moment"
      blurb="his answer first, then the offsets that turn it into a clock time"
    >
      <label className="block">
        <span className="text-xs font-bold text-[var(--color-text-secondary)]">Evening of</span>
        <input
          type="date"
          value={iso}
          onChange={(e) => setIso(e.target.value)}
          className="mt-1 ml-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 font-mono text-sm"
        />
      </label>

      {/* ── LAYER 1: his verdict, no observer anywhere in it ── */}
      <div
        className={`mt-3 rounded-lg border-2 p-3 ${
          visible ? 'border-[var(--color-gold)]' : 'border-[var(--color-border)]'
        } bg-[var(--color-bg)]`}
      >
        <div className="text-xs font-bold text-[var(--color-text-secondary)]">
          The Rambam's answer (KH 17)
        </div>
        <div className="mt-1 text-xl font-bold text-[var(--color-gold)]">
          {visible ? 'The moon should be visible' : 'The moon should not be visible'}
        </div>
        <div className="mt-2 grid gap-1 font-mono text-xs sm:grid-cols-2">
          <div>
            arc of sighting <strong>{moon.keshetHaReiyah.toFixed(2)}°</strong>
          </div>
          <div>
            the gap <strong>{moon.elongation.toFixed(2)}°</strong>
          </div>
          <div>
            moon in the{' '}
            <strong>
              {pos.index + 1}
              {ordinalSuffix(pos.index + 1)}
            </strong>{' '}
            sign ({pos.translit})
          </div>
          <div>
            {band
              ? `table band needs gap ≥ ${band.orechMin}°`
              : `thresholds ${thresholds.invisibleMax}° / ${thresholds.visibleMin}°`}
          </div>
        </div>
        <div className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
          This verdict uses no location at all. His method fixes one reference for everyone within
          "six or seven days' journey" of Jerusalem (KH 11:17), and Karmiel is well inside it —
          nearer his stated 32° north, in fact, than Jerusalem itself.
        </div>
      </div>

      {/* ── LAYER 2: his moment ── */}
      <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <div className="text-xs font-bold text-[var(--color-text-secondary)]">
          His instruction, put on a modern clock
        </div>
        <div className="mt-1 font-mono text-sm">
          sunset <strong>{formatClock(base.sunset)}</strong> → a third of an hour later,{' '}
          <strong className="text-[var(--color-gold)]">{formatClock(base.reference)}</strong>
        </div>
        {/* The provenance has to be explicit here. A sunset time under a
            heading with a KH reference reads as his figure, and it is
            not: nothing in nineteen chapters computes a sunset. */}
        <div className="mt-2 space-y-1 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
          <div>
            <strong>His:</strong> the instruction "about a third of an hour after the setting of the
            sun" (KH 14:6), and the reference latitude — {RAMBAM_REFERENCE.note}
          </div>
          <div>
            <strong>Ours:</strong> a latitude of {RAMBAM_REFERENCE.latitude}° and a longitude of{' '}
            {RAMBAM_REFERENCE.longitude}° fed to a modern sunset algorithm, because a clock time
            cannot be had without them.
          </div>
          <div>
            <strong>Not his:</strong> <em>the sunset time itself.</em> He publishes no sunset table,
            and the engine contains no sunset computation anywhere. The timezone (Israel local,
            UTC+{base.utcOffset}) and the daylight-saving rule are modern too.
          </div>
        </div>
      </div>

      {/* ── LAYER 3: the offsets ── */}
      <div className="mt-3 rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-bg)] p-3">
        <div className="text-xs font-bold text-[var(--color-text-secondary)]">
          Offsets for where you actually stand
        </div>
        <table className="mt-2 w-full text-xs">
          <tbody className="font-mono">
            <tr className="border-b border-[var(--color-border)]/40">
              <td className="py-1 pr-2 text-[var(--color-text-secondary)]">
                position ({signed(local.latitudeDelta, 2)}° lat, {signed(local.longitudeDelta, 2)}°
                lon)
              </td>
              <td className="py-1 text-right">{signed(local.sunsetShiftMinutes)} min</td>
            </tr>
            <tr className="border-b border-[var(--color-border)]/40">
              <td className="py-1 pr-2 text-[var(--color-text-secondary)]">
                height ({observer.elevationM} m → {(local.dipDegrees * 60).toFixed(0)}′ of horizon
                dip)
              </td>
              <td className="py-1 text-right">{signed(local.dipMinutes)} min</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-2 border-t border-[var(--color-border)] pt-2 font-mono text-sm">
          sunset here <strong>{formatClock(local.sunset)}</strong> · his moment lands at{' '}
          <strong>{formatClock(local.reference)}</strong>
        </div>
        <div className="mt-1 text-sm">
          <span className="text-[var(--color-text-secondary)]">Be outside</span>{' '}
          <strong className="text-[var(--color-gold)]">
            {formatClock(local.lookFrom)}–{formatClock(local.lookUntil)}
          </strong>
          <span className="text-[var(--color-text-secondary)]">, looking west.</span>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <label className="block">
          <span className="text-[11px] font-bold text-[var(--color-text-secondary)]">Latitude</span>
          <input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="mt-0.5 w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 font-mono text-xs"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-bold text-[var(--color-text-secondary)]">Longitude</span>
          <input
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            className="mt-0.5 w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 font-mono text-xs"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-bold text-[var(--color-text-secondary)]">
            Elevation (m)
          </span>
          <input
            value={elev}
            onChange={(e) => setElev(e.target.value)}
            className="mt-0.5 w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 font-mono text-xs"
          />
        </label>
      </div>
      <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
        Preset to Karmiel — 32.914° N, 35.296° E. Published elevations for the city run from about
        293 m to 330 m, since it is built across hills; the figure only affects the horizon dip.
      </p>

      {/* ── The side notes, which are the honest part ── */}
      <div className="mt-4 space-y-2 border-t border-[var(--color-border)] pt-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        <p className="font-bold text-[var(--color-text-secondary)]">Things worth knowing</p>
        {marginal && (
          <p className="rounded border border-[var(--color-gold)]/50 p-2 text-[var(--color-text)]">
            <strong>This night is marginal.</strong> The deciding quantity clears its threshold by
            only {Math.abs(slack).toFixed(2)}°. KH 18:4 addresses exactly this case: when the
            answer is this close, the court was told to weigh the season and where the witnesses
            stood, and to cross-examine hard. Treat the verdict as a prompt to look, not a promise.
          </p>
        )}
        <p>
          <strong>He never needed a clock, and that is worth noticing.</strong> Nothing in the
          nineteen chapters computes a sunset. The one place his method reacts to sunset at all is
          the season correction of KH 14:5 — the nudge of nothing, or a quarter of a degree, or half
          a degree, applied to the moon's average place according to where the sun is. Sunset slides
          through the year, so the moon has travelled further by the time it arrives in summer than
          in winter, and he absorbs that as <em>arcminutes of moon motion</em> rather than as a time.
          That correction is already inside the verdict above. Reading his table as a sunset proxy is
          our interpretation, though — he gives no reason for it.
        </p>
        <p>
          <strong>Your height matters more than your position.</strong> Karmiel's sunset differs
          from Jerusalem's by between −4.5 and +1.2 minutes across the year — under 2.5 arcminutes
          of moon travel, which never moves a verdict. But{' '}
          {(local.dipDegrees * 60).toFixed(0)}′ of horizon dip from standing{' '}
          {observer.elevationM} m up is larger than the whole margin on a borderline night. KH 18:1
          says this himself: a watcher high up may catch a crescent the calculation calls marginal,
          and one in a valley may miss an easy one.
        </p>
        <p>
          <strong>His sun runs slightly fast, and it biases one way.</strong> His mean solar rate
          is about 1.7 arcminutes per century ahead of the true tropical rate, so by now it has
          accumulated roughly a quarter of a degree. Over 50 years of sampled sighting nights that
          changed the verdict on about 1.6% of them — and every single change ran the same
          direction, visible → not visible. His method is very slightly generous about marginal
          nights. Nothing has been altered to compensate: this is a note, not a correction.
        </p>
        <p>
          <strong>What this card cannot do.</strong> There is no lunar ephemeris in this project by
          design, so nothing here independently predicts visibility, and it cannot tell you when
          the moon sets — which is the constraint that really decides a thin crescent. Cloud, dust
          and haze are outside the arithmetic too, as KH 18:1 concedes. This tells you when and
          where to look, beside his answer on whether to expect anything.
        </p>
      </div>
    </InteractiveCard>
  );
}
