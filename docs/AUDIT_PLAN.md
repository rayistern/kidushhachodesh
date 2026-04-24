# Audit Plan — Rambam-Cited Constants

Created 2026-04-24 following the Phase R engine purism rework.

## Why this exists

On 2026-04-24, three separate undocumented-rate errors in
`src/engine/constants.js` were discovered — all tagged with `// [R]`
markers that claimed they were Rambam-sourced. One (sun apogee) was
**10× too fast**, drifting the govah by ~116° over 848 years. The
bugs were latent because nobody had ever line-by-line verified the
constants against the Rambam's text.

This audit is the systematic verification pass we should have done
on day one. The goal: every `[R]`-tagged constant gets stamped with
a provenance citation and a cross-check against at least one external
reference (Sefaria text, hebcal output, a published luach, etc.).

## Scope

### Values to verify in `src/engine/constants.js`

Each entry below should be cross-checked against:

1. **Primary source**: Rambam's text on Sefaria
   (`api.sefaria.org/api/v3/texts/Mishneh_Torah,_Sanctification_of_the_New_Month.<chapter>`)
2. **Secondary source**: at least one independent reference —
   hebcal if applicable, a published Hebrew-calendar luach, or the
   Frankel edition's footnotes on variant readings.

Items to audit:

- [ ] `SUN.MEAN_MOTION_PER_DAY` — KH 12:1 (stated 59'8"; implied by
      10-day table as 59'8 1/3")
- [ ] `SUN.START_POSITION` — KH 12:2 (7°3'32" in Aries)
- [ ] `SUN.APOGEE_START` — KH 12:2 (26°45'8" in Gemini)
- [ ] `SUN.APOGEE_MOTION_PER_DAY` — **JUST FIXED** from 1.5"/day to
      0.15"/day. Keep the citation + derivation chain visible so it
      can't regress.
- [ ] `MOON.MEAN_MOTION_PER_DAY` — **JUST FIXED** from 13°10'35.133"
      to 13°10'35".
- [ ] `MOON.START_POSITION` — KH 14:4 (1°14'43" in Taurus)
- [ ] `MOON.MASLUL_MEAN_MOTION` — **JUST FIXED** from 13°3'53.333"
      to 13°3'54" (Sefaria reading). Note: some print editions have
      53 1/3. Document the textual variant.
- [ ] `MOON.MASLUL_START` — KH 14:4 (84°28'42")
- [ ] `NODE.START_POSITION` — KH 16:3 (180°57'28")
- [ ] `NODE.DAILY_MOTION` — KH 16:2 (3'11")
- [ ] All five `*_PERIOD_BLOCKS` tables — cross-check every row
      against the Sefaria text.

### Correction tables

These are the Rambam's published lookup tables. If the values are
off, the whole downstream (sun true, moon true, visibility) drifts:

- [ ] `SUN_MASLUL_CORRECTIONS` — KH 13:4 — 19 rows, every 10°
- [ ] `MOON_MASLUL_CORRECTIONS` — KH 15:4-6 — 19 rows, every 10°
- [ ] `MOON_LATITUDE_TABLE` — KH 16:9-10 — 10 rows
- [ ] `DOUBLE_ELONGATION_ADJUSTMENTS` — KH 15:3
- [ ] `SEASON_CORRECTIONS` — KH 14:5 (ranges + ±15'/±30')

### Galgalim visualization parameters

These are [D] (deduced) not [R], so lower priority. But if anything
has been silently mis-stated, the 3D scene shows a geometrically
wrong arrangement:

- [ ] `SUN.ECCENTRICITY` (0.0167)
- [ ] `SUN.ECCENTRIC_ANGLE` (65.5)
- [ ] `MOON.GALGALIM.RED_DOMEH.DAILY_MOTION` (-11°12' per class transcription)
- [ ] `MOON.GALGALIM.GREEN_YOITZEH.DAILY_MOTION` (24°23' per class transcription)
- [ ] `MOON.GALGALIM.GREEN_YOITZEH.ECCENTRICITY` (0.0549)
- [ ] `MOON.GALGALIM.GALGAL_KATAN.DAILY_MOTION` (derived from KH 14:2)
- [ ] `MOON.GALGALIM.GALGAL_KATAN.RADIUS_DEGREES` (5 per KH 15:9)
- [ ] `MOON.GALGALIM.LATITUDE_CYCLE` (27.21222, draconic month)

### hebcal cross-checks

hebcal implements the Hillel II fixed calendar. Use it to
independently verify:

- [ ] `HDate(3, 'Nisan', 4938).abs()` vs `HDate(3, 'Nisan', 5786).abs()`
      diff = 309,717 (already verified, keep)
- [ ] Monthly molad sequence matches our `fixedCalendar` module's
      output for a span of known years (e.g. RH 5780 through RH 5790)
- [ ] Leap year pattern for years 5780-5800 matches our
      `isHebrewLeapYear` output

### Engine-internal consistency

- [ ] `liveLongitudes.js` uses `daily × N`; `pipeline.js` uses
      period-block decomposition. The two produce values that drift
      from each other by a few arc-seconds (the Rambam's own table
      rounding). Decide: unify on period-blocks for consistency, or
      accept the gap as documented.
- [ ] `src/engine/fixedCalendar/` month counter spot-check:
      `monthsSinceBaharad` for RH of years 5000, 5500, 5780, 5786,
      5800 — verified against hebcal's molad sequence.

### External spot-checks (published luach)

Pick 3-5 reference dates and verify the final outputs:

- [ ] **Molad Tishrei 5786** — compare our fixed-calendar mean
      molad output against a published contemporary luach
- [ ] **Molad Nisan 5786** — same
- [ ] **Rosh Chodesh Nisan 5786 (start date)** — our engine says
      X, published calendars say Y. Any drift from the fixed-calendar
      date matters.
- [ ] **A visibility call** — pick a known "molad zaken" or
      traditional Rosh Chodesh determination and verify our engine
      agrees.

## Deliverables

1. **Updated `constants.js`** — every `[R]` constant gets a Sefaria
   URL fragment or KH chapter:halacha reference that a reader can
   actually click through. For any textual variant (e.g. 53 1/3 vs
   54 seconds), document BOTH readings and state which we chose.
2. **New tests in `src/engine/__tests__/constants-provenance.test.js`** —
   snapshot assertions that each Rambam-cited constant matches its
   published value, so future "refinements" can't silently drift.
3. **Discrepancy log** — a new section in `docs/OPEN_QUESTIONS.md`
   (or a new `docs/CONSTANT_AUDIT_RESULTS.md`) documenting anything
   found: textual variants encountered, values that needed fixing,
   judgment calls made.

## Expected outcomes

- **Best case**: nothing else is off. We get a stamped-audited
  constants file and a provenance test that catches future drift.
- **Likely case**: 1-3 more quiet inconsistencies surface (print
  edition variants, rounding choices). Document them, fix them,
  move on.
- **Worst case**: a correction table has a typo, changing
  downstream outputs. Unlikely but the whole point of an audit.

## Non-goals

- Modern-astronomy comparison (VSOP87/ELP-2000) — that's ROADMAP V8
  territory, a separate feature phase.
- Fixed-calendar dehiyot rules — the `fixedCalendar` module doesn't
  implement those yet (R4 labeling-only decision). If/when we add
  them, they need their own audit.
