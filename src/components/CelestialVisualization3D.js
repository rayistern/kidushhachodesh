import React, { useState, useMemo } from 'react';
import './CelestialVisualization.css';
import './3d/Scene3D.css';
import { Scene3D } from './3d';
import { CAMERA_PRESETS } from './3d/CameraControls';
import { getAstronomicalData } from '../utils/astronomyCalc';

/**
 * CelestialVisualization3D - 3D mode wrapper for the celestial visualization
 * 
 * This component wraps the Scene3D component and provides:
 * - Camera preset controls
 * - Mode toggle (2D/3D) - when integrated with parent
 * - Animation controls
 * - Tooltip display for 3D objects
 */
const CelestialVisualization3D = ({
  date,
  onDateChange,
  onTooltipChange,
  isAnimating = true,
  onToggleMode,
  ...props
}) => {
  // State
  const [currentPreset, setCurrentPreset] = useState('OVERVIEW');
  const [showZodiac, setShowZodiac] = useState(true);
  const [tooltipData, setTooltipData] = useState(null);
  
  // Get astronomical data
  const astronomicalData = useMemo(() => {
    return getAstronomicalData(date);
  }, [date]);
  
  // Handle 3D object hover
  const handleObjectHover = (data) => {
    setTooltipData(data);
    if (onTooltipChange) {
      onTooltipChange(data);
    }
  };
  
  // Camera preset buttons
  const presetButtons = [
    { key: 'OVERVIEW', label: 'Overview', icon: '🔭' },
    { key: 'EARTH', label: 'Earth', icon: '🌍' },
    { key: 'EARTH_TILT', label: 'Tilt View', icon: '📐' },
    { key: 'SUN_SYSTEM', label: 'Sun', icon: '☀️' },
    { key: 'MOON_SYSTEM', label: 'Moon', icon: '🌙' },
    { key: 'ECLIPTIC', label: 'Ecliptic', icon: '⭕' },
  ];

  return (
    <div className="celestial-visualization scene-3d-container">
      {/* Mode Toggle */}
      {onToggleMode && (
        <div className="mode-toggle">
          <button 
            className="mode-toggle-btn"
            onClick={onToggleMode}
          >
            ← Switch to 2D
          </button>
        </div>
      )}
      
      {/* Animation Controls */}
      <div className="animation-controls">
        <button 
          className={`animation-btn ${isAnimating ? 'playing' : ''}`}
          onClick={() => onDateChange && onDateChange(date)}
          title={isAnimating ? 'Pause' : 'Play'}
        >
          {isAnimating ? '⏸' : '▶'}
        </button>
        <label className="animation-speed">
          <input 
            type="checkbox" 
            checked={showZodiac}
            onChange={(e) => setShowZodiac(e.target.checked)}
          />
          Zodiac
        </label>
      </div>
      
      {/* 3D Scene */}
      <Scene3D
        date={date}
        astronomicalData={astronomicalData}
        isAnimating={isAnimating}
        showZodiac={showZodiac}
        onObjectHover={handleObjectHover}
        cameraPreset={currentPreset}
        style={{ width: '100%', height: '100%' }}
        {...props}
      />
      
      {/* Camera Preset Controls */}
      <div className="camera-controls">
        {presetButtons.map(({ key, label, icon }) => (
          <button
            key={key}
            className={`camera-control-btn ${currentPreset === key ? 'active' : ''}`}
            onClick={() => setCurrentPreset(key)}
            title={label}
          >
            <span>{icon}</span>
            <span style={{ marginLeft: '4px' }}>{label}</span>
          </button>
        ))}
      </div>
      
      {/* Legend */}
      <div className="legend-3d">
        <h4>Legend</h4>
        <div className="legend-item">
          <div className="legend-color earth" />
          <span>Earth (23.5° tilt)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color sun" />
          <span>Sun's Epicycle</span>
        </div>
        <div className="legend-item">
          <div className="legend-color moon-1" />
          <span>Moon's 1st Epicycle</span>
        </div>
        <div className="legend-item">
          <div className="legend-color moon-2" />
          <span>Moon's 2nd Epicycle (Inclined)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color galgal" />
          <span>Transparent Galgal</span>
        </div>
      </div>
      
      {/* Tooltip Overlay */}
      {tooltipData && (
        <div className="tooltip-3d" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}>
          <h4>{tooltipData.title}</h4>
          {tooltipData.longitude && (
            <p>Longitude: <span className="coordinate">{tooltipData.longitude}°</span></p>
          )}
          {tooltipData.latitude && (
            <p>Latitude: <span className="coordinate">{tooltipData.latitude}°</span></p>
          )}
          {tooltipData.constellation && (
            <p>Constellation: {tooltipData.constellation}</p>
          )}
          {tooltipData.phase && (
            <p>Phase: {tooltipData.phase}</p>
          )}
          {tooltipData.visibility && (
            <p>Visibility: {tooltipData.visibility}</p>
          )}
          <p>{tooltipData.description}</p>
          {tooltipData.reference && (
            <p className="reference">{tooltipData.reference}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CelestialVisualization3D;
