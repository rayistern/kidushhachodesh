import React, { useState } from 'react';

const Prop3DCard = ({
  title,
  hebrewTitle,
  description,
  isActive,
  isExpanded,
  onToggle,
  onExpand,
  icon,
  children,
}) => {
  const [opacity, setOpacity] = useState(0.7);
  const [rotation, setRotation] = useState(0);

  return (
    <div className={`prop3d-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="prop3d-header">
        <div className="prop3d-title">
          <span className="prop-icon">{icon}</span>
          <div>
            <h3>{title}</h3>
            <span className="hebrew-title">{hebrewTitle}</span>
          </div>
        </div>
        
        <div className="prop3d-controls">
          <button
            className={`toggle-btn ${isActive ? 'active' : ''}`}
            onClick={onToggle}
            title={isActive ? 'Hide' : 'Show'}
          >
            {isActive ? '👁️' : '👁️‍🗨️'}
          </button>
          <button
            className={`expand-btn ${isExpanded ? 'expanded' : ''}`}
            onClick={onExpand}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      <div className="prop3d-description">
        {description}
      </div>

      {isExpanded && (
        <div className="prop3d-settings">
          <div className="setting-group">
            <label>Opacity: {Math.round(opacity * 100)}%</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
            />
          </div>
          <div className="setting-group">
            <label>Auto Rotation: {rotation === 0 ? 'Off' : `${rotation}s`}</label>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
            />
          </div>
        </div>
      )}

      <div className="prop3d-content">
        {children}
      </div>

      <style>{`
        .prop3d-card {
          background: var(--color-card);
          border-radius: 12px;
          border: 1px solid var(--color-border);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .prop3d-card.expanded {
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
        }

        .prop3d-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: var(--color-surface-2);
          border-bottom: 1px solid var(--color-border);
        }

        .prop3d-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .prop-icon {
          font-size: 1.5rem;
        }

        .prop3d-title h3 {
          margin: 0;
          font-size: 1.1rem;
          color: var(--color-text);
        }

        .hebrew-title {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }

        .prop3d-controls {
          display: flex;
          gap: 0.5rem;
        }

        .toggle-btn, .expand-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .toggle-btn:hover, .expand-btn:hover {
          background: var(--color-accent);
          border-color: var(--color-accent);
        }

        .toggle-btn.active {
          background: var(--color-accent);
          border-color: var(--color-accent);
        }

        .expand-btn.expanded {
          transform: rotate(180deg);
        }

        .prop3d-description {
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          background: var(--color-surface);
        }

        .prop3d-settings {
          display: flex;
          gap: 1.5rem;
          padding: 1rem;
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          flex-wrap: wrap;
        }

        .setting-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 150px;
        }

        .setting-group label {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }

        .setting-group input[type="range"] {
          width: 100%;
          accent-color: var(--color-accent);
        }

        .prop3d-content {
          min-height: 300px;
          padding: 1rem;
        }
      `}</style>
    </div>
  );
};

export default Prop3DCard;