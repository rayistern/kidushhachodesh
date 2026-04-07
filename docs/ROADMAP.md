# Kiddush HaChodesh Dashboard — Roadmap

Living document. Current focus: deepen pedagogical value before / during Rabbi Zajac's astronomical chapters (12-17).

## Status legend

- [ ] not started
- [~] in progress
- [x] done

---

## Phase 1 — Foundation (mostly complete)

- [x] Vite migration
- [x] Calculation engine refactor (`src/engine/`) with step objects
- [x] Bug fixes: moon maslul DMS, double elongation, separate maslul tables
- [x] Zustand state stores
- [x] 3D scene with rotating galgalim (bodies are passive, dragged by parents)
- [x] Sun: blue deferent + red eccentric
- [x] Moon: red domeh, blue noteh, green yoitzeh, galgal katan
- [x] Tailwind dashboard layout
- [x] Drill-down calculation chain (basic)
- [x] Sideways "Rabbi Losh" view as default
- [x] Warmer color palette
- [x] Auto-collapsing side panels (mobile drawer / desktop inline)
- [x] Animation playback controls

---

## Phase 1.5 — Mobile UX pass

- [x] Touch-friendly tap targets (min 44px) on all controls
- [ ] Swipe-to-dismiss on overlay drawers
- [ ] Bottom-sheet pattern for narrow viewports (instead of side drawer)
- [x] Compact header on mobile (title abbreviated, fewer chrome buttons)
- [ ] Hide playback overlay's secondary controls behind a single ⋯ button on phones
- [ ] Verify pinch-zoom doesn't conflict with OrbitControls
- [ ] Test landscape vs portrait — separate breakpoint behavior
- [x] Larger Hebrew text on mobile (Hebrew often renders smaller than Latin at the same px)
- [x] Sticky date picker so user can scrub time without losing the visualization

---

## Phase 2 — High-impact visualizations

V1-V7 shipped (commits 1eeb080, 3e2dc47). Sources under `src/components/visualizations/` and `src/components/3d/Trails.jsx`.

### V1. Ecliptic ribbon strip
Horizontal 360° unwound zodiac under the 3D scene.
- [x] 12 mazalot with Hebrew labels
- [x] Live markers: sun, moon, sun apogee (govah), moon node (rosh)
- [x] Markers slide in real time as animation runs
- [x] Click a marker → opens its drill-down in right panel
- [x] Highlights current mazal as date changes
- **Why it matters:** bridges the abstract 3D position with the actual longitude *number*. Students who can't read 3D can read a strip.

### V2. Mean vs True ghost bodies
Two semi-transparent copies of each body in the 3D scene.
- [x] Ghost at *emtzoi* position (mean longitude — concentric model)
- [x] Solid body at *amiti* position (true — eccentric model)
- [x] Faint connector line between them = the maslul correction made visible
- [x] Toggle to show/hide ghosts
- **Why it matters:** the gap IS the maslul. Once seen, never forgotten.

### V3. Galgal isolation toggles
Eye-icon next to each galgal in the legend.
- [x] Click to hide a single galgal
- [x] "Solo" double-click (hides everything else)
- [x] "Show all" reset
- **Why it matters:** answers "what does THIS galgal actually do?" — the heart of Rabbi Losh's pedagogy.

### V4. Maslul correction graph
Small chart showing the correction value across one full anomalistic cycle.
- [x] Sine-shaped curve from the actual table values (Rambam 13:7-8 and 15:6-7)
- [x] Moving dot at today's anomaly position
- [x] Click any point → jumps date to that anomaly
- [x] Separate panels for sun maslul and moon maslul
- **Why it matters:** turns the static lookup table into a living shape. Students see WHERE in the cycle they are.

### V5. Time-lapse trails
Faint trail showing recent positions of sun & moon.
- [x] Configurable trail length (1 day / 1 week / 1 month / 1 year)
- [x] Different colors for sun vs moon
- [x] Visible bunching where the maslul slows the body down
- [x] Toggle on/off (off by default to avoid clutter)
- **Why it matters:** reveals the loops the moon makes against the sun's smooth march.

### V6. Visibility horizon diagram
Side-view of western horizon at sunset for Rosh Chodesh.
- [x] Sun position below horizon
- [x] Moon position above
- [x] Arc of vision (קשת הראיה) shaded
- [x] First light (אור ראשון) marker
- [x] Four conditions of ch 17 as a checklist with current values
- **Why it matters:** ch 17 is the climax of the astronomical section — visibility is the entire point of the model.

### V7. Conjunction / molad timeline
Horizontal timeline of upcoming/past moladot.
- [x] Pin every molad
- [x] Step backward / forward by molad
- [x] Show difference between mean molad and true conjunction
- [x] Click any pin → date jumps, scene updates
- **Why it matters:** the ~29.5 day rhythm vs true conjunction is hard to grasp without seeing both.

---

## Phase 3 — Drill-downs and linking

### D1. Click-galgal-for-details (shipped, 3e2dc47)
- [x] Click any galgal in 3D → right panel switches to its info card
- [x] Card shows: Hebrew name, Rambam ref, current rotation, daily motion, role, related halachot

### D2. Click-value-highlights-chain (shipped, 3e2dc47)
- [x] Click "True longitude" in sidebar → all contributing galgalim pulse in 3D
- [x] Click any intermediate value → shows its derivation chain visually

### D3. Halacha ↔ value cross-links
- [ ] Numerical values inside Rambam reader become clickable chips
- [ ] Click chip → calculation step scrolls into view + galgal pulses

### D4. Guided "Why is the moon there tonight?" walkthrough
- [ ] Step-by-step text bubbles
- [ ] Each step animates its relevant galgal
- [ ] No audio yet — future audio sync replaces text

### D5. Date scrubber linked to everything
- [ ] Drag timeline → date, calcs, 3D, current halacha all update
- [ ] Snap-to-molad option

### D6. Compare two dates side-by-side
- [ ] Pick "today" and any other date
- [ ] Two mini 3D scenes
- [ ] Diff of calculation chain showing what changed
- [ ] Useful for: why this month is 29 vs 30, why molad walks forward, etc.

---

## Phase 4 — Rambam text integration

- [x] Sefaria API fetch for chs 11-19 (`RambamReader.jsx`)
- [x] Hebrew + English side-by-side
- [ ] Cross-reference links (D3 above)
- [ ] Save/bookmark current halacha
- [ ] Search within chapters

---

## Phase 5 — Routing

- [ ] react-router-dom v7
- [ ] `/` Dashboard
- [ ] `/explore` Free 3D
- [ ] `/calculate/:date?` Drill-down focus
- [ ] `/learn/:chapter?` Rambam reader

---

## Phase 6 — Audio sync (post-podcast launch)

- [ ] Audio player component
- [ ] Timecode → camera/highlight/text mapping
- [ ] Per-podcast-episode mapping file
- [ ] Visual progress indicator on calculation chain

---

## Cross-cutting

- [ ] Test coverage for engine (vitest)
- [ ] Accessibility pass (keyboard nav, ARIA, screen reader)
- [ ] Print stylesheet for sharing calculation chains
- [ ] i18n scaffolding (Hebrew interface option, not just Hebrew content)

---

## Phase R — Regime discipline (added 2026-04-23)

Prompted by a user report where 309,716 (mean-synodic time) was
confused with 309,717 (integer civil-day count) as input to KH 12:1.
Rubber-ducking that incident surfaced a deeper issue: the app wasn't
being explicit about the boundary between fixed-calendar (KH 6-10) and
astronomical (KH 11-17) computation. Full writeup in
[docs/OPEN_QUESTIONS.md](./OPEN_QUESTIONS.md).

### R1. Engine purism — present Rambam's period-block decomposition

Currently every mean-motion step computes `dailyMotion × daysFromEpoch`
as a shortcut. The Rambam publishes period-block tables (KH 12:3,
14:1, 14:2, 16:2) that the student is meant to sum — 309,717 days =
30×10000 + 9×1000 + 7×100 + 1×10 + 7 days, each with a pre-computed
motion. Mathematically identical, pedagogically different.

- [ ] Expose KH 12:3 sun motion-per-period table in `constants.js`
- [ ] Expose KH 14:1 moon motion-per-period table
- [ ] Expose KH 14:2 moon-maslul motion-per-period table
- [ ] Expose KH 16:2 node motion-per-period table
- [ ] Rework `calculateSunMeanLongitude`, `calculateSunApogee`,
      `calculateMoonMeanLongitude`, `calculateMoonMaslul`,
      `calculateNodePosition` to expose the period-block decomposition
      as the `formula` field and the summed blocks as the `inputs`
- [ ] Drill-down shows: N days decomposed into period blocks, each
      block's pre-computed motion from the table, sum mod 360
- **Why it matters:** "Stay true to the source" rule (Q4). The
  drill-down is worthless as pedagogy if the formula it shows isn't
  the formula the Rambam teaches.

### R2. `daysFromEpoch` crossing-point display

The one step in our pipeline where fixed-calendar output becomes
astronomical input. Must be rendered distinctly.

- [ ] Add explicit "crossing step" visual treatment in StepDetail
- [ ] Show both "309,717 civil days (from Hillel II arithmetic)" AND
      "309,716.87 mean-synodic days (from KH 6:3 molad × months)" as
      a side-by-side callout — so the trap that produced this phase is
      pedagogically visible
- [ ] Link to Q1 of OPEN_QUESTIONS.md
- **Why it matters:** this single crossing is where the 309,716 /
  309,717 trap lives. Every student will benefit from seeing both
  numbers explicitly distinguished once.

### R3. Regime-labeled drill-down

Per Q2 (regime separation), drill-down chains must stay within one
regime.

- [ ] Tag every `CalculationStep` with a `regime` field:
      `'fixed-calendar' | 'astronomical' | 'crossing'`
- [ ] Render a regime badge in StepDetail header
- [ ] When input-click chaining is wired (D2 above), enforce:
      a `fixed-calendar` step may only `refId` into another
      `fixed-calendar` step (except via the `crossing` step)

### R4. Fixed-calendar primitives for the labeling layer

Per Q3 (Option B): keep KH 6-10 as labeling only, but do it properly.

- [ ] Stand up fixed-calendar primitives (BaHaRaD, month-count,
      year-length, dehiyot status) as their own step chain — separate
      from the astronomical pipeline
- [ ] Molad display in sidebar drills into this chain, not the
      astronomical one
- [ ] Rosh Chodesh indicator explains *why* via dehiyot when relevant

### R5. "Stay true to the source" audit

Classify every displayed value (Q5 in OPEN_QUESTIONS.md).

- [ ] Finish the audit table in OPEN_QUESTIONS.md — every route in
      the UI accounted for
- [ ] Any "Rambam-surface" value must be presented as the Rambam's
      own table / formula, not our internal computation
- [ ] Internal intermediates are fair game for drill-down retrofit
- [ ] Dual-view ("our computation vs Rambam's") is OUT OF SCOPE for
      this phase — tracked as a future "astronomy comparison" phase
      if we ever add VSOP87/ELP2000 overlays (see V8 in Phase 2)

### R6. Frontend links to OPEN_QUESTIONS.md

- [ ] "Methodology notes" link in sidebar footer
- [ ] Contextual links from specific steps (molad, daysFromEpoch)
- [ ] Maintain `docs/OPEN_QUESTIONS.md` as new uncertainties surface
