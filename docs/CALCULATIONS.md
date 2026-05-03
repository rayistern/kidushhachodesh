# Kiddush HaChodesh — Calculation Engine Documentation

This document describes the astronomical calculation engine used in this app,
based on the Rambam's Hilchot Kiddush HaChodesh chapters 11-17.

## Source Annotations

Every calculation step in the app carries a source tag, visible in the UI:

| Tag | Color  | Meaning |
|-----|--------|---------|
| **R** (Rambam)      | Blue   | Value directly from the Rambam's text |
| **~** (Interpolated) | Amber  | Interpolated between Rambam's table entries |
| **D** (Deduced)      | Purple | Not explicit in the Rambam — deduced from the model or external sources |
| **L** (Rabbi Losh)   | Green  | From Rabbi Yosef Losh's teaching tradition (colors, orientations, pedagogical framing) |

---

## Sun Calculations (KH 12-13)

### Rambam's Model (Rabbi Losh's Teaching)

The sun sits inside TWO nested galgalim:
- **Blue** (outer galgal) — centered on Earth, moves ~1 degree per 70 years
- **Red** (inner galgal) — off-center inside the blue, carries the sun

Because the red's center is NOT Earth's center, the sun's apparent position in
the mazalos differs depending on whether you observe from the red's center
(emtzoi) or from Earth (amiti). Max difference: ~2 degrees.

### Calculation Flow

```
1. Days from Epoch        KH 11:16    3 Nisan 4938 = April 3, 1177 CE
2. Sun Mean Longitude     KH 12:1     emtza = epoch_pos + 0°59'8.33" * days
3. Sun Apogee (Govah)     KH 12:2     govah = epoch_govah + ~0.000417°/day * days
4. Sun Maslul             KH 13:1     maslul = meanLon - apogee
5. Sun Correction         KH 13:4     Lookup in SUN table (max ~2° at 90°)
6. Sun True Longitude     KH 13:2-6   If maslul < 180°: mean - correction
                                       If maslul > 180°: mean + correction
```

### Sun Maslul Correction Table (KH 13:4)

| Maslul | Correction | Maslul | Correction |
|--------|-----------|--------|-----------|
| 10°    | 0° 20'    | 100°   | 1° 58'    |
| 20°    | 0° 40'    | 110°   | 1° 53'    |
| 30°    | 0° 58'    | 120°   | 1° 45'    |
| 40°    | 1° 15'    | 130°   | 1° 33'    |
| 50°    | 1° 29'    | 140°   | 1° 19'    |
| 60°    | 1° 41'    | 150°   | 1° 01'    |
| 70°    | 1° 51'    | 160°   | 0° 42'    |
| 80°    | 1° 57'    | 170°   | 0° 21'    |
| 90°    | 1° 59'    | 180°   | 0° 00'    |

---

## Moon Calculations (KH 14-16)

### Rambam's Model (Rabbi Losh's Teaching)

The moon has FOUR galgalim:

1. **Red (Domeh)** — Outermost. Aligned with the ecliptic (kav hamazalos).
   Moves 11°12'/day mi'mizrach l'maarav.
2. **Blue (Noteh)** — Tilted 5° off the ecliptic. Creates the rosh/zanav
   (ascending/descending nodes). Carried by the red.
3. **Green (Yoitzeh)** — Off-center (has its own govah, like the sun's red).
   Moves 24°23'/day mi'maarav l'mizrach. Net motion when combined with
   red+blue: ~13°10'/day.
4. **Galgal Katan** — Small epicycle inside the green. Moon sits on its EDGE.
   Diameter = 10° (5° radius). Moves 13°3'53"/day.

Key concept: **Nekudah Hanichaches** (Prosneusis Point)
The reference point for measuring the galgal katan's motion is NOT the green's
center, NOT Earth's center, but a point on the OPPOSITE side of Earth from the
green's center. This shifts the apparent speed — the moon appears to move
faster than 13°3' after the molad.

### Calculation Flow

```
 1. Moon Mean Longitude        KH 14:1     emtza = epoch_pos + 13°10'35" * days
 2. Season Correction          KH 14:5     Adjust for sunset timing (±15' or ±30')
 3. Moon Maslul (Anomaly)      KH 14:2     emtza_maslul = epoch + 13°3'53" * days
 4. Double Elongation          KH 15:1-2   merchak_kaful = 2 * (moon_mean - sun_mean)
 5. Maslul Hanachon            KH 15:3     Adjusted maslul = emtza_maslul + table(merchak_kaful)
 6. Moon Correction            KH 15:4-6   Lookup in MOON table (max ~5°8' at 100°)
 7. Moon True Longitude        KH 15:4     If maslul_hanachon < 180°: adjusted_mean - correction
                                            If maslul_hanachon > 180°: adjusted_mean + correction
 8. Node Position (Rosh)       KH 16:2-3   rosh = 360 - (epoch_rosh + 3'11"/day * days)
 9. Moon Latitude              KH 16:9-10  Lookup from distance to rosh (max ±5°)
```

### Double Elongation Adjustment Table (KH 15:3)

| Merchak Kaful | Adjustment |
|---------------|-----------|
| 0° - 5°      | 0°        |
| 6° - 11°     | +1°       |
| 12° - 18°    | +2°       |
| 19° - 24°    | +3°       |
| 25° - 31°    | +4°       |
| 32° - 38°    | +5°       |
| 39° - 45°    | +6°       |
| 46° - 51°    | +7°       |
| 52° - 59°    | +8°       |
| 60° - 63°    | +9°       |

Note: The Rambam only specifies up to 63° because that is the maximum merchak
kaful at which the new moon could be visible (KH 15:2). For general computation
beyond this range, the app extrapolates (marked as "approximated" in the UI).

### Moon Maslul Correction Table (KH 15:4-6)

**This is DIFFERENT from the sun's table.**

| Maslul | Correction | Maslul | Correction |
|--------|-----------|--------|-----------|
| 10°    | 0° 52'    | 100°   | 5° 08'    |
| 20°    | 1° 43'    | 110°   | 4° 59'    |
| 30°    | 2° 30'    | 120°   | 4° 40'    |
| 40°    | 3° 13'    | 130°   | 4° 11'    |
| 50°    | 3° 44'    | 140°   | 3° 33'    |
| 60°    | 4° 16'    | 150°   | 2° 48'    |
| 70°    | 4° 41'    | 160°   | 2° 05'    |
| 80°    | 5° 00'    | 170°   | 0° 59'    |
| 90°    | 5° 05'    | 180°   | 0° 00'    |

Note: The peak correction is at 100° (5°8'), NOT at 90°. This asymmetry
is caused by the nekudah hanichaches shifting the effective center of
measurement. For maslul > 180°, subtract from 360° and ADD the correction.

### Moon Latitude Table (KH 16:9)

| Distance from Rosh | Latitude |
|--------------------|----------|
| 10°                | 0° 52'   |
| 20°                | 1° 43'   |
| 30°                | 2° 30'   |
| 40°                | 3° 13'   |
| 50°                | 3° 44'   |
| 60°                | 4° 16'   |
| 70°                | 4° 41'   |
| 80°                | 5° 00'   |
| 90°                | 5° 00'   |

These values closely match 5° * sin(angle), but the app uses the Rambam's
explicit table for accuracy rather than computing sin().

Direction: 0-180° from rosh = northward, 180-360° = southward.

---

## Bugs Fixed

### Bug 1: Moon maslul ignored minutes and seconds
**File:** `astronomyCalc.js:84-86`
**Problem:** Used only `MASLUL_START.degrees` (13) instead of the full DMS
value (13° 3' 53.333"). Error: ~0.065°/day, compounding to ~2° per month.
**Fix:** Use `dmsToDecimal()` for both start and motion values.

### Bug 2: Wrong correction table for moon
**Problem:** Moon's correction used the SUN's table (max ~2° at 90°).
The moon's table goes up to 5° 8' at 100°. Error: up to ~3° in the
moon's true longitude.
**Fix:** Separate `MOON_MASLUL_CORRECTIONS` table in constants.js.

### Bug 3: Missing double elongation step
**Problem:** The merchak kaful (KH 15:1-3) was completely absent. This step
adjusts the moon's anomaly before the correction lookup, accounting for the
nekudah hanichaches effect.
**Fix:** Added `calculateDoubleElongation()` and `calculateMaslulHanachon()`
to the pipeline.

### Bug 4: Moon latitude used sin() instead of Rambam's table
**Problem:** Used `sin(2*pi*phase)` with the draconic month period, ignoring
the Rambam's explicit starting position for the rosh (ascending node) and
his specific latitude table.
**Fix:** Track the rosh position using the Rambam's epoch value and daily
regression, then look up latitude from his table.

### Bug 5: All results returned as `.toFixed(2)` strings
**Problem:** Original engine killed numeric precision by converting to strings.
**Fix:** New engine returns numeric values; formatting is done only in the UI.

---

## Teaching Notes (from Rabbi Zajac / Rabbi Losh classes)

Key pedagogical concepts used in the app's UI tooltips:

1. **"Sun speaks one language, moon speaks another"** — Both must be
   translated to "lashon kodesh" (Earth's perspective) = the amiti.

2. **Airplane mashal** — Same speed at different altitudes appears different.
   Sun at govah (far) covers fewer degrees; at perigee (near), more degrees.

3. **Phone mashal** — Phone near your face blocks 180°; far away, only 10°.
   Same principle as the govah effect.

4. **"Money owed to the bank"** — The merchak kaful doubles the distance.
   "You think you owe 12, before you blink you owe 24."

5. **Nekudah hanichaches** — The most counterintuitive concept. The reference
   point for measuring is not where you expect. Like putting a compass point
   below center — the same arc sweeps different angles.

---

## Epoch Values (KH 12:2, 14:4, 16:3)

| Parameter                        | Value at Epoch      |
|----------------------------------|---------------------|
| Sun mean longitude               | 0° 0' 0" (0° Aries)|
| Sun apogee (govah)               | 86° 45' 8" (26°45'8" in Gemini) |
| Moon mean longitude              | 31° 14' 43" (1°14'43" in Taurus) |
| Moon maslul (emtza hamaslul)     | 84° 28' 42"         |
| Ascending node (rosh)            | 180° 57' 28"        |

Epoch date: Wednesday night (beginning of Thursday), 3 Nisan 4938 = April 3, 1177 CE

---

## Season Correction Table (KH 14:5)

| Sun Position               | Adjustment |
|----------------------------|-----------|
| Mid-Aquarius to mid-Aries  | 0'        |
| Mid-Aries to start Gemini  | +15'      |
| Start Gemini to mid-Cancer | +30'      |
| Mid-Cancer to start Leo    | +15'      |
| Start Leo to mid-Virgo     | -15'      |
| Mid-Virgo to mid-Libra     | 0'        |
| Mid-Libra to start Sagittarius | -15'  |
| Start Sagittarius to start Capricorn | -30' |
| Start Capricorn to mid-Aquarius | -15' |

This accounts for the difference between 6:00 PM (when we calculate) and
actual sunset (when we observe). The moon moves ~0.5° per hour.

> **Open question** (issue #19): Sefaria's KH 14:5 reads `+15'` continuously
> from mid-Aries (15°) through mid-Virgo (165°), with no `+30'` band on the
> additive side. The table above (Rabbi Losh's tradition) places `+30'` at
> 60°-105°. A user worksheet uses `+30'` starting earlier still. Three
> distinct readings, three different answers. Tracked in issue #19; until
> resolved, the engine ships with the table above and flags the deviation
> in `src/engine/constants.js`.

---

## Visibility Chain (KH 17) — Full Rambam Procedure

Implemented in `src/engine/visibilityCalculations.js`; verbatim source
text at `docs/sources/KH_17_verbatim.md`.

The Rambam's procedure has seven named steps; the previous engine version
ran only step 1 plus a heuristic. The current implementation runs all
seven and arrives at the verdict via the `קיצי הראיה` table (KH 17:16-21)
when the קשת lands in the 9°-14° indeterminate band.

### Step-by-step

| Step | Hebrew name | Source | Computation |
|------|-------------|--------|-------------|
| 1 | אורך ראשון | KH 17:1 | `(moonTrueLon − sunTrueLon) mod 360` |
| 2 | אורך שני | KH 17:5 | subtract `PARALLAX_LON_BY_MAZAL[moonMazal]` from אורך ראשון |
| 3 | רוחב שני | KH 17:7-9 | apply `PARALLAX_LAT_BY_MAZAL[moonMazal]` to רוחב ראשון; north→subtract, south→add |
| 4 | מעגל הירח | KH 17:10 | take fraction of `|רוחב שני|` per `MOON_CIRCLE_FRACTIONS` (29-band table) |
| 5 | אורך שלישי | KH 17:11 | apply מעגל with sign per ecliptic-half × north/south rule |
| 6 | אורך רביעי | KH 17:12a | apply `SETTING_TIME_BY_MAZAL[moonMazal]` to אורך שלישי |
| 7 | מנת גובה המדינה | KH 17:12b | always `2/3 × |רוחב ראשון|` (fixed for ארץ ישראל) |
| 8 | קשת הראיה | KH 17:12c | אורך רביעי ± מנת גובה המדינה (north→add, south→subtract) |

### Verdict gates

1. **Early exits (KH 17:3-4)** — based on אורך ראשון alone, with thresholds
   that depend on which half of the ecliptic the moon sits in:

   | Moon position | אורך ראשון invisible if | אורך ראשון visible if |
   |---|---|---|
   | Capricorn–Gemini half | ≤ 9° | > 15° |
   | Cancer–Sagittarius half | ≤ 10° | > 24° |

2. **קשת gates (KH 17:15)** — if 17:3-4 didn't decide:
   - קשת ≤ 9° → not visible
   - קשת > 14° → visible

3. **קיצי הראיה (KH 17:16-21)** — if 9° < קשת ≤ 14°: lookup against אורך ראשון:

   | קשת band | required אורך ראשון | source |
   |---|---|---|
   | (9°, 10°] | ≥ 13° | 17:17 |
   | (10°, 11°] | ≥ 12° | 17:18 |
   | (11°, 12°] | ≥ 11° | 17:19 |
   | (12°, 13°] | ≥ 10° | 17:20 |
   | (13°, 14°] | ≥ 9° | 17:21 |

### Implementation notes

* **Reading of "האורך הזה במזל X"** (17:14): the Rambam's worked example
  places אורך שלישי = 11°28' "in Taurus." But 11°28' as an absolute
  longitude is in Aries, and as an arc-elongation has no zodiacal
  position at all. The worked example's stated answer (אורך רביעי = 13°46',
  computed as +1/5) only matches if the SETTING_TIME table is keyed on
  the moon's actual mazal (= Taurus). The setting-time function reads
  the moon's mazal accordingly. Without this fix the worked example
  produces 13°22' instead of 13°46'.

* **Tolerance**: KH 17:13 explicitly tells the reader "אֵין מְדַקְדְּקִין
  בִּשְׁנִיּוֹת" (we don't fuss over arc-seconds). The Rambam himself rounds
  intermediate values to whole arc-minutes in the worked example
  (e.g. 1/4 × 4°03' = 1.0125° → "1°01'"). Our implementation keeps full
  precision internally and reports formatted DMS at the surface; tests
  compare to the Rambam's rounded values within ±1' (one חלק).

* **Variant readings**: Sefaria preserves alternative manuscript readings
  for two parallax-table cells: PARALLAX_LON Cancer (52' bracketed; mss
  43') and PARALLAX_LAT Aquarius (27' bracketed; mss 24'). Primary value
  uses the bracketed (corrected) reading; the alternative is preserved
  on the constant entry as `variant`.

### Test fixtures

Two anchors, both in `src/engine/__tests__/visibilityChain.test.js`:

1. **The Rambam's own worked example** (KH 17:13-14, 17:22) — 2 Iyar of
   "this year" with sun = 7°09' Taurus, moon = 18°36' Taurus,
   רוחב ראשון = 3°53' South. Every step asserted to within ±1' of the
   Rambam's stated values. Verdict: ודאי יראה via the (11°, 12°] קצין band.

2. **The user's 2 Sivan ה'תשפו worksheet** (issue #18 source report) —
   the report that surfaced the missing chain. The verdict must flip
   from the prior heuristic's "not visible" to "visible," with קשת
   computed at ~15.25° (well above the 14° certainly-visible cutoff).
