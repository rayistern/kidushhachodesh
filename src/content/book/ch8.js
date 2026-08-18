/**
 * Chapter 8 of the plain-language book — the shape of the year.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **editorial** — NOT the Rambam, NOT a translation.
 *  SURFACE CATEGORY: teaching commentary
 * ═══════════════════════════════════════════════════════════════════
 *
 * The payoff of the calendar arc: two consecutive Rosh HaShanahs force
 * every month between them. The reader has already met this chapter's
 * output twice — the six year lengths in ch11's day-count seam, and
 * the "full month / short month" alternation in ch18 — so both ends
 * get tied here.
 */

export default {
  chapter: 8,
  sourceChapter: 8,
  title: 'The shape of the year',
  hebrewTitle: 'חדשים מלאים וחסרים',
  subtitle:
    'No month may start mid-day, so months are 29 or 30 days whole — and two Rosh HaShanahs force the length of every month between them.',

  terms: [
    {
      plain: 'full / lacking',
      formal: 'malei / chaser',
      hebrew: 'מלא / חסר',
      gloss:
        'A full month has 30 days, a lacking one 29. The real month is 29 and a half days and a bit, so the calendar alternates and lets the leftovers pile up where they can be managed.',
    },
    {
      plain: "the year's shape",
      formal: "the kevi'ah",
      hebrew: 'קביעה',
      gloss:
        'Which of three patterns the year follows: lacking (353/383 days), in order (354/384), or complete (355/385) — six lengths in all, counting common and leap.',
    },
    {
      plain: 'the two adjustable months',
      formal: 'Marcheshvan and Kislev',
      hebrew: 'מרחשוון וכסלו',
      gloss:
        'Every other month\'s length is fixed forever. These two flex — both lacking, one of each, or both full — and that flexing is the calendar\'s entire adjusting room.',
    },
  ],

  recap: {
    settled: [
      'The molad of any Tishrei, by addition from BaHaRaD.',
      'The weekday of any Rosh HaShanah — molad plus the four postponements, matching the calendar in use.',
    ],
    thisChapter:
      'A start-day is not yet a year. This chapter turns two consecutive Rosh HaShanahs into the whole year between them: its length, its pattern of full and lacking months, every date.',
    byTheEnd:
      'You will be able to lay out all the months of any year from two weekday names — and the six year lengths that chapter 11 leaned on will stop being a list and become a mechanism.',
  },

  sections: [
    {
      id: 'no-half-days',
      heading: 'Months of whole days only',
      source: 'KH 8:1-2',
      nodeId: 'year-shape',
      body: [
        'The real lunar month is 29½ days and 793 parts. But a calendar month may not start in the middle of a day — the tradition reads "a month of days" as whole days only.',
        'So calendar months come in two sizes: **lacking** at 29 days, **full** at 30. If the month were exactly 29½, they would simply alternate forever, six of each, 354 days a year. It is the 793 parts past the half-day that slowly pile up and force some years to carry an extra full month — or one fewer.',
      ],
    },

    {
      id: 'the-pattern',
      heading: 'One pattern, two adjustable months',
      source: 'KH 8:5-6',
      nodeId: 'year-shape',
      body: [
        'The months do alternate — Tishrei full, Tevet lacking, and one-and-one from there: Sh\'vat full, Adar lacking, Nisan full, Iyar lacking, Sivan full, Tammuz lacking, Av full, Elul lacking. (In a leap year, the first Adar is full and the second lacking.)',
        'Two months are left out of the pattern on purpose: **Marcheshvan and Kislev**. Sometimes both are lacking, sometimes one of each, sometimes both full — and those three cases are the three shapes a year can take: **lacking**, **in order**, **complete**.',
        'That is the entire adjusting room. All the piled-up parts, all the postponements of chapter 7 — every correction the calendar ever needs is paid out of those two months and the leap month. Everything else is fixed for eternity.',
      ],
    },

    {
      id: 'two-rh',
      heading: 'Two Rosh HaShanahs force everything',
      source: 'KH 8:7-9',
      nodeId: 'year-shape',
      body: [
        'Here is the chapter\'s clean trick. Find the weekday of this year\'s Rosh HaShanah and the next one\'s, and count the days strictly **between** the two weekdays.',
        'In a common year: two days between means a lacking year, three means in order, four means complete. In a leap year: four, five, six. No other gaps can occur — the postponements of chapter 7 exist partly to guarantee that.',
        'His example (8:9): this Rosh HaShanah on Thursday, next on Monday — Friday, Shabbat, Sunday between, three days: the year runs **in order**. Two weekday names, and every month of the year is forced.',
        'The counting is the one place to be careful: **between means strictly between**, both ends left out. The calculator below does it day by day, and also shows which pairs the calendar can never produce.',
      ],
      interactive: 'between-days',
    },

    {
      id: 'worked',
      heading: 'Any year, laid out whole',
      source: 'KH 8:5-10',
      nodeId: 'year-shape',
      body: [
        'The card below does the full derivation for any year: both Rosh HaShanahs, the gap, the shape, and the resulting grid of months — with the two adjustable ones doing whatever this year requires.',
        'This closes the loop chapter 11 opened. The six year lengths — 353, 354, 355, 383, 384, 385 — were the reason a day count could never be a multiplication. Now you can see where all six come from: three shapes, with and without a leap month.',
      ],
      interactive: 'year-shape',
    },

    {
      id: 'bonus-parshiyot',
      heading: 'Bonus: what the shape decides at shul',
      source: 'KH 8:7',
      nodeId: 'year-shape',
      body: [
        'One more thing the year\'s shape quietly fixes, beyond this chapter but too good to leave out: **which Torah portions get doubled up** on Shabbat that year.',
        'The reading cycle must land its last portion exactly on Simchat Torah, every year. But the shape decides how many Shabbatot the year holds, and the weekday of Rosh HaShanah decides which holidays fall ON Shabbat and swallow a reading slot. Whatever is left over, seven fixed candidate pairs absorb: split when the year has room, read together when it does not.',
        'So a leap year — four extra Shabbatot — splits most of the pairs; a common year combines most of them. The card below does the budget for any year, and shows the one wrinkle the diaspora adds: its extra festival days can swallow one more Shabbat, putting it a portion behind the Land of Israel until a pair that never combines in Israel — Chukat–Balak — lets it catch up.',
      ],
      interactive: 'parsha-pairs',
    },
  ],

  closing: {
    have: [
      'Every month of any year, from two consecutive Rosh HaShanahs.',
      'The three shapes and six lengths — the mechanism behind chapter 11\'s day-count seam.',
      'With chapters 6 and 7: the complete fixed calendar, from BaHaRaD to any date, all of it whole-number arithmetic.',
    ],
    missing: [
      'The sun\'s side of the calendar: leap years exist to hold Pesach beside the spring season-point, and tracking the seasons is chapters 9 and 10 — two traditions, one round and one exact. (Chapters 1 to 5, the court and its witnesses, remain in the source text.)',
    ],
  },
};
