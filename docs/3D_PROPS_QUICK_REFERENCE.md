# 3D Digital Props - Quick Reference Guide

## Visual Mockup Description

```
┌─────────────────────────────────────────────────────────────────┐
│                    3D CELESTIAL VISUALIZATION                    │
│  ╔═══════════════════════════════════════════════════════════╗  │
│  ║                                                           ║  │
│  ║     ★ ✦  .  ·  ✧   STARFIELD BACKGROUND   ✧  ·  .  ✦ ★    ║  │
│  ║                                                           ║  │
│  ║         ╭──────────────────────────────╮                  ║  │
│  ║        /   TRANSPARENT SPHERE          \                 ║  │
│  ║       /    (Galgal Gadol - Glass-like)  \                ║  │
│  ║      │        ╭────────────╮             │               ║  │
│  ║      │       /   COLORED    \            │               ║  │
│  ║      │      │   EPICYCLE     │           │               ║  │
│  ║      │      │   (Torus)      │           │               ║  │
│  ║      │       \   [GLOWING]   /            │               ║  │
│  ║      │        ╰────────────╯             │               ║  │
│  ║       \     ◉ Earth (Tilted 23.5°)       /                ║  │
│  ║        \   ═════════════════════════════/                 ║  │
│  ║         ╰──────────────────────────────╯                  ║  │
│  ║                     ☼ Sun Position                         ║  │
│  ║                                                           ║  │
│  ╚═══════════════════════════════════════════════════════════╝  │
│                                                                  │
│  [2D/3D Toggle] [Reset View] [Zoom: ████████░░] [Animate ▶]      │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Earth View   │  │ Sun System   │  │ Moon System  │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Color Scheme

| Component | Color | Hex Code | Material |
|-----------|-------|----------|----------|
| **Earth** | Deep Ocean Blue | `#1a4d8c` | Distorted sphere |
| **Atmosphere** | Light Blue Glow | `#4a90d9` | Transparent sphere |
| **Sun's Galgal** | Warm Orange | `#FFA500` | Glass (8% opacity) |
| **Sun's Epicycle** | Gold | `#FFD700` | Glowing torus |
| **Moon's Galgal** | Soft Blue | `#8080FF` | Glass (8% opacity) |
| **Moon 1st Epicycle** | Silver-Blue | `#C0C0FF` | Glowing torus |
| **Moon 2nd Epicycle** | Coral-Pink | `#FF8080` | Glowing torus (5° tilt) |
| **Zodiac Ring** | White | `#FFFFFF` | Wireframe ring |

## Key Props Interactions

### Rabbi Losh's Physical Props → Digital Equivalent

| Physical Prop | Digital Element | Interaction |
|---------------|-----------------|-------------|
| **Tilted Globe** | `EarthGlobe` component | Rotate to see tilt from different angles |
| **Clear Acrylic Spheres** | `GalgalSphere` with transmission | Click to toggle visibility/fade |
| **Colored Foam Epicycles** | `EpicycleRing` torus | Hover for rotation speed info |
| **Zodiac Ring Stand** | `ZodiacRing` component | Click to highlight constellation |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` | Switch to 2D view |
| `2` | Switch to 3D view |
| `E` | Focus on Earth |
| `S` | Focus on Sun system |
| `M` | Focus on Moon system |
| `Z` | Focus on Zodiac |
| `Space` | Play/Pause animation |
| `R` | Reset camera |
| `↑/↓` | Zoom in/out |
| `Shift + Drag` | Pan camera |

## Implementation Files Quick Map

```
NEW FILES TO CREATE:
├── src/components/3d/
│   ├── index.js              ← Export all 3D components
│   ├── Scene3D.js            ← Main R3F canvas
│   ├── EarthGlobe.js         ← Tilted Earth with atmosphere
│   ├── GalgalSphere.js       ← Transparent reusable sphere
│   ├── EpicycleRing.js       ← Colored torus epicycles
│   ├── ZodiacRing.js         ← 3D zodiac constellation ring
│   ├── SunMarker.js          ← Glowing sun position marker
│   ├── MoonMarker.js         ← Moon with phase shading
│   ├── CameraControls.js     ← Camera presets and animation
│   └── constants.js          ← 3D-specific constants
│
FILES TO MODIFY:
├── src/components/
│   ├── CelestialVisualization.js  ← Add 3D mode toggle
│   └── CelestialVisualization.css ← Add 3D styles
├── package.json                   ← Add three.js dependencies
└── src/App.js                     ← Optionally wrap with 3D provider
```

## Code Snippet Library

### 1. Quick Earth Globe
```jsx
<Sphere args={[2, 64, 64]}>
  <MeshDistortMaterial
    color="#1a4d8c"
    distort={0.1}
    speed={0.5}
  />
</Sphere>
```

### 2. Quick Transparent Sphere
```jsx
<mesh>
  <sphereGeometry args={[radius, 64, 64]} />
  <meshPhysicalMaterial
    transmission={0.9}
    opacity={0.1}
    transparent
    roughness={0.1}
  />
</mesh>
```

### 3. Quick Epicycle Ring
```jsx
<Torus args={[radius, 0.15, 16, 100]}>
  <meshStandardMaterial
    color="#FFD700"
    emissive="#FFD700"
    emissiveIntensity={0.3}
  />
</Torus>
```

### 4. Quick Camera Setup
```jsx
<Canvas camera={{ position: [0, 20, 40], fov: 50 }}>
  <OrbitControls enablePan enableZoom enableRotate />
</Canvas>
```

## Installation Commands

```bash
# Install Three.js and React Three Fiber
npm install three @react-three/fiber @react-three/drei

# Verify installation
npm list three @react-three/fiber @react-three/drei
```

## Performance Budget

| Metric | Target | Maximum |
|--------|--------|---------|
| **FPS** | 60 | 30 |
| **Draw calls** | < 50 | 100 |
| **Triangles** | < 100k | 200k |
| **Load time** | < 2s | 5s |
| **Memory** | < 100MB | 200MB |

## Responsive Breakpoints

| Breakpoint | 3D Detail Level | Notes |
|------------|-----------------|-------|
| Desktop (>1024px) | Full (64 segments) | All effects enabled |
| Tablet (768-1024px) | Medium (32 segments) | Reduced glow |
| Mobile (<768px) | Low (16 segments) | Auto-rotate disabled |

## Testing Commands

```bash
# Start development server
npm start

# Test 3D performance
# Open DevTools → Performance → Record 10 seconds

# Test mobile responsiveness
# Open DevTools → Device Toolbar → iPhone 12 Pro
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Black screen | WebGL disabled | Check browser settings, fallback to 2D |
| Low FPS | Too many objects | Reduce segment count, enable LOD |
| Touch not working | OrbitControls config | Add `touch-action: none` CSS |
| Memory leak | Un disposed geometries | Use `useEffect` cleanup |
| Z-fighting | Overlapping planes | Add small offset or use `polygonOffset` |

---

## Resources

- **Three.js Docs**: https://threejs.org/docs/
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber
- **Drei Helpers**: https://github.com/pmndrs/drei
- **Rambam Source**: Hilchot Kiddush HaChodesh, Chapters 11-17
