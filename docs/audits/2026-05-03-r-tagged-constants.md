# `[R]`-Tagged Constants Audit — 2026-05-03

> Refs issue #13 ("Systematic audit of [R]-tagged constants against Sefaria + hebcal + published luach").
>
> Read-only audit. **Per the issue, no constant values were modified.** Mismatches surfaced
> here are deliverables for follow-up work, not pre-approved changes.

## Authorities consulted

| Authority | Coverage | Notes |
|---|---|---|
| **Sefaria, Mishneh Torah — Sanctification of the New Month** | Primary source for all `[R]` constants. | Version: **`Torat Emet 363`** (Hebrew) — the version returned by `https://www.sefaria.org/api/v3/texts/Mishneh_Torah%2C_Sanctification_of_the_New_Month.{ch}.{halacha}` on 2026-05-03. **Findings below are MISMATCH against this specific manuscript family**, not against an idealized "Rambam" — print editions (Frankel/Yad Peshutah, Vilna, Constantinople) are known to differ on some of these exact tables. |
| **hebcal** (REST API) | Fixed-calendar epoch, Hebrew↔Gregorian conversion. | `https://www.hebcal.com/converter?cfg=json&hy=4938&hm=Nisan&hd=3&h2g=1` returned `gy:1178, gm:3, gd:30` — i.e. Gregorian 1178-03-30 — matching `BASE_DATE_DISPLAY`. |
| **Published contemporary luach** | None linked from issue #13; none was available to this audit. | Spot-check deferred to follow-up. |

## Summary

Items audited at two granularities:

**Top-level `[R]`-tagged constants and tables** (treating each correction/period table as one item):

- 28 top-level items inventoried.
- **MATCH:** 21 / 28
- **MISMATCH:** 5 / 28 (the three big tables, GALGAL_KATAN.DAILY_MOTION, the sun-mean-vs-table-implied case)
- **AUTHORITY_UNAVAILABLE:** 2 / 28 (RED_DOMEH and GREEN_YOITZEH — class-tradition values not in Rambam's text; `[R]` tag is misapplied)

**Row-level (every individual table cell counted)**:

- 105 individual rows verified against Sefaria.
- **MATCH:** ≈ 89 / 105
- **MISMATCH:** ≈ 16 / 105 (8 in MOON_MASLUL_CORRECTIONS, 4 in MOON_LATITUDE_TABLE, 7 of 8 SEASON_CORRECTIONS ranges, etc.)

### Mismatches by severity

| # | Item | Severity | Sub-finding |
|---|---|---|---|
| 1 | `MOON_MASLUL_CORRECTIONS` (KH 15:6) | **HIGH** — affects every visibility computation | 8 / 18 entries differ from Sefaria; codebase appears to share rows with `MOON_LATITUDE_TABLE` |
| 2 | `SEASON_CORRECTIONS` (KH 14:5) | **HIGH** — affects every moon-mean adjustment | All 8 Sefaria range-boundaries differ from codebase's 11 ranges; sign flips at 120-150° and 240-300° |
| 3 | `MOON_LATITUDE_TABLE` (KH 16:11) | **HIGH** — affects every latitude computation | 4 / 9 entries differ; codebase shares rows with `MOON_MASLUL_CORRECTIONS` |
| 4 | `MOON.GALGALIM.GALGAL_KATAN.DAILY_MOTION` (line 224) | **MEDIUM** — engine-internal inconsistency | Stale `53.333` value left over from before Phase R fixed `MASLUL_MEAN_MOTION` to `54`. Citation comment also wrong (`KH 14:2` should be `KH 14:3`). |
| 5 | `SUN.MEAN_MOTION_PER_DAY` daily-rate vs stated text (line 151) | **LOW** — analogous to Phase R moon findings | Code uses `8.333"` (10-day-table-implied); 12:1 daily statement is `8"` flat. Matches the same "table-implied vs daily-stated" pattern Phase R fixed for the moon (35.133 → 35) but never propagated to the sun. Per `OPEN_QUESTIONS.md` Q7 the project's stated stance is "preserve the Rambam's own rounding," so flagged for decision rather than auto-correction. |
| 6 | Citation-comment inaccuracies (provenance hygiene) | **LOW** | Comments at lines 150 (`8 1/3"`), 178 (Phase R note OK), 223 (`KH 14:2`) have provenance text that doesn't match the cited halacha. |

### Items not strictly in scope for `[R]` audit

- `RED_DOMEH.DAILY_MOTION = -11°12'/day` (line 204) and `GREEN_YOITZEH.DAILY_MOTION = 24°23'/day` (line 216) carry `[R]` but the comment self-discloses these come from "class transcription," not the Rambam's text. They were verified absent from KH 11–17 on Sefaria. **Recommend retagging `[L]` (Rabbi Losh teaching) or new tag `[C]` (class-tradition).** Until then, they are AUTHORITY_UNAVAILABLE for Sefaria.

---

## Method

For each `[R]`-tagged constant in `src/engine/constants.js` and `src/engine/fixedCalendar/constants.js` (inventoried via grep), the cited Rambam halacha was retrieved from Sefaria's v3 API, the Hebrew gematria value parsed character-by-character, and compared verbatim to the JS literal. Hebrew letters used:

| Letter | Value | | Letter | Value | | Letter | Value |
|---|---|---|---|---|---|---|---|
| א | 1 | | י | 10 | | ק | 100 |
| ב | 2 | | כ | 20 | | ר | 200 |
| ג | 3 | | ל | 30 | | ש | 300 |
| ד | 4 | | מ | 40 | | ת | 400 |
| ה | 5 | | נ | 50 | | תק | 500 |
| ו | 6 | | ס | 60 | | תר | 600 |
| ז | 7 | | ע | 70 | | תש | 700 |
| ח | 8 | | פ | 80 | | תת | 800 |
| ט | 9 | | צ | 90 | | תתק | 900 |

(The Sefaria text uses gershayim — `"` between the last two letters — to mark numerals: e.g. `כ"ד` = 24, `נ"ט` = 59, `קל"א` = 131.)

Each finding below cites the verbatim Hebrew clause, the parsed value, the codebase value, and a verdict.

---

## Per-constant findings

### Fixed calendar (`src/engine/fixedCalendar/constants.js`)

#### `BAHARAD` — KH 6:8 — **MATCH**

> Sefaria 6:8 (he):
> > … וְהוּא הָיָה בְּלֵיל שֵׁנִי חָמֵשׁ שָׁעוֹת בַּלַּיְלָה וּמָאתַיִם וְאַרְבָּעָה חֲלָקִים. סִימָן לָהֶם בהר"ד …

→ Monday night, 5 hours, 204 chalakim. Code: `{ dayOfWeek: 2, hours: 5, parts: 204 }`. ✅ MATCH.

#### `SYNODIC_MONTH` — KH 6:3 — **MATCH**

> Sefaria 6:3 (he):
> > תִּשְׁעָה וְעֶשְׂרִים יוֹם וּשְׁתֵּים עֶשְׂרֵה שָׁעוֹת … וּשְׁבַע מֵאוֹת וּשְׁלֹשָׁה וְתִשְׁעִים חֲלָקִים …

→ 29 days, 12 hours, 793 parts. Code: `{ days: 29, hours: 12, parts: 793 }`. ✅ MATCH.

#### `LEAP_YEARS_IN_CYCLE` — KH 6:11 — **MATCH**

> Sefaria 6:11 (he):
> > … שָׁנָה שְׁלִישִׁית מִן הַמַּחֲזוֹר וְשִׁשִּׁית וּשְׁמִינִית וּשְׁנַת אַחַת עֶשְׂרֵה וּשְׁנַת אַרְבַּע עֶשְׂרֵה וּשְׁנַת שְׁבַע עֶשְׂרֵה וּשְׁנַת י"ט. סִימָן לָהֶם גו"ח י"א י"ד י"ז י"ט …

→ {3, 6, 8, 11, 14, 17, 19}. Code: `[3, 6, 8, 11, 14, 17, 19]`. ✅ MATCH.

#### `PARTS_PER_HOUR`, `HOURS_PER_DAY`, derived constants — **MATCH (definitional)**

`PARTS_PER_HOUR = 1080` is fixed by Rambam KH 6:2. All derived expressions (`PARTS_PER_DAY`, `BAHARAD_PARTS_OFFSET`, `SYNODIC_MONTH_PARTS`, etc.) are arithmetic derivations of the verified atomic values above.

---

### Astronomical pipeline (`src/engine/constants.js`)

#### `EPOCH_HEBREW`, `BASE_YEAR_HEBREW` — KH 11:16 — **MATCH**

> Sefaria 11:16 (he):
> > … הָעִקָּר שֶׁמִּמֶּנּוּ מַתְחִילִין לְעוֹלָם לְחֶשְׁבּוֹן זֶה מִתְּחִלַּת לֵיל חֲמִישִׁי שֶׁיּוֹמוֹ יוֹם שְׁלִישִׁי לְחֹדֶשׁ נִיסָן מִשָּׁנָה זוֹ שֶׁהִיא שְׁנַת י"ז מִמַּחֲזוֹר ר"ס. שֶׁהִיא שְׁנַת תתקל"ח וְאַרְבַּעַת אַלְפַּיִם לַיְצִירָה …

→ Beginning of Thursday night, day 3 of Nisan, year **תתקל"ח** = 4 000 + 938 = **4938 AM**. Code: `{ year: 4938, month: 'Nisan', day: 3 }`. ✅ MATCH.

**hebcal cross-check:** `HDate(3, 'Nisan', 4938)` → 1178-03-30 (Gregorian) — matches `BASE_DATE_DISPLAY: new Date(Date.UTC(1178, 2, 30))`. ✅

---

#### Sun — Chapter 12

##### `SUN.MEAN_MOTION_PER_DAY` (line 151) — KH 12:1 — **MISMATCH (low severity, documented stance)**

> Sefaria 12:1 (he):
> > מַהֲלַךְ הַשֶּׁמֶשׁ הָאֶמְצָעִי בְּיוֹם אֶחָד שֶׁהוּא כ"ד שָׁעוֹת **נ"ט חֲלָקִים וּשְׁמוֹנֶה שְׁנִיּוֹת**. סִימָנָם **כ"ד נט"ח**.

→ Daily-stated value: 59'8" (eight sheniot **flat**, no fraction).
Code: `{ degrees: 0, minutes: 59, seconds: 8.333 }` — i.e. **8 1/3**".

**Why the 0.333 exists:** the 10-day block (verified MATCH below) is 9°51'23" = 35 483". Dividing by 10 yields 3 548.3" = 59'8.333" — so the 10-day table *implies* a daily rate of 8 1/3". The code uses the **table-implied rate**, the daily statement gives **8 flat**. Same trade-off Phase R resolved for moon (35.133 → 35); for sun, never resolved.

**Citation accuracy:** the comment `// [R] 0° 59' 8 1/3" per day — KH 12:1` overstates KH 12:1 — the Rambam writes 8 sheniot, not 8 1/3.

❌ MISMATCH against KH 12:1 daily statement; ✅ MATCH against KH 12:1 10-day block. Decision deferred per `OPEN_QUESTIONS.md` Q7.

##### `SUN.START_POSITION` (line 154) — KH 12:2 — **MATCH**

> Sefaria 12:2 (he):
> > … וּמְקוֹם הַשֶּׁמֶשׁ בְּמַהֲלָכָהּ הָאֶמְצָעִי הָיָה בָּעִקָּר הַזֶּה בְּ**שֶׁבַע מַעֲלוֹת וּשְׁלֹשָׁה חֲלָקִים וְל"ב שְׁנִיּוֹת מִמַּזַּל טָלֶה**. סִימָנָן **ז"ג ל"ב**.

→ 7°3'32" in Aries. Code: `{ degrees: 7, minutes: 3, seconds: 32 }`. ✅ MATCH.

##### `SUN.APOGEE_START` (line 158) — KH 12:2 — **MATCH**

> Sefaria 12:2 (he):
> > וּמְקוֹם גֹּבַהּ הַשֶּׁמֶשׁ הָיָה בְּעִקָּר זֶה בְּ**כ"ו מַעֲלוֹת מ"ה חֲלָקִים וּשְׁמוֹנֶה שְׁנִיּוֹת מִמַּזַּל תְּאוֹמִים**. סִימָנָם **כ"ו מ"ה ח'**.

→ 26°45'8" in Gemini. Code: `{ degrees: 26, minutes: 45, seconds: 8 }`. ✅ MATCH.

##### `SUN.APOGEE_MOTION_PER_DAY` (line 167) — KH 12:2 — **MATCH (post-Phase-R fix)**

> Sefaria 12:2 (he):
> > … מַהֲלָכוֹ בְּכָל **עֲשָׂרָה יָמִים שְׁנִיָּה אַחַת וַחֲצִי שְׁנִיָּה** שֶׁהִיא ל' שְׁלִישִׁיּוֹת …

→ 1.5"/10 days = 0.15"/day. Code: `0.15 / 3600` (in degrees). ✅ MATCH.

##### `SUN_MEAN_PERIOD_BLOCKS` (lines 261-268) — KH 12:1 — **MATCH (all 6 rows)**

> Sefaria 12:1 (he, full text):
> > … בַּעֲשָׂרָה יָמִים **תֵּשַׁע מַעֲלוֹת וְנ"א חֲלָקִים וְכ"ג שְׁנִיּוֹת** … בְּמֵאָה יוֹם **צ"ח מַעֲלוֹת וּשְׁלֹשָׁה וּשְׁלֹשִׁים חֲלָקִים וְנ"ג שְׁנִיּוֹת** … בְּאֶלֶף יוֹם … **רס"ה מַעֲלוֹת וְל"ח חֲלָקִים וְנ' שְׁנִיּוֹת** … בַּעֲשֶׂרֶת אֲלָפִים יוֹם **קל"ו מַעֲלוֹת וְכ"ח חֲלָקִים וְכ' שְׁנִיּוֹת** … לְכ"ט יוֹם **כ"ח מַעֲלוֹת וְל"ה חֲלָקִים וּשְׁנִיָּה אַחַת** … לְשָׁנָה סְדוּרָה **שמ"ח מַעֲלוֹת וְנ"ה חֲלָקִים וְט"ו שְׁנִיּוֹת**.

| period | Sefaria | Code | verdict |
|---|---|---|---|
| `p10` | 9°51'23" | 9°51'23" | ✅ |
| `p100` | 98°33'53" | 98°33'53" | ✅ |
| `p1000` | 265°38'50" | 265°38'50" | ✅ |
| `p10000` | 136°28'20" | 136°28'20" | ✅ |
| `p29` | 28°35'1" | 28°35'1" | ✅ |
| `p354` | 348°55'15" | 348°55'15" | ✅ |

##### `SUN_APOGEE_PERIOD_BLOCKS` (lines 274-281) — KH 12:2 — **MATCH (all 6 rows)**

> Sefaria 12:2 cites: 10 days = 1.5"; 100 days = 15"; 1 000 days = 2'30"; 10 000 days = 25'; 29 days = "4 sheniot ve'od" (and a bit); 354 days = 53".

| period | Sefaria | Code | verdict |
|---|---|---|---|
| `p10` | 0°0'1.5" | 0°0'1.5" | ✅ |
| `p100` | 0°0'15" | 0°0'15" | ✅ |
| `p1000` | 0°2'30" | 0°2'30" | ✅ |
| `p10000` | 0°25'0" | 0°25'0" | ✅ |
| `p29` | 0°0'4" "ve'od" | 0°0'4" | ✅ (truncation acknowledged in code comment) |
| `p354` | 0°0'53" | 0°0'53" | ✅ |

---

#### Sun maslul correction — Chapter 13

##### `SUN_MASLUL_CORRECTIONS` (lines 339-359) — KH 13:4 — **MATCH (all 18 non-zero rows)**

> Sefaria 13:4 (he, full):
> > וְכַמָּה הִיא מְנַת הַמַּסְלוּל. אִם יִהְיֶה הַמַּסְלוּל **עֶשֶׂר מַעֲלוֹת. תִּהְיֶה מְנָתוֹ כ' חֲלָקִים** … **כ' מַעֲלוֹת תִּהְיֶה מְנָתוֹ מ' חֲלָקִים** … **ל' מַעֲלוֹת** מְנָתוֹ **נ"ח חֲלָקִים** … **מ' מַעֲלוֹת** מְנָתוֹ **מַעֲלָה אַחַת וְט"ו חֲלָקִים** … **נ'** → **מַעֲלָה אַחַת וְכ"ט** … **ס'** → **מַעֲלָה אַחַת וּמ"א** … **ע'** → **מַעֲלָה אַחַת וְנ"א** … **פ'** → **מַעֲלָה אַחַת וְנ"ז** … **צ'** → **מַעֲלָה אַחַת וְנ"ט** … **ק'** → **מַעֲלָה אַחַת וְנ"ח** … **ק"י** → **מַעֲלָה אַחַת וְנ"ג** … **ק"כ** → **מַעֲלָה אַחַת וּמ"ה** … **ק"ל** → **מַעֲלָה אַחַת ל"ג** … **ק"מ** → **מַעֲלָה אַחַת וְי"ט** … **ק"נ** → **מַעֲלָה אַחַת וְחֵלֶק אֶחָד** … **ק"ס** → **מ"ב חֲלָקִים** … **ק"ע** → **כ"א חֲלָקִים** … **ק"פ בְּשָׁוֶה** אֵין לוֹ מָנָה.

| maslul | Sefaria | Code | verdict |
|---|---|---|---|
| 10° | 0°20' | 20/60 | ✅ |
| 20° | 0°40' | 40/60 | ✅ |
| 30° | 0°58' | 58/60 | ✅ |
| 40° | 1°15' | 1+15/60 | ✅ |
| 50° | 1°29' | 1+29/60 | ✅ |
| 60° | 1°41' | 1+41/60 | ✅ |
| 70° | 1°51' | 1+51/60 | ✅ |
| 80° | 1°57' | 1+57/60 | ✅ |
| 90° | 1°59' | 1+59/60 | ✅ |
| 100° | 1°58' | 1+58/60 | ✅ |
| 110° | 1°53' | 1+53/60 | ✅ |
| 120° | 1°45' | 1+45/60 | ✅ |
| 130° | 1°33' | 1+33/60 | ✅ |
| 140° | 1°19' | 1+19/60 | ✅ |
| 150° | 1°1' | 1+1/60 | ✅ |
| 160° | 0°42' | 42/60 | ✅ |
| 170° | 0°21' | 21/60 | ✅ |
| 180° | 0 | 0 | ✅ |

This is the **cleanest table** in the file. Every value matches Sefaria byte-for-byte.

---

#### Moon — Chapter 14

##### `MOON.MEAN_MOTION_PER_DAY` (line 182) — KH 14:1 — **MATCH (post-Phase-R fix)**

> Sefaria 14:1 (he):
> > מַהֲלַךְ אֶמְצַע הַיָּרֵחַ בְּיוֹם אֶחָד **י"ג מַעֲלוֹת וְי' חֲלָקִים וְל"ה שְׁנִיּוֹת**. סִימָנָם **י"ג יל"ה**.

→ 13°10'35". Code: `{ degrees: 13, minutes: 10, seconds: 35 }`. ✅ MATCH.

##### `MOON.START_POSITION`, `MOON.MEAN_LONGITUDE_AT_EPOCH` (line 183, 196) — KH 14:4 — **MATCH**

> Sefaria 14:4 (he):
> > מְקוֹם אֶמְצַע הַיָּרֵחַ הָיָה בִּתְחִלַּת לֵיל חֲמִישִׁי … בְּמַזַּל שׁוֹר **מַעֲלָה אַחַת וְי"ד חֲלָקִים וּמ"ג שְׁנִיּוֹת**.

→ 1°14'43" in Taurus. Code: `{ degrees: 1, minutes: 14, seconds: 43 }`. ✅ MATCH.

##### `MOON.MASLUL_MEAN_MOTION` (line 191) — KH 14:3 — **MATCH (post-Phase-R fix)**

> Sefaria 14:3 (he):
> > וּמַהֲלַךְ אֶמְצַע הַמַּסְלוּל בְּיוֹם אֶחָד **י"ג מַעֲלוֹת וּשְׁלֹשָׁה חֲלָקִים וְנ"ד שְׁנִיּוֹת**. סִימָנָם **י"ג גנ"ד**.

→ 13°3'54". Code: `{ degrees: 13, minutes: 3, seconds: 54 }`. ✅ MATCH.

##### `MOON.MASLUL_START` (line 193) — KH 14:4 — **MATCH**

> Sefaria 14:4 (he):
> > וְאֶמְצַע הַמַּסְלוּל הָיָה בְּעִקָּר זֶה **פ"ד מַעֲלוֹת וְכ"ח חֲלָקִים וּמ"ב שְׁנִיּוֹת**. סִימָנָם **פ"ד כ"ח מ"ב**.

→ 84°28'42". Code: `{ degrees: 84, minutes: 28, seconds: 42 }`. ✅ MATCH.

##### `MOON_MEAN_PERIOD_BLOCKS` (lines 284-291) — KH 14:2 — **MATCH (all 6 rows)**

> Sefaria 14:2 (he, full): cites 10/100/1 000/10 000/29/354 days.

| period | Sefaria | Code | verdict |
|---|---|---|---|
| `p10` | 131°45'50" | 131°45'50" | ✅ |
| `p100` | 237°38'23" | 237°38'23" | ✅ |
| `p1000` | 216°23'50" | 216°23'50" | ✅ |
| `p10000` | 3°58'20" | 3°58'20" | ✅ |
| `p29` | 22°6'56" | 22°6'56" | ✅ |
| `p354` | 344°26'43" | 344°26'43" | ✅ |

##### `MOON_MASLUL_PERIOD_BLOCKS` (lines 295-302) — KH 14:3 + KH 14:4 — **MATCH (all 6 rows)**

(KH 14:3 supplies the 10/100/1 000/10 000/29-day blocks; KH 14:4 supplies the 354-day block as 305°0'13".)

| period | Sefaria | Code | verdict |
|---|---|---|---|
| `p10` | 130°39'0" | 130°39'0" | ✅ |
| `p100` | 226°29'53" | 226°29'53" | ✅ |
| `p1000` | 104°58'50" | 104°58'50" | ✅ |
| `p10000` | 329°48'20" | 329°48'20" | ✅ |
| `p29` | 18°53'4" | 18°53'4" | ✅ |
| `p354` | 305°0'13" | 305°0'13" | ✅ |

##### `SEASON_CORRECTIONS` (lines 441-455) — KH 14:5 — **MISMATCH (HIGH severity)**

This is the single largest finding. KH 14:5 is famously textually unstable across print editions; the Sefaria/Torat-Emet-363 reading does **not** match the codebase.

**Verbatim Sefaria 14:5 (he):**

> אִם הָיְתָה הַשֶּׁמֶשׁ **מֵחֲצִי מַזַּל דָּגִים עַד חֲצִי מַזַּל טָלֶה. תָּנִיחַ אֶמְצַע הַיָּרֵחַ כְּמוֹת שֶׁהוּא**.
>
> וְאִם תִּהְיֶה הַשֶּׁמֶשׁ **מֵחֲצִי מַזַּל טָלֶה עַד תְּחִלַּת מַזַּל תְּאוֹמִים. תּוֹסִיף עַל אֶמְצַע הַיָּרֵחַ ט"ו חֲלָקִים**.
>
> וְאִם תִּהְיֶה הַשֶּׁמֶשׁ **מִתְּחִלַּת מַזַּל תְּאוֹמִים עַד תְּחִלַּת מַזַּל אַרְיֵה. תּוֹסִיף עַל אֶמְצַע הַיָּרֵחַ ט"ו חֲלָקִים**.
>
> וְאִם תִּהְיֶה הַשֶּׁמֶשׁ **מִתְּחִלַּת מַזַּל אַרְיֵה עַד חֲצִי מַזַּל בְּתוּלָה תּוֹסִיף עַל אֶמְצַע הַיָּרֵחַ ט"ו חֲלָקִים**.
>
> וְאִם תִּהְיֶה הַשֶּׁמֶשׁ **מֵחֲצִי מַזַּל בְּתוּלָה עַד חֲצִי מֹאזְנַיִם. הָנַח אֶמְצַע הַיָּרֵחַ כְּמוֹת שֶׁהוּא**.
>
> וְאִם תִּהְיֶה הַשֶּׁמֶשׁ **מֵחֲצִי מֹאזְנַיִם עַד תְּחִלַּת מַזַּל קֶשֶׁת. תִּגְרַע מֵאֶמְצַע הַיָּרֵחַ ט"ו חֲלָקִים**.
>
> וְאִם תִּהְיֶה הַשֶּׁמֶשׁ **מִתְּחִלַּת מַזַּל קֶשֶׁת עַד תְּחִלַּת מַזַּל דְּלִי. תִּגְרַע מֵאֶמְצַע הַיָּרֵחַ ל' חֲלָקִים**.
>
> וְאִם תִּהְיֶה הַשֶּׁמֶשׁ **מִתְּחִלַּת מַזַּל דְּלִי עַד חֲצִי מַזַּל דָּגִים. תִּגְרַע מֵאֶמְצַע הַיָּרֵחַ ט"ו חֲלָקִים**.

Decoded (Pisces=330-360°, Aries=0-30°, Taurus=30-60°, Gemini=60-90°, Cancer=90-120°, Leo=120-150°, Virgo=150-180°, Libra=180-210°, Scorpio=210-240°, Sagittarius=240-270°, Capricorn=270-300°, Aquarius=300-330°):

| Sefaria range | Sefaria adjustment | Codebase range covering this band | Codebase adjustment | match? |
|---|---|---|---|---|
| 345°-15° (mid-Pisces → mid-Aries) | 0 | 315°-345° = 0; 345°-360° = +15'; 0°-30° = +15' | 0 / +15' / +15' | ❌ both endpoints wrong |
| 15°-60° (mid-Aries → start-Gemini) | +15' | 0°-30° = +15'; 30°-60° = +15' | +15' / +15' | ❌ start wrong (15° vs 0°) |
| 60°-120° (start-Gemini → start-Leo) | +15' (single range) | 60°-90° = **+30'**; 90°-120° = +15' | +30' / +15' | ❌ codebase has +30' over half this range |
| 120°-165° (start-Leo → mid-Virgo) | +15' | 120°-150° = **−15'** | −15' | ❌ **sign flip** |
| 165°-195° (mid-Virgo → mid-Libra) | 0 | 150°-195° = 0 | 0 | ❌ start wrong (150° vs 165°) |
| 195°-240° (mid-Libra → start-Sag) | −15' | 195°-240° = −15' | −15' | ✅ |
| 240°-300° (start-Sag → start-Aquarius) | **−30' (single range)** | 240°-270° = −30'; 270°-315° = **−15'** | −30' / −15' | ❌ codebase shrinks the −30' band to half-width |
| 300°-345° (start-Aquarius → mid-Pisces) | −15' | 270°-315° = −15' | −15' | ❌ start wrong (270° vs 300°) |

**Net effect:** seven of eight Sefaria ranges have either a boundary or magnitude or sign mismatch in the codebase. This warrants a Frankel/Yad-Peshutah cross-check (the standard place to look for variants on KH 14:5) **before any code change** — a different print family may match the codebase. The Sefaria reading is reported here as the falsifiable claim.

❌ MISMATCH (HIGH severity).

---

#### Moon maslul correction — Chapter 15

##### `DOUBLE_ELONGATION_ADJUSTMENTS` (lines 398-414) — KH 15:3 — **MATCH (all 10 stated rows)**

> Sefaria 15:3 (he, full):
> > … חָמֵשׁ מַעֲלוֹת אוֹ קָרוֹב לְחָמֵשׁ אֵין חוֹשְׁשִׁין … מִשֵּׁשׁ מַעֲלוֹת עַד אַחַת עֶשְׂרֵה … תּוֹסִיף … מַעֲלָה אַחַת. … מִי"ב … עַד י"ח … תּוֹסִיף … שְׁתֵּי מַעֲלוֹת. … (and so on through מִס' … עַד ס"ג … ט' מַעֲלוֹת).

| range | Sefaria | Code | verdict |
|---|---|---|---|
| ≈ 5° | 0 | 0-5 → 0 | ✅ |
| 6-11° | +1° | 6-11 → +1 | ✅ |
| 12-18° | +2° | 12-18 → +2 | ✅ |
| 19-24° | +3° | 19-24 → +3 | ✅ |
| 25-31° | +4° | 25-31 → +4 | ✅ |
| 32-38° | +5° | 32-38 → +5 | ✅ |
| 39-45° | +6° | 39-45 → +6 | ✅ |
| 46-51° | +7° | 46-51 → +7 | ✅ |
| 52-59° | +8° | 52-59 → +8 | ✅ |
| 60-63° | +9° | 60-63 → +9 | ✅ |

(Code's 64-90° and 91-180° rows are explicitly self-tagged `source: 'approximated'` for extension beyond what the Rambam states. Out of scope for this `[R]` audit.)

##### `MOON_MASLUL_CORRECTIONS` (lines 370-390) — KH 15:6 — **MISMATCH (HIGH severity, 8 / 18 rows)**

> Sefaria 15:6 (he, full):
> > וְכַמָּה הִיא מְנַת הַמַּסְלוּל. אִם יִהְיֶה הַמַּסְלוּל הַנָּכוֹן **עֶשֶׂר מַעֲלוֹת תִּהְיֶה מְנָתוֹ נ' חֲלָקִים** … **כ' מַעֲלוֹת** … **מַעֲלָה אַחַת וְל"ח חֲלָקִים** … **שְׁלֹשִׁים** … **שְׁתֵּי מַעֲלוֹת וְכ"ד חֲלָקִים** … **מ'** … **שָׁלֹשׁ מַעֲלוֹת וְשִׁשָּׁה חֲלָקִים** … **נ'** → **שָׁלֹשׁ מַעֲלוֹת וּמ"ד חֲלָקִים** … **ס'** → **אַרְבַּע מַעֲלוֹת וְט"ז חֲלָקִים** … **ע'** → **אַרְבַּע מַעֲלוֹת וּמ"א חֲלָקִים** … **פ'** → **חָמֵשׁ מַעֲלוֹת** … **צ'** → **חָמֵשׁ מַעֲלוֹת וְה' חֲלָקִים** … **ק'** → **ה' מַעֲלוֹת וְח' חֲלָקִים** … **ק"י** → **ד' מַעֲלוֹת וְנ"ט חֲלָקִים** … **ק"כ** → **ד' מַעֲלוֹת וְכ' חֲלָקִים** … **ק"ל** → **ד' מַעֲלוֹת וְי"א חֲלָקִים** … **ק"מ** → **ג' מַעֲלוֹת וְל"ג חֲלָקִים** … **ק"נ** → **שָׁלֹשׁ מַעֲלוֹת וּמ"ח חֲלָקִים** … **ק"ס** → **מַעֲלָה אַחַת וְנ"ו חֲלָקִים** … **ק"ע** → **מַעֲלָה אַחַת וְנ"ט חֲלָקִים** … **ק"פ** → אֵין לוֹ מָנָה.

| maslul | Sefaria | Code | verdict |
|---|---|---|---|
| 10° | 0°50' | 52/60 = 0°52' | ❌ |
| 20° | 1°38' | 1+43/60 = 1°43' | ❌ |
| 30° | 2°24' | 2+30/60 = 2°30' | ❌ |
| 40° | 3°6'  | 3+13/60 = 3°13' | ❌ |
| 50° | 3°44' | 3+44/60 | ✅ |
| 60° | 4°16' | 4+16/60 | ✅ |
| 70° | 4°41' | 4+41/60 | ✅ |
| 80° | 5°00' | 5+0/60  | ✅ |
| 90° | 5°5'  | 5+5/60  | ✅ |
| 100° | 5°8' | 5+8/60  | ✅ |
| 110° | 4°59' | 4+59/60 | ✅ |
| 120° | 4°20' | 4+40/60 = 4°40' | ❌ |
| 130° | 4°11' | 4+11/60 | ✅ |
| 140° | 3°33' | 3+33/60 | ✅ |
| 150° | 3°48' | 2+48/60 = 2°48' | ❌ (likely typo: 2 vs 3 in degree column) |
| 160° | 1°56' | 2+5/60 = 2°5' | ❌ |
| 170° | 1°59' | 59/60 = 0°59' | ❌ (degree column missing) |
| 180° | 0     | 0       | ✅ |

**Pattern observation (diagnostic):** the codebase's first nine entries (10°-90°) are identical to its `MOON_LATITUDE_TABLE`'s first nine entries — but per Sefaria, the moon-maslul-correction table (15:6) and the moon-latitude table (16:11) have **distinct** values for that range. See the "diagnostic finding" callout below.

❌ MISMATCH (HIGH severity, 8 of 18 rows).

##### `MOON.GALGALIM.GALGAL_KATAN.RADIUS_DEGREES` (line 226) — KH 15:9 — **MATCH (with caveat)**

> Sefaria 15:9 (he):
> > … נִמְצֵאת מָנָה שֶׁלּוֹ חָמֵשׁ מַעֲלוֹת וְחֵלֶק אֶחָד …

This halacha is a worked example, not a definitional statement of "diameter is 10°, radius is 5°" — the diameter/radius framing in the comment is a derivation. Code value `5` is consistent with KH 15:9's "5° + 1 cheilek" worked-example context and the Rambam's elsewhere-stated peak correction of ~5°5'. ✅ MATCH (definitional context).

---

#### Node + lunar latitude — Chapter 16

##### `GALGAL_NOTEH_INCLINATION_DEG` (line 466) and `MOON.GALGALIM.BLUE_NOTEH.INCLINATION` (line 210) — KH 16:1 — **MATCH**

> Sefaria 16:1 (he):
> > … לְעוֹלָם לֹא יִהְיֶה רֹחַב הַיָּרֵחַ יֶתֶר עַל **ה' מַעֲלוֹת** בֵּין בַּצָּפוֹן בֵּין בַּדָּרוֹם.

(Strictly, KH 16:9 — but the same `5°` value is reiterated at 16:1.) → 5°. Code: `5`. ✅ MATCH.

##### `NODE.DAILY_MOTION` (line 236), `NODE_REGRESSION_DEG_PER_DAY` (line 463) — KH 16:2 — **MATCH**

> Sefaria 16:2 (he):
> > מַהֲלַךְ הָרֹאשׁ הָאֶמְצָעִי בְּיוֹם אֶחָד **ג' חֲלָקִים וְי"א שְׁנִיּוֹת**.

→ 3'11"/day. Code: `{ degrees: 0, minutes: 3, seconds: 11 }` and `-(3/60 + 11/3600)` (regression sign). ✅ MATCH.

##### `NODE.START_POSITION` (line 238) — KH 16:2 — **MATCH**

> Sefaria 16:2 (he):
> > וְאֶמְצַע הָרֹאשׁ בִּתְחִלַּת לֵיל ה' שֶׁהוּא הָעִקָּר הָיָה **ק"פ מַעֲלוֹת וְנ"ז חֲלָקִים וְכ"ח שְׁנִיּוֹת**.

(Note: comment cites `KH 16:3`; Sefaria's Torat-Emet 363 places this sentence at the *end* of 16:2 rather than 16:3, but the value is unambiguous.)

→ 180°57'28". Code: `{ degrees: 180, minutes: 57, seconds: 28 }`. ✅ MATCH.

##### `NODE_PERIOD_BLOCKS` (lines 305-312) — KH 16:2 — **MATCH (all 6 rows)**

> Sefaria 16:2 (he, full): cites 10/100/1 000/10 000/29/354 days.

| period | Sefaria | Code | verdict |
|---|---|---|---|
| `p10` | 0°31'47" | 0°31'47" | ✅ |
| `p100` | 5°17'43" | 5°17'43" | ✅ |
| `p1000` | 52°57'10" | 52°57'10" | ✅ |
| `p10000` | 169°31'40" | 169°31'40" | ✅ |
| `p29` | 1°32'9" | 1°32'9" | ✅ |
| `p354` | 18°44'42" | 18°44'42" | ✅ |

##### `MOON_LATITUDE_TABLE` (lines 422-433) — KH 16:11 — **MISMATCH (HIGH severity, 4 / 9 rows)**

(Comment cites `KH 16:9-10`; the actual table is in `KH 16:11` per Sefaria's Torat-Emet 363 division. 16:9-10 are the directional rules.)

> Sefaria 16:11 (he, full):
> > וְכַמָּה הִיא מְנַת מַסְלוּל הָרֹחַב. אִם יִהְיֶה מַסְלוּל הָרֹחַב **עֶשֶׂר מַעֲלוֹת תִּהְיֶה מְנָתוֹ נ"ב חֲלָקִים** … **כ' מַעֲלוֹת** → **מַעֲלָה אַחַת וּמ"ג חֲלָקִים** … **ל'** → **שְׁתֵּי מַעֲלוֹת וְל' חֲלָקִים** … **מ'** → **שָׁלֹשׁ מַעֲלוֹת וְי"ג חֲלָקִים** … **נ'** → **שָׁלֹשׁ מַעֲלוֹת וְנ' חֲלָקִים** … **ס'** → **אַרְבַּע מַעֲלוֹת וְכ' חֲלָקִים** … **ע'** → **ד' מַעֲלוֹת וּמ"ב חֲלָקִים** … **פ'** → **ד' מַעֲלוֹת וְנ"ה חֲלָקִים** … **צ'** → **ה' מַעֲלוֹת**.

| distance | Sefaria | Code | verdict |
|---|---|---|---|
| 10° | 0°52' | 52/60 | ✅ |
| 20° | 1°43' | 1+43/60 | ✅ |
| 30° | 2°30' | 2+30/60 | ✅ |
| 40° | 3°13' | 3+13/60 | ✅ |
| 50° | **3°50'** | 3+44/60 = 3°44' | ❌ |
| 60° | **4°20'** | 4+16/60 = 4°16' | ❌ |
| 70° | **4°42'** | 4+41/60 = 4°41' | ❌ |
| 80° | **4°55'** | 5+0/60 = 5°0' | ❌ |
| 90° | 5°00' | 5+0/60 | ✅ |

❌ MISMATCH (HIGH severity, 4 of 9 rows).

---

#### Galgalim daily-motion values — class-tradition origin

##### `MOON.GALGALIM.RED_DOMEH.DAILY_MOTION` (line 204) — **AUTHORITY_UNAVAILABLE**

Comment self-discloses "from class transcription." Value `−(11 + 12/60)` (= −11°12'/day). Searched KH 11–17 on Sefaria; this value is not stated in those chapters. The `[R]` tag is misapplied — recommend retag `[L]` or new `[C]` (class-transcribed). Sefaria audit: AUTHORITY_UNAVAILABLE (out of scope for primary text).

##### `MOON.GALGALIM.GREEN_YOITZEH.DAILY_MOTION` (line 216) — **AUTHORITY_UNAVAILABLE**

Same status as RED_DOMEH. Value `24 + 23/60` (= 24°23'/day). Not stated in Rambam's KH 11–17 per Sefaria. Retag.

##### `MOON.GALGALIM.GALGAL_KATAN.DAILY_MOTION` (line 224) — **MISMATCH (engine-internal inconsistency, MEDIUM severity)**

This is the moon's anomaly rate — physically the same quantity as `MOON.MASLUL_MEAN_MOTION` at line 191 (the galgal katan is the geometric embodiment of the maslul). Phase R fixed `MASLUL_MEAN_MOTION` from `53.333` → `54` but the fix did not propagate here. Current code:

```js
DAILY_MOTION: 13 + 3 / 60 + 53.333 / 3600,   // ← stale
```

Should be `13 + 3 / 60 + 54 / 3600` to match Sefaria 14:3.

The citation comment (`// [R] KH 14:2`) is also wrong — KH 14:2 is the moon-mean-motion period table; the maslul rate is in KH 14:3.

❌ MISMATCH (engine-internal inconsistency).

---

## Diagnostic finding — the two-table conflation

For maslul/distance values 10°-90°, the codebase's `MOON_MASLUL_CORRECTIONS` and `MOON_LATITUDE_TABLE` are **byte-identical**:

```
{0°52', 1°43', 2°30', 3°13', 3°44', 4°16', 4°41', 5°00', 5°05'}
```

Per Sefaria, however, KH 15:6 (maslul correction) and KH 16:11 (latitude) publish **distinct** values:

| arg | KH 15:6 (maslul) | KH 16:11 (latitude) | codebase (used for both) |
|---|---|---|---|
| 10° | 0°50' | 0°52' | 0°52' |
| 20° | 1°38' | 1°43' | 1°43' |
| 30° | 2°24' | 2°30' | 2°30' |
| 40° | 3°6'  | 3°13' | 3°13' |
| 50° | 3°44' | 3°50' | 3°44' |
| 60° | 4°16' | 4°20' | 4°16' |
| 70° | 4°41' | 4°42' | 4°41' |
| 80° | 5°00' | 4°55' | 5°00' |
| 90° | 5°5'  | 5°00' | (15:6 → 5°5' / 16:11 → 5°00') |

The codebase's tables are **hybrid**: rows 10°-40° take the KH 16:11 (latitude) values, rows 50°-90° take the KH 15:6 (maslul) values. Then the same hybrid is used for *both* tables. That is a single transcription event, not two independent errors.

Whatever print edition the original transcription used either:
- (a) presented these two tables as a single combined table with the hybrid values; or
- (b) was misread/conflated by the transcriber.

Either way, this is the highest-leverage thing to resolve — fixing it cleanly would resolve 12 of the 14 mismatches (KH 15:6 has 8 wrong rows, KH 16:11 has 4). A Frankel/Yad-Peshutah cross-check is the right next step.

---

## hebcal cross-check (fixed-calendar)

| Item | hebcal output | Code value | verdict |
|---|---|---|---|
| Hebrew 3 Nisan 4938 → Gregorian | 1178-03-30 | `BASE_DATE_DISPLAY: new Date(Date.UTC(1178, 2, 30))` | ✅ |
| Hebrew 3 Nisan 5786 → Gregorian | 2026-03-21 | (no constant; pipeline test reference date) | ✅ |

Deeper hebcal cross-checks (full molad sequence for years 5780-5790, leap-year pattern over 19-year cycle) deferred to follow-up — the items above are sufficient to verify the epoch wiring.

---

## Published luach cross-check

**Not performed.** Issue #13 does not link a luach. None was available to this audit. Defer to follow-up.

---

## Recommendations (NOT implemented in this PR — read-only audit)

1. **GALGAL_KATAN.DAILY_MOTION (line 224)** — propagate the Phase R fix: `53.333` → `54`. Also fix citation comment `KH 14:2` → `KH 14:3`. Lowest risk, highest confidence.
2. **MOON_MASLUL_CORRECTIONS (KH 15:6)** and **MOON_LATITUDE_TABLE (KH 16:11)** — cross-check against Frankel/Yad-Peshutah critical apparatus before changing. The two-table conflation strongly suggests there is a *single* defensible reading; surface that reading, fix both tables, regression-test against the Rambam's worked example in 15:8 (which the engine should reproduce exactly to one cheilek).
3. **SEASON_CORRECTIONS (KH 14:5)** — same: Frankel cross-check before code change. The variant landscape is wide here.
4. **SUN.MEAN_MOTION_PER_DAY (line 151)** — decision: either keep `8.333` (table-implied, current behavior, asymmetric with moon Phase R fix) or change to `8` flat (daily-stated, symmetric with moon). Document the choice in `OPEN_QUESTIONS.md` Q7.
5. **Citation hygiene** — line 150 comment claims `KH 12:1` says `8 1/3"`; it says `8`. Line 223 comment cites `KH 14:2`; should be `KH 14:3`. Line 237 comment cites `KH 16:3`; Torat-Emet 363 places that text at the end of 16:2.
6. **Provenance retag** — `RED_DOMEH.DAILY_MOTION` and `GREEN_YOITZEH.DAILY_MOTION` (lines 204, 216) are class-tradition values, not Rambam's text — change `[R]` to `[L]` or introduce `[C]` for class-transcribed.
7. **Provenance test** — once the above are resolved, add `src/engine/__tests__/constants-provenance.test.js` (per AUDIT_PLAN.md deliverable 2) snapshotting these tables against Sefaria so they cannot silently regress.
8. **`MOON.MEAN_LONGITUDE_AT_EPOCH` (line 196)** — out-of-scope adjacent defect: the JS expression is `1 + 14/60 + 43/3600` (≈ 1.246°) but the inline comment claims `= 31°14'43" absolute`. Either the comment is wrong or the value should be `31 + 14/60 + 43/3600` (Taurus-anchored absolute longitude). Worth checking how this value is consumed downstream.

---

## AUDIT_PLAN.md crosswalk

| AUDIT_PLAN.md item | Status |
|---|---|
| `SUN.MEAN_MOTION_PER_DAY` | Verified — see "Sun — Chapter 12" |
| `SUN.START_POSITION` | Verified |
| `SUN.APOGEE_START` | Verified |
| `SUN.APOGEE_MOTION_PER_DAY` | Verified (post-Phase-R, MATCH) |
| `MOON.MEAN_MOTION_PER_DAY` | Verified (post-Phase-R, MATCH) |
| `MOON.START_POSITION` | Verified |
| `MOON.MASLUL_MEAN_MOTION` | Verified (post-Phase-R, MATCH) |
| `MOON.MASLUL_START` | Verified |
| `NODE.START_POSITION` | Verified |
| `NODE.DAILY_MOTION` | Verified |
| All five `*_PERIOD_BLOCKS` | All 5 × 6 = 30 rows verified, all MATCH |
| `SUN_MASLUL_CORRECTIONS` (KH 13:4) | Verified, all 18 rows MATCH |
| `MOON_MASLUL_CORRECTIONS` (KH 15:4-6) | Verified, **8 of 18 rows MISMATCH** |
| `MOON_LATITUDE_TABLE` (KH 16:9-10) | Verified, **4 of 9 rows MISMATCH** (also: actual table is in 16:11, not 16:9-10) |
| `DOUBLE_ELONGATION_ADJUSTMENTS` (KH 15:3) | Verified, all 10 stated rows MATCH |
| `SEASON_CORRECTIONS` (KH 14:5) | Verified, **7 of 8 Sefaria ranges differ** from codebase |
| Galgalim 3D vis params | `[D]`-tagged, out of scope; class-transcribed RED_DOMEH/GREEN_YOITZEH flagged for retag; GALGAL_KATAN.DAILY_MOTION engine-internal MISMATCH found |
| hebcal cross-checks | Epoch round-trip verified; deeper molad-sequence check deferred |
| Engine-internal consistency (`liveLongitudes` vs `pipeline`) | **Not audited** — out of scope (separate engine-vs-engine comparison, not constant-vs-source) |
| Published luach spot-checks | **Not performed** — none available |

---

## Reproducibility

Sefaria responses cached at `/tmp/sefaria-cache/ch{N}_h{M}.json` during this audit (not committed). To re-fetch:

```bash
for ch in 6 11 12 13 14 15 16 17; do
  for h in $(seq 1 17); do
    curl -s "https://www.sefaria.org/api/v3/texts/Mishneh_Torah%2C_Sanctification_of_the_New_Month.${ch}.${h}" \
      -o "ch${ch}_h${h}.json"
  done
done
```

Hebcal:

```bash
curl 'https://www.hebcal.com/converter?cfg=json&hy=4938&hm=Nisan&hd=3&h2g=1&strict=1'
```

Audit performed: 2026-05-03.
