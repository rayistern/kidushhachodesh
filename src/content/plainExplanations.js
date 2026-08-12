/**
 * Plain-language explanations, one per halacha.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **editorial** — NOT the Rambam, NOT a translation.
 *  SURFACE CATEGORY: teaching commentary
 * ═══════════════════════════════════════════════════════════════════
 *
 * These are written for this app. They are not a translation, not a
 * paraphrase of any commentator, and carry no authority — they exist to
 * connect one halacha to the next and to say what a term means and why
 * a step is there. Every surface that renders them must label them as
 * an editor's note, because unmarked plain-English beside a halacha
 * reads as though the Rambam said it.
 *
 * Where a halacha states numbers, the numbers here match the text
 * exactly (and the same figures are pinned in maslulTable.test.js).
 * Where something is a simplification, it is a simplification of the
 * mechanism and not of the result.
 *
 * Keyed chapter → halacha number (1-indexed, matching the reader).
 */

export const PLAIN_EXPLANATIONS = {
  13: {
    1: `Chapter 12 gave you the sun's *average* place — where it would be if it never sped up or slowed down. It does, so that place is a little bit wrong. This chapter fixes it.

The first thing to work out is how far the sun has travelled since it last passed its **far point**: the spot in its circle where it sits furthest from us. Take the far point's position away from the average position, and the gap you get is called the **course**. Everything else in the chapter depends on this one number.`,

    2: `Now that you have the course, you look up how big the fix should be, and the course also tells you which way to apply it.

If the course is less than half a circle (under 180°), the sun is running *late* — behind where the average says — so you take the fix away. If it's more than half a circle, the sun is running *early*, so you add the fix on. Either way, what you end up with is the sun's real place in the sky.`,

    3: `Two courses are special: exactly half a circle, and exactly a whole one. At those two moments the sun lines up perfectly with us and with the middle of its circle, so there is nothing to correct. The average place *is* the real place.

That is also why the fix grows from nothing and shrinks back to nothing — those two points are where it resets.`,

    4: `This is the answer list. Find your course down the left, read the fix off the right.

Notice its shape: it starts at nothing, climbs to its biggest at 90° — 1 degree and 59 minutes — then shrinks back to nothing at 180°. Like walking up a hill and down the other side. The top of the hill is the most the sun ever strays from its average place.`,

    5: `The list stops at 180°, but a course can be anything up to 360°. For the bigger ones, fold the number back: take it away from 360 and look *that* up instead.

A course of 200° gets the same size of fix as 160°, because the far half of the circle mirrors the near half. Only the direction changes — and halacha 2 already told you that: over 180°, you add instead of subtract.`,

    6: `The same fold again, with a bigger number. 300° taken from 360° leaves 60°, and the list says 60° is 1°41'. So a course of 300° gets a fix of 1°41' too.`,

    7: `What if your course is 65°, and the list only shows 60° and 70°?

Look at the two answers on either side: 1°41' and 1°51'. The difference between them is 10 minutes, spread across 10 degrees — so each degree is worth 1 minute. Your 65° is 5 degrees past 60, so add 5 minutes to 1°41' and you get **1°46'**.`,

    8: `Once more, so the method is unmistakable: 67° is 7 degrees past 60, so add 7 minutes to 1°41' → **1°48'**.

And this sharing-out trick isn't only for the sun. The moon has its own answer list later on, and you read it exactly the same way.`,

    9: `Now a real one, carrying straight on from chapter 12's example — the same day, 100 days after the starting point.

The average place is 105°37'25". The far point is 86°45'23". Take one from the other and the course is **18°52'2"**.

For looking things up, only whole degrees matter. The leftover 52 minutes is more than half a degree, so it counts as one more degree: read the list at **19°**. Between 10° (20') and 20° (40') each degree is worth 2 minutes, so 19° gives **38 minutes**.`,

    10: `The course was under 180°, so — by halacha 2 — the fix is taken away:

105°37'25" − 38' = **104°59'25"**

That lands in Sartan, a hair short of 15 degrees into the sign. And don't fret about the seconds. They are far too small to change whether anybody can actually see the new moon, which is the only question all of this is for.`,

    11: `Here's what you've really gained. You can now find the sun's true place on *any* day you like — so you can also run the question backwards.

Pick the exact spot in the sky where a season begins, then hunt for the day the sun arrives there. That gives you the true equinox or solstice, for any year you want, forwards or backwards from the starting point.`,
  },
};

/** Explanations for a chapter, or an empty object. */
export function explanationsForChapter(chapter) {
  return PLAIN_EXPLANATIONS[chapter] || {};
}

/** True when a chapter has any plain-language commentary written. */
export function hasExplanations(chapter) {
  return Object.keys(explanationsForChapter(chapter)).length > 0;
}
