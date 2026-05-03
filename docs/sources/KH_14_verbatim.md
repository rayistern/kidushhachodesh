# Hilchot Kiddush HaChodesh, Chapter 14 — verbatim Hebrew

Pulled from Sefaria 2026-05-03 (`Mishneh_Torah,_Sanctification_of_the_New_Month.14`,
Hebrew version, `return_format=text_only`). Used as the primary source for
the moon's mean motion (14:1-4), the season correction at sunset
(14:5-6), and as the resolution source for issue #19.

## Halachot

### 14:1 — moon mean motion

> הַיָּרֵחַ שְׁנֵי מַהֲלָכִים אְמְצָעיּים יֵשׁ לוֹ. … מַהֲלַךְ אֶמְצַע הַיָּרֵחַ בְּיוֹם אֶחָד י"ג מַעֲלוֹת וְי' חֲלָקִים וְל"ה שְׁנִיּוֹת. סִימָנָם י"ג יל"ה:

→ moon mean motion = 13°10'35"/day. (Implemented in `CONSTANTS.MOON.MEAN_MOTION_PER_DAY`.)

### 14:2 — period blocks for moon mean

> נִמְצָא מַהֲלָכוֹ בַּעֲשָׂרָה יָמִים קל"א מַעֲלוֹת וּמ"ה חֲלָקִים וַחֲמִשִּׁים שְׁנִיּוֹת … בְּק' יוֹם רל"ז מַעֲלוֹת וְל"ח חֲלָקִים וְכ"ג שְׁנִיּוֹת … בְּאֶלֶף יוֹם רי"ו מַעֲלוֹת וְכ"ג חֲלָקִים וְנ' שְׁנִיּוֹת … בְּי' אֲלָפִים יוֹם ג' מַעֲלוֹת וְנ"ח חֲלָקִים וְכ' שְׁנִיּוֹת …

→ Implemented in `CONSTANTS.MOON_MEAN_PERIOD_BLOCKS`.

### 14:3 — maslul (anomaly) mean motion

> וּמַהֲלַךְ אֶמְצַע הַמַּסְלוּל בְּיוֹם אֶחָד י"ג מַעֲלוֹת וּשְׁלֹשָׁה חֲלָקִים וְנ"ד שְׁנִיּוֹת.

→ maslul motion = 13°3'54"/day. (Implemented in `CONSTANTS.MOON.MASLUL_MEAN_MOTION`.)

### 14:4 — epoch values

> מְקוֹם אֶמְצַע הַיָּרֵחַ הָיָה בִּתְחִלַּת לֵיל חֲמִישִׁי שֶׁהוּא הָעִקָּר לְחֶשְׁבּוֹנוֹת אֵלּוּ בְּמַזַּל שׁוֹר מַעֲלָה אַחַת וְי"ד חֲלָקִים וּמ"ג שְׁנִיּוֹת. … וְאֶמְצַע הַמַּסְלוּל הָיָה בְּעִקָּר זֶה פ"ד מַעֲלוֹת וְכ"ח חֲלָקִים וּמ"ב שְׁנִיּוֹת.

→ moon mean lon at epoch = 1°14'43" Taurus = 31°14'43" abs. maslul at epoch = 84°28'42". (Both implemented.)

### 14:5 — season correction (the resolution of issue #19)

> אִם הָיְתָה הַשֶּׁמֶשׁ מֵחֲצִי מַזַּל דָּגִים עַד חֲצִי מַזַּל טָלֶה. תָּנִיחַ אֶמְצַע הַיָּרֵחַ כְּמוֹת שֶׁהוּא. וְאִם תִּהְיֶה הַשֶּׁמֶשׁ מֵחֲצִי מַזַּל טָלֶה עַד תְּחִלַּת מַזַּל תְּאוֹמִים. תּוֹסִיף עַל אֶמְצַע הַיָּרֵחַ ט"ו חֲלָקִים. וְאִם תִּהְיֶה הַשֶּׁמֶשׁ מִתְּחִלַּת מַזַּל תְּאוֹמִים עַד תְּחִלַּת מַזַּל אַרְיֵה. תּוֹסִיף עַל אֶמְצַע הַיָּרֵחַ ט"ו חֲלָקִים. וְאִם תִּהְיֶה הַשֶּׁמֶשׁ מִתְּחִלַּת מַזַּל אַרְיֵה עַד חֲצִי מַזַּל בְּתוּלָה תּוֹסִיף עַל אֶמְצַע הַיָּרֵחַ ט"ו חֲלָקִים. וְאִם תִּהְיֶה הַשֶּׁמֶשׁ מֵחֲצִי מַזַּל בְּתוּלָה עַד חֲצִי מֹאזְנַיִם. הָנַח אֶמְצַע הַיָּרֵחַ כְּמוֹת שֶׁהוּא. וְאִם תִּהְיֶה הַשֶּׁמֶשׁ מֵחֲצִי מֹאזְנַיִם עַד תְּחִלַּת מַזַּל קֶשֶׁת. תִּגְרַע מֵאֶמְצַע הַיָּרֵחַ ט"ו חֲלָקִים. וְאִם תִּהְיֶה הַשֶּׁמֶשׁ מִתְּחִלַּת מַזַּל קֶשֶׁת עַד תְּחִלַּת מַזַּל דְּלִי. תִּגְרַע מֵאֶמְצַע הַיָּרֵחַ ל' חֲלָקִים. וְאִם תִּהְיֶה הַשֶּׁמֶשׁ מִתְּחִלַּת מַזַּל דְּלִי עַד חֲצִי מַזַּל דָּגִים. תִּגְרַע מֵאֶמְצַע הַיָּרֵחַ ט"ו חֲלָקִים:

**Tabulated verbatim:**

| Sun position | Operation | Boundary in degrees |
|---|---|---|
| מחצי דגים → מחצי טלה | leave unchanged | 345° → 15° |
| מחצי טלה → תחילת תאומים | **+15'** | 15° → 60° |
| תחילת תאומים → תחילת אריה | **+15'** | 60° → 120° |
| תחילת אריה → חצי בתולה | **+15'** | 120° → 165° |
| חצי בתולה → חצי מאזנים | leave unchanged | 165° → 195° |
| חצי מאזנים → תחילת קשת | −15' | 195° → 240° |
| תחילת קשת → תחילת דלי | **−30'** | 240° → 300° |
| תחילת דלי → חצי דגים | −15' | 300° → 345° |

**Key features of the verbatim text:**

1. The **additive side** (sun in northern half, summer half) is **uniformly +15'** from mid-Aries (15°) through mid-Virgo (165°). There is **no +30' band** on the additive side.
2. The **subtractive side** has **one −30' band** at start-Sagittarius through start-Aquarius (240°-300°), flanked by −15' bands.
3. The two no-correction bands sit at the equinoxes (mid-Pisces → mid-Aries and mid-Virgo → mid-Libra), as expected.
4. Asymmetry is real: the −30' band exists only on the subtractive side. Astronomically, this corresponds to the longer nights of winter — sunset is much later than 6 PM relative to summer's small offset.

### 14:6 — definition of אמצע הירח לשעת הראיה

> וּמַה שֶּׁיִּהְיֶה הָאֶמְצַע אַחַר שֶׁתּוֹסִיף עָלָיו אוֹ תִּגְרַע מִמֶּנּוּ אוֹ תָּנִיחַ אוֹתוֹ כְּמוֹת שֶׁהוּא. הוּא אֶמְצַע הַיָּרֵחַ לְאַחַר שְׁקִיעַת הַחַמָּה בִּכְמוֹ שְׁלִישׁ שָׁעָה בְּאוֹתוֹ הַזְּמַן שֶׁתּוֹצִיא הָאֶמְצַע לוֹ. וְזֶה הוּא הַנִּקְרָא אֶמְצַע הַיָּרֵחַ לִשְׁעַת הָרְאִיָּה.

→ The corrected mean longitude is the moon's position about ⅓ hour after sunset. This is אמצע הירח לשעת הראיה.

## Resolution of issue #19

The shipping table (added in commit 42de589 during the original
rebuild, never source-verified despite its `[R]` tag) placed `+30'`
at start-Gemini → mid-Cancer (60°-90°). That value does not appear
anywhere in this primary text. The user's worksheet uses yet a third
reading (`+30'` for sun in late Taurus, ~57°), which also doesn't
match Sefaria.

**Decision (2026-05-03):** switch the engine to Sefaria's verbatim
reading. Reasoning:

1. The user's directive: "Should be entirely true to the source text
   in Rambam." Sefaria is the most accessible primary digital text,
   with scholarly review and variant-reading annotations.
2. The previous shipping reading was unverified — its `[R]` tag was
   asserted, not derived. Per the project's own `feedback_r_tags`
   memory, `[R]` tags are not automatically trustworthy.
3. The change does not affect the verdict for the reporting user's
   2 Sivan ה'תשפו case (sun at 57° gets +15' under both readings).
4. For dates where the readings differ (sun in 60°-105° band): we
   now produce the smaller +15' instead of the larger +30'. This is
   a structural change to the engine output for those dates.

If the user's worksheet follows a different traditional reading
(Frankel, Yemenite, Rabbi Losh), they can let us know and we can
either (a) switch to that reading, or (b) make the table
user-selectable. Until then, Sefaria's text is the load-bearing
primary source.
