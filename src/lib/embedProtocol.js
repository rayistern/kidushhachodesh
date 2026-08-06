/**
 * Embed protocol v1 — the contract between the KH observatory embed
 * (/embed) and a host page (zajac's KhArtifact component, or any other
 * embedder). Documented for hosts in docs/EMBED_PROTOCOL.md; the URL
 * params and message shapes here are part of the public API contract
 * (docs/API_CONTRACT.md): changes are additive, breaking changes bump
 * PROTOCOL_VERSION.
 */
export const PROTOCOL_VERSION = 1;

export const EMBED_VIEWS = ['scene', 'ribbon', 'visibility', 'steps'];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse and sanitize /embed query params. Unknown values fall back. */
export function parseEmbedParams(search) {
  const q = new URLSearchParams(search || '');
  const view = EMBED_VIEWS.includes(q.get('view')) ? q.get('view') : 'scene';
  const date = ISO_DATE.test(q.get('date') || '') ? q.get('date') : null;
  const step = q.get('step') || null;
  return { view, date, step };
}

/** Commands a host may send the embed. Returns the parsed command or null. */
export function parseHostCommand(data) {
  if (!data || typeof data !== 'object' || typeof data.type !== 'string') return null;
  switch (data.type) {
    case 'kh:set-date':
      return ISO_DATE.test(data.date || '') ? { type: 'set-date', date: data.date } : null;
    case 'kh:set-view':
      return EMBED_VIEWS.includes(data.view) ? { type: 'set-view', view: data.view } : null;
    case 'kh:select-step':
      return typeof data.stepId === 'string' && data.stepId.length < 64
        ? { type: 'select-step', stepId: data.stepId }
        : null;
    case 'kh:camera':
      return typeof data.preset === 'string' && data.preset.length < 32
        ? { type: 'camera', preset: data.preset }
        : null;
    default:
      return null;
  }
}

/** Events the embed posts to its host. */
export const embedEvents = {
  ready: () => ({ type: 'kh:ready', version: PROTOCOL_VERSION }),
  state: (date, view) => ({ type: 'kh:state', version: PROTOCOL_VERSION, date, view }),
  stepSelected: (stepId) => ({ type: 'kh:step-selected', version: PROTOCOL_VERSION, stepId }),
};
