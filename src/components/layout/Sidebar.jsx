/**
 * Sidebar — mixed-regime display.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: mixed (fixed-calendar labeling + astronomical)
 * ═══════════════════════════════════════════════════════════════════
 * Per docs/OPEN_QUESTIONS.md Q3 (Option B, 2026-04-23):
 *   - Hebrew date display, Rosh Chodesh indicator, and molad readout
 *     come from the FIXED CALENDAR (KH 6-10) — they are labeling
 *     layer only.
 *   - Sun / Moon / Visibility value rows come from the ASTRONOMICAL
 *     pipeline (KH 11-17).
 * When drill-down click handling is added (Phase 3 / D2 roadmap), the
 * fixed-calendar rows must NOT route to astronomical steps. A molad
 * click should open a fixed-calendar explanation (BaHaRaD + month-
 * count × synodic), never "mean sun longitude."
 */
import React from 'react';
import { useCalendarStore } from '../../stores/calendarStore';
import { useCalculationStore } from '../../stores/calculationStore';
import { useVisualizationStore } from '../../stores/visualizationStore';
import { useUIStore } from '../../stores/uiStore';
import { getHebrewDateDisplay, getMoladDisplay } from '../../utils/dateUtils';
import { formatDms } from '../../engine/dmsUtils';
import { SOURCE_TYPES } from '../../engine/constants';
import DateScrubber from './DateScrubber';

export default function Sidebar() {
  const { currentDate, setDate, adjustDays } = useCalendarStore();
  const calculation = useCalculationStore((s) => s.calculation);
  const selectStep = useCalculationStore((s) => s.selectStep);
  const setHighlightedGalgal = useVisualizationStore((s) => s.setHighlightedGalgal);
  const pulseStep = useVisualizationStore((s) => s.pulseStep);
  const setRightPanel = useUIStore((s) => s.setRightPanel);
  const isWideViewport = useUIStore((s) => s.isWideViewport);
  const setLeftPanelOpen = useUIStore((s) => s.setLeftPanelOpen);
  const setRightPanelOpen = useUIStore((s) => s.setRightPanelOpen);

  const hebrew = getHebrewDateDisplay(currentDate);
  const molad = getMoladDisplay(currentDate);

  // Clicking a value: select the step, highlight the relevant mechanism,
  // pulse every galgal that contributes to that step (D2), and (on mobile)
  // swap the left drawer for the right drilldown drawer so the user
  // immediately sees the result of their tap.
  const handleClick = (stepId, galgalId) => {
    selectStep(stepId);
    setRightPanel('drilldown');
    if (galgalId) setHighlightedGalgal(galgalId);
    pulseStep(stepId);
    if (!isWideViewport) {
      setLeftPanelOpen(false);
      setRightPanelOpen(true);
    }
  };

  return (
    <aside className="w-full h-full border-r border-[var(--color-border)] bg-[var(--color-surface)] overflow-y-auto">
      {/* Date section — sticky so the user can scrub time without losing it */}
      <div className="p-3 sm:p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-10">
        <label className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">Date</label>
        <input
          type="date"
          value={currentDate.toISOString().slice(0, 10)}
          onChange={(e) => setDate(new Date(e.target.value))}
          className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)] text-sm tap-target"
        />
        <div className="grid grid-cols-6 gap-1 mt-2">
          {[-365, -30, -1, 1, 30, 365].map((d) => (
            <button
              key={d}
              onClick={() => adjustDays(d)}
              className="px-1 py-2 rounded text-xs font-mono bg-[var(--color-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] active:bg-[var(--color-border)] transition-colors min-h-[36px]"
            >
              {d > 0 ? `+${d}` : d}
            </button>
          ))}
        </div>

        {/* Hebrew date display */}
        <div className="mt-3 text-center">
          <div className="hebrew-text text-lg font-bold text-[var(--color-accent)]">
            {hebrew.hebrewFormatted}
          </div>
          <div className="text-xs text-[var(--color-text-secondary)]">
            {hebrew.formatted}
          </div>
          {hebrew.isRoshChodesh && (
            <div className="text-xs text-[var(--color-gold)] font-bold mt-1">Rosh Chodesh</div>
          )}
        </div>

        {/* Molad */}
        {molad.calculated && (
          <div className="mt-2 text-xs text-[var(--color-text-secondary)]">
            <span className="font-medium">Molad:</span> {molad.formatted}
          </div>
        )}
      </div>

      {/* D5 — date scrubber lives right below the date header so it's
          always reachable while scrolling values. */}
      <DateScrubber />

      {/* Calculation summary — each value is clickable */}
      {calculation && (
        <>
          {/* ── SUN ── */}
          <SectionHeader title="Sun" hebrewTitle="השמש" color="var(--color-gold)" />
          <ValueRow
            label="Mean Longitude" hebrewLabel="אמצע השמש"
            value={formatDms(calculation.sun.meanLongitude)}
            onClick={() => handleClick('sunMeanLongitude', 'sun')}
          />
          <ValueRow
            label="True Longitude" hebrewLabel="מקום אמיתי"
            value={formatDms(calculation.sun.trueLongitude)}
            onClick={() => handleClick('sunTrueLongitude', 'sun')}
          />
          <ValueRow
            label="Apogee (Govah)" hebrewLabel="גובה"
            value={formatDms(calculation.sun.apogee)}
            onClick={() => handleClick('sunApogee', 'sun')}
            tooltip="The point on the red galgal furthest from Earth"
          />
          <ValueRow
            label="Maslul" hebrewLabel="מסלול"
            value={formatDms(calculation.sun.maslul)}
            onClick={() => handleClick('sunMaslul', 'sun')}
          />
          <ValueRow
            label="Correction" hebrewLabel="מנת המסלול"
            value={formatDms(calculation.sun.maslulCorrection)}
            onClick={() => handleClick('sunMaslulCorrection', 'sun')}
            source="approximated"
            tooltip="Interpolated from the Rambam's table — max ~2° at 90°"
          />
          <ValueRow
            label="Constellation"
            value={`${calculation.sun.constellation.hebrew} (${calculation.sun.constellation.english})`}
          />

          {/* ── MOON ── */}
          <SectionHeader title="Moon" hebrewTitle="הירח" color="var(--color-silver)" />
          <ValueRow
            label="Mean Longitude" hebrewLabel="אמצע הירח"
            value={formatDms(calculation.moon.meanLongitude)}
            onClick={() => handleClick('moonMeanLongitude', 'moon')}
            tooltip="The center of the galgal katan (small epicycle)"
          />
          <ValueRow
            label="Double Elongation" hebrewLabel="מרחק כפול"
            value={formatDms(calculation.moon.doubleElongation)}
            onClick={() => handleClick('doubleElongation', 'moon')}
            source="rambam"
            tooltip="2 x (moon mean - sun mean). Accounts for opposite motions of the outer galgalim."
          />
          <ValueRow
            label="Maslul Hanachon" hebrewLabel="מסלול נכון"
            value={formatDms(calculation.moon.maslulHanachon)}
            onClick={() => handleClick('maslulHanachon', 'moon')}
            tooltip="The corrected course — emtza hamaslul adjusted by the double elongation"
          />
          <ValueRow
            label="True Longitude" hebrewLabel="מקום אמיתי"
            value={formatDms(calculation.moon.trueLongitude)}
            onClick={() => handleClick('moonTrueLongitude', 'moon')}
          />
          <ValueRow
            label="Node (Rosh)" hebrewLabel="ראש התלי"
            value={formatDms(calculation.moon.nodePosition)}
            onClick={() => handleClick('nodePosition', 'moon')}
            tooltip="Ascending node — where the moon's tilted orbit crosses the ecliptic northward"
          />
          <ValueRow
            label="Latitude" hebrewLabel="רוחב"
            value={formatDms(calculation.moon.latitude)}
            onClick={() => handleClick('moonLatitude', 'moon')}
          />
          <ValueRow
            label="Elongation" hebrewLabel="אורך ראשון"
            value={formatDms(calculation.moon.elongation)}
            onClick={() => handleClick('elongation', null)}
          />
          <ValueRow
            label="Phase" hebrewLabel="מופע"
            value={`${calculation.moon.phase}`}
            source="deduced"
          />
          <ValueRow
            label="Visible?" hebrewLabel="נראה?"
            value={calculation.moon.isVisible ? 'Yes' : 'No'}
            highlight={calculation.moon.isVisible}
            onClick={() => handleClick('moonVisibility', null)}
          />

          {/* ── SEASON ── */}
          <SectionHeader title="Season" hebrewTitle="תקופה" color="var(--color-accent)" />
          <ValueRow
            label="Current" value={calculation.season.currentSeason}
          />
          <ValueRow
            label="Days to next" value={`${calculation.season.daysUntilNextSeason} days`}
          />
        </>
      )}
    </aside>
  );
}

function SectionHeader({ title, hebrewTitle, color }) {
  return (
    <div className="px-4 py-2 border-b border-[var(--color-border)]" style={{ borderLeftColor: color, borderLeftWidth: 3 }}>
      <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{title}</span>
      {hebrewTitle && (
        <span className="hebrew-text text-sm ml-2" style={{ color }}>{hebrewTitle}</span>
      )}
    </div>
  );
}

function ValueRow({ label, hebrewLabel, value, onClick, highlight, source, tooltip }) {
  const sourceInfo = source ? SOURCE_TYPES[source] : null;
  return (
    <div
      onClick={onClick}
      className={`flex justify-between items-center gap-2 px-4 py-2.5 sm:py-1.5 text-xs border-b border-[var(--color-border)] border-opacity-30 ${
        onClick ? 'cursor-pointer hover:bg-[var(--color-card)] active:bg-[var(--color-card)]' : ''
      } ${highlight ? 'bg-[var(--color-accent)] bg-opacity-10' : ''}`}
      title={tooltip}
    >
      <span className="text-[var(--color-text-secondary)] flex items-center gap-1 min-w-0 flex-1">
        {sourceInfo && (
          <span
            className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: sourceInfo.color }}
            title={sourceInfo.description}
          />
        )}
        <span className="truncate">{label}</span>
        {hebrewLabel && (
          <span className="hebrew-text opacity-60 truncate flex-shrink min-w-0">({hebrewLabel})</span>
        )}
      </span>
      <span className="font-mono text-[var(--color-text)] flex-shrink-0 whitespace-nowrap">{value}</span>
    </div>
  );
}
