import { describe, expect, it } from 'vitest'

import { likeTime } from './likeTime'

describe('likeTime', () => {
  const now = new Date('2026-11-25T23:00:00')

  it('shows the time for a like from today', () => {
    expect(likeTime('2026-11-25T21:14:00', now)).toBe('9:14 PM')
  })

  it('shows the weekday within the week and the date after', () => {
    expect(likeTime('2026-11-23T21:14:00', now)).toBe('Mon')
    expect(likeTime('2026-11-10T21:14:00', now)).toBe('10 Nov')
  })
})
