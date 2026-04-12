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

### D3. Halacha ↔ value cross-links — `src/lib/rambamChips.js`
- [x] Numerical values inside Rambam reader become clickable chips
- [x] Click chip → calculation step selected + galgalim pulse

### D4. Guided "Why is the moon there tonight?" walkthrough — `GuidedWalkthrough.jsx`
- [x] Step-by-step text bubbles (`src/content/walkthroughs.js`)
- [x] Each step animates its relevant galgal + swings camera
- [ ] No audio yet — future audio sync replaces text

### D5. Date scrubber linked to everything — `DateScrubber.jsx`
- [x] Drag slider → live scene offset updates without losing calendar date
- [x] Snap-to-molad option

### D6. Compare two dates side-by-side — `CompareView.jsx` at `/compare`
- [x] Pick two dates with independent pickers
- [~] Skipped twin 3D scenes (perf risk) — rich side-by-side summary instead
- [x] Diff of calculation chain showing what changed (red/green by row)

---

## Phase 4 — Rambam text integration

- [x] Sefaria API fetch for chs 11-19 (`RambamReader.jsx`)
- [x] Hebrew + English side-by-side
- [x] Cross-reference links (D3 above)
- [x] Save/bookmark current halacha (localStorage `kh:bookmarks`)
- [x] Search within chapters (client-side, highlights matches)

---

## Phase 5 — Routing

- [x] react-router-dom v7 wired in `src/main.jsx` + `src/App.jsx`
- [x] `/` Dashboard
- [x] `/explore` Free 3D (panels closed)
- [x] `/calculate/:date?` Drill-down focus (opens right panel)
- [x] `/learn/:chapter?` Rambam reader
- [x] `/compare` Two-date compare

---

## Phase 6 — Audio sync (post-podcast launch)

- [ ] Audio player component
- [ ] Timecode → camera/highlight/text mapping
- [ ] Per-podcast-episode mapping file
- [ ] Visual progress indicator on calculation chain

---

## Cross-cutting

- [x] Test coverage for engine (vitest) — `src/engine/__tests__/pipeline.test.js` + chip parser tests
- [~] Accessibility pass (keyboard shortcuts `[`/`]`/`Esc` via `useKeyboardShortcuts`, existing aria-labels; full screen-reader audit still TODO)
- [x] Print stylesheet for sharing calculation chains (`src/styles/print.css`)
- [x] i18n scaffolding (`src/i18n/index.js`, `uiStore.locale`)
