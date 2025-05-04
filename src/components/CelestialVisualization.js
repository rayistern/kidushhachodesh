import React, { useEffect, useRef, useState, useCallback } from 'react';
import './CelestialVisualization.css';
import { CONSTANTS, GALGALIM_INFO, GALGAL_NOTEH_INCLINATION_DEG } from '../constants';
import { getHebrewDate, getMoladInfo, getHebrewDateDisplay, getMoladDisplay } from '../utils/dateUtils';
import { getAscendingNodeLongitude } from '../utils/astronomy';

const CelestialVisualization = ({ date, onDateChange, onTooltipChange }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const dateRef = useRef(date);
  const [tooltipInfo, setTooltipInfo] = useState(null);
  const [hoveredObject, setHoveredObject] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewRotation, setViewRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationTarget, setAnimationTarget] = useState(null);
  
  // Add this at the component level, with other refs
  const tooltipTimeoutRef = useRef(null);
  
  // Force re-render when date changes
  useEffect(() => {
    dateRef.current = date;
    drawCanvas();
  }, [date]);
  
  // Draw the canvas with current date
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Keep the sun radius the same
    const sunRadius = Math.min(width, height) * 0.42;
    
    // Increase the moon radius to move it away from Earth
    const moonRadius = Math.min(width, height) * 0.20; // From 0.12 to 0.20
    
    // Calculate positions based on current date WITH width and height
    const positions = calculatePositions(dateRef.current, width, height);
    
    // Store positions on canvas element for tooltip reference
    canvas.positions = positions;
    
    // Apply transformations
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);
    ctx.rotate(viewRotation.y * Math.PI / 180);
    ctx.translate(-width / 2, -height / 2);
    
    // Draw constellations circle
    const zodiacRadius = Math.min(width, height) * 0.35; // Radius for zodiac circle
      ctx.beginPath();
    ctx.arc(width / 2, height / 2, zodiacRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(100, 120, 255, 0.2)';
    ctx.setLineDash([2, 3]);
      ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw constellation marks on zodiac
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30) * Math.PI / 180;
      const x = width / 2 + zodiacRadius * Math.cos(angle);
      const y = height / 2 + zodiacRadius * Math.sin(angle);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw constellation name
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const labelX = width / 2 + (zodiacRadius + 15) * Math.cos(angle);
      const labelY = height / 2 + (zodiacRadius + 15) * Math.sin(angle);
      ctx.fillText(CONSTANTS.CONSTELLATIONS[i], labelX, labelY);
    }
    
    // Draw sun's eccentric circle (deferent)
    ctx.beginPath();
    ctx.arc(
      positions.eccentricCenter.x,
      positions.eccentricCenter.y,
      positions.sunDeferent.radius,
      0, 2 * Math.PI
    );
    ctx.strokeStyle = 'rgba(255, 180, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw sun's epicycle
    const epicycleRadius = positions.sunDeferent.radius * CONSTANTS.SUN.EPICYCLE.RADIUS_RATIO;
    ctx.beginPath();
    ctx.arc(
      positions.sunEpicycleCenter.x,
      positions.sunEpicycleCenter.y,
      epicycleRadius,
      0, 2 * Math.PI
    );
    ctx.strokeStyle = 'rgba(255, 180, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw eccentric center
    ctx.beginPath();
    ctx.arc(
      positions.eccentricCenter.x, 
      positions.eccentricCenter.y, 
      positions.eccentricCenter.radius, 
      0, 2 * Math.PI
    );
    ctx.fillStyle = 'rgba(255, 100, 0, 0.6)';
    ctx.fill();
    
    // Draw epicycle center
    ctx.beginPath();
    ctx.arc(
      positions.sunEpicycleCenter.x, 
      positions.sunEpicycleCenter.y, 
      positions.sunEpicycleCenter.radius, 
      0, 2 * Math.PI
    );
    ctx.fillStyle = 'rgba(255, 150, 0, 0.6)';
    ctx.fill();
    
    // Connect centers with line to show relationship
    ctx.beginPath();
    ctx.moveTo(positions.earth.x, positions.earth.y);
    ctx.lineTo(positions.eccentricCenter.x, positions.eccentricCenter.y);
    ctx.lineTo(positions.sunEpicycleCenter.x, positions.sunEpicycleCenter.y);
    ctx.lineTo(positions.sun.x, positions.sun.y);
    ctx.strokeStyle = 'rgba(255, 150, 0, 0.3)';
    ctx.setLineDash([2, 2]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw moon's orbit with the adjusted radius
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, moonRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(200, 200, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw earth
    ctx.beginPath();
    ctx.arc(
      positions.earth.x, 
      positions.earth.y, 
      positions.earth.radius, 
      0, 2 * Math.PI
    );
    ctx.fillStyle = '#3080FF';
    ctx.fill();
    ctx.strokeStyle = '#80C0FF';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw sun
    ctx.beginPath();
    ctx.arc(
      positions.sun.x, 
      positions.sun.y, 
      positions.sun.radius, 
      0, 2 * Math.PI
    );
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    
    // Add sun glow
    const sunGlow = ctx.createRadialGradient(
      positions.sun.x, positions.sun.y, positions.sun.radius,
      positions.sun.x, positions.sun.y, positions.sun.radius * 2
    );
    sunGlow.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
    sunGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
    
    ctx.beginPath();
    ctx.arc(
      positions.sun.x, 
      positions.sun.y, 
      positions.sun.radius * 2, 
      0, 2 * Math.PI
    );
    ctx.fillStyle = sunGlow;
    ctx.fill();
    
    // Draw moon's eccentric circle
    ctx.beginPath();
    ctx.arc(
      positions.moonEccentricCenter.x,
      positions.moonEccentricCenter.y,
      moonRadius,
      0, 2 * Math.PI
    );
    ctx.strokeStyle = 'rgba(150, 150, 255, 0.2)';
    ctx.lineWidth = 2; // Slightly thicker line for better visibility
    ctx.stroke();
    
    // Store the moonRadius on the canvas for hit detection
    canvas.moonRadius = moonRadius;

    // Draw the centers as small dots, not filled circles
    // For moonEccentricCenter
    ctx.beginPath();
    ctx.arc(
      positions.moonEccentricCenter.x,
      positions.moonEccentricCenter.y,
      4, // Small radius
      0, 2 * Math.PI
    );
    ctx.fillStyle = 'rgba(150, 150, 255, 0.8)';
    ctx.fill();
    
    // Draw moon's deferent circle
    ctx.beginPath();
    ctx.arc(
      positions.moonDeferentCenter.x,
      positions.moonDeferentCenter.y,
      moonRadius * 0.8,
      0, 2 * Math.PI
    );
    ctx.strokeStyle = 'rgba(150, 150, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw moon's first epicycle
    ctx.beginPath();
    ctx.arc(
      positions.moonFirstEpicycleCenter.x,
      positions.moonFirstEpicycleCenter.y,
      moonRadius * CONSTANTS.MOON.GALGALIM.FIRST_EPICYCLE.RADIUS_RATIO,
      0, 2 * Math.PI
    );
    ctx.strokeStyle = 'rgba(150, 150, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw moon's second epicycle
    ctx.beginPath();
    ctx.arc(
      positions.moonSecondEpicycleCenter.x,
      positions.moonSecondEpicycleCenter.y,
      moonRadius * CONSTANTS.MOON.GALGALIM.SECOND_EPICYCLE.RADIUS_RATIO,
      0, 2 * Math.PI
    );
    ctx.strokeStyle = 'rgba(150, 150, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Optional: Draw connecting lines to show relationships between circles
    ctx.beginPath();
    ctx.moveTo(positions.earth.x, positions.earth.y);
    ctx.lineTo(positions.moonEccentricCenter.x, positions.moonEccentricCenter.y);
    ctx.lineTo(positions.moonDeferentCenter.x, positions.moonDeferentCenter.y);
    ctx.lineTo(positions.moonFirstEpicycleCenter.x, positions.moonFirstEpicycleCenter.y);
    ctx.lineTo(positions.moonSecondEpicycleCenter.x, positions.moonSecondEpicycleCenter.y);
    ctx.lineTo(positions.moon.x, positions.moon.y);
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)';
    ctx.setLineDash([2, 2]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    /* ------------------------------------------------------------------
       Helper – draw a small radial "tick" that shows the galgal's
       current orientation.  Five-pixel length by default.
    ------------------------------------------------------------------ */
    const drawGalgalTick = (
      c, cx, cy, radius, angle,
      length = 5,
      color  = 'rgba(255,255,255,0.7)'
    ) => {
      const inner = radius - length;
      c.beginPath();
      c.moveTo(
        cx + inner * Math.cos(angle),
        cy + inner * Math.sin(angle)
      );
      c.lineTo(
        cx + radius * Math.cos(angle),
        cy + radius * Math.sin(angle)
      );
      c.strokeStyle = color;
      c.lineWidth   = 1;
      c.stroke();
    };
    
    /* --------------------------------------------------------------
       Draw orientation-ticks for each galgal to visualize rotation
    -------------------------------------------------------------- */
    // Draw one tick for each of the four galgalim
    ['galgalSunDefer','galgalMoonDefer','galgalMoonFirstEpi','galgalMoonSecondEpi']
      .forEach(key => {
        const g = positions[key];
        if (g) {
          drawGalgalTick(ctx, g.centerX, g.centerY, g.radius, g.angle);
        }
      });
    
    // Draw moon with phase representation
    ctx.beginPath();
    ctx.arc(
      positions.moon.x, 
      positions.moon.y, 
      positions.moon.radius, 
      0, 2 * Math.PI
    );
    ctx.fillStyle = positions.moon.data.fill;
    ctx.fill();
    
    // Restore context
    ctx.restore();
  }, [zoom, viewRotation]);
  
  // Calculate positions based on date
  const calculatePositions = (currentDate, width, height) => {
    const baseDate = CONSTANTS.BASE_DATE;
    const daysFromBase = Math.floor((currentDate - baseDate) / (1000 * 60 * 60 * 24));
    
    // Setup dimensions and scale constants
    const centerX = width / 2;
    const centerY = height / 2;
    const sunRadius = Math.min(width, height) * 0.42; // Increased from 0.3
    
    // Move the Moon further from Earth by increasing its radius
    const moonRadius = Math.min(width, height) * 0.20; // From 0.12 to 0.20
    
    // Calculate astronomical parameters
    
    // Convert sun's mean motion to decimal degrees
    const sunMeanMotionDegrees = CONSTANTS.SUN.MEAN_MOTION_PER_DAY.degrees + 
                                CONSTANTS.SUN.MEAN_MOTION_PER_DAY.minutes / 60 + 
                                CONSTANTS.SUN.MEAN_MOTION_PER_DAY.seconds / 3600;

    // Calculate sun's mean position
    const sunLongitude = (CONSTANTS.SUN.START_POSITION.degrees + 
                         CONSTANTS.SUN.START_POSITION.minutes / 60 + 
                         CONSTANTS.SUN.START_POSITION.seconds / 3600 + 
                         (sunMeanMotionDegrees * daysFromBase)) % 360;
    
    // Calculate sun's apogee (govah)
    const apogeeStart = CONSTANTS.SUN.APOGEE_START.degrees + 
                        (CONSTANTS.SUN.APOGEE_CONSTELLATION * 30);
    const apogeeLongitude = (apogeeStart + 
                           (CONSTANTS.SUN.APOGEE_MOTION_PER_DAY * daysFromBase)) % 360;
    
    // Calculate maslul (argument of sun)
    let maslul = sunLongitude - apogeeLongitude;
    if (maslul < 0) maslul += 360;
    
    // Calculate maslul correction
    let correction = 0;
    
    // Find correction from table
    for (let i = 0; i < CONSTANTS.MASLUL_CORRECTIONS.length - 1; i++) {
      const current = CONSTANTS.MASLUL_CORRECTIONS[i];
      const next = CONSTANTS.MASLUL_CORRECTIONS[i + 1];
      
      if (maslul >= current.maslul && maslul < next.maslul) {
        // Linear interpolation
        const ratio = (maslul - current.maslul) / (next.maslul - current.maslul);
        correction = current.correction + ratio * (next.correction - current.correction);
        break;
      }
    }
    
    // Basic corrected position (without epicycles)
    let correctedSunLongitude;
    if (maslul <= 180) {
      correctedSunLongitude = (sunLongitude + correction) % 360;
    } else {
      correctedSunLongitude = (sunLongitude - correction) % 360;
      if (correctedSunLongitude < 0) correctedSunLongitude += 360;
    }
    
    // Calculate epicycle position (galgal katan)
    const epicycleAngle = (daysFromBase / CONSTANTS.SUN.EPICYCLE.REVOLUTION_PERIOD * 360 + 
                           CONSTANTS.SUN.EPICYCLE.INITIAL_ANGLE) % 360;
    
    // Calculate eccentric offset
    const eccentricRadians = (CONSTANTS.SUN.ECCENTRIC_ANGLE) * Math.PI / 180;
    const eccentricX = CONSTANTS.SUN.ECCENTRICITY * Math.cos(eccentricRadians);
    const eccentricY = CONSTANTS.SUN.ECCENTRICITY * Math.sin(eccentricRadians);
    
    // Calculate deferent position
    const sunMeanRadians = sunLongitude * Math.PI / 180;
    const deferentX = Math.cos(sunMeanRadians);
    const deferentY = Math.sin(sunMeanRadians);
    
    // Calculate epicycle contribution
    const epicycleRadians = epicycleAngle * Math.PI / 180;
    const epicycleRadius = CONSTANTS.SUN.EPICYCLE.RADIUS_RATIO;
    const epicycleX = epicycleRadius * Math.cos(epicycleRadians);
    const epicycleY = epicycleRadius * Math.sin(epicycleRadians);
    
    // Combine all components for true position
    const sunTrueX = deferentX + epicycleX;
    const sunTrueY = deferentY + epicycleY;
    
    // Calculate final longitude from coordinates
    const finalSunLongitude = (Math.atan2(sunTrueY, sunTrueX) * 180 / Math.PI + 360) % 360;
    
    // Calculate which constellation the sun is in
    const sunConstellation = Math.floor(finalSunLongitude / 30);
    
    // Moon calculations
    // Convert moon's mean motion to decimal degrees
    const moonMeanMotionDegrees = CONSTANTS.MOON.MEAN_MOTION_PER_DAY.degrees + 
                                 CONSTANTS.MOON.MEAN_MOTION_PER_DAY.minutes / 60 + 
                                 CONSTANTS.MOON.MEAN_MOTION_PER_DAY.seconds / 3600;
    
    // Calculate moon's complex position with four galgalim model
    // 1. Calculate basic mean position
    const moonMeanLongitude = (CONSTANTS.MOON.START_POSITION.degrees + 
                            CONSTANTS.MOON.START_POSITION.minutes / 60 + 
                            CONSTANTS.MOON.START_POSITION.seconds / 3600 + 
                            (moonMeanMotionDegrees * daysFromBase)) % 360;

    // 2. Calculate moon's maslul (argument)
    const moonMaslulMotion = CONSTANTS.MOON.MASLUL_MEAN_MOTION.degrees + 
                           CONSTANTS.MOON.MASLUL_MEAN_MOTION.minutes / 60 + 
                           CONSTANTS.MOON.MASLUL_MEAN_MOTION.seconds / 3600;

    const moonMaslul = (CONSTANTS.MOON.MASLUL_START.degrees + 
                        CONSTANTS.MOON.MASLUL_START.minutes / 60 + 
                        CONSTANTS.MOON.MASLUL_START.seconds / 3600 + 
                        (moonMaslulMotion * daysFromBase)) % 360;

    // 3. Calculate moon's mean longitude
    const moonMeanRadians = moonMeanLongitude * Math.PI / 180;

    // 4. Calculate eccentric offset
    const moonEccentricRadians = CONSTANTS.MOON.GALGALIM.ECCENTRIC.ANGLE * Math.PI / 180;
    const moonEccentricX = CONSTANTS.MOON.GALGALIM.ECCENTRIC.ECCENTRICITY * Math.cos(moonEccentricRadians);
    const moonEccentricY = CONSTANTS.MOON.GALGALIM.ECCENTRIC.ECCENTRICITY * Math.sin(moonEccentricRadians);

    // 5. Calculate deferent position (first galgal - gadol)
    const moonDeferentX = Math.cos(moonMeanRadians);
    const moonDeferentY = Math.sin(moonMeanRadians);

    // 6. Calculate first epicycle angle (second galgal - katan)
    const firstEpicycleAngle = (daysFromBase / CONSTANTS.MOON.GALGALIM.FIRST_EPICYCLE.REVOLUTION_PERIOD * 360 + 
                             CONSTANTS.MOON.GALGALIM.FIRST_EPICYCLE.INITIAL_ANGLE) % 360;
    const firstEpicycleRadians = firstEpicycleAngle * Math.PI / 180;

    // 7. Calculate first epicycle contribution
    const firstEpicycleRadius = CONSTANTS.MOON.GALGALIM.FIRST_EPICYCLE.RADIUS_RATIO;
    const firstEpicycleX = firstEpicycleRadius * Math.cos(firstEpicycleRadians);
    const firstEpicycleY = firstEpicycleRadius * Math.sin(firstEpicycleRadians);

    // 8. Calculate second epicycle angle (third galgal - noteh)
    const secondEpicycleAngle = (daysFromBase / CONSTANTS.MOON.GALGALIM.SECOND_EPICYCLE.REVOLUTION_PERIOD * 360 + 
                              CONSTANTS.MOON.GALGALIM.SECOND_EPICYCLE.INITIAL_ANGLE) % 360;
    const secondEpicycleRadians = secondEpicycleAngle * Math.PI / 180;

    // 9. Calculate second epicycle contribution
    const secondEpicycleRadius = CONSTANTS.MOON.GALGALIM.SECOND_EPICYCLE.RADIUS_RATIO;
    const secondEpicycleX = secondEpicycleRadius * Math.cos(secondEpicycleRadians);
    const secondEpicycleY = secondEpicycleRadius * Math.sin(secondEpicycleRadians);

    // 10. Calculate latitude component (deviation from ecliptic)
    const latitudePhase = (daysFromBase % CONSTANTS.MOON.GALGALIM.LATITUDE_CYCLE) / 
                        CONSTANTS.MOON.GALGALIM.LATITUDE_CYCLE;
    const moonLatitude = CONSTANTS.MOON.GALGALIM.INCLINATION * 
                      Math.sin(2 * Math.PI * latitudePhase);

    // 11. Combine all components for true position
    const moonTrueX = (moonDeferentX + firstEpicycleX + secondEpicycleX - moonEccentricX);
    const moonTrueY = (moonDeferentY + firstEpicycleY + secondEpicycleY - moonEccentricY);

    // 12. Calculate final moon longitude from coordinates
    const moonTrueLongitude = (Math.atan2(moonTrueY, moonTrueX) * 180 / Math.PI + 360) % 360;

    // Calculate which constellation the moon is in
    const moonConstellation = Math.floor(moonTrueLongitude / 30);

    // 13. Determine if the moon is visible (approximate calculation)
    const elongation = Math.abs((moonTrueLongitude - finalSunLongitude + 180) % 360 - 180);
    const isVisible = elongation > 12 && Math.abs(moonLatitude) < 6;

    // 14. Calculate moon phase
    let moonPhase = "";
    if (elongation < 45) {
      moonPhase = "New / Waxing Crescent";
    } else if (elongation < 90) {
      moonPhase = "First Quarter";
    } else if (elongation < 135) {
      moonPhase = "Waxing Gibbous";
    } else if (elongation < 225) {
      moonPhase = "Full / Waning Gibbous";
    } else if (elongation < 270) {
      moonPhase = "Last Quarter";
    } else {
      moonPhase = "Waning Crescent";
    }

    // Map the moon's coordinates to canvas coordinates
    const moonScale = 1.0 + 0.1 * (firstEpicycleX + secondEpicycleX); // Scale for distance variations

    // Calculate moon illumination (0 = new moon, 1 = full moon)
    const moonIllumination = (1 - Math.cos(elongation * Math.PI / 180)) / 2;
    // Map illumination to brightness (30% to 100%)
    const minBright = 30;
    const maxBright = 100;
    const brightness = minBright + moonIllumination * (maxBright - minBright);
    const moonFill = `hsl(0, 0%, ${brightness}%)`;

    // Store moon components for visualization
    const positions = {
      // Earth at center
      earth: {
        x: centerX,
        y: centerY,
        radius: 10,
        data: {
          title: "Earth",
          englishName: "Aretz / ארץ",
          description: "Our vantage point for astronomical observations.",
          reference: "Hilchot Kiddush HaChodesh, Chapter 11"
        }
      },
      
      // Sun's eccentric center
      eccentricCenter: {
        x: centerX + eccentricX * sunRadius,
        y: centerY + eccentricY * sunRadius,
        radius: 3,
        data: {
          title: "Eccentric Center",
          englishName: "Galgal Yotze / גלגל יוצא",
          description: "The eccentric center of the sun's orbit, offset from Earth.",
          reference: "Hilchot Kiddush HaChodesh, Chapter 13"
        }
      },
      
      // Sun's deferent circle (should not be visible but used for calculations)
      sunDeferent: {
        x: centerX + eccentricX * sunRadius,
        y: centerY + eccentricY * sunRadius,
        radius: sunRadius,
        data: {
          title: "Sun's Deferent",
          englishName: "Galgal Gadol / גלגל גדול",
          description: "The main circle carrying the sun's epicycle.",
          reference: "Hilchot Kiddush HaChodesh, Chapter 13"
        }
      },
      
      // Sun's epicycle center
      sunEpicycleCenter: {
        x: centerX + eccentricX * sunRadius + deferentX * sunRadius,
        y: centerY + eccentricY * sunRadius + deferentY * sunRadius,
        radius: 4,
        data: {
          title: "Sun's Epicycle Center",
          englishName: "Markaz Galgal Katan / מרכז גלגל קטן",
          description: "The center point of the sun's small circle (epicycle).",
          reference: "Hilchot Kiddush HaChodesh, Chapter 13"
        }
      },
      
      // Sun's final position
      sun: {
        x: centerX + (sunTrueX * sunRadius),
        y: centerY + (sunTrueY * sunRadius),
        radius: 12,
        data: {
          title: "Sun",
          englishName: "Shemesh / שמש",
          longitude: finalSunLongitude.toFixed(2),
          constellation: CONSTANTS.CONSTELLATIONS[sunConstellation],
          maslul: maslul.toFixed(2),
          maslulCorrection: correction.toFixed(2),
          description: "The sun's true position based on all epicycles.",
          reference: "Hilchot Kiddush HaChodesh, Chapter 13"
        }
      },
      
      // Moon's position
      moon: {
        x: centerX + moonTrueX * moonRadius,
        y: centerY + moonTrueY * moonRadius,
        radius: 8 * moonScale, // Variable size based on distance
        data: {
          title: "Moon",
          englishName: "Yareach / ירח",
          longitude: moonTrueLongitude.toFixed(2),
          latitude: moonLatitude.toFixed(2),
          constellation: CONSTANTS.CONSTELLATIONS[moonConstellation],
          phase: moonPhase,
          visibility: isVisible ? "Potentially Visible" : "Not Visible",
          elongation: elongation.toFixed(2),
          fill: moonFill,
          description: "The moon's position as calculated from the Rambam's model.",
          reference: "Hilchot Kiddush HaChodesh, Chapter 17"
        }
      },
      
      // Moon's eccentric center
      moonEccentricCenter: {
        x: centerX + moonEccentricX * moonRadius,
        y: centerY + moonEccentricY * moonRadius,
        radius: 3,
        data: {
          title: "Moon's Eccentric Center",
          englishName: "Galgal Yotze Merkaz / גלגל יוצא מרכז",
          description: "The center of the moon's eccentric orbit, offset from Earth.",
          reference: "Hilchot Kiddush HaChodesh, Chapter 17"
        }
      },
      
      // Moon's deferent center
      moonDeferentCenter: {
        x: centerX + moonEccentricX * moonRadius,
        y: centerY + moonEccentricY * moonRadius,
        radius: 4,
        data: {
          title: "Moon's Deferent Center",
          englishName: "Galgal Gadol / גלגל גדול",
          description: "The primary orbital path of the Moon.",
          reference: "Hilchot Kiddush HaChodesh, Chapter 17"
        }
      },
      
      // Moon's first epicycle center
      moonFirstEpicycleCenter: {
        x: centerX + moonEccentricX * moonRadius,
        y: centerY + moonEccentricY * moonRadius,
        radius: 4,
        data: {
          title: "Moon's First Epicycle Center",
          englishName: "Galgal Katan / גלגל קטן",
          description: "The center point of the moon's first epicycle.",
          reference: "Hilchot Kiddush HaChodesh, Chapter 17"
        }
      },
      
      // Moon's second epicycle center
      moonSecondEpicycleCenter: {
        x: centerX + moonEccentricX * moonRadius,
        y: centerY + moonEccentricY * moonRadius,
        radius: 3,
        data: {
          title: "Moon's Second Epicycle Center",
          englishName: "Galgal Noteh / גלגל נוטה",
          description: "The center point of the moon's second epicycle (inclination circle).",
          reference: "Hilchot Kiddush HaChodesh, Chapter 17"
        }
      },
      
      /* ----------------------------------------------------------
         Galgal objects with current 'angle' so the canvas
         layer can draw ticks that rotate over time.
      ---------------------------------------------------------- */
      galgalSunDefer: {
        centerX: centerX + eccentricX * sunRadius,
        centerY: centerY + eccentricY * sunRadius,
        radius: sunRadius,
        angle: sunMeanRadians          // 0° direction on the deferent
      },
      galgalMoonDefer: {
        centerX: centerX + moonEccentricX * moonRadius,
        centerY: centerY + moonEccentricY * moonRadius,
        radius: moonRadius * 0.8,
        angle: moonMeanRadians
      },
      galgalMoonFirstEpi: {
        centerX: centerX + moonEccentricX * moonRadius,
        centerY: centerY + moonEccentricY * moonRadius,
        radius: moonRadius * CONSTANTS.MOON.GALGALIM.FIRST_EPICYCLE.RADIUS_RATIO,
        angle: firstEpicycleRadians
      },
      galgalMoonSecondEpi: {
        centerX: centerX + moonEccentricX * moonRadius,
        centerY: centerY + moonEccentricY * moonRadius,
        radius: moonRadius * CONSTANTS.MOON.GALGALIM.SECOND_EPICYCLE.RADIUS_RATIO,
        angle: secondEpicycleRadians
      }
    };
    
    return positions;
  };
  
  // Animation loop
  useEffect(() => {
    const animate = () => {
      if (isAnimating && animationTarget) {
        const currentDate = dateRef.current;
        const targetDate = animationTarget;
        
        const timeDiff = targetDate.getTime() - currentDate.getTime();
        
        if (Math.abs(timeDiff) < 86400000) { // Less than one day
          // Animation complete
          onDateChange(targetDate);
          setIsAnimating(false);
          setAnimationTarget(null);
        } else {
          // Continue animation
          const step = timeDiff > 0 ? 86400000 : -86400000; // One day forward or backward
          const newDate = new Date(currentDate.getTime() + step);
          onDateChange(newDate);
        }
      }
      
      // Always draw the canvas
      drawCanvas();
      
      // Continue animation loop
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation loop
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [drawCanvas, isAnimating, animationTarget, onDateChange]);
  
  // Handle mouse interactions
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.positions) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const x = mouseX * (canvas.width / rect.width);
    const y = mouseY * (canvas.height / rect.height);
    
    // Handle dragging first
    if (isDragging) {
      const deltaX = mouseX - dragStart.x;
      const deltaY = mouseY - dragStart.y;
      
      // FLIPPED BEHAVIOR: Normal drag changes date, shift+drag rotates view
      if (!e.shiftKey) {
        // Change date when dragging without shift key
        const dateDelta = Math.floor(deltaX / 3); // Days change per pixels
        if (dateDelta !== 0) {
          const newDate = new Date(dateRef.current.getTime() + dateDelta * 86400000);
          onDateChange(newDate);
          setDragStart({ x: mouseX, y: mouseY });
        }
      } else {
        // Rotate view when dragging with shift key
        setViewRotation({
          x: viewRotation.x + deltaY * 0.5,
          y: viewRotation.y + deltaX * 0.5,
        });
        setDragStart({ x: mouseX, y: mouseY });
      }
      return;
    }
    
    // Clear any existing tooltip timeout
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    
    // Check if mouse is over any object
    let foundObject = null;
    const hitRadius = 10; // Increase hit radius for easier selection
    
    // Define objects to check in order of priority (smaller objects first)
    const objectsToCheck = [
      'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
      'moonSecondEpicycleCenter', 'moonFirstEpicycleCenter', 'moonDeferentCenter', 'moonEccentricCenter',
      'earth'
    ];
    
    // Check each object
    for (const objKey of objectsToCheck) {
      const obj = canvas.positions[objKey];
      if (!obj) continue;
      
      const dx = x - obj.x;
      const dy = y - obj.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= (obj.radius || 5) + hitRadius) {
        foundObject = objKey;
        break;
      }
    }
    
    // Also check for galgalim (circles)
    if (!foundObject) {
      // Check if we're near any of the orbit circles
      const galgalimToCheck = [
        { key: 'galgalMoonEccentric', center: 'earth', radius: canvas.moonRadius },
        { key: 'galgalMoonDefer', center: 'moonEccentricCenter', radius: canvas.moonRadius * 0.8 },
        { key: 'galgalMoonFirstEpi', center: 'moonDeferentCenter', radius: canvas.moonRadius * CONSTANTS.MOON.GALGALIM.FIRST_EPICYCLE.RADIUS_RATIO },
        { key: 'galgalMoonSecondEpi', center: 'moonFirstEpicycleCenter', radius: canvas.moonRadius * CONSTANTS.MOON.GALGALIM.SECOND_EPICYCLE.RADIUS_RATIO }
      ];
      
      for (const galgal of galgalimToCheck) {
        const center = canvas.positions[galgal.center];
        if (!center) continue;
        
        const dx = x - center.x;
        const dy = y - center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if we're near the circle line
        if (Math.abs(distance - galgal.radius) <= hitRadius) {
          foundObject = galgal.key;
          break;
        }
      }
    }
    
    // Update hover state and tooltip
    if (foundObject) {
      setHoveredObject(foundObject);
      
      // Get tooltip info based on the object
      let objData = null;
      if (canvas.positions[foundObject]?.data) {
        objData = canvas.positions[foundObject].data;
      } else if (foundObject?.startsWith('galgal')) {
        objData = GALGALIM_INFO[foundObject];
      }
      
      if (objData) {
        setTooltipInfo(objData);
        if (onTooltipChange) onTooltipChange(objData);
      }
    } else {
      // Set a timeout to hide the tooltip when not hovering over an object
      tooltipTimeoutRef.current = setTimeout(() => {
        setHoveredObject(null);
        setTooltipInfo(null);
        if (onTooltipChange) onTooltipChange(null);
      }, 300); // Short delay before hiding tooltip
    }
  }, [isDragging, onTooltipChange, dragStart, viewRotation, onDateChange]);
  
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoveredObject(null);
    setTooltipInfo(null);
  };
  
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = -Math.sign(e.deltaY) * 0.1;
    setZoom(prev => Math.max(0.5, Math.min(2.5, prev + delta)));
  };
  
  // Move to a specific date with animation
  const animateToDate = (daysToAdd) => {
    const targetDate = new Date(dateRef.current.getTime() + daysToAdd * 86400000);
    setAnimationTarget(targetDate);
    setIsAnimating(true);
  };
  
  // Inside your component
  const hebrewDateDisplay = getHebrewDateDisplay(dateRef.current);
  const moladDisplay = getMoladDisplay(dateRef.current);

  // You can then display this information in your UI or use it for calculations
  
  return (
    <div className="celestial-visualization">
      <div className="controls">
        <button onClick={() => setZoom(prev => Math.min(2, prev + 0.1))} title="Zoom In">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
          </svg>
        </button>
        <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} title="Zoom Out">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M19 13H5v-2h14v2z" fill="currentColor" />
          </svg>
        </button>
        <button onClick={() => setViewRotation({x: 0, y: 0})} title="Reset View">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor" />
          </svg>
        </button>
      </div>
      
      <div className="date-scroll-controls">
        <button className="date-scroll-btn" onClick={() => animateToDate(-365)} title="Back 1 Year">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6 1.41-1.41zM6 6h2v12H6V6z" fill="currentColor" />
          </svg>
        </button>
        <button className="date-scroll-btn" onClick={() => animateToDate(-30)} title="Back 1 Month">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" fill="currentColor" />
          </svg>
        </button>
        <div className="scroll-info">Drag to move time, Shift+drag to rotate</div>
        <button className="date-scroll-btn" onClick={() => animateToDate(30)} title="Forward 1 Month">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor" />
          </svg>
        </button>
        <button className="date-scroll-btn" onClick={() => animateToDate(365)} title="Forward 1 Year">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6-1.41 1.41zM16 6h2v12h-2V6z" fill="currentColor" />
          </svg>
        </button>
      </div>
      
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          width: '100%',
          height: '100%',
          maxHeight: '600px',
          objectFit: 'contain'
        }}
      />
      
      {tooltipInfo && hoveredObject && canvasRef.current && canvasRef.current.positions && (
        <div 
          className="tooltip"
          style={{
            left: hoveredObject.startsWith('galgal') 
              ? `${window.innerWidth / 2 + 100}px` 
              : `${canvasRef.current.positions[hoveredObject].x + 30}px`,
            top: hoveredObject.startsWith('galgal') 
              ? `${window.innerHeight / 2}px` 
              : `${canvasRef.current.positions[hoveredObject].y - 30}px`,
            opacity: 1,
            transition: 'opacity 0.2s ease'
          }}
        >
          <h4>{tooltipInfo.title}</h4>
          {tooltipInfo.englishName && <p>{tooltipInfo.englishName}</p>}
          {tooltipInfo.longitude && <p>Longitude: {tooltipInfo.longitude}°</p>}
          {tooltipInfo.constellation && <p>Constellation: {tooltipInfo.constellation}</p>}
          {tooltipInfo.maslul && <p>Maslul: {tooltipInfo.maslul}°</p>}
          {tooltipInfo.maslulCorrection && <p>Correction: {tooltipInfo.maslulCorrection}°</p>}
          <p>{tooltipInfo.description}</p>
          {tooltipInfo.reference && <p className="reference">{tooltipInfo.reference}</p>}
        </div>
      )}
      
      <div className="date-info-panel">
        <h3>Date Information</h3>
        <p>Gregorian: {dateRef.current.toLocaleDateString()}</p>
        <p>Hebrew: {hebrewDateDisplay.formatted}</p>
        <p>Molad: {moladDisplay.formatted}</p>
      </div>
    </div>
  );
};

export default CelestialVisualization; 