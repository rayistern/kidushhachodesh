import React from 'react';
import Prop3DCard from './Prop3DCard';
import TiltedEarth from './TiltedEarth';
import CelestialSpheres from './CelestialSpheres';
import Epicycles from './Epicycles';

const PropsDashboard = ({ date }) => {
  const [activeProps, setActiveProps] = React.useState({
    earth: true,
    spheres: true,
    epicycles: true,
  });

  const [expandedProp, setExpandedProp] = React.useState(null);

  const toggleProp = (propName) => {
    setActiveProps((prev) => ({
      ...prev,
      [propName]: !prev[propName],
    }));
  };

  const handleExpand = (propName) => {
    setExpandedProp(expandedProp === propName ? null : propName);
  };

  return (
    <div className="props-dashboard">
      <div className="dashboard-header">
        <h2>3D Digital Props</h2>
        <p className="dashboard-subtitle">
          Interactive celestial visualization based on Rambam's model
        </p>
      </div>

      <div className="props-grid">
        <Prop3DCard
          title="Tilted Earth"
          hebrewTitle="כדור הארץ"
          description="Interactive 3D Earth with switchable tilt (horizontal mode vs 23.5° actual tilt)"
          isActive={activeProps.earth}
          isExpanded={expandedProp === 'earth'}
          onToggle={() => toggleProp('earth')}
          onExpand={() => handleExpand('earth')}
          icon="🌍"
        >
          <TiltedEarth isActive={activeProps.earth} date={date} />
        </Prop3DCard>

        <Prop3DCard
          title="Celestial Spheres"
          hebrewTitle="גלגלים שמימיים"
          description="9 concentric transparent celestial spheres with adjustable opacity"
          isActive={activeProps.spheres}
          isExpanded={expandedProp === 'spheres'}
          onToggle={() => toggleProp('spheres')}
          onExpand={() => handleExpand('spheres')}
          icon="🔵"
        >
          <CelestialSpheres isActive={activeProps.spheres} date={date} />
        </Prop3DCard>

        <Prop3DCard
          title="Epicycles"
          hebrewTitle="גלגל קטן"
          description="Nested circles showing Rambam's deferent/epicycle/eccentric system"
          isActive={activeProps.epicycles}
          isExpanded={expandedProp === 'epicycles'}
          onToggle={() => toggleProp('epicycles')}
          onExpand={() => handleExpand('epicycles')}
          icon="⭕"
        >
          <Epicycles isActive={activeProps.epicycles} date={date} />
        </Prop3DCard>
      </div>

      <div className="audio-lecture-section">
        <div className="audio-lecture-placeholder">
          <h3>🎧 Audio Lecture Integration</h3>
          <p>
            Connect Rambam's celestial model to audio lectures. 
            Placeholder for future Chabad.org audio integration.
          </p>
          <div className="audio-controls-placeholder">
            <button className="audio-btn" disabled>
              ▶ Play Introduction
            </button>
            <button className="audio-btn" disabled>
              ⏸ Select Topic
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .props-dashboard {
          padding: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .dashboard-header h2 {
          font-size: 1.8rem;
          color: var(--color-text);
          margin-bottom: 0.5rem;
        }

        .dashboard-subtitle {
          color: var(--color-text-secondary);
          font-size: 1rem;
        }

        .props-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .audio-lecture-section {
          background: var(--color-card);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid var(--color-border);
        }

        .audio-lecture-placeholder h3 {
          margin-top: 0;
          color: var(--color-text);
        }

        .audio-lecture-placeholder p {
          color: var(--color-text-secondary);
        }

        .audio-controls-placeholder {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .audio-btn {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: 1px solid var(--color-border);
          background: var(--color-surface-2);
          color: var(--color-text-secondary);
          cursor: not-allowed;
        }

        @media (max-width: 900px) {
          .props-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PropsDashboard;