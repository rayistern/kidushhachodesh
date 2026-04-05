import React, { useState, useCallback, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';

// Component imports
import EarthGlobe from './EarthGlobe';
import GalgalimSystem from './GalgalimSystem';
import ZodiacRing from './ZodiacRing';
import CameraControls, { CAMERA_PRESETS } from './CameraControls';

// Constants
import { STARS, COLORS } from './constants';

/**
 * LoadingScreen - Displayed while 3D assets load
 */
const LoadingScreen = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="scene-loader">
        <div className="loader-spinner" />
        <p>Loading celestial spheres... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
};

/**
 * StarField - Background stars using Drei component
 */
const StarField = () => (
  <Stars
    radius={STARS.RADIUS}
    depth={STARS.DEPTH}
    count={STARS.COUNT}
    factor={STARS.FACTOR}
    saturation={STARS.SATURATION}
    fade={STARS.FADE}
  />
);

/**
 * SceneLighting - Optimized lighting setup
 */
const SceneLighting = () => (
  <>
    {/* Ambient light for base visibility */}
    <ambientLight intensity={0.3} />
    
    {/* Main directional light (simulating sun) */}
    <directionalLight
      position={[10, 20, 10]}
      intensity={1}
      castShadow
      shadow-mapSize={[2048, 2048]}
    />
    
    {/* Fill light from opposite side */}
    <directionalLight
      position={[-10, 10, -10]}
      intensity={0.3}
      color="#8080ff"
    />
    
    {/* Subtle rim light */}
    <pointLight
      position={[0, -10, 0]}
      intensity={0.2}
      color="#ffaa00"
    />
  </>
);

/**
 * MainScene - The complete 3D celestial visualization
 */
const MainScene = ({
  date,
  astronomicalData,
  isAnimating = true,
  showZodiac = true,
  onObjectHover,
  cameraPreset = 'OVERVIEW',
  ...props
}) => {
  // Track hovered object for tooltip
  const [hoveredObject, setHoveredObject] = useState(null);
  
  // Handle object hover with callback
  const handleObjectHover = useCallback((data) => {
    setHoveredObject(data);
    if (onObjectHover) {
      onObjectHover(data);
    }
  }, [onObjectHover]);

  return (
    <group {...props}>
      {/* Lighting */}
      <SceneLighting />
      
      {/* Background stars */}
      <StarField />
      
      {/* Ecliptic plane grid (subtle) */}
      <gridHelper
        args={[100, 50, '#333333', '#222222']}
        position={[0, -10, 0]}
        rotation={[0, 0, 0]}
      />
      
      {/* Earth at center with 23.5° tilt */}
      <EarthGlobe
        onHover={handleObjectHover}
        showLabels={true}
      />
      
      {/* Complete galgalim system */}
      <GalgalimSystem
        date={date}
        astronomicalData={astronomicalData}
        isAnimating={isAnimating}
        onObjectHover={handleObjectHover}
      />
      
      {/* Zodiac ring */}
      {showZodiac && (
        <ZodiacRing
          onHover={handleObjectHover}
        />
      )}
      
      {/* Camera controls with presets */}
      <CameraControls
        initialPreset={cameraPreset}
        enableAutoRotate={false}
      />
    </group>
  );
};

/**
 * Scene3D - Main wrapper component
 * 
 * Props:
 * - date: Current selected date
 * - astronomicalData: Calculated sun/moon positions
 * - isAnimating: Whether epicycles should rotate
 * - showZodiac: Whether to show zodiac ring
 * - onObjectHover: Callback when user hovers over an object
 * - cameraPreset: Initial camera position preset
 * - style: Additional CSS styles for the canvas
 */
const Scene3D = ({
  date,
  astronomicalData,
  isAnimating = true,
  showZodiac = true,
  onObjectHover,
  cameraPreset = 'OVERVIEW',
  style = {},
  ...props
}) => {
  // Canvas configuration
  const canvasProps = {
    camera: {
      position: CAMERA_PRESETS[cameraPreset]?.position || [0, 30, 50],
      fov: CAMERA_PRESETS[cameraPreset]?.fov || 50,
    },
    gl: {
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    },
    dpr: [1, 2], // Responsive device pixel ratio
    style: {
      background: `radial-gradient(circle, ${COLORS.BACKGROUND_GRADIENT_START} 0%, ${COLORS.BACKGROUND_GRADIENT_END} 100%)`,
      borderRadius: '12px',
      ...style,
    },
    ...props,
  };

  return (
    <Canvas {...canvasProps}>
      <React.Suspense fallback={<LoadingScreen />}>
        <MainScene
          date={date}
          astronomicalData={astronomicalData}
          isAnimating={isAnimating}
          showZodiac={showZodiac}
          onObjectHover={onObjectHover}
          cameraPreset={cameraPreset}
        />
      </React.Suspense>
    </Canvas>
  );
};

export default Scene3D;
