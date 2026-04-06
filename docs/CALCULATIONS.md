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
