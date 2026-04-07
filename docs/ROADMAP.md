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

- [ ] Touch-friendly tap targets (min 44px) on all controls
- [ ] Swipe-to-dismiss on overlay drawers
- [ ] Bottom-sheet pattern for narrow viewports (instead of side drawer)
- [ ] Compact header on mobile (title abbreviated, fewer chrome buttons)
- [ ] Hide playback overlay's secondary controls behind a single ⋯ button on phones
- [ ] Verify pinch-zoom doesn't conflict with OrbitControls
- [ ] Test landscape vs portrait — separate breakpoint behavior
- [ ] Larger Hebrew text on mobile (Hebrew often renders smaller than Latin at the same px)
- [ ] Sticky date picker so user can scrub time without losing the visualization

---

## Phase 2 — High-impact visualizations

These are the next batch to build. Ordered by pedagogical leverage for chs 12-17.

### V1. Ecliptic ribbon strip
Horizontal 360° unwound zodiac under the 3D scene.
- [ ] 12 mazalot with Hebrew labels
- [ ] Live markers: sun, moon, sun apogee (govah), moon node (rosh)
- [ ] Markers slide in real time as animation runs
- [ ] Click a marker → opens its drill-down in right panel
- [ ] Highlights current mazal as date changes
- **Why it matters:** bridges the abstract 3D position with the actual longitude *number*. Students who can't read 3D can read a strip.

### V2. Mean vs True ghost bodies
Two semi-transparent copies of each body in the 3D scene.
- [ ] Ghost at *emtzoi* position (mean longitude — concentric model)
- [ ] Solid body at *amiti* position (true — eccentric model)
- [ ] Faint connector line between them = the maslul correction made visible
- [ ] Toggle to show/hide ghosts
- **Why it matters:** the gap IS the maslul. Once seen, never forgotten.

### V3. Galgal isolation toggles
Eye-icon next to each galgal in the legend.
- [ ] Click to hide a single galgal
- [ ] "Solo" double-click (hides everything else)
- [ ] "Show all" reset
- **Why it matters:** answers "what does THIS galgal actually do?" — the heart of Rabbi Losh's pedagogy.

### V4. Maslul correction graph
Small chart showing the correction value across one full anomalistic cycle.
- [ ] Sine-shaped curve from the actual table values (Rambam 13:7-8 and 15:6-7)
- [ ] Moving dot at today's anomaly position
- [ ] Click any point → jumps date to that anomaly
- [ ] Separate panels for sun maslul and moon maslul
- **Why it matters:** turns the static lookup table into a living shape. Students see WHERE in the cycle they are.

### V5. Time-lapse trails
Faint trail showing recent positions of sun & moon.
- [ ] Configurable trail length (1 day / 1 week / 1 month / 1 year)
- [ ] Different colors for sun vs moon
- [ ] Visible bunching where the maslul slows the body down
- [ ] Toggle on/off (off by default to avoid clutter)
- **Why it matters:** reveals the loops the moon makes against the sun's smooth march.

### V6. Visibility horizon diagram
Side-view of western horizon at sunset for Rosh Chodesh.
- [ ] Sun position below horizon
- [ ] Moon position above
- [ ] Arc of vision (קשת הראיה) shaded
- [ ] First light (אור ראשון) marker
- [ ] Four conditions of ch 17 as a checklist with current values
- **Why it matters:** ch 17 is the climax of the astronomical section — visibility is the entire point of the model.

### V7. Conjunction / molad timeline
Horizontal timeline of upcoming/past moladot.
- [ ] Pin every molad
- [ ] Step backward / forward by molad
- [ ] Show difference between mean molad and true conjunction
- [ ] Click any pin → date jumps, scene updates
- **Why it matters:** the ~29.5 day rhythm vs true conjunction is hard to grasp without seeing both.

### V8. Modern overlay (optional)
Thin line at the modern-astronomy position of each body.
- [ ] Sun position from VSOP87 or similar
- [ ] Moon position from ELP-2000 or similar
- [ ] Difference badge (e.g. "Rambam: 12°34', Modern: 12°31'")
- **Why it matters:** demonstrates how astonishingly close the Rambam gets, usually within a fraction of a degree.

---

## Phase 3 — Drill-downs and linking

### D1. Click-galgal-for-details
- [ ] Click any galgal in 3D → right panel switches to its info card
- [ ] Card shows: Hebrew name, Rambam ref, current rotation, daily motion, role, related halachot

### D2. Click-value-highlights-chain
- [ ] Click "True longitude" in sidebar → all contributing galgalim pulse in 3D
- [ ] Click any intermediate value → shows its derivation chain visually

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

- [ ] Sefaria API fetch for chs 11-19
- [ ] Hebrew + English side-by-side
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
