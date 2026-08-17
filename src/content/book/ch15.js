/**
 * Chapter 15 of the plain-language book — the moon's true position.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **editorial** — NOT the Rambam, NOT a translation.
 *  SURFACE CATEGORY: teaching commentary
 * ═══════════════════════════════════════════════════════════════════
 *
 * The chapter where chapter 14's two loose numbers finally join, and
 * the first place the moon's answer is a real position in the sky.
 *
 * Three things need explaining that the text states without motivating:
 *
 *   1. Why the sun's position enters at all — and why the gap between
 *      moon and sun is *doubled* (15:1). Section 2.
 *   2. Why that doubled figure is always between 5° and 62° (15:2).
 *      The answer is that the question is only ever asked on one night
 *      of the month, which is worth saying out loud. Section 3.
 *   3. Why the correct course needs a nudge of up to nine degrees
 *      before the table is read (15:3). Section 4.
 *
 * Numbers quoted from the worked example are the Rambam's own stated
 * figures, and ch15's test asserts the engine reproduces each of them
 * to within a few arcseconds — see the note on QUOTED_FROM_TEXT in
 * book.test.js for why those are pinned differently from the rest.
 */

export default {
  chapter: 15,
  sourceChapter: 15,
  title: 'Where the moon really is',
  hebrewTitle: 'מקום הירח האמיתי',
  subtitle:
    "Chapter 14's two numbers finally come together — with help from the sun, of all things, and a correction two and a half times bigger than anything the sun needed.",

  terms: [
    {
      plain: 'the gap to the sun',
      formal: 'the elongation',
      hebrew: null,
      gloss:
        'How far the moon has pulled away from the sun since they were last together. Subtract one position from the other.',
    },
    {
      plain: 'the gap, doubled',
      formal: 'the double elongation',
      hebrew: 'מרחק כפול',
      gloss:
        'Exactly what it says — the gap multiplied by two. Doubled because the wobble being corrected for happens **twice** in each lap, not once.',
    },
    {
      plain: 'the course after its nudge',
      formal: 'the correct course',
      hebrew: 'המסלול הנכון',
      gloss:
        "Where the moon sits on its small circle, after adding the nudge the doubled gap earns it. This is the number you look the real correction up by.",
    },
    {
      plain: 'the fix from the table',
      formal: 'the angle of the course',
      hebrew: 'מנת המסלול',
      gloss:
        'How much to shift the average position to get the real one. Up to 5° 8′ for the moon — two and a half times anything the sun needed.',
    },
  ],

  recap: {
    settled: [
      "The moon's **mean** — where its small circle has got to — nudged to the moment of sighting.",
      'The **mean within its path** — where the moon sits on that small circle.',
      "The sun's average and true positions, from chapters 12 and 13.",
    ],
    thisChapter:
      "Chapter 14 left you holding two numbers and no moon. This chapter joins them. The method is the same shape as chapter 13's — find a course, look up a correction, apply it — but with two extra steps at the front that have no equivalent on the sun's side.",
    byTheEnd:
      "You will have the moon's true position on any evening: a real place in the sky, which is the second of the two things the visibility test needs.",
  },

  sections: [
    {
      id: 'what-is-missing',
      heading: 'Two numbers, no moon',
      source: 'KH 15:1',
      nodeId: 'moon-true',
      body: [
        'At the end of chapter 14 you had the arm of the fairground ride pointing somewhere, and the cup at the end of it turned to some angle. What you did not have is where the passenger actually is.',
        'This chapter finishes the job. But before the two can be combined, the moon\'s position on the small circle needs adjusting — and the adjustment depends on **where the sun is**.',
        'The sun again. In chapter 14 the sun told you what time sunset was; here it does something quite different, and this time the reason is physical rather than a matter of clocks.',
      ],
    },

    {
      id: 'double-elongation',
      heading: 'How far the moon has pulled away from the sun — doubled',
      source: 'KH 15:1',
      nodeId: 'double-elongation',
      body: [
        'The first step is simple enough. Take the moon\'s average place, take the sun\'s, and subtract. What is left is **the gap** — how far the moon has pulled away from the sun since the two were last together. The text calls it the *elongation*.',
        'Then comes the odd instruction: **double it**. He calls the result the *double elongation* — מרחק כפול, which literally means "doubled distance". Plainly: **the gap, doubled**.',
        'Why double? The commentary in the **Chitrik edition** gives a reason, and it is much better than it looks: **the epicycle\'s distance from the sun is always exactly half its distance from the far point** — the נקודת הגובה, the apogee of the circle the epicycle rides on.',
        'That is worth stopping on, because it means the doubling is not a relabelling. It **converts one quantity into another**. You can measure the gap between moon and sun easily; what the correction actually needs is the epicycle\'s distance from the far point. Those two are locked together at one to two, so doubling the first hands you the second for nothing.',
        'And now the step stops being strange, because it is the same step chapter 13 took. There, the sun\'s correction was measured from **its** far point, and you had to track that point across the centuries to do it. Here the same idea applies to the moon — a correction is always counted from the far point — but its far point never has to be tracked at all. That is why the Rambam gives the sun a govah with its own tables and gives the moon nothing of the kind. He does not need to. Doubling the gap *is* the moon\'s far-point calculation.',
        'It also explains why the table starts at nothing. When sun and moon are together the gap is zero, so the epicycle is sitting **on** the far point — and there is nothing to correct, exactly as the sun\'s correction vanishes at its own govah.',
        'One consequence, if you want to see the machinery: for the halves to stay locked as the month runs, that far point has to travel **backwards** — about 11 degrees a day, right round in roughly 32 days. The Rambam never mentions it. He does not have to, and that is the elegance of it.',
        'And what is all this machinery *for*? The nudge it feeds — the next section — corrects a real disturbance: the sun genuinely drags the moon off its simple path, and by how much depends on how the moon, the sun and the far point stand relative to one another, which is exactly what the doubled gap measures. Modern astronomy calls that wobble the *evection*; after the in-and-out of chapter 14\'s small circle, it is the largest irregularity in the moon\'s motion. The Rambam has no theory of gravity to explain it, but he has the pattern, and the pattern is all the table needs.',
      ],
      interactive: 'double-elongation',
    },

    {
      id: 'the-bounds',
      heading: 'Why the answer is always between 5 and 62 degrees',
      source: 'KH 15:2',
      nodeId: 'double-elongation',
      body: [
        'The Rambam then says something that looks like a very bold claim: the doubled gap can never be less than **5 degrees** nor more than **62**.',
        'That would be false for the moon in general — across a month the gap runs the whole way from nothing to a full circle, so doubled it covers everything. The claim only holds because of *when* the question is being asked.',
        'Remember what all this is for. Nobody works out the moon\'s position on a random Tuesday. The court asks on one particular night — the evening the new moon might first be spotted, just after the moon and sun have parted company. On that night the moon is never more than about two and a half days clear of the sun, and never less than a few hours.',
        'Two and a half degrees of separation at the earliest, about thirty-one at the latest. Double those and you get five and sixty-two. His bound is not a fact about the moon; it is a fact about the question.',
        'Which is also why his table in the next halacha stops at 63. He never needs more, so he never tabulates more.',
      ],
    },

    {
      id: 'the-nudge',
      heading: 'A nudge of up to nine degrees',
      source: 'KH 15:3',
      nodeId: 'moon-true',
      body: [
        'Now the doubled figure gets used. Look it up in a short table, and it tells you to add somewhere between **nothing and nine degrees** to the moon\'s position on the small circle.',
        'Five degrees or so: add nothing. Six to eleven: add one. Twelve to eighteen: add two. And so on up to sixty to sixty-three, which adds nine.',
        'What you get after adding is **the course after its nudge** — his *correct course*, the *maslul hanachon* (המסלול הנכון). From here on it plays exactly the part the sun\'s course played in chapter 13: it is the number you look the real correction up by.',
        'So the shape of the chapter is: build a course, correct it, then use it. The sun needed only the second half of that.',
      ],
      // The doubled-gap card (with this nudge table inside it) is already
      // shown in the previous section; rendering it twice on one page
      // reads as an error, not an emphasis.
    },

    {
      id: 'the-table',
      heading: "The moon's table, and how much bigger it is",
      source: 'KH 15:6',
      nodeId: 'moon-true',
      body: [
        'The correct course now goes into a table, and everything about how to read it you already know from chapter 13. Under half a circle, subtract; over, add. At exactly 180 or 360, no correction at all. Past 180, take it from 360 and read the mirror. Between rows, share out the difference.',
        'The only thing that changes is the numbers — and they change a lot. The fix from the table peaked at **1° 59\'** for the sun. For the moon it peaks at **5° 8\'**, and it peaks at 100 degrees rather than 90.',
        'That is two and a half times larger. The moon genuinely wanders much further from its average than the sun does, which is the single best reason the moon takes four chapters and the sun took two.',
        'The figure below plots both tables together so the difference in scale is visible rather than something you have to take on trust.',
      ],
      interactive: 'moon-correction-table',
    },

    {
      id: 'worked',
      heading: 'The whole thing, on one evening',
      source: 'KH 15:8',
      nodeId: 'moon-true',
      body: [
        'The Rambam works it right through, for the evening of the second of Iyar — twenty-nine days after the starting point. That is one month on from the epoch, which is not a coincidence: twenty-nine days is exactly the gap from one possible sighting to the next.',
        'Every figure he states along the way is marked in the calculator below. The chain runs: the sun\'s average place, the moon\'s average place at sighting, the moon within its path, the gap between moon and sun, that gap doubled, the nudge it earns, the course after its nudge, the fix from the table, and finally the subtraction.',
        'His answer: the moon stands **18 degrees 36 minutes into the 2nd sign** (Shor).',
        'One thing to watch as you step through it. He truncates the correct course to a whole number of degrees before reading the table, exactly as he did with the sun in chapter 13 — 108 degrees and 21 minutes becomes simply 108. That is the same licence, spent the same way.',
      ],
      interactive: 'moon-true',
    },
  ],

  closing: {
    have: [
      "The moon's **true** position on any evening — a real place among the signs.",
      "The sun's true position, from chapter 13.",
      'Which means: both of the two bodies whose separation the whole question turns on.',
    ],
    missing: [
      'One thing, and it is easy to miss. Everything so far has treated the sky as a single line, with the sun and moon sliding along it. They are not on the same line — the moon runs a little above or below the sun\'s track, by up to five degrees. That tilt is chapter 16, and it matters because a moon sitting higher above the horizon at sunset is a moon you have a better chance of seeing.',
    ],
  },
};
