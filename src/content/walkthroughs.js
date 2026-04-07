/**
 * Guided walkthroughs (D4). Each walkthrough is an array of steps the
 * GuidedWalkthrough component runs sequentially, animating the scene
 * and the calculation panel. Steps are pure data — add more without
 * touching component code.
 */
export const WALKTHROUGHS = {
  'moon-tonight': {
    title: 'Why is the moon there tonight?',
    hebrewTitle: 'מדוע הירח שם הלילה?',
    steps: [
      {
        text: 'Start with the mean sun — the Rambam\'s first anchor. Its position is a simple linear advance from the epoch (3 Nisan 4938).',
        stepId: 'sunMeanLongitude',
        cameraPreset: 'sun',
      },
      {
        text: 'Apply the maslul correction. The red eccentric galgal tugs the true sun off the mean position by up to ~2°.',
        stepId: 'sunMaslulCorrection',
        cameraPreset: 'sun',
      },
      {
        text: 'Now the moon\'s mean position — averaged motion of the outermost blue galgal.',
        stepId: 'moonMeanLongitude',
        cameraPreset: 'moon',
      },
      {
        text: 'The double elongation measures how far the moon has pulled past the sun since the last molad — it drives the moon maslul correction.',
        stepId: 'doubleElongation',
        cameraPreset: 'moon',
      },
      {
        text: 'The maslul hanachon (corrected course) is the moon\'s anomaly after the double-elongation adjustment.',
        stepId: 'maslulHanachon',
        cameraPreset: 'moon',
      },
      {
        text: 'Combining every galgal gives the moon\'s true longitude — where it actually appears tonight against the mazalot.',
        stepId: 'moonTrueLongitude',
        cameraPreset: 'moon',
      },
      {
        text: 'Finally, the elongation (moon − sun) plus the latitude tells Beis Din whether the new moon can be sighted at sunset.',
        stepId: 'moonVisibility',
        cameraPreset: 'overview',
      },
    ],
  },
};
