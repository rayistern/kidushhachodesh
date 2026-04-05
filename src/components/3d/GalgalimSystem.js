import React, { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import GalgalSphere from './GalgalSphere';
import EpicycleRing from './EpicycleRing';
import SunMarker from './SunMarker';
import MoonMarker from './MoonMarker';
import { 
  GALGALIM, 
  COLORS, 
  TOOLTIP_CONTENT
} from './constants';

/**
 * GalgalimSystem - Complete Rambam/Ptolemaic celestial model
 * 
 * Combines all galgalim (celestial spheres) and epicycles into a cohesive 3D system:
 * - Sun's deferent and epicycle
 * - Moon's deferent and two epicycles (including inclined Galgal Noteh)
 * - Eccentric offsets for both sun and moon
 * - True positions calculated from astronomical data
 */
const GalgalimSystem = ({ 
  date,
  astronomicalData,
  isAnimating = true,
  onObjectHover = null,
  ...props 
}) => {
  const { viewport } = useThree();
  
  // Responsive segment count
  const segments = useMemo(() => {
    if (viewport.width < 10) return 16; // Mobile
    if (viewport.width < 15) return 32; // Tablet
    return 64; // Desktop
  }, [viewport.width]);
  
  // Extract astronomical data
  const { sun, moon } = astronomicalData || {};
  
  // Calculate positions based on astronomical data
  const positions = useMemo(() => {
    if (!sun || !moon) return null;
    
    // Convert longitude to radians
    const sunLonRad = (parseFloat(sun.trueLongitude) * Math.PI) / 180;
    const moonLonRad = (parseFloat(moon.correctedLongitude) * Math.PI) / 180;
    
    // Sun position on its deferent circle
    const sunDeferentRadius = GALGALIM.SUN.DEFERENT.RADIUS;
    const sunX = Math.cos(sunLonRad) * sunDeferentRadius;
    const sunZ = Math.sin(sunLonRad) * sunDeferentRadius;
    
    // Sun's epicycle center (offset by eccentricity)
    const sunEccentricOffset = 2; // Simplified - should come from constants
    const sunEpicycleX = sunX + Math.cos(sunLonRad) * sunEccentricOffset;
    const sunEpicycleZ = sunZ + Math.sin(sunLonRad) * sunEccentricOffset;
    
    // Moon position
    const moonDeferentRadius = GALGALIM.MOON.DEFERENT.RADIUS;
    const moonX = Math.cos(moonLonRad) * moonDeferentRadius;
    const moonZ = Math.sin(moonLonRad) * moonDeferentRadius;
    
    return {
      sun: { x: sunX, y: 0, z: sunZ },
      sunEpicycleCenter: { x: sunEpicycleX, y: 0, z: sunEpicycleZ },
      moon: { x: moonX, y: 0, z: moonZ },
    };
  }, [sun, moon]);
  
  if (!positions) return null;
  
  return (
    <group {...props}>
      {/* ============== SUN SYSTEM ============== */}
      <group name="sun-system">
        {/* Sun's deferent sphere (Galgal Gadol) */}
        <GalgalSphere
          radius={GALGALIM.SUN.DEFERENT.RADIUS}
          color={COLORS.SUN_GALGAL}
          opacity={GALGALIM.SUN.DEFERENT.OPACITY}
          segments={segments}
          labelHe={GALGALIM.SUN.DEFERENT.LABEL_HE}
          labelEn={GALGALIM.SUN.DEFERENT.LABEL_EN}
          onHover={onObjectHover}
          tooltipData={TOOLTIP_CONTENT.SUN_DEFERENT}
        />
        
        {/* Sun's epicycle */}
        <EpicycleRing
          radius={GALGALIM.SUN.DEFERENT.RADIUS * GALGALIM.SUN.EPICYCLE.RADIUS_RATIO}
          color={COLORS.SUN_EPICYCLE}
          position={[positions.sunEpicycleCenter.x, 0, positions.sunEpicycleCenter.z]}
          revolutionPeriod={GALGALIM.SUN.EPICYCLE.REVOLUTION_PERIOD}
          isAnimating={isAnimating}
          labelHe="גלגל קטן"
          labelEn="Sun's Epicycle"
          onHover={onObjectHover}
          tooltipData={TOOLTIP_CONTENT.SUN_EPICYCLE}
        />
        
        {/* Sun marker at true position */}
        <SunMarker
          position={[positions.sun.x, 0, positions.sun.z]}
          longitude={parseFloat(sun?.trueLongitude || 0)}
          constellation={sun?.constellation || ''}
          onHover={onObjectHover}
        />
      </group>
      
      {/* ============== MOON SYSTEM ============== */}
      <group name="moon-system">
        {/* Moon's deferent sphere (Galgal Gadol) */}
        <GalgalSphere
          radius={GALGALIM.MOON.DEFERENT.RADIUS}
          color={COLORS.MOON_GALGAL}
          opacity={GALGALIM.MOON.DEFERENT.OPACITY}
          segments={segments}
          labelHe={GALGALIM.MOON.DEFERENT.LABEL_HE}
          labelEn={GALGALIM.MOON.DEFERENT.LABEL_EN}
          onHover={onObjectHover}
          tooltipData={TOOLTIP_CONTENT.MOON_DEFERENT}
        />
        
        {/* Moon's first epicycle (Galgal Katan) */}
        <EpicycleRing
          radius={GALGALIM.MOON.DEFERENT.RADIUS * GALGALIM.MOON.FIRST_EPICYCLE.RADIUS_RATIO}
          color={COLORS.MOON_EPICYCLE_1}
          position={[positions.moon.x * 0.9, 0, positions.moon.z * 0.9]}
          revolutionPeriod={GALGALIM.MOON.FIRST_EPICYCLE.REVOLUTION_PERIOD}
          isAnimating={isAnimating}
          labelHe={GALGALIM.MOON.FIRST_EPICYCLE.LABEL_HE}
          labelEn={GALGALIM.MOON.FIRST_EPICYCLE.LABEL_EN}
          onHover={onObjectHover}
          tooltipData={TOOLTIP_CONTENT.MOON_EPICYCLE_1}
        />
        
        {/* Moon's second epicycle (Galgal Noteh) - with 5° inclination */}
        <EpicycleRing
          radius={GALGALIM.MOON.DEFERENT.RADIUS * GALGALIM.MOON.SECOND_EPICYCLE.RADIUS_RATIO}
          color={COLORS.MOON_EPICYCLE_2}
          position={[positions.moon.x * 0.85, 0, positions.moon.z * 0.85]}
          rotation={[0, 0, (GALGALIM.MOON.SECOND_EPICYCLE.INCLINATION_DEG * Math.PI) / 180]}
          revolutionPeriod={GALGALIM.MOON.SECOND_EPICYCLE.REVOLUTION_PERIOD}
          isAnimating={isAnimating}
          labelHe={GALGALIM.MOON.SECOND_EPICYCLE.LABEL_HE}
          labelEn={GALGALIM.MOON.SECOND_EPICYCLE.LABEL_EN}
          onHover={onObjectHover}
          tooltipData={TOOLTIP_CONTENT.MOON_EPICYCLE_2}
        />
        
        {/* Moon marker at true position */}
        <MoonMarker
          position={[positions.moon.x, 0, positions.moon.z]}
          longitude={parseFloat(moon?.correctedLongitude || 0)}
          latitude={parseFloat(moon?.latitude || 0)}
          elongation={parseFloat(moon?.elongation || 0)}
          phase={moon?.phase || 'New Moon'}
          constellation={moon?.constellation || ''}
          isVisible={moon?.isVisible || false}
          onHover={onObjectHover}
        />
      </group>
      
      {/* Connection lines (optional visual aid) */}
      <group name="connection-lines">
        {/* Line from Earth to Sun */}
        <mesh>
          <cylinderGeometry 
            args={[0.02, 0.02, GALGALIM.SUN.DEFERENT.RADIUS, 8]} 
          />
          <meshBasicMaterial 
            color={COLORS.SUN_GALGAL} 
            transparent 
            opacity={0.2} 
          />
          <position x={positions.sun.x / 2} y={0} z={positions.sun.z / 2} />
          <rotation z={Math.atan2(positions.sun.z, positions.sun.x) - Math.PI / 2} />
        </mesh>
        
        {/* Line from Earth to Moon */}
        <mesh>
          <cylinderGeometry 
            args={[0.015, 0.015, GALGALIM.MOON.DEFERENT.RADIUS, 8]} 
          />
          <meshBasicMaterial 
            color={COLORS.MOON_GALGAL} 
            transparent 
            opacity={0.2} 
          />
          <position x={positions.moon.x / 2} y={0} z={positions.moon.z / 2} />
          <rotation z={Math.atan2(positions.moon.z, positions.moon.x) - Math.PI / 2} />
        </mesh>
      </group>
    </group>
  );
};

export default GalgalimSystem;
