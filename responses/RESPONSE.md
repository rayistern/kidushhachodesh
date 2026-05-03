# Response to user — ב' סיון ה'תשפו visibility report

> **UPDATE 2026-05-03 (after fix):** the engine now runs the full Rambam KH 17 chain (commits [4b7fa4b](https://github.com/rayistern/kidushhachodesh/commit/4b7fa4b), [99e3965](https://github.com/rayistern/kidushhachodesh/commit/99e3965); issue [#18](https://github.com/rayistern/kidushhachodesh/issues/18) closed). The verdict for ב' סיון ה'תשפו correctly returns **ודאי יראה** — קשת הראיה ≈ 15°15' (above the 14° certainly-visible cutoff per KH 17:15). All seven intermediate values now appear in the engine output and in the UI's drill-down. The remaining ~15-20' delta versus the user's worksheet traces to issue [#19](https://github.com/rayistern/kidushhachodesh/issues/19) (KH 14:5 season-correction boundary placement); the verdict is unaffected. Original diagnosis below.

---

## Bottom line (original)

**The user is right.** Our website does **not** run the full Rambam visibility chain (KH 17:5–22). It computes only **אורך ראשון** (the raw moon‑sun elongation, KH 17:6) and applies a heuristic threshold; it never produces **אורך שני / שלישי / רביעי**, **מעגל הירח**, **תיקון ארוכי וקצרי שקיעה**, **מנת גובה המדינה**, or **קשת הראיה**.

For ב' סיון ה'תשפו specifically, our engine returns **elongation ≈ 11°59'** and reports "not visible." The user's full computation produces **קשת ראיה ≈ 15°31'** — well above the threshold, so "וודאי יראה." Both numbers are internally consistent; ours is just incomplete.

> **Note on the user's "11°" figure.** The user reports our site shows "אורך ראשון = 11°." Our engine actually returns **11°59'** (≈12°). The 11° he saw is most likely a rounded display value (or his rounding when reading it) — worth a quick check on the live site (kidushhachodesh.netlify.app for 18 May 2026) to confirm whether the UI truncates instead of rounding. If the UI shows a bare "11°," that's a separate display bug to log.

The Excel attached (`our_numbers_2_sivan_5786.xlsx`) presents row‑by‑row:
- Sheet 1 (`ב סיון ה'תשפו`) — every step the user computed, with our value next to his and a status (תואם / סטייה / לא מחושב).
- Sheet 2 (`כל החודשים`) — a table for every day from 1 ניסן through 29 תמוז ה'תשפו with the values our engine *does* produce.

## Where we agree (to within seconds of arc)

Days from epoch (309775), sun mean longitude (55°55'), sun apogee (99°39'), sun maslul (316°16'), sun maslul correction (1°20'), **sun true longitude 57°15'**, moon mean longitude (69°41'), moon mean anomaly (168°49'), maslul hanachon (172°49'), moon maslul correction (0°42'), and node position (335°35') — all match the user's spreadsheet to within 1–2 seconds of arc.

## Where we differ

### 1. תיקון לשעת הראיה (KH 14:5 — season correction)

| | Our value | User value |
|---|---|---|
| For sun ≈ 57°15' (Taurus, late) | **+0°15'** | **+0°30'** |

Our table puts the boundary at **30° (start of Taurus → start of Gemini = +15')**, with **+30'** beginning at the start of Gemini (60°). The user's table puts **+30'** earlier — likely from "מחצי אריה" / "מחצי תאומים" boundaries placed at 45° instead of 60°.

The Rambam's text in KH 14:5 names *halves* of mazalot (חצי דגים, חצי תאומים…), and different printed editions and מפרשים place those midpoints at slightly different absolute longitudes. Our reading is documented in `docs/CALCULATIONS.md` §"Season Correction Table"; the user's reading is also defensible. We will add this to `docs/OPEN_QUESTIONS.md` as Q‑season‑boundaries to invite primary‑source clarification.

This 15' delta propagates downward and explains every other small mismatch in the chain:

- adjusted mean longitude differs by 15'
- moon true longitude differs by 15' (69°14' vs 69°29')
- אורך ראשון differs by 15' (11°58' vs 12°13')

### 2. The visibility chain (KH 17:5–22) — not implemented

This is the substantive issue.

`src/engine/visibilityCalculations.js` implements:
```
elongation        = moonTrueLon − sunTrueLon       (KH 17:6)
firstVisAngle     = elongation + 0.3 × |latitude|  (heuristic, NOT in Rambam)
isVisible         = firstVisAngle > 12°
                    AND elongation ∈ (12°, 348°)
                    AND |latitude| < 6°
```

What the Rambam actually requires after KH 17:6 is:

| Step | Source | Effect on 2 Sivan example |
|---|---|---|
| שינוי המראה לאורך (parallax in longitude) | KH 17:7–9 | −0°59' → אורך שני 11°14' |
| מעגל הירח (galgal correction) | KH 17:10–11 | −0°47' → אורך שלישי 10°27' |
| תיקון ארוכי וקצרי שקיעה (long/short setting) | KH 17:12 | +1°44' → אורך רביעי 12°12' |
| מנת גובה המדינה (latitude/height adjustment for ארץ ישראל) | KH 17:13–14 | +3°18' |
| **קשת הראיה** | KH 17:15 | **15°30'** |
| Compare against קיצי הראיה table | KH 17:16–22 | 15°30' > 9° → "וודאי יראה" |

Our `+ 0.3 × |latitude|` heuristic happens to be in the right *direction* but is far too small (0.3 × 5° = 1.5°, vs the real chain that adds about 3°+ from גובה המדינה alone). And our `> 12°` cutoff bypasses the proper קיצי הראיה table.

So for any month where the raw elongation lands between roughly 9° and 14° — i.e. exactly the borderline cases the Rambam designed his chain to resolve — our app will frequently say "not visible" when the Rambam's chain says it *is* visible. ב' סיון ה'תשפו is exactly such a case.

## What we should do

1. **File a tracking issue** in this repo titled "Implement KH 17:5–22 visibility chain" with the user's report as the worked example, the six steps above as the implementation outline, and tests anchored on his ב' סיון ה'תשפו worksheet (which we now have line‑by‑line).
2. **Open a second issue** for the season‑correction boundary question (Q‑season‑boundaries), since at least one alternative tradition places the +15'/+30' boundary lower than ours.
3. **Update the visibility section of the docs** (`docs/OPEN_QUESTIONS.md` and `docs/CALCULATIONS.md`) to flag the current approximation explicitly until the chain is implemented — the docs presently understate this.
4. **Reply to the user** acknowledging both findings; the message draft is below.

---

## Suggested reply (Hebrew) — UPDATED 2026-05-03 after the fix shipped

> תודה רבה על הדיווח המפורט והגיליון — צדקת לחלוטין, ותיקנו את זה.
>
> המנוע אכן עצר ב‑**אורך ראשון** והחיל סף heuristic של "> 12°", במקום להריץ את השרשרת המלאה של פרק י"ז. תיקנו זאת באתר היום: כעת הוא מריץ את כל שבעת השלבים של הרמב"ם — אורך שני (KH 17:5), רוחב שני (17:7-9), מעגל הירח (17:10-11), אורך שלישי, אורך רביעי (17:12), מנת גובה המדינה, וקשת הראיה — ואז משווה לקיצי הראיה (KH 17:16-21).
>
> עבור ב' סיון ה'תשפו, התוצאה החדשה: **קשת הראיה ≈ 15°15' → ודאי יראה** (KH 17:15: > 14°). גמרנו עם המסקנה השגויה.
>
> הקוד מאומת מול שני fixtures: (א) הדוגמא הסדורה של הרמב"ם בעצמו ב‑KH 17:13-14 (ב' אייר של "שנה זו") — תואם ספרה‑אחר‑ספרה לתוך ±1' (תוך כיבוד "אֵין מְדַקְדְּקִין בִּשְׁנִיּוֹת"); (ב) הגיליון שלך עצמך, שמראה כעת ודאי יראה. הפער שנשאר ביננו (~15') בערכי הביניים נובע מסוגיית KH 14:5 — קרי המקום המדויק שמתחיל לפיו ה‑+30' של התיקון לשעת הראיה. סוגיה זו עדיין פתוחה (#19), ויש בה לפחות שלוש קריאות מסורתיות שונות; היא לא משפיעה על הפסק לב' סיון, אבל היא חשובה לחודשי גבול אחרים.
>
> קבצים בגיט (פתוח לכל):
> • הקובץ הוורבטים של פרק י"ז: [`docs/sources/KH_17_verbatim.md`](https://github.com/rayistern/kidushhachodesh/blob/main/docs/sources/KH_17_verbatim.md)
> • התיעוד של השרשרת: [`docs/CALCULATIONS.md`](https://github.com/rayistern/kidushhachodesh/blob/main/docs/CALCULATIONS.md) ("Visibility Chain (KH 17)")
> • Issue #18 שנסגר: https://github.com/rayistern/kidushhachodesh/issues/18
> • Issue #19 הפתוח על KH 14:5: https://github.com/rayistern/kidushhachodesh/issues/19
> • הקובץ אקסל המעודכן: [`responses/our_numbers_2_sivan_5786.xlsx`](https://github.com/rayistern/kidushhachodesh/raw/main/responses/our_numbers_2_sivan_5786.xlsx)
>
> אם יש לך עוד הערות, או אם יש לך קריאה מועדפת ל‑KH 14:5 (Frankel? תימני? מסורת אחרת?) שתרצה שנכלול — נשמח לדעת. הגיליון שלך הפך ל‑test fixture קבוע במאגר.

## Suggested reply (English) — UPDATED 2026-05-03 after the fix shipped

> Thank you for the detailed report and worksheet — you were entirely right, and we've fixed it.
>
> The engine was indeed stopping at **אורך ראשון** with a heuristic `> 12°` cutoff instead of running the Rambam's full chapter-17 chain. We fixed that today: it now runs all seven steps the Rambam specifies — אורך שני (KH 17:5), רוחב שני (17:7-9), מעגל הירח (17:10-11), אורך שלישי, אורך רביעי (17:12), מנת גובה המדינה, and קשת הראיה — then compares against the קיצי הראיה table (KH 17:16-21).
>
> For ב' סיון ה'תשפו the new verdict is: **קשת הראיה ≈ 15°15' → ודאי יראה** (KH 17:15: > 14°). The wrong call is gone.
>
> The code is anchored on two fixtures: (a) the Rambam's own worked example in KH 17:13-14 (2 Iyar of "this year") — every step matches the Rambam's stated values to within ±1' (honoring his own "אֵין מְדַקְדְּקִין בִּשְׁנִיּוֹת"); and (b) your own worksheet, which now also lands on ודאי יראה. The remaining ~15' delta in the intermediate values traces to the KH 14:5 boundary question (issue #19) — at least three traditional readings exist for where the +30' band of the season correction starts; we want a primary‑source review before flipping. It doesn't affect the 2 Sivan verdict but matters for borderline months.
>
> Public links:
> • Verbatim source text of KH 17: [`docs/sources/KH_17_verbatim.md`](https://github.com/rayistern/kidushhachodesh/blob/main/docs/sources/KH_17_verbatim.md)
> • Documentation of the chain: [`docs/CALCULATIONS.md`](https://github.com/rayistern/kidushhachodesh/blob/main/docs/CALCULATIONS.md) (section "Visibility Chain (KH 17)")
> • Closed issue #18: https://github.com/rayistern/kidushhachodesh/issues/18
> • Open issue #19 (KH 14:5): https://github.com/rayistern/kidushhachodesh/issues/19
> • Updated Excel comparison: [`responses/our_numbers_2_sivan_5786.xlsx`](https://github.com/rayistern/kidushhachodesh/raw/main/responses/our_numbers_2_sivan_5786.xlsx)
>
> If you have a preferred KH 14:5 reading you'd like us to use (Frankel? Yemenite manuscript? a particular printed edition?), let us know — your worksheet has become a permanent test fixture in the repo.
