import { describe, expect, it } from 'vitest'

import { toApiError } from './errors'

describe('toApiError', () => {
  it('reads code and detail from a domain error', () => {
    const error = toApiError(409, { code: 'already_registered', detail: 'Already on the list.' })

    expect(error.status).toBe(409)
    expect(error.code).toBe('already_registered')
    expect(error.message).toBe('Already on the list.')
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

  it('falls back to a generic error for unexpected bodies', () => {
    const error = toApiError(500, 'Internal Server Error')

    expect(error.code).toBe('unknown')
  })
})
