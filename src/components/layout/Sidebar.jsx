import React from 'react';
import { useCalendarStore } from '../../stores/calendarStore';
import { useCalculationStore } from '../../stores/calculationStore';
import { useVisualizationStore } from '../../stores/visualizationStore';
import { getHebrewDateDisplay, getMoladDisplay } from '../../utils/dateUtils';
import { formatDms } from '../../engine/dmsUtils';

export default function Sidebar() {
  const { currentDate, setDate, adjustDays } = useCalendarStore();
  const calculation = useCalculationStore((s) => s.calculation);
  const selectStep = useCalculationStore((s) => s.selectStep);
  const setHighlightedGalgal = useVisualizationStore((s) => s.setHighlightedGalgal);

  const hebrew = getHebrewDateDisplay(currentDate);
  const molad = getMoladDisplay(currentDate);

  const handleClick = (stepId, galgalId) => {
    selectStep(stepId);
    setHighlightedGalgal(galgalId);
  };

  return (
    <aside className="w-72 border-r border-[var(--color-border)] bg-[var(--color-surface)] overflow-y-auto flex-shrink-0">
      {/* Date section */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <label className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide">Date</label>
        <input
          type="date"
          value={currentDate.toISOString().slice(0, 10)}
          onChange={(e) => setDate(new Date(e.target.value))}
          className="w-full mt-1 px-3 py-1.5 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)] text-sm"
        />
        <div className="flex gap-1 mt-2">
          {[-365, -30, -1, 1, 30, 365].map((d) => (
            <button
              key={d}
              onClick={() => adjustDays(d)}
              className="flex-1 px-1 py-1 rounded text-xs font-mono bg-[var(--color-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors"
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

      {/* Calculation summary — each value is clickable */}
      {calculation && (
        <>
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
            label="Apogee" hebrewLabel="גובה"
            value={formatDms(calculation.sun.apogee)}
            onClick={() => handleClick('sunApogee', 'sun')}
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
          />
          <ValueRow
            label="Constellation"
            value={`${calculation.sun.constellation.hebrew} (${calculation.sun.constellation.english})`}
          />

          <SectionHeader title="Moon" hebrewTitle="הירח" color="var(--color-silver)" />
          <ValueRow
            label="Mean Longitude" hebrewLabel="אמצע הירח"
            value={formatDms(calculation.moon.meanLongitude)}
            onClick={() => handleClick('moonMeanLongitude', 'moon')}
          />
          <ValueRow
            label="True Longitude" hebrewLabel="מקום אמיתי"
            value={formatDms(calculation.moon.trueLongitude)}
            onClick={() => handleClick('moonTrueLongitude', 'moon')}
          />
          <ValueRow
            label="Maslul" hebrewLabel="מסלול"
            value={formatDms(calculation.moon.maslul)}
            onClick={() => handleClick('moonMaslul', 'moon')}
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
          />
          <ValueRow
            label="Visible?" hebrewLabel="נראה?"
            value={calculation.moon.isVisible ? 'Yes' : 'No'}
            highlight={calculation.moon.isVisible}
            onClick={() => handleClick('moonVisibility', null)}
          />

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

function ValueRow({ label, hebrewLabel, value, onClick, highlight }) {
  return (
    <div
      onClick={onClick}
      className={`flex justify-between items-center px-4 py-1.5 text-xs border-b border-[var(--color-border)] border-opacity-30 ${
        onClick ? 'cursor-pointer hover:bg-[var(--color-card)]' : ''
      } ${highlight ? 'bg-[var(--color-accent)] bg-opacity-10' : ''}`}
    >
      <span className="text-[var(--color-text-secondary)]">
        {label}
        {hebrewLabel && <span className="hebrew-text ml-1 opacity-60">({hebrewLabel})</span>}
      </span>
      <span className="font-mono text-[var(--color-text)]">{value}</span>
    </div>
  );
}
