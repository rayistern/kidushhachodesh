/**
 * JerusalemCoordinates — where the calculations are anchored. [R] KH 11:17
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal UI (teaching diagram)
 * ═══════════════════════════════════════════════════════════════════
 *
 * KH 11:17 closes the chapter by saying who the calculations are for:
 * Jerusalem and the region within six or seven days' journey of it,
 * about 32° north, spanning 29° to 35°. That band is not incidental —
 * visibility of the new moon depends on the observer's latitude, and
 * the whole of chapters 17-19 is calibrated to it.
 *
 * The Rambam also gives a longitude, "approximately 24° west of the
 * centre of the populated area". That reference meridian is not one we
 * use today, so the figure is stated as he states it and not converted
 * into a modern longitude — quietly translating it to 35°E would be
 * asserting an identification the text does not make.
 */
import React from 'react';
import InteractiveCard from './InteractiveCard';

const CENTRE_LAT = 32;
const BAND = { from: 29, to: 35 };

export default function JerusalemCoordinates() {
  return (
    <InteractiveCard
      title="The band of latitude the calculations serve"
      source="KH 11:17"
      blurb="Jerusalem at about 32° north, and six or seven days' journey around it"
    >
      <div className="grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
        <LatitudeDiagram />

        <div className="min-w-0 space-y-3 text-sm">
          <div>
            <div className="text-xs font-bold text-[var(--color-text-secondary)]">Latitude</div>
            <div>
              About <strong className="text-[var(--color-gold)]">{CENTRE_LAT}° north</strong> of the
              equator, with the surrounding region running from {BAND.from}° to {BAND.to}°.
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-[var(--color-text-secondary)]">Longitude</div>
            <div>
              About <strong className="text-[var(--color-gold)]">24° west</strong> of the centre of
              the populated area, the surrounding region running from 21° to 27° west.
            </div>
            <div className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
              Measured from a reference meridian that is not the one in use today, so this
              figure is left as the Rambam states it rather than converted.
            </div>
          </div>

          <p className="text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
            Why it is stated at all: whether the new moon can be seen depends on the angle at
            which the sun and moon set, and that angle depends on the observer's latitude. The
            visibility rules of chapters 17-19 are calibrated to this band — they are not a
            general-purpose test that holds at any latitude on earth.
          </p>
        </div>
      </div>
    </InteractiveCard>
  );
}

function LatitudeDiagram() {
  const size = 190;
  const cx = size / 2;
  const cy = size / 2;
  const r = 78;

  // Screen y for a given latitude on a globe seen edge-on.
  const yFor = (lat) => cy - r * Math.sin((lat * Math.PI) / 180);
  // Half-width of the circle of latitude at that height.
  const halfWidth = (lat) => r * Math.cos((lat * Math.PI) / 180);

  const bandTop = yFor(BAND.to);
  const bandBottom = yFor(BAND.from);

  return (
    <figure className="mx-auto w-full max-w-[190px]">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full" role="img"
        aria-label={`A globe seen edge-on, with the band from ${BAND.from} to ${BAND.to} degrees north highlighted`}>
        <defs>
          <clipPath id="kh-globe-clip">
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>

        <circle cx={cx} cy={cy} r={r} fill="var(--color-card)" stroke="var(--color-border)" strokeWidth="1.5" />

        {/* The 29°-35° band */}
        <rect
          x={cx - r}
          y={bandTop}
          width={r * 2}
          height={bandBottom - bandTop}
          fill="var(--color-accent)"
          fillOpacity="0.3"
          clipPath="url(#kh-globe-clip)"
        />

        {/* Equator */}
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy}
          stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" />
        <text x={cx + r + 2} y={cy + 3} fontSize="7" fill="var(--color-text-secondary)">0°</text>

        {/* Jerusalem's own parallel */}
        <line
          x1={cx - halfWidth(CENTRE_LAT)}
          y1={yFor(CENTRE_LAT)}
          x2={cx + halfWidth(CENTRE_LAT)}
          y2={yFor(CENTRE_LAT)}
          stroke="var(--color-gold)"
          strokeWidth="1.5"
        />
        <circle cx={cx} cy={yFor(CENTRE_LAT)} r="3.5" fill="var(--color-gold)" />
        <text x={cx + 7} y={yFor(CENTRE_LAT) - 4} fontSize="7" fill="var(--color-gold)">
          32° N
        </text>

        <text x={cx - r} y={bandTop - 3} fontSize="7" fill="var(--color-accent)">
          {BAND.to}°
        </text>
        <text x={cx - r} y={bandBottom + 8} fontSize="7" fill="var(--color-accent)">
          {BAND.from}°
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-[11px] text-[var(--color-text-secondary)]">
        Where the moon is sighted and witnesses reach the court.
      </figcaption>
    </figure>
  );
}
