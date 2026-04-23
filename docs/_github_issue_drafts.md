# GitHub Issue Drafts — Phase R (Regime Discipline)

Drafted 2026-04-23. Awaiting approval before posting to
`https://github.com/rayistern/kidushhachodesh/issues`.

These mirror ROADMAP.md Phase R items and reference
`docs/OPEN_QUESTIONS.md` for context.

---

## Issue 1 — Engine purism: present Rambam's period-block decomposition

**Title:** Engine purism — compute mean longitudes via Rambam's period-block tables (KH 12:3, 14:1, 14:2, 16:2)

**Labels:** `enhancement`, `pedagogical-correctness`, `phase-R`

**Body:**

The engine currently computes mean longitudes (sun, sun apogee, moon,
moon maslul, node) as `dailyMotion × daysFromEpoch mod 360`. This is
mathematically correct but **pedagogically wrong** — the Rambam
publishes period-block tables (KH 12:3, 14:1, 14:2, 16:2) that the
student is meant to use as the end-user surface, not bypass.

Example: for N = 309,717 days, the Rambam expects the student to
decompose `309717 = 30 × 10000 + 9 × 1000 + 7 × 100 + 1 × 10 + 7`,
sum the corresponding pre-computed period motions (e.g. 10,000-day
motion = 136°28'20" for the sun), and mod 360 the result. We compute
`0.98565° × 309717 mod 360` instead.

Per the maintainer's "stay true to the source" rule (2026-04-23), the
drill-down should present the Rambam's formula, not ours.

### Acceptance criteria

- [ ] Add KH 12:3 sun period-block table to `src/engine/constants.js`
- [ ] Add KH 14:1 moon period-block table
- [ ] Add KH 14:2 moon-maslul period-block table
- [ ] Add KH 16:2 node period-block table
- [ ] Rework `calculateSunMeanLongitude` to expose the period-block
      decomposition via its `formula` and `inputs` fields
- [ ] Same for `calculateSunApogee`, `calculateMoonMeanLongitude`,
      `calculateMoonMaslul`, `calculateNodePosition`
- [ ] Numeric result unchanged (regression test: full pipeline values
      for 3 Nisan 5786 match the current output to within rounding)

### Out of scope

- Dual-view ("our computation vs the Rambam's") — future phase, tracked
  separately when external-astronomy comparisons (VSOP87/ELP2000) are
  added (see ROADMAP V8).

### References

- docs/OPEN_QUESTIONS.md Q4
- docs/ROADMAP.md Phase R, item R1

---

## Issue 2 — Render `daysFromEpoch` as a crossing-point step

**Title:** Crossing-point display for `daysFromEpoch` — make the 309,716 / 309,717 trap pedagogically visible

**Labels:** `enhancement`, `pedagogical-correctness`, `phase-R`

**Body:**

`daysFromEpoch` is the one step in the astronomical pipeline whose
input comes from a different regime — it's a fixed-calendar output
(KH 6-10, Hillel II's integer day count) consumed by the astronomical
pipeline (KH 11-17).

A user (2026-04-23) reported their KH 12:1+ calculations didn't match
ours. Root cause: they had computed mean-synodic time (10,488 molads ×
29d 12h 793p ≈ 309,716.87 days) and fed that into KH 12:1 instead of
the integer calendar day count (309,717). The ~0.13-day drift produces
~0.87° of moon motion drift per 848 years — small but wrong.

We should render this one step distinctly so the trap is visible.

### Acceptance criteria

- [ ] `daysFromEpoch` step gets a visual "crossing" treatment in
      `StepDetail` (distinct from astronomical and fixed-calendar
      steps)
- [ ] Display both numbers side-by-side:
      - `309,717 civil days` (Hillel II integer count — what KH 12:1 wants)
      - `309,716.87 mean-synodic days` (10,488 × molad — what it *looks
        like* KH 12:1 might want, but doesn't)
- [ ] Link to `docs/OPEN_QUESTIONS.md#q1` from this step
- [ ] One-line explanation in the step's teaching-note area

### References

- docs/OPEN_QUESTIONS.md Q1
- docs/ROADMAP.md Phase R, item R2

---

## Issue 3 — Regime-tag every `CalculationStep` and enforce in drill-down chains

**Title:** Regime-tag CalculationSteps (`fixed-calendar` | `astronomical` | `crossing`)

**Labels:** `enhancement`, `architecture`, `phase-R`

**Body:**

The Rambam keeps two computational systems separate (KH 6-10 vs
KH 11-17). When Phase 3 / D2 adds input-click chaining to the
drill-down, chains that cross regimes would recreate exactly the
confusion documented in OPEN_QUESTIONS.md Q1–Q2.

### Acceptance criteria

- [ ] Add a `regime` field to every `CalculationStep` object returned
      by the engine: `'fixed-calendar' | 'astronomical' | 'crossing'`
- [ ] Render a regime badge in `StepDetail` header
- [ ] When input-click chaining lands (D2), enforce:
      - `astronomical` steps only `refId` into other `astronomical`
        steps (or the `crossing` step)
      - `fixed-calendar` steps only `refId` into other
        `fixed-calendar` steps (or the `crossing` step)
      - the `crossing` step may link both directions and is the only
        step where a chain spans regimes

### References

- docs/OPEN_QUESTIONS.md Q2
- docs/ROADMAP.md Phase R, item R3

---

## Issue 4 — Stand up fixed-calendar primitives as their own labeling-layer chain

**Title:** Fixed-calendar primitives for the labeling layer (KH 6-10 as labels, not computation)

**Labels:** `enhancement`, `phase-R`, `scope-decision`

**Body:**

Scope decision 2026-04-23: KH 6-10 appears in this app only as a
labeling / translation layer (Option B of the scope discussion; see
OPEN_QUESTIONS.md Q3). But we should do that properly — right now the
molad display, Rosh Chodesh indicator, and Hebrew date come from ad-
hoc utilities, not from a clean fixed-calendar pipeline analogous to
our astronomical one.

### Acceptance criteria

- [ ] Build a `src/engine/fixedCalendar/` module with step objects for
      BaHaRaD anchor, month count, year arithmetic, dehiyot status,
      molad in d/h/p
- [ ] Each step produces the same `CalculationStep` shape as the
      astronomical pipeline, but `regime: 'fixed-calendar'`
- [ ] Sidebar molad display drills into this chain, NOT the
      astronomical one
- [ ] Rosh Chodesh indicator can explain *why* via dehiyot

### Out of scope

- First-class UI for the fixed calendar as a primary focus area.
  Per Option B, it stays a labeling layer. A full fixed-calendar half
  of the app is a separate future phase.

### References

- docs/OPEN_QUESTIONS.md Q3
- docs/ROADMAP.md Phase R, item R4

---

## Issue 5 — Complete the "Rambam-surface vs internal" audit

**Title:** Audit: classify every displayed value as Rambam-surface or internal

**Labels:** `documentation`, `phase-R`

**Body:**

Before retrofitting any flat table into StepDetail-backed drill-down,
we need to classify every displayed value as either "Rambam-surface"
(a table/value the Rambam publishes as the end-user's working surface;
must not be flattened) or "internal" (our working intermediate; fair
game for drill-down retrofit).

Partial audit done in OPEN_QUESTIONS.md (Q5 + inline regime tags on
engine files, 2026-04-23). Needs to be completed for:

- `AstronomicalCalculations.jsx` — every row
- `Sidebar.jsx` — every ValueRow
- `CelestialVisualization.jsx` — every annotation
- `MoladTimeline.jsx` — every displayed value
- `VisibilityHorizon.jsx`
- `EclipticRibbon.jsx`

### Acceptance criteria

- [ ] Audit table in OPEN_QUESTIONS.md filled in for every UI surface
- [ ] Any Rambam-surface value is explicitly marked with its Rambam
      reference and presented as a table/formula the Rambam himself
      would recognize

### References

- docs/OPEN_QUESTIONS.md Q5
- docs/ROADMAP.md Phase R, item R5

---

## Issue 6 — Drill-down input-chain click + breadcrumb (Phase 3 / D2 implementation)

**Title:** Wire up drill-down input-chain click + breadcrumb navigation

**Labels:** `enhancement`, `phase-3`

**Body:**

StepDetail's input rows already mark numeric inputs as clickable
(`cursor-pointer hover`), but the `onClickInput` handler isn't actually
wired up. Inputs also don't carry an explicit `refId` to the upstream
step. As a result, users can open a step detail but can't drill
*through* it into its input values.

This was the original user request that led to Phase R — once R3 is
in place (regime-tagged steps), D2 becomes safe to implement.

### Acceptance criteria

- [ ] Add explicit `refId` to each input in `CalculationStep.inputs`
      (linking to the upstream step's `id`)
- [ ] Wire `onClickInput` handler in `StepDetail` to call
      `selectStep(input.refId)` when the input has a `refId`
- [ ] Add breadcrumb navigation above StepDetail so users can walk
      back up the chain
- [ ] Enforce regime discipline from R3 — clicks may not cross regimes
      except via the `daysFromEpoch` crossing step

### Blocked by

- #3 (regime-tag every CalculationStep)

### References

- docs/ROADMAP.md Phase 3, D2 and Phase R, item R3
