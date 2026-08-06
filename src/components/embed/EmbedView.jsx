/**
 * The embeddable observatory — the KH surface a host page (zajac's
 * KhArtifact) mounts in an iframe. One interface rule (issue #41):
 * users arrive through zajac; this view carries no site navigation.
 *
 * URL: /embed?date=YYYY-MM-DD&view=scene|ribbon|visibility|steps&step=<id>
 * Control: postMessage per docs/EMBED_PROTOCOL.md (v1).
 * `ribbon` doubles as the low-end/2D fallback (no WebGL canvas).
 */
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useCalculationStore } from '../../stores/calculationStore';
import { useVisualizationStore } from '../../stores/visualizationStore';
import {
  parseEmbedParams,
  parseHostCommand,
  embedEvents,
} from '../../lib/embedProtocol';

const Scene3D = React.lazy(() => import('../3d/Scene'));
const EclipticRibbon = React.lazy(() => import('../visualizations/EclipticRibbon'));
const VisibilityHorizon = React.lazy(() => import('../visualizations/VisibilityHorizon'));
const CalculationChain = React.lazy(() => import('../dashboard/CalculationChain'));

const post = (msg) => {
  if (window.parent && window.parent !== window) {
    // The embed is public read-only content — '*' leaks nothing; hosts
    // validate OUR origin on their side per EMBED_PROTOCOL.md.
    window.parent.postMessage(msg, '*');
  }
};

export default function EmbedView() {
  const location = useLocation();
  const [{ view }, setParams] = useState(() => parseEmbedParams(location.search));
  const setDateFromISO = useCalculationStore((s) => s.setDateFromISO);
  const selectStep = useCalculationStore((s) => s.selectStep);
  const resetAnimation = useVisualizationStore((s) => s.resetAnimation);
  const setCameraPreset = useVisualizationStore((s) => s.setCameraPreset);

  // Apply initial URL params once: date, step, pinned scene (no offset).
  useEffect(() => {
    const p = parseEmbedParams(location.search);
    resetAnimation();
    if (p.date) setDateFromISO(p.date);
    if (p.step) selectStep(p.step);
    post(embedEvents.ready());
    post(embedEvents.state(p.date, p.view));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Host commands.
  useEffect(() => {
    const onMessage = (event) => {
      const cmd = parseHostCommand(event.data);
      if (!cmd) return;
      if (cmd.type === 'set-date') setDateFromISO(cmd.date);
      if (cmd.type === 'set-view') setParams((prev) => ({ ...prev, view: cmd.view }));
      if (cmd.type === 'select-step') selectStep(cmd.stepId);
      if (cmd.type === 'camera') setCameraPreset(cmd.preset);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [setDateFromISO, selectStep, setCameraPreset]);

  // Report step selections back to the host (drill-down clicks inside
  // the steps/visibility views).
  useEffect(
    () =>
      useCalculationStore.subscribe((state, prev) => {
        if (state.selectedStepId !== prev.selectedStepId && state.selectedStepId) {
          post(embedEvents.stepSelected(state.selectedStepId));
        }
      }),
    [],
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0a0e14',
        color: '#e8e3d8',
        overflow: view === 'steps' ? 'auto' : 'hidden',
      }}
    >
      <React.Suspense
        fallback={
          <div style={{ padding: 24, fontFamily: 'monospace', color: '#4ea1f7' }}>
            Loading…
          </div>
        }
      >
        {view === 'scene' && <Scene3D />}
        {view === 'ribbon' && (
          <div style={{ padding: '12px 8px' }}>
            <EclipticRibbon />
          </div>
        )}
        {view === 'visibility' && (
          <div style={{ padding: '12px 8px', overflow: 'auto', height: '100%' }}>
            <VisibilityHorizon />
          </div>
        )}
        {view === 'steps' && (
          <div style={{ padding: '12px 8px' }}>
            <CalculationChain />
          </div>
        )}
      </React.Suspense>
    </div>
  );
}
