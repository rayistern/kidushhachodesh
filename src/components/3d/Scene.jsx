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

  // Sideways (Rabbi Losh) = look at the ecliptic head-on with east at the
  // top of the screen. Achieved by rotating the scene 90° around X (lifting
  // the ecliptic plane upright) and 90° around Z (so longitude 0° / Aries
  // sits at the top instead of the right).
  // Top-down = the standard astronomical map view with north at top.
  const sceneRotation = sidewaysAxis
    ? [Math.PI / 2, 0, Math.PI / 2]
    : [0, 0, 0];

  return (
    <group rotation={sceneRotation}>
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
 *
 * `dimmed` is true when a side drawer is open over the scene on mobile —
 * we hide the overlays in that state so they don't compete with the panel
 * content the user is reading.
 */
export default function Scene3D({ dimmed = false }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        gl={{ antialias: true, alpha: true, sortObjects: false }}
        style={{ background: '#070a12', borderRadius: '12px' }}
      >
        <PerspectiveCamera makeDefault position={[0, 2, 14]} fov={55} />
        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          minDistance={2}
          maxDistance={40}
          maxPolarAngle={Math.PI}
          enableZoom
          enableRotate
          enablePan
          touches={{ ONE: 0 /* ROTATE */, TWO: 2 /* DOLLY_PAN */ }}
        />
        <Suspense fallback={null}>
          <CelestialScene />
        </Suspense>
      </Canvas>
      {!dimmed && <PlaybackOverlay />}
      {!dimmed && <LegendOverlay />}
    </div>
  );
}

/**
 * Bottom overlay with play/pause + speed selector + scrubber + display toggles.
 * On narrow screens the second toggle row collapses behind a "More" button
 * to keep the overlay shallow.
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

  const [moreOpen, setMoreOpen] = React.useState(false);
  const [isNarrow, setIsNarrow] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );
  useEffect(() => {
    const handler = () => setIsNarrow(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Speed presets — abbreviated labels on narrow screens
  const speeds = isNarrow
    ? [
        { v: 1, label: '1d' },
        { v: 30, label: '1mo' },
        { v: 365, label: '1yr' },
        { v: 3650, label: '10y' },
      ]
    : [
        { v: 1, label: '1 d/s' },
        { v: 30, label: '1 mo/s' },
        { v: 365, label: '1 yr/s' },
        { v: 3650, label: '10 yr/s' },
        { v: 25550, label: '70 yr/s' },
      ];

  return (
    <div
      className="safe-bottom"
      style={{
        position: 'absolute',
        bottom: 8,
        left: 8,
        right: 8,
        background: 'rgba(24, 28, 32, 0.92)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(120, 140, 180, 0.25)',
        borderRadius: 12,
        padding: isNarrow ? '8px 10px' : '10px 14px',
        color: 'var(--color-text)',
        fontSize: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: isNarrow ? 8 : 8,
        zIndex: 5,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: isNarrow ? 4 : 6, flexWrap: 'wrap' }}>
        <button
          onClick={togglePlaying}
          style={btnStyle(isPlaying ? '#4ef7a1' : '#c9d6e3', isNarrow, true)}
          title={isPlaying ? 'Pause' : 'Play'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <button
          onClick={resetAnimation}
          style={btnStyle('#c9d6e3', isNarrow, true)}
          title="Reset"
          aria-label="Reset animation"
        >
          ↺
        </button>

        {speeds.map((s) => (
          <button
            key={s.v}
            onClick={() => setAnimationSpeed(s.v)}
            style={btnStyle(animationSpeed === s.v ? '#4ea1f7' : '#555', isNarrow)}
          >
            {s.label}
          </button>
        ))}

        <span
          style={{
            marginLeft: 'auto',
            opacity: 0.75,
            fontFamily: 'monospace',
            fontSize: isNarrow ? 11 : 11,
            whiteSpace: 'nowrap',
          }}
        >
          {animationDays >= 0 ? '+' : ''}
          {animationDays.toFixed(0)}d
        </span>

        {isNarrow && (
          <button
            onClick={() => setMoreOpen((o) => !o)}
            style={btnStyle('#c9d6e3', isNarrow, true)}
            title="More controls"
            aria-label="More controls"
          >
            ⋯
          </button>
        )}
      </div>

      <input
        type="range"
        min={-3650}
        max={3650}
        step={0.5}
        value={animationDays}
        onChange={(e) => setAnimationDays(parseFloat(e.target.value))}
        style={{
          width: '100%',
          accentColor: '#4ea1f7',
          height: isNarrow ? 28 : 20,
        }}
      />

      {(!isNarrow || moreOpen) && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={toggleSidewaysAxis} style={btnStyle(!sidewaysAxis ? '#e4b94a' : '#555', isNarrow)}>
            Top-down {!sidewaysAxis ? '✓' : ''}
          </button>
          <button onClick={toggleRadii} style={btnStyle(showRadii ? '#4ea1f7' : '#555', isNarrow)}>
            Radii {showRadii ? '✓' : ''}
          </button>
          <button onClick={toggleLabels} style={btnStyle(showLabels ? '#4ea1f7' : '#555', isNarrow)}>
            Labels {showLabels ? '✓' : ''}
          </button>
        </div>
      )}
    </div>
  );
}

function btnStyle(color, isNarrow = false, square = false) {
  // Mobile gets bigger tap targets — at least 36px tall for finger use.
  // The icon-only buttons (play, reset, more) get a square shape so they
  // read as buttons, not text labels.
  const minHeight = isNarrow ? 36 : 26;
  const padX = square ? (isNarrow ? 12 : 8) : isNarrow ? 10 : 8;
  const padY = isNarrow ? 6 : 3;
  return {
    background: 'transparent',
    color,
    border: `1px solid ${color}`,
    borderRadius: 8,
    padding: `${padY}px ${padX}px`,
    minHeight,
    minWidth: square ? minHeight : undefined,
    fontSize: isNarrow ? 12 : 11,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

/**
 * Top-right legend explaining the colors of each galgal.
 * Default collapsed on narrow viewports.
 */
function LegendOverlay() {
  const [isNarrow, setIsNarrow] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );
  const [open, setOpen] = React.useState(
    typeof window === 'undefined' ? true : window.innerWidth >= 768,
  );
  useEffect(() => {
    const handler = () => setIsNarrow(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        background: 'rgba(24, 28, 32, 0.92)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(120, 140, 180, 0.25)',
        borderRadius: 10,
        padding: open ? '10px 14px' : isNarrow ? '0' : '6px 10px',
        color: 'var(--color-text)',
        fontSize: 11,
        maxWidth: isNarrow ? 220 : 260,
        zIndex: 5,
      }}
    >
      <div
        onClick={() => setOpen((o) => !o)}
        role="button"
        aria-label="Toggle legend"
        style={{
          cursor: 'pointer',
          fontWeight: 700,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          minHeight: isNarrow && !open ? 40 : undefined,
          minWidth: isNarrow && !open ? 40 : undefined,
          padding: isNarrow && !open ? '8px 12px' : 0,
        }}
      >
        <span>{isNarrow && !open ? 'ℹ' : 'Galgalim Legend'}</span>
        {(!isNarrow || open) && <span style={{ opacity: 0.6 }}>{open ? '−' : '+'}</span>}
      </div>
      {open && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Section title="Sun (KH 12-13)">
            <Item color="#7fa8d8" label="Blue galgal" sub="outer, Earth-centered, ~1°/70yr" />
            <Item color="#d8895a" label="Red galgal" sub="off-center, carries the sun" />
            <Item color="#fde29a" label="Sun" sub="on the red's rim" />
          </Section>
          <Section title="Moon (KH 14-16)">
            <Item color="#c47588" label="Red (domeh)" sub="ecliptic-aligned" />
            <Item color="#6aa0b4" label="Blue (noteh)" sub="tilted 5° → latitude" />
            <Item color="#8fb088" label="Green (yoitzeh)" sub="off-center, has its own govah" />
            <Item color="#e4cf9a" label="Galgal katan" sub="small epicycle (radius 5°)" />
            <Item color="#e8e4d8" label="Moon" sub="on the katan's rim" />
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
