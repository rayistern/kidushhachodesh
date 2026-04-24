/**
 * Fixed-calendar (KH 6-10) module.
 *
 * Provides a separate step-chain parallel to the astronomical pipeline,
 * wired into the main `getFullCalculation` so StepDetail / drill-down
 * renders its steps alongside (but regime-labeled separately from) the
 * astronomical steps. See docs/OPEN_QUESTIONS.md Q3 Option B.
 *
 * Public API:
 *   runFixedCalendarChain(hDate) → { steps, stepMap, meanMolad }
 */
export { runFixedCalendarChain } from './steps.js';
export {
  isHebrewLeapYear,
  monthsInYear,
  monthsFromYear1ToTishrei,
  monthPositionInYear,
  monthsSinceBaharad,
} from './months.js';
export * from './constants.js';
