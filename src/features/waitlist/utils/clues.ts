export type Clue = {
  kind: string
  question: string
  options: [string, string, string]
  /** Index of the true answer. */
  answer: number
}

/** The demo profile visitors guess on the waitlist hero. */
export const demoClues: [Clue, ...Clue[]] = [
  {
    kind: 'Everyday choice',
    question: 'Free hour between lectures. Where do I disappear to?',
    options: ["The library's back corner", 'The canteen chai stall', 'The lawns, headphones on'],
    answer: 1,
  },
  {
    kind: 'Hot take',
    question: 'Most overrated thing on campus?',
    options: ['Fest DJ night', 'Maggi at 2am', 'Front-row seats'],
    answer: 0,
  },
  {
    kind: 'Little thing',
    question: 'Song I play way too much?',
    options: ['Something sad and Hindi', 'Old Bollywood', 'Lo-fi, always'],
    answer: 0,
  },
]

const START_BLUR = 34
const STEP = 8

/** Each right guess sharpens the face, but never fully: on Reveal the photo opens only when both say yes. */
export function blurFor(rightGuesses: number): number {
  return START_BLUR - rightGuesses * STEP
}
