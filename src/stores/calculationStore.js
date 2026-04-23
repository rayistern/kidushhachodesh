import { create } from 'zustand';
import { getFullCalculation } from '../engine/pipeline.js';

export const useCalculationStore = create((set, get) => ({
  calculation: null,
  selectedStepId: null,

  // Drill-down breadcrumb — the chain of step IDs the user walked
  // through to reach selectedStepId. Empty when the user selects a
  // step from outside the drill-down (sidebar click, etc.). Grows
  // when they click an input `refId`. The last element is the step
  // they came from to reach `selectedStepId`.
  drillBreadcrumb: [],

  /** Recompute all astronomical data for the given date */
  compute: (date) => {
    const calculation = getFullCalculation(date);
    set({ calculation });
  },

  /** Select a calculation step from outside the drill-down — resets breadcrumb. */
  selectStep: (stepId) => set({ selectedStepId: stepId, drillBreadcrumb: [] }),
  clearSelection: () => set({ selectedStepId: null, drillBreadcrumb: [] }),

  /**
   * Drill deeper into an input's upstream step. Pushes the current
   * step onto the breadcrumb, then selects the target.
   *
   * Enforces regime discipline (roadmap R3, docs Q2): a chain must
   * not cross regimes — except at the `crossing` step, which is the
   * one bridge by design. Returns true if navigation happened, false
   * if the click was refused by the regime rule.
   */
  drillIntoInput: (fromStepId, toStepId) => {
    const { calculation, drillBreadcrumb } = get();
    if (!calculation) return false;
    const from = calculation.stepMap[fromStepId];
    const to = calculation.stepMap[toStepId];
    if (!from || !to) return false;
    const crossRegime = from.regime && to.regime && from.regime !== to.regime;
    const crossingStepInvolved = from.regime === 'crossing' || to.regime === 'crossing';
    if (crossRegime && !crossingStepInvolved) {
      console.warn(
        `[regime] refused cross-regime drill ${fromStepId}(${from.regime}) → ${toStepId}(${to.regime})`
      );
      return false;
    }
    set({
      selectedStepId: toStepId,
      drillBreadcrumb: [...drillBreadcrumb, fromStepId],
    });
    return true;
  },

  /** Pop the breadcrumb one level; or clear if empty. */
  drillBack: () => {
    const { drillBreadcrumb } = get();
    if (drillBreadcrumb.length === 0) {
      set({ selectedStepId: null });
      return;
    }
    const newCrumb = drillBreadcrumb.slice(0, -1);
    const prev = drillBreadcrumb[drillBreadcrumb.length - 1];
    set({ selectedStepId: prev, drillBreadcrumb: newCrumb });
  },

  /** Get the currently selected step object */
  getSelectedStep: () => {
    const { calculation, selectedStepId } = get();
    if (!calculation || !selectedStepId) return null;
    return calculation.stepMap[selectedStepId] || null;
  },
}));
