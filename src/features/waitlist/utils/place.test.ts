import { describe, expect, it } from 'vitest'

import { describePlace } from './place'

describe('describePlace', () => {
  it('calls the first 50 founding members, without a number', () => {
    expect(describePlace(1)).toEqual({ kind: 'founding' })
    expect(describePlace(50)).toEqual({ kind: 'founding' })
  })

  it('shows the real number from 51 on, Indian-formatted', () => {
    expect(describePlace(51)).toEqual({ kind: 'numbered', number: '51' })
    expect(describePlace(123456)).toEqual({ kind: 'numbered', number: '1,23,456' })
  })
})
