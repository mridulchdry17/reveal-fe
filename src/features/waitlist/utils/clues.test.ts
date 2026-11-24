import { describe, expect, it } from 'vitest'

import { blurFor, demoClues } from './clues'

describe('blurFor', () => {
  it('sharpens with every right guess but never shows the face clearly', () => {
    const blurs = [0, 1, 2, 3].map(blurFor)
    expect(blurs).toEqual([...blurs].sort((a, b) => b - a))
    expect(blurFor(demoClues.length)).toBeGreaterThanOrEqual(10)
  })
})
