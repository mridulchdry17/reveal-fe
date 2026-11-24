import { describe, expect, it } from 'vitest'

import { countdown, dropDay } from './countdown'

describe('countdown', () => {
  it('splits the time left into two-digit parts', () => {
    const now = new Date('2026-11-24T18:45:23')
    expect(countdown('2026-11-24T21:00:00', now)).toEqual({
      hours: '02',
      minutes: '14',
      seconds: '37',
    })
  })

  it('stops at zero once the drop is here', () => {
    expect(countdown('2026-11-24T21:00:00', new Date('2026-11-24T21:00:05'))).toEqual({
      hours: '00',
      minutes: '00',
      seconds: '00',
    })
  })
})

describe('dropDay', () => {
  it('says tonight for a drop later today and tomorrow after it', () => {
    expect(dropDay('2026-11-24T21:00:00', new Date('2026-11-24T10:00:00'))).toEqual({
      day: 'Tonight',
      time: '9',
    })
    expect(dropDay('2026-11-25T21:00:00', new Date('2026-11-24T22:00:00'))).toEqual({
      day: 'Tomorrow',
      time: '9',
    })
  })

  it('keeps minutes when the drop is not on the hour', () => {
    expect(dropDay('2026-11-24T21:30:00', new Date('2026-11-24T10:00:00')).time).toBe('9:30')
  })
})
