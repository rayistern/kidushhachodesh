import React from 'react';
import './AstronomicalCalculations.css';
import { getAstronomicalData } from '../utils/astronomyCalc';

const AstronomicalCalculations = ({ date }) => {
  const data = getAstronomicalData(date);
  
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

export default AstronomicalCalculations; 