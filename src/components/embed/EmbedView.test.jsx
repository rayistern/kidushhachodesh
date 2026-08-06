// @vitest-environment jsdom
/**
 * Embed smoke test — the blank-page regression (2026-08-06): the embed
 * set the date but never ran compute(), so every view rendered against
 * a null calculation forever. The ribbon view is plain DOM, so jsdom
 * can prove the calculation actually happens.
 */
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmbedView from './EmbedView';
import { useCalculationStore } from '../../stores/calculationStore';

afterEach(cleanup);

describe('EmbedView', () => {
  it('computes the calculation on mount (ribbon renders real content)', async () => {
    render(
      <MemoryRouter initialEntries={["/embed?view=ribbon&date=2026-05-18"]}>
        <EmbedView />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(useCalculationStore.getState().calculation).not.toBeNull();
    });
    expect(useCalculationStore.getState().calculation.daysFromEpoch).toBe(309775);
  });
});
