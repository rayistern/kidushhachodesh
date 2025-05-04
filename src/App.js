import React, { useState, useEffect, useRef } from 'react';
import './App.css'; // Create this file for styling
import CelestialVisualization from './components/CelestialVisualization';
import DateControl from './components/DateControl';
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
      {/* Links bar */}
      <div 
        className="top-links-bar"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          padding: '1rem 0 0.5rem 0',
          background: 'var(--color-surface-2)',
          borderBottom: '1px solid var(--color-border)',
          fontSize: '1.1rem',
          fontWeight: 500,
          letterSpacing: '0.02em'
        }}
      >
        <a 
          href="https://github.com/rayistern/kidushhachodesh" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            color: '#24292f',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}
        >
          <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor" style={{verticalAlign: 'middle'}}>
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
              0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52
              -.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2
              -3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64
              -.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08
              2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01
              1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          Github
        </a>
        <a 
          href="https://www.cobundle.ai/s/sNYJD4j5xR/rambam_kiddush_hachodesh" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            color: '#0057b8',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}
        >
          <svg height="20" width="20" viewBox="0 0 24 24" fill="currentColor" style={{verticalAlign: 'middle'}}>
            <circle cx="12" cy="12" r="10" fill="#0057b8" opacity="0.15"/>
            <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm1 13h-2v-2h2v2zm0-4h-2V7h2v5z" fill="#0057b8"/>
          </svg>
          AI Chat
        </a>
      </div>

      <header className="app-header">
        <h1>קידוש החודש</h1>
        <h2>Kidush Hachodesh – Interactive Celestial Visualization</h2>
      </header>

      <div className="main-layout">
        <div className="top-section">
          {/* Main visualization area - Now takes full width */}
          <div className="visualization-area full-width">
            <div className="visualization-card">
              <CelestialVisualization 
                date={currentDate} 
                onDateChange={handleDateChange}
                onTooltipChange={setTooltip} 
              />
            </div>
          </div>
        </div>
        
        {/* Date control moved below visualization */}
        <div className="mid-section">
          <div className="control-card">
            <DateControl 
              date={currentDate} 
              onDateChange={handleDateChange} 
              hideCurrentDate={true} 
            />
          </div>
        </div>
        
        {/* AstronomicalCalculations below */}
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
      <div className="video-embeds-row">
        <div className="video-embed-section-left">
          <h3>Rambam's Celestial Model (Chabad.org, Part 1)</h3>
          <div ref={videoRefLeft}></div>
        </div>
        <div className="video-embed-section-right">
          <h3>Rambam's Celestial Model (Chabad.org, Part 2)</h3>
          <div ref={videoRefRight}></div>
        </div>
      </div>

      {/* Sidebar (minimal) */}
      <div className="sidebar">
        <div className="other-sidebar-component">
          {/* Other content */}
        </div>
      </div>
    </div>
  );
}

export default App; 