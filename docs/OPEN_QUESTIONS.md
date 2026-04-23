# Open Questions & Unresolved Methodology

Living document. Started 2026-04-23 after a user correctly caught us
presenting a number whose meaning we hadn't been careful about.

Treat every entry here as *known uncertainty the maintainers owe
readers*. If an entry says "deferred", the current behavior is a
conscious trade-off, not an oversight. If it says "open", we genuinely
don't know yet.

---

## Q1. What day count does the Rambam's astronomical pipeline actually want?

**Status: resolved (with a deferred implementation item — see Q3).**

### What happened

A user computed, from first principles, the number of days from the
Rambam's astronomical epoch (3 Nisan 4938 AM, KH 11:16) to 3 Nisan 5786.
They arrived at **309,716 days, 20 hours, 984 chalakim** — the result
of multiplying 10,488 mean synodic months by the Rambam's molad length
of 29d 12h 793p. They fed that number into the sun, moon, node, and
apogee formulas of KH 12–16 and found their answers didn't match ours.

Our dashboard uses **309,717** (integer) for the same date.

The discrepancy is ~0.13 of a day — which is roughly **0.87° of moon
motion per 848 years** — so it's small, but it is the difference
between "correct per the Rambam's own framing" and "wrong."

### What each number actually is

| Number | What it is | Which chapter produces it |
|---|---|---|
| **309,716.87** | Mean synodic time elapsed over 10,488 moladot (10,488 × 29d 12h 793p) | A *pure mean-molad clock*. Computable from KH 6:3 alone. |
| **309,717** | Integer count of calendar days between 3 Nisan 4938 AM and 3 Nisan 5786 AM | The *fixed Hebrew calendar* (KH 6–10): BaHaRaD + year arithmetic + dehiyot, executed across 848 years |

These are **different quantities**. They drift apart because the fixed
calendar's dehiyot (KH 7) shift Rosh Hashanah (and cascade-shift the
whole year by 0–2 days) to keep Yom Kippur off Friday/Sunday and keep
Hoshana Rabba off Shabbos. Over 848 years, those tiny shifts net out to
~0.13 of a day between "civil date" and "mean-molad clock."

### Which one does KH 12:1 want?

KH 12:1 says: "ובכל עת שתרצה לידע מקום השמש... תחשוב ימים שלמים מיום
העיקר עד יום שתרצה." — *count the WHOLE DAYS from the epoch to the
target date*. That's an integer civil-day count. The Rambam is asking
"how many calendar days have passed?" — which means the input to the
astronomical pipeline is a **fixed-calendar output**.

So **309,717 is the correct input**. 309,716 is a coherent number for
a different question ("how much mean synodic time has elapsed?") but
not the one KH 12:1 asks.

### What this means for the app

This incident surfaced a deeper issue (Q2). Keep reading.

---

## Q2. Are KH 6–10 and KH 11–17 two separate systems, or one?

**Status: resolved in the Rambam's framing; still working through the
implications for this app.**

### The regime separation

The Rambam's Hilchot Kiddush HaChodesh contains **two parallel
computational systems** that do not share a spine:

#### The Fixed Calendar (KH 6–10)

- **Epoch:** BaHaRaD — molad Tishrei of year 1 AM, 2 days 5 hours 204
  chalakim from creation.
- **Inputs:** BaHaRaD + year number + dehiyot rules.
- **Outputs:** Rosh Chodesh dates, year length (353/354/355/383/384/385
  days), which months are 29 vs 30, leap-year status (7 of every 19).
- **Arithmetic:** pure integer day/hour/chalakim bookkeeping. No
  astronomy enters.
- **Philosophical stance:** the molad here is a *label*, a
  mean-reckoning that doesn't claim to be the true conjunction. It's
  the calendar's spine, not a physical claim.

#### The Astronomical Pipeline (KH 11–17)

- **Epoch:** 3 Nisan 4938 AM (KH 11:16). **Different epoch than
  BaHaRaD.** This alone tells you the two systems don't share a spine.
- **Inputs:** days from 3 Nisan 4938 + daily motions + correction
  tables (KH 13:4, 15:4-6, 16:9-10).
- **Outputs:** true longitudes of sun and moon, node position, moon
  latitude, crescent visibility.
- **Philosophical stance:** the Rambam explicitly frames these chapters
  in KH 11:1-4 as a tool for a hypothetical beit din returning to
  sighted-moon sanctification. The astronomical pipeline has *no input
  from* and *no output to* the fixed calendar.

### But they touch at exactly one point

The Rambam's "count days from the epoch" step (KH 12:1) imports an
integer day count from the fixed calendar. There is no astronomical
way to locate "3 Nisan 4938" in absolute day-number space — the date
label itself is a fixed-calendar fact.

So the two systems are not fully parallel. They meet at one edge: the
`daysFromEpoch` step. Upstream of that step is fixed-calendar
territory; downstream is purely astronomical. That single crossing is
where the 309,716 / 309,717 trap lives.

### Implications for this app

- **Drill-downs must be regime-labeled.** A user drilling into "true
  moon longitude" should land at astronomical primitives (daily motion,
  correction tables). A user drilling into "molad of Nisan" should land
  at fixed-calendar primitives (BaHaRaD, month number × synodic month).
  The two drill-down trees **must not cross-reference**, or we'll
  recreate this user's confusion in every student.
- The `daysFromEpoch` step is the one place where a drill-down crosses
  regimes. We should surface that explicitly in its display — with
  exactly the distinction laid out in Q1 above.

---

## Q3. Scope of this app — how much of KH 6–10 do we implement?

**Status: decided (Option B). 2026-04-23.**

### The decision

**Option B: keep KH 6–10 as a labeling/translation layer only.**

The fixed calendar appears in the app in three bounded roles:

1. **Date-entry translation.** User picks a civil or Hebrew date; we
   translate via the fixed calendar (hebcal) to produce an integer day
   count.
2. **Rosh Chodesh overlay.** Labeling: "this date is Rosh Chodesh per
   the fixed calendar."
3. **Molad display.** As a reference point on the timeline, marked
   explicitly as a fixed-calendar output, not part of the astronomical
   computation.

The fixed calendar **must not** appear in the astronomical drill-down
graph except at the single `daysFromEpoch` crossing step (where it
belongs by the Rambam's own design).

### Why not Option A (drop KH 6–10 entirely)?

Considered. Rejected because: (a) the Rambam himself places both halves
under "Kidush HaChodesh" — cutting 6–10 entirely would misrepresent
his scope; (b) users need a Hebrew date to feel oriented; (c) the
Rosh-Chodesh overlay is pedagogically useful *because* it shows where
the fixed calendar sits relative to true astronomy.

### What this rules out

- No first-class UI for the fixed calendar's internals (dehiyot rules,
  year-length arithmetic, leap-year cycle display) unless we
  explicitly scope a future phase for "the fixed calendar half of the
  app."
- The current `moladTimeline.js` sits at the boundary. It derives tick
  positions from BaHaRaD (fixed calendar), anchored at the astronomical
  epoch (see `EPOCH_OFFSET_TO_FIRST_MOLAD`). It's allowed because it
  serves as visual context for the astronomical scene, but it must
  stay labeled as fixed-calendar output.

---

## Q4. Should the engine compute via the Rambam's period-block tables
instead of `dailyMotion × days`?

**Status: open. Deferred to a future phase (see ROADMAP Phase 2+).**

### The issue

The Rambam publishes **pre-computed period motion tables** for sun,
moon, moon-maslul, and node:

- **KH 12:3** — sun motion for 10, 100, 1000, 10000, 29, and 354 days, and
  the 19-year cycle
- **KH 14:1** — moon mean-motion period blocks
- **KH 14:2** — moon maslul period blocks
- **KH 16:2** — node period blocks

These are not optimizations we chose to bypass. The Rambam *expects*
the student to decompose N days into these blocks (e.g., 309,717 = 30 ×
10000 + 9 × 1000 + 7 × 100 + 1 × 10 + 7) and sum pre-computed motions
— not to multiply a daily-motion constant by N.

Our current engine does `dailyMotion × daysFromEpoch mod 360`.
Mathematically identical, but **pedagogically wrong**: when a user
drills into a step, they see a formula the Rambam doesn't use.

### The decision rule ("stay true to the source")

The maintainer's rule, stated 2026-04-23: the drill-down should
present the Rambam's surface. We do not offer a "dual view" that
compares our computation to his — that's a future-phase feature
(external astronomy comparison is the natural place to add it).

### Why deferred

Rewiring the engine to compute via period-block decomposition is real
work: every mean-motion step (`calculateSunMeanLongitude`,
`calculateSunApogee`, `calculateMoonMeanLongitude`,
`calculateMoonMaslul`, `calculateNodePosition`) needs to expose both
the decomposition of N days into period blocks and the sum of
corresponding period motions. The answer is the same; the formula
shown to the user is not.

This is tracked in the roadmap and as a GitHub issue. Not a bug — a
known tech-debt item against the "stay true to the source" rule.

---

## Q5. The `AstronomicalCalculations.jsx` table and other "flat" views
— are those our internal surfaces or the Rambam's cheat-sheets?

**Status: open. Audit pending.**

### The concern

Some display surfaces in the app look like "tables we could replace
with proper drill-downs" but may in fact be the Rambam's own published
cheat-sheet surfaces that the student is meant to use as-is. Before
any "retrofit flat tables into StepDetail" work, we need to classify
every displayed value as one of:

1. **Internal intermediate** — our engine's working value. Safe to
   wrap in StepDetail with formulas and inputs.
2. **Rambam-published surface** — a table/value the Rambam himself
   presents as the end-user's working surface. Must stay first-class;
   don't flatten into our internal derivation.
3. **Both** — a value the Rambam publishes *and* we compute. Per Q4's
   decision: show the Rambam's surface; never dual-display with our
   internal.

The classification lives inline with each engine/display file as it's
audited. Summary table below (will be filled in as audit proceeds).

### Audit status

See `Inline Audit Summary` section at the bottom of this document.

---

## Q6. Should mean-molad timeline anchoring use Jerusalem mean solar
time instead of UT?

**Status: known open ambiguity. See `src/engine/moladTimeline.js` and
the README.**

This one predates the current conversation. Including here for
completeness. The molad timeline's tick anchoring treats BaHaRaD's
civil time as UT; the Rambam almost certainly meant Jerusalem mean
solar time (~UT+2h21m). This introduces a ~2h offset in where mean-
molad tick marks fire, affecting the **decorative timeline only** —
the astronomical engine is unaffected.

---

## Inline Audit Summary (Q5 follow-up)

Audit proceeds file-by-file, with regime and surface-category tags
added inline. This table is the roll-up.

| File | Regime | Surface Category | Notes |
|---|---|---|---|
| `src/engine/epochDays.js` | **crossing** | Internal | Single boundary point between fixed-calendar and astronomical. Must stay labeled as such. |
| `src/engine/sunCalculations.js` | astronomical | Internal (currently); Rambam-surface target for Q4 rework | Currently uses daily-motion × days. Rambam publishes period-block tables (KH 12:3) as the end-user surface. |
| `src/engine/moonCalculations.js` | astronomical | Internal (currently); Rambam-surface target for Q4 rework | Same as sun. Also hosts the node calculation. |
| `src/engine/visibilityCalculations.js` | astronomical | Internal | Riding on top of KH 11-17 outputs. Safe for drill-down retrofit. |
| `src/engine/moladTimeline.js` | fixed-calendar | Internal (labeling layer) | Per Q3 Option B: labeled, visible, but not cross-linked into astronomical drill-down. |
| `src/engine/constants.js` | mixed | Mostly Rambam-surface | The correction tables (SUN_MASLUL_CORRECTIONS, MOON_MASLUL_CORRECTIONS, MOON_LATITUDE_TABLE, DOUBLE_ELONGATION_ADJUSTMENTS, SEASON_CORRECTIONS) are **Rambam's published tables, verbatim**. They belong to the Rambam's surface — our drill-down should present them as such, not "deduce" values from them without showing the table. |
| `src/components/AstronomicalCalculations.jsx` | astronomical | Internal (flat table) | Legacy. Low priority for drill-down retrofit; cleanup tracked in roadmap. |
| `src/components/layout/Sidebar.jsx` | astronomical (+ fixed-calendar labeling) | Both | Mixes Hebrew date / molad display (fixed-calendar labels) with astronomical value rows. Acceptable per Q3, but drill-down click from molad must NOT land on astronomical steps. |
| `src/components/visualizations/MoladTimeline.jsx` | fixed-calendar | Internal (labeling layer) | Per Q3. |
| `src/components/visualizations/VisibilityHorizon.jsx` | astronomical | Internal | Downstream of KH 11-17. |
| `src/components/dashboard/CalculationChain.jsx` | astronomical (+ boundary display at daysFromEpoch) | Internal UI | Drill-down renderer. Must enforce regime-labeling per Q2. |

---

## How to link to this document

This file is a permanent resource, not a one-off memo. Frontend
components should link to it (or to specific anchors inside it) any
time a user is likely to hit one of the traps documented here.

In particular:

- The `daysFromEpoch` step display should link to Q1+Q2 (the crossing-
  point explanation).
- The "methodology notes" footer link (next to source-legend) should
  link to this document.
- The molad display should link to Q3 (fixed calendar as labeling
  layer only) and Q6 (timezone anchoring ambiguity).

Permalink once merged:
`https://github.com/rayistern/kidushhachodesh/blob/main/docs/OPEN_QUESTIONS.md`
