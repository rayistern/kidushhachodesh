import React from 'react';
import './AstronomicalCalculations.css';
import { CONSTANTS } from '../constants';

const AstronomicalCalculations = ({ date }) => {
  // Calculate astronomical data
  const calculateData = (date) => {
    const baseDate = CONSTANTS.BASE_DATE;
    const daysFromBase = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));
    
    // Convert sun's mean motion to decimal degrees
    const sunMeanMotionDegrees = CONSTANTS.SUN.MEAN_MOTION_PER_DAY.degrees + 
                                CONSTANTS.SUN.MEAN_MOTION_PER_DAY.minutes / 60 + 
                                CONSTANTS.SUN.MEAN_MOTION_PER_DAY.seconds / 3600;

    // Calculate sun's position
    const sunLongitude = (CONSTANTS.SUN.START_POSITION.degrees + 
                         CONSTANTS.SUN.START_POSITION.minutes / 60 + 
                         CONSTANTS.SUN.START_POSITION.seconds / 3600 + 
                         (sunMeanMotionDegrees * daysFromBase)) % 360;
    
    // Calculate sun's apogee (govah)
    const apogeeStart = CONSTANTS.SUN.APOGEE_START.degrees + 
                      (CONSTANTS.SUN.APOGEE_CONSTELLATION * 30);
    const apogeePosition = (apogeeStart + 
                         (CONSTANTS.SUN.APOGEE_MOTION_PER_DAY * daysFromBase)) % 360;
    
    // Calculate maslul (argument of sun)
    let maslul = sunLongitude - apogeePosition;
    if (maslul < 0) maslul += 360;
    
    // Calculate maslul correction
    let maslulCorrection = 0;
    
    // Find correction from table
    for (let i = 0; i < CONSTANTS.MASLUL_CORRECTIONS.length - 1; i++) {
      const current = CONSTANTS.MASLUL_CORRECTIONS[i];
      const next = CONSTANTS.MASLUL_CORRECTIONS[i + 1];
      
      if (maslul >= current.maslul && maslul < next.maslul) {
        const ratio = (maslul - current.maslul) / (next.maslul - current.maslul);
        maslulCorrection = current.correction + ratio * (next.correction - current.correction);
        break;
      }
    }
    
    // Calculate true position
    let correctedSunLongitude;
    if (maslul <= 180) {
      correctedSunLongitude = (sunLongitude + maslulCorrection) % 360;
    } else {
      correctedSunLongitude = (sunLongitude - maslulCorrection) % 360;
    }
    
    // Sun's position in constellation
    const sunConstellation = Math.floor(sunLongitude / 30);
    const sunPositionInConstellation = sunLongitude % 30;
    
    // Moon calculations
    const moonLongitude = (CONSTANTS.MOON.START_POSITION.degrees + 
                          (CONSTANTS.MOON.MEAN_MOTION_PER_DAY.degrees * daysFromBase)) % 360;
    
    // Calculate lunar maslul (argument of moon)
    // Using regular MASLUL_CORRECTIONS for now since MOON_MASLUL_CORRECTIONS might not exist
    const moonMaslul = (CONSTANTS.MOON.MASLUL_START.degrees + 
                       (CONSTANTS.MOON.MASLUL_MEAN_MOTION.degrees * daysFromBase)) % 360;
    
    // Find the appropriate correction for the moon maslul
    let moonMaslulCorrection = 0;
    // Using regular MASLUL_CORRECTIONS for now
    for (let i = 0; i < CONSTANTS.MASLUL_CORRECTIONS.length - 1; i++) {
      if (moonMaslul >= CONSTANTS.MASLUL_CORRECTIONS[i].maslul && 
          moonMaslul < CONSTANTS.MASLUL_CORRECTIONS[i + 1].maslul) {
        // Linear interpolation between correction points
        const ratio = (moonMaslul - CONSTANTS.MASLUL_CORRECTIONS[i].maslul) / 
                     (CONSTANTS.MASLUL_CORRECTIONS[i + 1].maslul - CONSTANTS.MASLUL_CORRECTIONS[i].maslul);
        moonMaslulCorrection = CONSTANTS.MASLUL_CORRECTIONS[i].correction + 
                              ratio * (CONSTANTS.MASLUL_CORRECTIONS[i + 1].correction - 
                                      CONSTANTS.MASLUL_CORRECTIONS[i].correction);
        break;
      }
    }
    
    // Calculate lunar latitude
    const lunarLatitude = calculateLunarLatitude(daysFromBase);
    
    // Adjust moon position with maslul correction
    const correctedMoonLongitude = (moonLongitude + moonMaslulCorrection) % 360;
    
    // Moon's position in constellation
    const moonConstellation = Math.floor(correctedMoonLongitude / 30);
    const moonPositionInConstellation = correctedMoonLongitude % 30;
    
    // Calculate lunar visibility parameters
    const elongation = (correctedMoonLongitude - correctedSunLongitude + 360) % 360;
    const firstVisibilityAngle = calculateFirstVisibility(elongation, lunarLatitude);
    const isVisible = firstVisibilityAngle > 12; // Default threshold if VISIBILITY_THRESHOLD is undefined
    
    // Moon phase calculation
    let moonPhase = "";
    if (elongation < 90) {
      moonPhase = "Waxing Crescent";
    } else if (elongation < 180) {
      moonPhase = "Waxing Gibbous";
    } else if (elongation < 270) {
      moonPhase = "Waning Gibbous";
    } else {
      moonPhase = "Waning Crescent";
    }
    
    // For new moon detection
    const isNearNewMoon = elongation < 10 || elongation > 350;
    
    // Calculate seasonal information
    const seasonInfo = calculateSeasonalInfo(daysFromBase);
    
    // Return the complete set of calculations
    return {
      sun: {
        meanLongitude: sunLongitude.toFixed(2),
        constellation: CONSTANTS.CONSTELLATIONS[sunConstellation],
        positionInConstellation: sunPositionInConstellation.toFixed(2),
        apogee: apogeePosition.toFixed(2),
        maslul: maslul.toFixed(2),
        maslulCorrection: maslulCorrection.toFixed(2),
        trueLongitude: correctedSunLongitude.toFixed(2),
      },
      moon: {
        meanLongitude: moonLongitude.toFixed(2),
        correctedLongitude: correctedMoonLongitude.toFixed(2),
        constellation: CONSTANTS.CONSTELLATIONS[moonConstellation],
        positionInConstellation: moonPositionInConstellation.toFixed(2),
        maslul: moonMaslul.toFixed(2),
        maslulCorrection: moonMaslulCorrection.toFixed(2),
        elongation: elongation.toFixed(2),
        latitude: lunarLatitude.toFixed(2),
        firstVisibilityAngle: firstVisibilityAngle.toFixed(2),
        isVisible: isVisible,
        phase: moonPhase,
        isNearNewMoon
      },
      season: seasonInfo
    };
  };
  
  const data = calculateData(date);
  
  return (
    <div className="astronomical-calculations">
      <h3>Astronomical Calculations</h3>
      
      <div className="calculation-section">
        <h4>Sun Position</h4>
        <table>
          <tbody>
            <tr>
              <td>Mean Longitude:</td>
              <td>{data.sun.meanLongitude}°</td>
            </tr>
            <tr>
              <td>True Longitude:</td>
              <td>{data.sun.trueLongitude}°</td>
            </tr>
            <tr>
              <td>Apogee (גובה):</td>
              <td>{data.sun.apogee}°</td>
            </tr>
            <tr>
              <td>Maslul (מסלול):</td>
              <td>{data.sun.maslul}°</td>
            </tr>
            <tr>
              <td>Correction (מנת המסלול):</td>
              <td>{data.sun.maslulCorrection}°</td>
            </tr>
            <tr>
              <td>Constellation:</td>
              <td>{data.sun.constellation} ({data.sun.positionInConstellation}°)</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="calculation-section">
        <h4>Moon Position</h4>
        <table>
          <tbody>
            <tr>
              <td>Mean Longitude:</td>
              <td>{data.moon.meanLongitude}°</td>
            </tr>
            <tr>
              <td>Maslul (מסלול):</td>
              <td>{data.moon.maslul}°</td>
            </tr>
            <tr>
              <td>Correction (מנת המסלול):</td>
              <td>{data.moon.maslulCorrection}°</td>
            </tr>
            <tr>
              <td>True Longitude:</td>
              <td>{data.moon.correctedLongitude}°</td>
            </tr>
            <tr>
              <td>Latitude (רוחב):</td>
              <td>{data.moon.latitude}°</td>
            </tr>
            <tr>
              <td>Constellation:</td>
              <td>{data.moon.constellation} ({data.moon.positionInConstellation}°)</td>
            </tr>
            <tr>
              <td>Phase:</td>
              <td>{data.moon.phase}</td>
            </tr>
            <tr>
              <td>Elongation (אורך ראשון):</td>
              <td>{data.moon.elongation}°</td>
            </tr>
            <tr>
              <td>Visibility Angle:</td>
              <td>{data.moon.firstVisibilityAngle}°</td>
            </tr>
            <tr>
              <td>Potentially Visible:</td>
              <td>{data.moon.isVisible ? '✓' : '✗'}</td>
            </tr>
          </tbody>
        </table>
        
        {data.moon.isNearNewMoon && (
          <div className="new-moon-alert">
            <p>⚠️ Near New Moon! Potential beginning of new Hebrew month.</p>
            <p>See Knowledge Base section on Moon Visibility (Kidush Hachodesh).</p>
          </div>
        )}
      </div>
      
      <div className="calculation-section">
        <h4>Seasonal Information (תקופות)</h4>
        <table>
          <tbody>
            <tr>
              <td>Current Season:</td>
              <td>{data.season.currentSeason}</td>
            </tr>
            <tr>
              <td>Days until next season:</td>
              <td>{data.season.daysUntilNextSeason}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Calculate lunar latitude (deviation from ecliptic)
const calculateLunarLatitude = (daysFromBase) => {
  // Based on Rambam's method for calculating lunar latitude
  const latitudeCycle = 27.32166; // Draconic month in days
  const maxLatitude = 5.0; // Maximum latitude in degrees
  
  // Calculate phase in the cycle
  const phase = (daysFromBase % latitudeCycle) / latitudeCycle;
  
  // Sinusoidal approximation of latitude
  return maxLatitude * Math.sin(2 * Math.PI * phase);
};

// Calculate first visibility angle
const calculateFirstVisibility = (elongation, latitude) => {
  // Simplified calculation based on elongation and latitude
  // This is an approximation of the complex visibility calculation
  return elongation + 0.3 * Math.abs(latitude);
};

// Calculate seasonal information
const calculateSeasonalInfo = (daysFromBase) => {
  const solarYear = 365.25; // Approximate solar year length
  const seasonLength = solarYear / 4;
  
  // Calculate position in the year
  const yearPosition = (daysFromBase % solarYear) / solarYear;
  const dayInYear = Math.floor(daysFromBase % solarYear);
  
  // Determine current season
  let season = '';
  let daysUntilNextSeason = 0;
  
  if (yearPosition < 0.25) {
    season = 'Spring';
    daysUntilNextSeason = Math.ceil(seasonLength - (dayInYear % seasonLength));
  } else if (yearPosition < 0.5) {
    season = 'Summer';
    daysUntilNextSeason = Math.ceil(seasonLength - (dayInYear % seasonLength));
  } else if (yearPosition < 0.75) {
    season = 'Fall';
    daysUntilNextSeason = Math.ceil(seasonLength - (dayInYear % seasonLength));
  } else {
    season = 'Winter';
    daysUntilNextSeason = Math.ceil(seasonLength - (dayInYear % seasonLength));
  }
  
  return {
    currentSeason: season,
    daysUntilNextSeason: daysUntilNextSeason
  };
};

export default AstronomicalCalculations; 