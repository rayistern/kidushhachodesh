import { create } from 'zustand';
import { getFullCalculation } from '../engine/pipeline.js';

export const useCalculationStore = create((set, get) => ({
  calculation: null,
  selectedStepId: null,

  /** Recompute all astronomical data for the given date */
  compute: (date) => {
    const calculation = getFullCalculation(date);
    set({ calculation });
  },

  /** Select a calculation step for drill-down display */
  selectStep: (stepId) => set({ selectedStepId: stepId }),
  clearSelection: () => set({ selectedStepId: null }),

  /** Get the currently selected step object */
  getSelectedStep: () => {
    const { calculation, selectedStepId } = get();
    if (!calculation || !selectedStepId) return null;
    return calculation.stepMap[selectedStepId] || null;
  },
}));
