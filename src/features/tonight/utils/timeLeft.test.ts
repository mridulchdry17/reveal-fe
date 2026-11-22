import { describe, expect, it } from 'vitest'

import { timeLeft } from './timeLeft'

describe('timeLeft', () => {
  const now = new Date('2026-11-22T16:30:00Z')

  it('shows hours and minutes', () => {
    expect(timeLeft('2026-11-23T12:44:00Z', now)).toBe('20h 14m')
  })

  it('shows only minutes under an hour, rounding up', () => {
    expect(timeLeft('2026-11-22T16:44:30Z', now)).toBe('15m')
  })

  it('never says zero', () => {
    expect(timeLeft('2026-11-22T16:00:00Z', now)).toBe('1m')
  })
})
