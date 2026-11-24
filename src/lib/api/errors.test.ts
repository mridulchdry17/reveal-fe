import { describe, expect, it } from 'vitest'

import { toApiError } from './errors'

describe('toApiError', () => {
  it('reads code and detail from a domain error', () => {
    const error = toApiError(429, { code: 'rate_limited', detail: 'Too many tries.' })

    expect(error.status).toBe(429)
    expect(error.code).toBe('rate_limited')
    expect(error.message).toBe('Too many tries.')
  })

  it('maps validation errors to their field names', () => {
    const error = toApiError(422, {
      detail: [
        { loc: ['body', 'enrollment_number'], msg: 'Value error, Enter your enrollment number', type: 'value_error' },
      ],
    })

    expect(error.code).toBe('validation_error')
    expect(error.fieldErrors).toEqual({ enrollment_number: 'Enter your enrollment number' })
  })

  it('keeps the full path of errors inside lists', () => {
    const error = toApiError(422, {
      detail: [
        { loc: ['body', 'cards', 1, 'options', 2], msg: 'String should have at most 40 characters', type: 'x' },
        { loc: ['body', 'cards', 0, 'options'], msg: 'Value error, Give three different options', type: 'x' },
      ],
    })

    expect(error.fieldPaths).toEqual({
      'cards.1.options.2': 'String should have at most 40 characters',
      'cards.0.options': 'Give three different options',
    })
  })

  it('falls back to a generic error for unexpected bodies', () => {
    const error = toApiError(500, 'Internal Server Error')

    expect(error.code).toBe('unknown')
  })
})
