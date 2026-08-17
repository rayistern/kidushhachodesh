/**
 * Chapter 11 of the plain-language book — the ground rules.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **editorial** — NOT the Rambam, NOT a translation.
 *  SURFACE CATEGORY: teaching commentary
 * ═══════════════════════════════════════════════════════════════════
 *
 * The first chapter of the book, and the one that has to earn the
 * reader's patience: KH 11 teaches no astronomy at all, only the
 * vocabulary and the arithmetic everything later is written in.
 *
 * The framing that makes it worth reading rather than skimming is
 * KH 11:5-6 — the Rambam warns *in advance* that his method contains
 * deliberate approximations, and says why. A reader who has that in
 * hand meets every later rounding as a decision rather than a defect,
 * which matters a great deal by chapter 13.
 */

export default {
  chapter: 11,
  sourceChapter: 11,
  title: 'The ground rules',
  hebrewTitle: 'יסודות חשבון התקופות',
  subtitle:
    'No astronomy yet — this chapter hands you the measuring system, the arithmetic, one big idea, and a date to count from.',

  recap: {
    settled: [
      'The month began when two witnesses saw the new moon and the court accepted them.',
      'The court needed to know **in advance** whether the moon could be seen that night, so it could tell an honest mistake from a false witness.',
    ],
    thisChapter:
      "Everything up to here has been about people: witnesses, judges, testimony. From this chapter on it is about the sky. The Rambam is about to hand over a method for working out, months ahead, whether the moon will be visible on a given evening — and this chapter lays out the tools before any of it starts.",
    byTheEnd:
      'You will be able to read a position in the sky, add and subtract in the units he uses, and you will know the single idea the whole rest of the book turns on.',
  },

  sections: [
    {
      id: 'why-bother',
      heading: 'Why there is suddenly arithmetic',
      source: 'KH 11:1',
      nodeId: 'days',
      body: [
        'The court sanctified the month on the evidence of witnesses who had seen the new moon. But they did not simply take their word for it. They worked out beforehand whether the moon *could* have been seen — and if the calculation said no, testimony that said yes was rejected.',
        'So this was never idle astronomy. It was how a court checked its witnesses. That is why the Rambam thinks it is worth eight chapters of careful method, and why he says at the start of this one that anyone with a proper mind will want to know how it is done.',
      ],
    },

    {
      id: 'approximations',
      heading: 'He tells you in advance that he is approximating',
      source: 'KH 11:5',
      nodeId: 'days',
      body: [
        'Before any of the method arrives, the Rambam does something unusual. He warns you that a knowledgeable reader will spot places where his numbers are not exact — and asks you not to assume he failed to notice.',
        'His reason is precise: where being more exact could not change *whether the moon is seen*, he does not bother. The question has a yes-or-no answer, and chasing a fraction of a minute that cannot flip it is wasted effort.',
        'Hold on to this. It explains a great deal that would otherwise look sloppy — rounded tables, discarded seconds, a rule that says "if it is less than thirty, drop it". None of that is carelessness. It is a stated policy, announced here, before you had a reason to doubt him.',
      ],
    },

    {
      id: 'measuring',
      heading: 'How positions in the sky are written down',
      source: 'KH 11:7',
      nodeId: 'days',
      body: [
        'Everything from here on is an angle. Not a distance, not a height — an angle around a circle.',
        'Imagine the band of sky the sun and moon travel along, bent round into a full circle. That circle is divided into **360 degrees**, and into **twelve signs of 30 degrees each**, starting from the first of them, Taleh.',
        'Each degree splits into 60 minutes, each minute into 60 seconds. Not minutes and seconds of *time* — of angle. They are small: a minute of angle is about the width of a coin seen across a room.',
        'So "104 degrees, 59 minutes, 25 seconds" is a place on that circle. Count 104 and a bit degrees round from the start of Taleh and you are there. Try it below — it will also tell you which sign you have landed in.',
      ],
      interactive: 'zodiac-position',
    },

    {
      id: 'how-big',
      heading: 'How big is a degree?',
      source: 'KH 11:7',
      nodeId: 'days',
      body: [
        'Short, and it will pay for itself in every chapter after this one.',
        'The numbers ahead are all angles, and an angle you cannot picture is just a digit on a page. So before going any further, get a physical sense of the sizes. The only tool needed is your own hand.',
        'Hold your arm straight out and look past it. Your **little finger** covers about **one degree** of sky. Your **closed fist**, knuckles across, about **ten**. A **spread hand**, thumb-tip to little-finger-tip, about **twenty**. From the horizon to **straight overhead** is **ninety** — a quarter of the whole circle.',
        'And for scale at the small end: the **full moon itself is only half a degree wide**. So one degree is two moons side by side, and a fist is twenty of them.',
        'The trick works for almost anybody without measuring anything, because a bigger hand tends to sit on the end of a longer arm.',
        'Keep these. They turn the rest of the book from arithmetic into something you can picture. When chapter 17 says the moon must be more than nine degrees from the sun to be seen at all, it is saying **about one fist**. When it says more than fifteen is certain, that is a fist and a half. The whole question turns on distances you could measure with your hand at arm\'s length.',
      ],
      interactive: 'degree-scale',
    },

    {
      id: 'why-name-them',
      heading: 'Why bother naming the twelve?',
      source: 'KH 11:9',
      nodeId: 'days',
      body: [
        'A fair question, since a position is already a number. Why say "Sartan, fifteen degrees in" when you could just say 105 degrees?',
        'Notice first that he does **both**. When he finishes the worked calculation in chapter 13 he gives the answer as 104° 59\' 25" *and* as "fifteen degrees less 35 seconds in Sartan". The sign is not a replacement for the number. It is the number said a second way.',
        'And there is a hard reason, which does not show up until chapter 17. Several of the corrections there are **looked up by sign** — not by degree. Each of the twelve carries its own value, running from about 34 minutes at the lowest to a full degree at the highest. So you cannot finish the calculation without knowing which sign the moon is in. It is an input, not a label.',
        'Why would a correction care about the sign? Because the sign quietly carries something a bare number does not: **the angle at which that stretch of sky meets the horizon**. The signs do not set upright — some slant north, some south. A moon the same distance from the sun will sit at a different angle above the horizon depending which part of the belt is going down, and that changes whether a thin crescent clears the glow. The sign is shorthand for a fact about the local sky.',
        'Three plainer reasons on top of that. A sign can be **checked against the sky** — nobody can eyeball "104 degrees", but you can go outside and look at Sartan. It **catches mistakes**: slip thirty degrees in your addition and you land in the wrong sign, which is glaring, where a wrong number looks like any other number. And it was **the language everyone already spoke** — witnesses and judges talked in constellations, so the arithmetic had to come back out in words the court used.',
        'As for the names themselves — Taleh, Shor, Teomim — they are handles and not much more. What you actually need is the order, and that each one is thirty degrees wide. The Rambam all but says so: he notes that the stars have shifted since these were named, so the pictures no longer really fit. Do not spend effort on the imagery. Learn the order.',
        'One small warning about the familiar English names, since they can mislead. They came into English through Greek and Latin, and they are not translations of the Hebrew. **Taleh is a lamb**; Aries is a ram — a different animal, and Hebrew has its own word for a ram (*ayil*). The Latin names sit alongside the Hebrew ones rather than rendering them, which is one more reason to hold the twelve as an ordered list of thirty-degree boxes and not as a menagerie.',
      ],
    },

    {
      id: 'arithmetic',
      heading: 'Adding and subtracting in sixties',
      source: 'KH 11:10',
      nodeId: 'days',
      body: [
        'Because minutes and seconds run in sixties rather than tens, adding two positions takes a little care — sixty seconds become a minute, sixty minutes become a degree, and a full 360 degrees is a whole lap and gets thrown away.',
        'Subtraction has one extra rule that catches everyone. If you are taking a bigger angle from a smaller one, you first **add a whole circle** to the smaller one. That sounds like cheating, but a circle is a lap: adding one changes nothing about where you are pointing, and it makes the sum possible.',
        'The Rambam works one example by hand, and the calculator below is set to it. You do not need to be fast at this — but you should be able to follow it, because every chapter from here on is made of these two operations and nothing harder.',
      ],
      interactive: 'sexagesimal',
    },

    {
      id: 'mean-vs-true',
      heading: 'The one big idea',
      source: 'KH 11:13',
      nodeId: 'sun-mean',
      body: [
        'Here is the idea the whole rest of the book is built on. If you understand only one thing from this chapter, make it this.',
        'The sun and the moon each move at a **perfectly steady speed**. They do not speed up or slow down. But their circles are **not centred on us** — we are off to one side.',
        'And that changes everything about what you see. Something moving steadily around a circle, watched from off-centre, *appears* to hurry when it is near you and dawdle when it is far. Its real motion is even; its apparent motion is not.',
        'So there are two different answers to "where is the sun":',
        '**The average position** (אמצע) — where it would be if the steady speed were the whole story. Easy to work out: speed times days.',
        '**The true position** (אמיתי) — where you would actually see it. Harder, and always the average with a correction applied.',
        'Every remaining chapter is one of those two jobs. Chapter 12 finds the sun\'s average; chapter 13 corrects it. Chapter 14 finds the moon\'s average; chapter 15 corrects it. Same shape, twice.',
        'The picture below is worth a minute of your time. Drag the slider and watch the two directions pull apart and come back together.',
      ],
      interactive: 'mean-vs-true',
    },

    {
      id: 'starting-point',
      heading: 'A date to count from',
      source: 'KH 11:16',
      nodeId: 'days',
      body: [
        'The tables in the coming chapters all say how far something moves in a given number of days. To turn that into a position, you need to know where it started — so the Rambam fixes one particular evening as the origin of the whole system.',
        'That evening is the eve of Thursday, 3 Nisan 4938 — the spring of 1178, when he was writing. Every calculation in the book begins by asking: **how many days from that evening to the one I care about?**',
        'It is a whole number of days, always. Not hours, not fractions.',
      ],
      interactive: 'epoch-counter',
    },

    {
      id: 'where',
      heading: 'And a place to stand',
      source: 'KH 11:17',
      nodeId: 'days',
      body: [
        'One last thing before the method starts. Whether a thin new moon can be spotted depends on where you are standing — the angle the sun and moon sink below the horizon differs with latitude.',
        'So the Rambam says plainly who these calculations are for: Jerusalem, and the country within six or seven days\' travel of it. Roughly 29 to 35 degrees north.',
        'This matters later. The visibility rules in chapters 17 to 19 are tuned to that band of the world. They are not a general test that works anywhere on earth, and he does not claim they are.',
      ],
      interactive: 'jerusalem',
    },
  ],

  closing: {
    have: [
      'A way to write down any position in the sky, and to find which sign it falls in.',
      'The arithmetic of degrees, minutes and seconds — including the borrow-a-circle rule.',
      '**The big idea**: steady motion, watched from off-centre, looks uneven. Average is not the same as true.',
      'A starting date to count days from, and a part of the world the answers are for.',
    ],
    missing: [
      'Any actual position of anything. Nothing has been calculated yet — this chapter was the toolkit. Chapter 12 picks up the tools and finds the sun\'s average position for a day of your choosing.',
    ],
  },
};
