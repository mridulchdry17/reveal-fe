import { describe, expect, it } from 'vitest'

import { guessStat } from './myCards'

describe('guessStat', () => {
  it('rounds the share of right guesses', () => {
    expect(guessStat({ guessed_count: 18, right_count: 11 })).toBe('61% guess right')
    expect(guessStat({ guessed_count: 3, right_count: 0 })).toBe('0% guess right')
  })

  it('says nobody has guessed yet instead of 0%', () => {
    expect(guessStat({ guessed_count: 0, right_count: 0 })).toBe('No guesses yet')
  })
})
