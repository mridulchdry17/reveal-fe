import { describe, expect, it } from 'vitest'

import { autoTheme, resolveTheme } from './theme'

// IST is UTC+05:30, so 21:00 IST is 15:30 UTC and 08:00 IST is 02:30 UTC.
const utc = (h: number, m: number) => new Date(Date.UTC(2026, 10, 20, h, m))

describe('autoTheme', () => {
  it('is paper during the day in IST', () => {
    expect(autoTheme(utc(9, 0))).toBe('paper') // 14:30 IST
  })

  it('switches to ink exactly at 21:00 IST', () => {
    expect(autoTheme(utc(15, 29))).toBe('paper') // 20:59 IST
    expect(autoTheme(utc(15, 30))).toBe('ink') // 21:00 IST
  })

  it('switches back to paper at 08:00 IST', () => {
    expect(autoTheme(utc(2, 29))).toBe('ink') // 07:59 IST
    expect(autoTheme(utc(2, 30))).toBe('paper') // 08:00 IST
  })
})

describe('resolveTheme', () => {
  it('respects an explicit preference over the clock', () => {
    expect(resolveTheme('paper', utc(18, 0))).toBe('paper')
    expect(resolveTheme('ink', utc(9, 0))).toBe('ink')
  })
})
