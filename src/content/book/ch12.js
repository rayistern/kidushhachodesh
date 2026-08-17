/**
 * Chapter 12 of the plain-language book — the sun's average position.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **editorial** — NOT the Rambam, NOT a translation.
 *  SURFACE CATEGORY: teaching commentary
 * ═══════════════════════════════════════════════════════════════════
 *
 * Two halachot, and between them a complete computational method: the
 * pre-computed blocks and the instruction to decompose a day count into
 * them. This is also the chapter that establishes the pattern chapters
 * 14 and 16 repeat, so it is worth naming the pattern out loud here.
 *
 * The daily-rate discrepancy (printed 59'8", operative 59'8⅓") is not
 * an aside — it is the clearest evidence in the book that his printed
 * figures are rounded displays of finer working values, which is
 * exactly what KH 11:5-6 warned about. It gets its own section.
 */

export default {
  chapter: 12,
  sourceChapter: 12,
  title: "Where the sun would be, if it behaved",
  hebrewTitle: 'אמצע השמש',
  subtitle:
    'The first real calculation. Two halachot, one method — and a small puzzle in the numbers that tells you a lot about how he works.',

  terms: [
    {
      plain: 'average place',
      formal: 'the mean position',
      hebrew: 'אמצע',
      gloss:
        'Where the sun would be if it never changed speed. Easy to work out, and deliberately not yet the real answer. *Emtza* just means "middle".',
    },
    {
      plain: 'the far point',
      formal: 'the apogee',
      hebrew: 'גובה השמש',
      gloss:
        "The one place on the sun's circle where it is furthest from us. Chapter 13 measures its correction from this point, so you have to know where it is before you can correct anything.",
    },
    {
      plain: 'the chunks',
      formal: 'the period-block tables',
      hebrew: null,
      gloss:
        'How far the sun travels in ten days, a hundred, a thousand, ten thousand — worked out once by him, so that anyone can handle any date with nothing harder than adding up.',
    },
  ],

  recap: {
    settled: [
      'A way to write down any position in the sky — degrees, minutes, seconds.',
      'The arithmetic to add and subtract them, including the borrow-a-circle rule.',
      'The difference between **average** and **true**, and why watching from off-centre creates it.',
      'A date to count days from: the eve of Thursday, 3 Nisan 4938.',
    ],
    thisChapter:
      "Now the tools get used. This chapter answers one question — where would the sun be on a given evening *if* it moved at a perfectly steady speed? That is the **average** position, and it is deliberately not yet the real one.",
    byTheEnd:
      "You'll be able to work out the sun's average position for any date, using nothing harder than addition — and you'll know where its slowly-drifting reference point sits, which chapter 13 needs.",
  },

  sections: [
    {
      id: 'what-average',
      heading: 'Why start with a position you know is wrong',
      source: 'KH 12:1',
      nodeId: 'sun-mean',
      body: [
        'It might seem odd to spend a chapter finding a number you already know is not the answer. But it is the only sensible way in.',
        'The sun\'s real motion is steady motion seen from off-centre. Those are two separate facts, and they are much easier to handle one at a time. So: work out where steady motion alone would put it — that is this chapter — and then correct for the off-centre viewing — that is the next one.',
        'The average position has a name worth knowing, because it comes up constantly: **emtza** (אמצע), literally "middle". You will meet the moon\'s emtza in chapter 14 and it means exactly the same thing there.',
      ],
    },

    {
      id: 'the-rate',
      heading: "The sun's daily speed, and a small puzzle",
      source: 'KH 12:1',
      nodeId: 'sun-mean',
      body: [
        'The sun moves about one degree a day. Precisely, the Rambam says, **59 minutes and 8 seconds** of angle per day — just under a degree, which is why a year is a bit more than 360 days.',
        'Now the puzzle. In the very same halacha he says the sun travels 9° 51\' 23" in ten days. But ten times 59\' 8" is **9° 51\' 20"**. Three seconds adrift, in a single sentence.',
        'Neither number is a slip. The real rate he works with is 59 minutes and 8 **and a third** seconds; the "8" is a rounded display. His ten-day figure gives the missing third away.',
        'This is worth dwelling on for a moment, because it tells you how to read everything that follows. The numbers printed in the text are often tidied versions of finer ones — exactly as he warned in chapter 11. The calculator below tests both candidate rates against every figure he publishes; watch how badly the flat version drifts once the day counts get large.',
      ],
      interactive: 'hidden-third',
    },

    {
      id: 'the-method',
      heading: 'Adding your way to an answer',
      source: 'KH 12:2',
      nodeId: 'sun-mean',
      body: [
        'Here is the method, and it is genuinely clever — it lets someone with no more than addition work out a position centuries into the future.',
        'Rather than multiplying a daily rate by a large number of days, the Rambam pre-computes how far the sun travels in **ten days, a hundred days, a thousand, and ten thousand**, and publishes those four figures. To handle any date you break the day count into those chunks, look each one up, and add.',
        'So 1,234 days is one thousand, two hundreds, three tens, and four single days. Five look-ups and a sum. No multiplication, no long division — which matters enormously when your reader has no calculator and possibly no paper to spare.',
        'Then add where the sun started at the epoch: **7° 3\' 32"**, which is in the 1st sign (Taleh). Throw away any whole circles. That is your answer.',
        'He works one example himself: a hundred days after the starting point. Try it below — it is loaded and ready.',
      ],
      interactive: 'sun-mean',
    },

    {
      id: 'month-and-year-blocks',
      heading: 'The two extra rows, and why they are not a month and a year',
      source: 'KH 12:1',
      nodeId: 'sun-mean',
      body: [
        'Alongside the four round blocks he gives two more, and they cause more confusion than the rest of the chapter put together: **29 days** (28° 35\' 1") and **354 days** (348° 55\' 15"). He calls them the distance travelled "in a month" and "in a year".',
        'Take those labels off. They are nicknames, and they will mislead you in two different ways.',
        '**First: the 29-day block is a block of twenty-nine days.** Not a month. There is no fraction in it and no rounding of a month\'s length — it is simply the daily rate multiplied by 29, and it comes out to his figure exactly. (Multiply 59\' 8⅓" by 29 and you land on his 28° 35\' 1" with about two-thirds of a second to spare, which is the rounding. Use the flat 59\' 8" instead and you come out 9 seconds off — the hidden third showing itself again.)',
        'The fraction is real; it is simply not in the block. A true lunar month is **29 days and about 12¾ hours**, so his 29-day row falls half a day short of one. The fraction lives in the *rate*, which is why the rate carries a third of a second; the *block* is a whole number of days by construction, because whole days are all the method ever handles.',
        '**Second, and this is the useful part: the blocks are never chained.** A previous month\'s value is never needed, because there is no month-to-month running total anywhere in the method. Every calculation goes back to the same fixed evening in 1178 and asks one question: *how many days from then to now?* That single number gets broken into blocks and added up. Nothing carries forward from a previous month, because there is no previous month in the arithmetic.',
        'That also means these two rows are **optional**. Drop them entirely and you can still reach every answer in the book with the four round blocks and single days — 29 days is just two tens and nine singles. Nothing depends on them.',
        'So what are they for? Mostly a **check**. Because they are reachable the ordinary way, his published figure and the one you assemble from the blocks are two independent routes to the same number, and if they disagree you have made a mistake. Handing a reader a spare way to catch their own error is a kindness, and it is the same instinct as publishing the ten-day figure that gives the hidden third away.',
        'And the labels do make sense once you see where they come from — they are **calendar** lengths, not astronomical ones. Twenty-nine days is a short Hebrew month; 354 days is a common Hebrew year, one of the six year lengths from chapter 11. So if you already know "this is one common year on from the date I did last time", you get there in one lookup instead of nine. He is pre-computing the spans his reader would actually be handed.',
        'Which is worth checking against the sky, because one of the two labels is honest and one is not. 354 days really is a lunar year — twelve true lunar months come to 354.37 days, so his row is within nine hours of it. But it is nowhere near a **solar** year of 365¼ days; it is eleven days short, which is exactly the gap the leap month exists to close. And twelve of his 29-day blocks give 348 days, over six days shy of a lunar year. **The blocks do not compose into each other.** Treat each as what it is — a pre-computed number of days — and the trap disappears.',
      ],
    },

    {
      id: 'apogee',
      heading: 'The far point, and why it has to be tracked',
      source: 'KH 12:2',
      nodeId: 'sun-mean',
      body: [
        'One more thing before the chapter is done, and it will not make full sense until the next one — but it belongs here, because this is where he puts it.',
        'The sun\'s circle is off-centre from us, so there is one point on it where the sun is **furthest away**. That point has a name, the **govah** (גובה), and at the epoch it stood 26° 45\' 8" into the 3rd sign (Teomim).',
        'Worth writing that a second way, because both forms are used and mixing them up costs you a whole sign. Counting from the very start of the circle it is **86° 45\' 8"** — the 60 degrees of the first two signs, plus the 26 and a bit into the third. That larger number is the one chapter 13 subtracts.',
        'Why does it matter? Because chapter 13\'s correction depends entirely on how far the sun has travelled *from that point*. It is the origin the correction is measured from — so before you can correct anything, you have to know where it is.',
        'And it moves. Very slowly: about one degree in seventy years, the slowest thing in the entire book.',
        'So does he bother tracking it forward, or just reuse the starting figure? **He tracks it.** When he works the example in chapter 13 he says to take the apogee "at this time", and gives 86° 45\' 23" — the starting figure plus the 15 seconds it has moved in a hundred days.',
        'Which is strictly pointless, and instructively so. The very next sentence of that halacha throws away everything below a whole degree: *"with regard to the course, the minutes are of no consequence."* Work his example both ways — apogee moved, apogee frozen — and the course comes out 18° 52\' 2" against 18° 52\' 17". Both round to 19. The final answer is identical to the second.',
        'He is being careful where care does not yet pay, and that turns out to be the right instinct, because over long spans the drift is real. By now it has crept about **thirteen degrees**, out of the 3rd sign and into the 4th, which moves the sun\'s true position by roughly a sixth of a degree. A method built to be used for centuries has to carry a term that does nothing for the first few.',
        'One caution on a remark you will meet in the margin here. A footnote in the English translation observes that the apogee has moved some twelve degrees since the Mishneh Torah was written and now sits in Sartan. That is accurate — the rate confirms it — but it is **the translator\'s note, not the Rambam\'s**. He gives the rate; the observation about our own sky is a later hand.',
      ],
      interactive: 'sun-apogee',
    },
  ],

  closing: {
    have: [
      "The sun's average position on any date you like, from a day count and four published figures.",
      'The position of the far point (govah) on that same date.',
      'A working sense of why his printed numbers are sometimes rounded versions of the ones he calculates with.',
    ],
    missing: [
      "Where the sun actually is. Everything here is the steady-speed pretence — useful, and not yet true. Chapter 13 takes these two numbers, works out how far apart they are, and looks up the correction that turns one into the other.",
    ],
  },
};
