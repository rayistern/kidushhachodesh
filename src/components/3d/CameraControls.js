import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { CAMERA_PRESETS, ANIMATION } from './constants';

/**
 * CameraControls - Advanced camera management for the 3D scene
 * 
 * Features:
 * - Smooth camera transitions between preset views
 * - OrbitControls for user interaction (zoom, pan, rotate)
 * - Camera preset buttons (Overview, Earth, Sun System, etc.)
 * - Smooth animated transitions between positions
 */
const CameraControls = ({
  initialPreset = 'OVERVIEW',
  enableAutoRotate = false,
  autoRotateSpeed = 0.5,
  onCameraChange = null,
  ...props
}) => {
  const { camera } = useThree();
  const controlsRef = useRef();
  
  // Track current preset and animation state
  const [currentPreset, setCurrentPreset] = useState(initialPreset);
  const [targetPosition, setTargetPosition] = useState(null);
  const [targetLookAt, setTargetLookAt] = useState(null);
  
  // Initialize camera from preset
  useEffect(() => {
    const preset = CAMERA_PRESETS[initialPreset];
    if (preset) {
      camera.position.set(...preset.position);
      camera.fov = preset.fov;
      camera.updateProjectionMatrix();
      
      if (controlsRef.current) {
        controlsRef.current.target.set(...preset.target);
        controlsRef.current.update();
      }
    }
  }, [camera, initialPreset]);
  
  // Smooth camera transition animation
  useFrame(() => {
    if (targetPosition && controlsRef.current) {
      // Smoothly interpolate camera position
      camera.position.lerp(
        new THREE.Vector3(...targetPosition),
        ANIMATION.CAMERA_TRANSITION_SPEED
      );
      
      // Smoothly interpolate target (look-at point)
      controlsRef.current.target.lerp(
        new THREE.Vector3(...targetLookAt),
        ANIMATION.CAMERA_TRANSITION_SPEED
      );
      
      controlsRef.current.update();
      
      // Check if we've reached the target (approximate)
      const distToTarget = camera.position.distanceTo(new THREE.Vector3(...targetPosition));
      if (distToTarget < 0.1) {
        setTargetPosition(null);
        setTargetLookAt(null);
      }
    }
  });
  
  // Function to move to a preset
  const moveToPreset = (presetName) => {
    const preset = CAMERA_PRESETS[presetName];
    if (!preset) return;
    
    setCurrentPreset(presetName);
    setTargetPosition(preset.position);
    setTargetLookAt(preset.target);
    
    // Update FOV if different
    if (preset.fov !== camera.fov) {
      camera.fov = preset.fov;
      camera.updateProjectionMatrix();
    }
    
    if (onCameraChange) {
      onCameraChange(presetName, preset);
    }
  };
  
  // Reset to default view
  const resetView = () => {
    moveToPreset('OVERVIEW');
  };
  
  // Focus on specific object
  const focusOnObject = (objectPosition, distance = 10) => {
    const direction = new THREE.Vector3(...objectPosition).normalize();
    const newPosition = direction.multiplyScalar(distance);
    
    setTargetPosition([newPosition.x, newPosition.y, newPosition.z]);
    setTargetLookAt(objectPosition);
    setCurrentPreset('CUSTOM');
  };

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={100}
        autoRotate={enableAutoRotate}
        autoRotateSpeed={autoRotateSpeed}
        enableDamping={true}
        dampingFactor={0.05}
        {...props}
      />
      
      {/* Preset Buttons UI - rendered via React Three Fiber Html */}
      {/* Note: In actual implementation, these would be React DOM elements */}
      {/* overlaying the canvas, not inside the 3D scene */}
    </>
  );
};

// Export presets and helper functions
export { CAMERA_PRESETS };
export default CameraControls;
