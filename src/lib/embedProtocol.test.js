/**
 * Contract tests for the embed protocol (docs/EMBED_PROTOCOL.md v1).
 * These shapes are consumed by external hosts (zajac's KhArtifact) —
 * changes here are contract changes.
 */
import { describe, it, expect } from 'vitest';
import {
  PROTOCOL_VERSION,
  EMBED_VIEWS,
  parseEmbedParams,
  parseHostCommand,
  embedEvents,
} from './embedProtocol';

describe('parseEmbedParams', () => {
  it('parses a full valid query', () => {
    expect(parseEmbedParams('?date=2026-08-10&view=visibility&step=keshetHaReiyah')).toEqual({
      date: '2026-08-10',
      view: 'visibility',
      step: 'keshetHaReiyah',
    });
  });

  it('falls back on invalid values instead of throwing', () => {
    expect(parseEmbedParams('?date=tomorrow&view=hologram')).toEqual({
      date: null,
      view: 'scene',
      step: null,
    });
    expect(parseEmbedParams('')).toEqual({ date: null, view: 'scene', step: null });
  });

  it('supports every documented view', () => {
    for (const v of EMBED_VIEWS) {
      expect(parseEmbedParams(`?view=${v}`).view).toBe(v);
    }
  });
});

describe('parseHostCommand', () => {
  it('accepts the four documented commands', () => {
    expect(parseHostCommand({ type: 'kh:set-date', date: '2026-08-10' }))
      .toEqual({ type: 'set-date', date: '2026-08-10' });
    expect(parseHostCommand({ type: 'kh:set-view', view: 'ribbon' }))
      .toEqual({ type: 'set-view', view: 'ribbon' });
    expect(parseHostCommand({ type: 'kh:select-step', stepId: 'moonTrueLongitude' }))
      .toEqual({ type: 'select-step', stepId: 'moonTrueLongitude' });
    expect(parseHostCommand({ type: 'kh:camera', preset: 'overview' }))
      .toEqual({ type: 'camera', preset: 'overview' });
  });

  it('rejects malformed input fail-silent (returns null, never throws)', () => {
    expect(parseHostCommand(null)).toBeNull();
    expect(parseHostCommand('kh:set-date')).toBeNull();
    expect(parseHostCommand({ type: 'kh:set-date', date: 'not-a-date' })).toBeNull();
    expect(parseHostCommand({ type: 'kh:set-view', view: 'hologram' })).toBeNull();
    expect(parseHostCommand({ type: 'kh:select-step', stepId: 'x'.repeat(100) })).toBeNull();
    expect(parseHostCommand({ type: 'unrelated-message' })).toBeNull();
  });
});

describe('embedEvents', () => {
  it('stamps every event with the protocol version', () => {
    expect(embedEvents.ready()).toEqual({ type: 'kh:ready', version: PROTOCOL_VERSION });
    expect(embedEvents.state('2026-08-10', 'scene')).toMatchObject({
      type: 'kh:state',
      version: PROTOCOL_VERSION,
      date: '2026-08-10',
      view: 'scene',
    });
    expect(embedEvents.stepSelected('keshetHaReiyah')).toMatchObject({
      type: 'kh:step-selected',
      stepId: 'keshetHaReiyah',
    });
  });
});
