# 3D Digital Props System - Implementation Plan

## Overview
This plan outlines the implementation of a 3D digital props system that replicates Rabbi Losh's physical teaching aids as interactive 3D elements in the Kidush Hachodesh application.

## Goals
1. **Tilted Earth Globe** - 3D Earth with proper 23.5° axial tilt, showing the relationship between Earth's tilt and the ecliptic plane
2. **Clear Galgalim Spheres** - Transparent celestial spheres representing the Ptolemaic/Rambam model
3. **Inlaid Colored Epicycles** - Distinctively colored epicycles nested within the transparent spheres

## Current State Analysis
- **Current Tech**: HTML5 Canvas 2D rendering
- **Current Visualization**: Top-down 2D view with circular orbits
- **Architecture**: React 18 with Create React App
- **Main Component**: `CelestialVisualization.js` (~1000 lines)

---

## Phase 1: Setup and Dependencies

### 1.1 Install Required Packages
```bash
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three  # if using TypeScript
```

### 1.2 Create New Component Structure
```
src/components/3d/
├── index.js                    # Public exports
├── Scene3D.js                  # Main Three.js canvas component
├── EarthGlobe.js               # Tilted Earth with texture
├── GalgalSphere.js             # Reusable transparent sphere component
├── EpicycleRing.js             # Colored epicycle visualization
├── ZodiacRing.js               # 3D zodiac/constellation ring
├── SunMarker.js                # Glowing sun representation
├── MoonMarker.js               # Moon with phase visualization
├── CameraControls.js           # Orbit controls and camera management
├── utils/
│   ├── geometry.js             # 3D geometry helpers
│   └── materials.js            # Shared Three.js materials
└── constants.js                # 3D-specific constants
```

---

## Phase 2: Core 3D Components

### 2.1 Scene3D Component
**File**: `src/components/3d/Scene3D.js`

```javascript
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

const Scene3D = ({ date, astronomicalData }) => {
  return (
    <Canvas
      camera={{ position: [0, 20, 40], fov: 50 }}
      style={{ background: 'radial-gradient(circle, #1a1a2e 0%, #0a0a0a 100%)' }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {/* Stars background */}
      <Stars radius={100} depth={50} count={5000} factor={4} />
      
      {/* Main 3D objects */}
      <EarthGlobe tilt={23.5} />
      <GalgalimSystem date={date} data={astronomicalData} />
      <ZodiacRing radius={25} />
      
      {/* Controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={100}
      />
    </Canvas>
  );
};
```

### 2.2 Earth Globe Component
**File**: `src/components/3d/EarthGlobe.js`

**Features**:
- 23.5° axial tilt (Earth's obliquity)
- Simple texture or procedural shading
- Atmosphere glow effect
- Optional: Cloud layer

```javascript
import { useRef } from 'react';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';

const EarthGlobe = ({ tilt = 23.5 }) => {
  const earthRef = useRef();
  
  return (
    <group rotation={[0, 0, (tilt * Math.PI) / 180]}>
      {/* Earth's core */}
      <Sphere ref={earthRef} args={[2, 64, 64]}>
        <MeshDistortMaterial
          color="#1a4d8c"
          emissive="#0a1a3a"
          roughness={0.6}
          metalness={0.1}
          distort={0.1}
          speed={0.5}
        />
      </Sphere>
      
      {/* Atmosphere glow */}
      <Sphere args={[2.1, 32, 32]}>
        <meshBasicMaterial
          color="#4a90d9"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Tilt indicator - subtle ring showing ecliptic plane */}
      <ringGeometry args={[3, 3.2, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
      </ringGeometry>
    </group>
  );
};
```

### 2.3 Galgal Sphere Component
**File**: `src/components/3d/GalgalSphere.js`

**Visual Design**:
- Transparent/glass-like material
- Wireframe or subtle surface lines
- Hebrew label floating nearby
- Smooth sphere geometry

```javascript
import { Sphere, Html } from '@react-three/drei';

const GalgalSphere = ({ 
  radius, 
  color = '#4a90d9', 
  opacity = 0.1,
  label,
  labelHebrew,
  rotation = [0, 0, 0]
}) => {
  return (
    <group rotation={rotation}>
      {/* Main transparent sphere */}
      <Sphere args={[radius, 64, 64]}>
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={opacity}
          roughness={0.1}
          metalness={0.1}
          transmission={0.9}  // Glass-like transmission
          thickness={0.5}
          side={THREE.DoubleSide}
        />
      </Sphere>
      
      {/* Wireframe overlay for structure visibility */}
      <Sphere args={[radius, 32, 32]}>
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={0.3}
        />
      </Sphere>
      
      {/* Label */}
      <Html position={[0, radius + 1, 0]} center>
        <div className="galgal-label">
          <span className="hebrew">{labelHebrew}</span>
          <span className="english">{label}</span>
        </div>
      </Html>
    </group>
  );
};
```

### 2.4 Epicycle Ring Component
**File**: `src/components/3d/EpicycleRing.js`

**Visual Design**:
- Torus (donut) shape for the epicycle
- Distinct colors for different epicycle levels
- Glowing effect to show inlaid nature
- Rotation animation based on astronomical calculations

```javascript
import { useRef, useMemo } from 'react';
import { Torus, Trail } from '@react-three/drei';

const EPCYCLE_COLORS = {
  sun: '#FFD700',        // Gold
  moonFirst: '#C0C0FF',  // Light blue
  moonSecond: '#FF8080', // Light red/pink (for inclination)
};

const EpicycleRing = ({ 
  radius,
  tube = 0.15,
  color,
  centerPosition = [0, 0, 0],
  rotationSpeed = 0,
  tilt = 0
}) => {
  const ringRef = useRef();
  
  // Animate rotation based on astronomical calculations
  useFrame(({ clock }) => {
    if (ringRef.current && rotationSpeed) {
      ringRef.current.rotation.z = clock.getElapsedTime() * rotationSpeed;
    }
  });
  
  return (
    <group position={centerPosition} rotation={[tilt, 0, 0]}>
      {/* Main epicycle ring */}
      <Torus 
        ref={ringRef}
        args={[radius, tube, 16, 100]}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.4}
          metalness={0.6}
        />
      </Torus>
      
      {/* Glow effect */}
      <Torus args={[radius, tube * 2, 16, 100]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
        />
      </Torus>
      
      {/* Center marker */}
      <Sphere args={[0.2]}>
        <meshBasicMaterial color={color} />
      </Sphere>
    </group>
  );
};
```

### 2.5 Complete Galgalim System
**File**: `src/components/3d/GalgalimSystem.js`

Combines all spheres and epicycles into the Rambam model:

```javascript
const GalgalimSystem = ({ date, data }) => {
  const { sun, moon } = data;
  
  return (
    <group>
      {/* Sun's System */}
      <group name="sun-system">
        {/* Main deferent (Galgal Gadol) */}
        <GalgalSphere 
          radius={15} 
          color="#FFA500" 
          opacity={0.08}
          label="Sun's Deferent"
          labelHebrew="גלגל השמש"
        />
        
        {/* Sun's epicycle */}
        <EpicycleRing
          radius={2.5}
          color={EPCYCLE_COLORS.sun}
          centerPosition={calculateSunDeferentPosition(date)}
          rotationSpeed={SUN_EPICYCLE_SPEED}
        />
        
        {/* Sun marker at true position */}
        <SunMarker position={calculateSunPosition(date)} />
      </group>
      
      {/* Moon's System */}
      <group name="moon-system">
        {/* Moon's deferent (Galgal Gadol) */}
        <GalgalSphere 
          radius={10} 
          color="#8080FF" 
          opacity={0.08}
          label="Moon's Deferent"
          labelHebrew="גלגל הירח"
        />
        
        {/* First epicycle (Galgal Katan) */}
        <EpicycleRing
          radius={1.5}
          color={EPCYCLE_COLORS.moonFirst}
          centerPosition={calculateMoonDeferentPosition(date)}
          rotationSpeed={MOON_EPICYCLE_1_SPEED}
        />
        
        {/* Second epicycle (Galgal Noteh) - with inclination */}
        <EpicycleRing
          radius={0.8}
          color={EPCYCLE_COLORS.moonSecond}
          centerPosition={calculateFirstEpicyclePosition(date)}
          rotationSpeed={MOON_EPICYCLE_2_SPEED}
          tilt={(5 * Math.PI) / 180}  // 5° inclination for latitude
        />
        
        {/* Moon marker */}
        <MoonMarker 
          position={calculateMoonPosition(date)}
          phase={moon.phase}
        />
      </group>
    </group>
  );
};
```

---

## Phase 3: Integration with Existing System

### 3.1 Update CelestialVisualization
**File**: `src/components/CelestialVisualization.js`

Create a wrapper that can switch between 2D and 3D modes:

```javascript
const CelestialVisualization = ({ date, onDateChange, onTooltipChange, mode = '3d' }) => {
  const astronomicalData = useMemo(() => 
    getAstronomicalData(date), [date]
  );
  
  return (
    <div className="celestial-visualization">
      <ModeToggle mode={mode} onChange={setMode} />
      
      {mode === '3d' ? (
        <Scene3D 
          date={date} 
          astronomicalData={astronomicalData}
          onObjectClick={handle3DObjectClick}
        />
      ) : (
        <Canvas2D 
          date={date} 
          astronomicalData={astronomicalData}
        />
      )}
      
      {/* Shared controls */}
      <DateControls date={date} onChange={onDateChange} />
      <ZoomControls />
    </div>
  );
};
```

### 3.2 Responsive Design

```css
/* CelestialVisualization.css updates */
.celestial-visualization {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 600px;
}

.scene-3d,
.scene-2d {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.mode-toggle {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 100;
  background: rgba(0, 0, 0, 0.6);
  padding: 0.5rem;
  border-radius: 8px;
}
```

---

## Phase 4: Interactive Features

### 4.1 Raycasting for Tooltips
```javascript
import { useThree } from '@react-three/fiber';

const InteractiveLayer = ({ onObjectHover }) => {
  const { raycaster, mouse, camera, scene } = useThree();
  
  useFrame(() => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
      const object = intersects[0].object;
      onObjectHover(object.userData);
    }
  });
  
  return null;
};
```

### 4.2 Time Animation in 3D
```javascript
const useTimeAnimation = (date, onDateChange) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  useFrame((state, delta) => {
    if (isPlaying) {
      const dayAdvance = delta * 0.5; // Half a day per second
      const newDate = new Date(date.getTime() + dayAdvance * 86400000);
      onDateChange(newDate);
    }
  });
  
  return { isPlaying, setIsPlaying };
};
```

### 4.3 Camera Presets
```javascript
const CAMERA_PRESETS = {
  overview: { position: [0, 30, 50], target: [0, 0, 0] },
  earthTilt: { position: [20, 0, 0], target: [0, 0, 0] },
  sunSystem: { position: [0, 5, 20], target: [15, 0, 0] },
  moonSystem: { position: [0, 5, 15], target: [10, 0, 0] },
  ecliptic: { position: [0, 0, 50], target: [0, 0, 0] },
};
```

---

## Phase 5: Educational Annotations

### 5.1 Floating Labels System
```javascript
const EducationalLabels = ({ visible }) => {
  if (!visible) return null;
  
  return (
    <>
      <Html position={[0, 3, 0]}>
        <div className="annotation annotation-earth">
          <h4>Earth (ארץ)</h4>
          <p>Center of the geocentric model</p>
          <p className="detail">Axial tilt: 23.5°</p>
        </div>
      </Html>
      
      <Html position={[15, 2, 0]}>
        <div className="annotation annotation-sun">
          <h4>Sun's Deferent</h4>
          <p>Main orbital circle (Galgal Gadol)</p>
        </div>
      </Html>
    </>
  );
};
```

### 5.2 Animated Demonstrations
- **Earth's Tilt**: Animation showing how tilt causes seasons
- **Epicycle Motion**: Visual trail showing retrograde motion
- **Moons Latitude**: 3D visualization of the 5° orbital inclination

---

## Phase 6: Styling and Polish

### 6.1 CSS for 3D Labels
```css
.galgal-label {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  white-space: nowrap;
}

.galgal-label .hebrew {
  display: block;
  font-family: 'David Libre', serif;
  font-size: 14px;
}

.galgal-label .english {
  display: block;
  font-size: 10px;
  opacity: 0.8;
}

.annotation {
  background: rgba(26, 34, 54, 0.95);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  padding: 12px;
  max-width: 200px;
  color: white;
  pointer-events: none;
}
```

### 6.2 Loading State
```javascript
const SceneLoader = () => (
  <div className="scene-loader">
    <div className="loader-spinner" />
    <p>Loading celestial spheres...</p>
  </div>
);
```

---

## Phase 7: Performance Optimization

### 7.1 Instanced Meshes for Stars
```javascript
import { InstancedMesh } from 'three';

const StarsField = ({ count = 5000 }) => {
  const mesh = useRef();
  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return pos;
  });
  
  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.05, 4, 4]} />
      <meshBasicMaterial color="white" />
    </instancedMesh>
  );
};
```

### 7.2 LOD (Level of Detail) for Spheres
```javascript
const AdaptiveGalgalSphere = ({ radius, ...props }) => {
  const { viewport } = useThree();
  const isMobile = viewport.width < 768;
  
  return (
    <GalgalSphere 
      radius={radius}
      segments={isMobile ? 32 : 64}
      {...props}
    />
  );
};
```

---

## Implementation Timeline

| Phase | Task | Estimated Time |
|-------|------|----------------|
| 1 | Setup dependencies and file structure | 2 hours |
| 2 | Core 3D components (Earth, Galgalim, Epicycles) | 8 hours |
| 3 | Integration with existing app | 4 hours |
| 4 | Interactive features (tooltips, animations) | 6 hours |
| 5 | Educational annotations | 3 hours |
| 6 | Styling and polish | 3 hours |
| 7 | Performance optimization | 4 hours |
| **Total** | | **30 hours** |

---

## Testing Checklist

- [ ] Earth globe renders with correct 23.5° tilt
- [ ] Galgalim spheres are transparent and wireframed
- [ ] Epicycles are colored distinctly (Sun: gold, Moon 1: blue, Moon 2: red)
- [ ] Camera controls work smoothly (zoom, pan, rotate)
- [ ] Tooltips appear on hover in 3D mode
- [ ] Date changes update 3D positions correctly
- [ ] Mode toggle switches between 2D and 3D
- [ ] Performance is smooth on mobile devices
- [ ] All existing 2D functionality still works

---

## Future Enhancements

1. **VR Mode**: WebXR integration for immersive experience
2. **Shadow Effects**: Realistic lighting and shadows
3. **Texture Mapping**: High-res Earth textures
4. **Particle Effects**: Solar wind, atmosphere glow
5. **Sound**: Ambient space audio
6. **Recording**: Export animations as video
