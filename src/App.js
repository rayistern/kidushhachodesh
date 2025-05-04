import React, { useState, useEffect, useRef } from 'react';
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
  const videoRefRight = useRef(null);   // For aid=5500843 (right)
  const videoRefLeft = useRef(null);    // For aid=5500842 (left)
  
  // Right video (aid=5500843)
  useEffect(() => {
    if (videoRefRight.current) {
      videoRefRight.current.innerHTML = '';
      const existingScript = document.querySelector('script[src="//embed.chabad.org/multimedia/mediaplayer/embedded/embed.js.asp?aid=5500843&width=auto&height=auto&HideVideoInfo=false"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//embed.chabad.org/multimedia/mediaplayer/embedded/embed.js.asp?aid=5500843&width=auto&height=auto&HideVideoInfo=false';
        script.async = true;
        videoRefRight.current.appendChild(script);
      }
    }
    return () => {
      if (videoRefRight.current) videoRefRight.current.innerHTML = '';
    };
  }, []);

  // Left video (aid=5500842)
  useEffect(() => {
    if (videoRefLeft.current) {
      videoRefLeft.current.innerHTML = '';
      const existingScript = document.querySelector('script[src="//embed.chabad.org/multimedia/mediaplayer/embedded/embed.js.asp?aid=5500842&width=auto&height=auto&HideVideoInfo=false"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//embed.chabad.org/multimedia/mediaplayer/embedded/embed.js.asp?aid=5500842&width=auto&height=auto&HideVideoInfo=false';
        script.async = true;
        videoRefLeft.current.appendChild(script);
      }
    }
    return () => {
      if (videoRefLeft.current) videoRefLeft.current.innerHTML = '';
    };
  }, []);

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

      {/* Video Embeds Row */}
      <div className="video-embeds-row" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '2rem 0' }}>
        {/* Left: Chabad video aid=5500842 */}
        <div className="video-embed-section-left" style={{ flex: 1, maxWidth: 400 }}>
          <h3 style={{ fontSize: '1rem' }}>Rambam's Celestial Model (Chabad.org, Part 1)</h3>
          <div ref={videoRefLeft}></div>
        </div>
        {/* Right: Chabad video aid=5500843 */}
        <div className="video-embed-section-right" style={{ flex: '0 0 320px', maxWidth: 320, textAlign: 'center' }}>
          <h3 style={{ fontSize: '1rem' }}>Rambam's Celestial Model (Chabad.org, Part 2)</h3>
          <div ref={videoRefRight}></div>
        </div>
      </div>

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