import { useState } from 'react'

import { blurFor, type Clue } from '../utils/clues'

/** The hero's three-clue guessing game. Pure UI state, nothing is sent anywhere. */
export function useGuessGame(clues: readonly [Clue, ...Clue[]]) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [results, setResults] = useState<boolean[]>([])

  const done = index >= clues.length
  const clue = clues[Math.min(index, clues.length - 1)] ?? clues[0]
  const right = results.filter(Boolean).length

  function guess(option: number) {
    if (picked !== null || done) return
    setPicked(option)
    setResults((previous) => [...previous, option === clue.answer])
  }

  function next() {
    setIndex((value) => value + 1)
    setPicked(null)
  }

  function restart() {
    setIndex(0)
    setPicked(null)
    setResults([])
  }

  return {
    clue,
    index,
    picked,
    results,
    done,
    right,
    answered: picked !== null,
    correct: picked !== null && picked === clue.answer,
    isLast: index === clues.length - 1,
    blur: blurFor(right),
    guess,
    next,
    restart,
  }
}
