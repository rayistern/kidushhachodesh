import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Html } from '@react-three/drei';
import SunMechanism from './SunMechanism';
import MoonMechanism from './MoonMechanism';
import ZodiacBelt from './ZodiacBelt';
import { useVisualizationStore } from '../../stores/visualizationStore';
import { useCalculationStore } from '../../stores/calculationStore';

/**
 * Scene3D — the main interactive 3D view of the Rambam's mechanical model.
 *
 * Two mechanisms render in the same scene, both centered on Earth:
 *   • SunMechanism — blue galgal + red galgal (off-center) + sun
 *   • MoonMechanism — red domeh + blue noteh (5° tilt) + green yoitzeh
 *                     (off-center) + galgal katan + moon
 *
 * Both mechanisms share the same time clock from visualizationStore.animationDays,
 * so when you press play, both rotate together at their actual angular velocities.
 */
function CelestialScene() {
  const calculation = useCalculationStore((s) => s.calculation);
  const sidewaysAxis = useVisualizationStore((s) => s.sidewaysAxis);
  const showLabels = useVisualizationStore((s) => s.showLabels);

  if (!calculation) {
    return (
      <Html center>
        <div style={{ color: '#888', fontSize: 14 }}>Loading…</div>
      </Html>
    );
  }

  const daysFromEpoch = calculation.daysFromEpoch;

  return (
    <group rotation={sidewaysAxis ? [0, 0, Math.PI / 2] : [0, 0, 0]}>
      <Stars radius={80} depth={50} count={2500} factor={2} fade speed={0.4} />

      {/* ── EARTH at the center ── */}
      <mesh>
        <sphereGeometry args={[0.22, 32, 24]} />
        <meshStandardMaterial color="#2266aa" emissive="#0a2244" emissiveIntensity={0.5} />
      </mesh>
      {showLabels && (
        <Html position={[0, 0.4, 0]} center style={{ pointerEvents: 'none' }}>
          <div
            style={{
              color: '#88bbff',
              fontSize: '11px',
              fontWeight: 700,
              textShadow: '0 0 6px #000',
            }}
          >
            <div style={{ fontSize: '13px' }}>ארץ</div>
            <div style={{ fontSize: '9px', opacity: 0.7 }}>Earth</div>
          </div>
        </Html>
      )}

      {/* ── ZODIAC BELT around the whole scene ── */}
      <ZodiacBelt radius={6} visible={showLabels} />

      {/* ── THE TWO MECHANISMS ── */}
      <SunMechanism daysFromEpoch={daysFromEpoch} scale={4.2} showLabels={showLabels} />
      <MoonMechanism daysFromEpoch={daysFromEpoch} scale={2.4} showLabels={showLabels} />

      {/* ── Lights ── */}
      <ambientLight intensity={0.45} />
      <directionalLight position={[10, 10, 5]} intensity={0.4} />
    </group>
  );
}

/**
 * Top-level Canvas wrapper.
 */
export default function Scene3D() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        gl={{ antialias: true, alpha: true, sortObjects: false }}
        style={{ background: '#070a12', borderRadius: '12px' }}
      >
        <PerspectiveCamera makeDefault position={[0, 6, 12]} fov={55} />
        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          minDistance={2}
          maxDistance={40}
          maxPolarAngle={Math.PI}
        />
        <Suspense fallback={null}>
          <CelestialScene />
        </Suspense>
      </Canvas>
      <PlaybackOverlay />
      <LegendOverlay />
    </div>
  );
}

/**
 * Bottom overlay with play/pause + speed selector + scrubber + display toggles.
 */
function PlaybackOverlay() {
  const isPlaying = useVisualizationStore((s) => s.isPlaying);
  const togglePlaying = useVisualizationStore((s) => s.togglePlaying);
  const animationSpeed = useVisualizationStore((s) => s.animationSpeed);
  const setAnimationSpeed = useVisualizationStore((s) => s.setAnimationSpeed);
  const animationDays = useVisualizationStore((s) => s.animationDays);
  const setAnimationDays = useVisualizationStore((s) => s.setAnimationDays);
  const resetAnimation = useVisualizationStore((s) => s.resetAnimation);
  const sidewaysAxis = useVisualizationStore((s) => s.sidewaysAxis);
  const toggleSidewaysAxis = useVisualizationStore((s) => s.toggleSidewaysAxis);
  const showRadii = useVisualizationStore((s) => s.showRadii);
  const toggleRadii = useVisualizationStore((s) => s.toggleRadii);
  const showLabels = useVisualizationStore((s) => s.showLabels);
  const toggleLabels = useVisualizationStore((s) => s.toggleLabels);

  // Force re-render at 4Hz while playing so the offset readout + scrubber update.
  const [, force] = React.useState(0);
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => force((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [isPlaying]);

  const speeds = [
    { v: 1, label: '1 d/s' },
    { v: 30, label: '1 mo/s' },
    { v: 365, label: '1 yr/s' },
    { v: 3650, label: '10 yr/s' },
    { v: 25550, label: '70 yr/s' },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        background: 'rgba(10, 14, 22, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(120, 140, 180, 0.25)',
        borderRadius: 10,
        padding: '10px 14px',
        color: '#dde',
        fontSize: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={togglePlaying}
          style={btnStyle(isPlaying ? '#4ef7a1' : '#aaa')}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <button onClick={resetAnimation} style={btnStyle('#aaa')} title="Reset to selected date">
          ↺
        </button>

        <span style={{ opacity: 0.7, marginLeft: 4 }}>Speed:</span>
        {speeds.map((s) => (
          <button
            key={s.v}
            onClick={() => setAnimationSpeed(s.v)}
            style={btnStyle(animationSpeed === s.v ? '#4ea1f7' : '#555')}
          >
            {s.label}
          </button>
        ))}

        <span style={{ marginLeft: 'auto', opacity: 0.7, fontFamily: 'monospace' }}>
          offset: {animationDays >= 0 ? '+' : ''}
          {animationDays.toFixed(1)} d
        </span>
      </div>

      <input
        type="range"
        min={-3650}
        max={3650}
        step={0.5}
        value={animationDays}
        onChange={(e) => setAnimationDays(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#4ea1f7' }}
      />

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button onClick={toggleSidewaysAxis} style={btnStyle(sidewaysAxis ? '#4ef7a1' : '#555')}>
          Rabbi Losh view {sidewaysAxis ? '✓' : ''}
        </button>
        <button onClick={toggleRadii} style={btnStyle(showRadii ? '#4ea1f7' : '#555')}>
          Radii {showRadii ? '✓' : ''}
        </button>
        <button onClick={toggleLabels} style={btnStyle(showLabels ? '#4ea1f7' : '#555')}>
          Labels {showLabels ? '✓' : ''}
        </button>
      </div>
    </div>
  );
}

function btnStyle(color) {
  return {
    background: 'transparent',
    color,
    border: `1px solid ${color}`,
    borderRadius: 6,
    padding: '3px 8px',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  };
}

/**
 * Top-right legend explaining the colors of each galgal.
 */
function LegendOverlay() {
  const [open, setOpen] = React.useState(true);

  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        background: 'rgba(10, 14, 22, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(120, 140, 180, 0.25)',
        borderRadius: 10,
        padding: open ? '10px 14px' : '6px 10px',
        color: '#dde',
        fontSize: 11,
        maxWidth: 260,
      }}
    >
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          cursor: 'pointer',
          fontWeight: 700,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>Galgalim Legend</span>
        <span style={{ opacity: 0.6 }}>{open ? '−' : '+'}</span>
      </div>
      {open && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Section title="Sun (KH 12-13)">
            <Item color="#3b6fd4" label="Blue galgal" sub="outer, Earth-centered, ~1°/70yr" />
            <Item color="#d44747" label="Red galgal" sub="off-center, carries the sun" />
            <Item color="#ffdd44" label="Sun" sub="on the red's rim" />
          </Section>
          <Section title="Moon (KH 14-16)">
            <Item color="#cc4444" label="Red (domeh)" sub="ecliptic-aligned" />
            <Item color="#4488cc" label="Blue (noteh)" sub="tilted 5° → latitude" />
            <Item color="#44aa44" label="Green (yoitzeh)" sub="off-center, has its own govah" />
            <Item color="#dddd44" label="Galgal katan" sub="small epicycle (radius 5°)" />
            <Item color="#dddde0" label="Moon" sub="on the katan's rim" />
          </Section>
          <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4 }}>
            Eccentricities exaggerated for visibility (real values are ~1-5%).
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, marginBottom: 3 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>{children}</div>
    </div>
  );
}

function Item({ color, label, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          display: 'inline-block',
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      <span>
        <span style={{ fontWeight: 600 }}>{label}</span>{' '}
        <span style={{ opacity: 0.6, fontSize: 10 }}>— {sub}</span>
      </span>
    </div>
  );
}
