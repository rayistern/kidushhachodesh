/**
 * Chapter 7 of the plain-language book — the four postponements.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **editorial** — NOT the Rambam, NOT a translation.
 *  SURFACE CATEGORY: teaching commentary
 * ═══════════════════════════════════════════════════════════════════
 *
 * The hinge of the fixed calendar: the molad proposes a day and four
 * rules dispose. Two things the book must carry:
 *
 *   1. The rules are exact to the single chelek (7:6) and reproduce
 *      the calendar in use — pinned across 400 years in
 *      fixedYear.test.js, which is the strongest verification this
 *      project owns.
 *   2. His REASON (7:7-8) is the book's oldest theme arriving early:
 *      the molad is a MEAN, the sky runs true, and the postponements
 *      exist partly to absorb that gap. Mean-versus-true, chapters
 *      before the astronomy defines the words.
 */

export default {
  chapter: 7,
  sourceChapter: 7,
  title: 'Four rules between the molad and the calendar',
  hebrewTitle: 'דחיות',
  subtitle:
    'The molad proposes a day for Rosh HaShanah; four postponements dispose. Exact to a single part — and still fixing the calendar on your wall.',

  terms: [
    {
      plain: 'a postponement',
      formal: 'a dechiyah',
      hebrew: 'דחייה',
      gloss:
        'A rule that pushes Rosh HaShanah off the molad\'s day. There are four; between them they move about six years in every ten.',
    },
    {
      plain: 'the old molad',
      formal: 'molad zaken',
      hebrew: 'מולד זקן',
      gloss:
        'A molad at noon or later (hour 18, counting from the evening). Too late in the day for the new crescent to be seen that evening — so the month starts tomorrow.',
    },
    {
      plain: 'never Sunday, Wednesday, Friday',
      formal: 'lo ADU rosh',
      hebrew: 'לא אד"ו ראש',
      gloss:
        'Rosh HaShanah never falls on those three weekdays — the letters אד"ו spell 1, 4, 6. A day landing there gets pushed one further.',
    },
  ],

  recap: {
    settled: [
      'The molad of any Tishrei — a weekday, an hour, and parts — by addition from BaHaRaD.',
      'The units and the leftovers that make the sums small.',
    ],
    thisChapter:
      'A molad is a moment; a calendar needs a day. This chapter is the bridge: four rules that take the molad\'s proposed weekday and decide where Rosh HaShanah actually falls.',
    byTheEnd:
      'You will be able to take any year\'s molad and land Rosh HaShanah on the right weekday — checkable against any printed calendar, and checked here against four hundred years of them.',
  },

  sections: [
    {
      id: 'proposes-disposes',
      heading: 'The molad proposes; the rules dispose',
      source: 'KH 7:1',
      nodeId: 'rosh-hashanah',
      body: [
        'The natural rule would be: Rosh HaShanah falls on the day of its molad. That is the default, and it survives untouched in roughly four years out of ten.',
        'The other six meet one of four postponements. Two are broad — a forbidden weekday, a too-late hour. Two are narrow, firing rarely and cut to a single part. All four only ever push **forward**, by one day or two, never back.',
        'Everything else in the calendar hangs off this one decision: fix the weekday of two consecutive Rosh HaShanahs and, as chapter 8 shows, every month between them is forced.',
      ],
    },

    {
      id: 'the-two-big',
      heading: 'The two broad rules',
      source: 'KH 7:1-3',
      nodeId: 'rosh-hashanah',
      body: [
        '**Never Sunday, Wednesday or Friday** (לא אד"ו ראש). If the molad falls on one of those, Rosh HaShanah moves a day. The workings of this rule sit outside these chapters — the classical reason is which festivals may not land beside Shabbat — but its effect is mechanical and total: no year in the fixed calendar has ever begun on those days.',
        '**The old molad** (מולד זקן): a molad at noon or later also pushes a day. His stated logic ties it to the sighting the calendar replaced: a meeting that late leaves the moon too young to be seen that evening, so the month ought not begin that night.',
        'And they stack. A molad on Shabbat at noon or later is pushed to Sunday by the old-molad rule, then off Sunday by אד"ו — Rosh HaShanah lands on **Monday**, two days past the molad (7:3).',
      ],
    },

    {
      id: 'the-two-small',
      heading: 'The two narrow rules, exact to one part',
      source: 'KH 7:4-6',
      nodeId: 'rosh-hashanah',
      body: [
        'The remaining two exist to protect chapter 8: without them, some years would need lengths the month-pattern cannot produce.',
        '**The Tuesday rule** (ג"ט ר"ד): in a common year, a molad on Tuesday at 9 hours 204 parts or later sends Rosh HaShanah to **Thursday**. **The after-leap Monday rule** (בט"ו תקפ"ט): in a year following a leap year, a molad on Monday at 15 hours 589 parts or later pushes to **Tuesday**.',
        'Both thresholds are exact to the single part, and he says so (7:6): at 9–203 or 15–588, one part earlier, nothing moves. There is no rounding anywhere in this system — it is integer arithmetic from BaHaRaD down, which is why it can run for millennia without drift.',
      ],
    },

    {
      id: 'why',
      heading: 'His reason: the molad is an average',
      source: 'KH 7:7-8',
      nodeId: 'rosh-hashanah',
      body: [
        'Then he explains himself, and the explanation is this book\'s oldest theme arriving five chapters early.',
        'These calculations, he says, find the meeting **at the mean rate of travel** — not where the sun and moon truly are. The real sky runs ahead of the average and behind it; the postponements are shaped so the calendar day stays near the day the crescent would genuinely have been seen.',
        'He offers the proof from experience (7:8): sometimes the rules push Rosh HaShanah two days past the computed molad, and the moon is first seen — exactly then. The average said Tuesday; the sky said Thursday; the rules had already said Thursday.',
        'A reader coming from the astronomy chapters will recognise everything: pretend-steady average, real wobbling sky, and machinery to bridge them. Chapters 13 and 15 bridge it with correction tables; this chapter bridges it with postponements. Same gap, two tools.',
      ],
    },

    {
      id: 'worked',
      heading: 'Any year, walked through the gates',
      source: 'KH 7:1-5',
      nodeId: 'rosh-hashanah',
      body: [
        'The card below takes a year, computes its molad, walks it past all four rules, and shows which fired — with presets for a year where none fires and a year for each rule.',
        'Then it does the thing this book cannot do for any astronomical claim: it checks the answer against the calendar actually in use. Across four hundred consecutive years, his four rules never miss once. You are holding the same arithmetic that fixed this year\'s holidays.',
      ],
      interactive: 'four-gates',
    },
  ],

  closing: {
    have: [
      'The weekday of Rosh HaShanah for any year — molad plus four rules, exact to one part in 1080 of an hour.',
      'His own reason: the molad is an average, and the rules absorb part of the gap between average and sky.',
    ],
    missing: [
      'A weekday for Rosh HaShanah is not yet a calendar: the months of the year still need their lengths. Chapter 8 derives every one of them from just two consecutive Rosh HaShanahs.',
    ],
  },
};
