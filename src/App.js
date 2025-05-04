import React, { useState } from 'react';
import './App.css'; // Create this file for styling
import CelestialVisualization from './components/CelestialVisualization';
import DateControl from './components/DateControl';
import HebrewDateInput from './components/HebrewDateInput';
import AstronomicalCalculations from './components/AstronomicalCalculations';

// Import constants from a separate file
import { 
  HEBREW_MONTHS_REGULAR,
  HEBREW_MONTHS_LEAP,
  CONSTANTS 
} from './constants'; // Move constants to this file

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tooltip, setTooltip] = useState(null);
  
  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>קידוש החודש</h1>
        <h2>Kidush Hachodesh - Interactive Celestial Visualization</h2>
      </header>

      <div className="main-layout">
        <div className="top-section">
          {/* Side panel with controls */}
          <div className="control-panel">
            <div className="control-card">
              <DateControl date={currentDate} onDateChange={handleDateChange} />
            </div>
            <div className="control-card">
              <HebrewDateInput date={currentDate} onDateChange={handleDateChange} />
            </div>
          </div>
          
          {/* Main visualization area */}
          <div className="visualization-area">
            <div className="visualization-card">
              <CelestialVisualization 
                date={currentDate} 
                onDateChange={handleDateChange}
                onTooltipChange={setTooltip} 
              />
            </div>
          </div>
        </div>
        
        {/* AstronomicalCalculations moved below the visualization */}
        <div className="bottom-section">
          <div className="control-card full-width">
            <AstronomicalCalculations date={currentDate} />
          </div>
        </div>
      </div>
      
      <footer className="app-footer">
        <p>Based on the Rambam's calculations in Hilchot Kiddush HaChodesh</p>
      </footer>

      {/* Keep the sidebar but remove specific components */}
      <div className="sidebar">
        {/* Remove the Hebrew date card */}
        
        {/* Remove the KnowledgeBase component */}
        
        {/* Keep any other sidebar components you want to retain */}
        <div className="other-sidebar-component">
          {/* Other content */}
        </div>
      </div>
    </div>
  );
}

export default App; 