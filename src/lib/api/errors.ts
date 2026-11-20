import { z } from 'zod'

/**
 * Every failed API call becomes one of these. Features branch on `code`
 * (from the backend's ErrorResponse) and show `fieldErrors` next to inputs.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldErrors: Record<string, string>

  constructor(status: number, code: string, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

const domainErrorBody = z.object({ code: z.string(), detail: z.string() })

const validationErrorBody = z.object({
  detail: z.array(z.object({ loc: z.array(z.union([z.string(), z.number()])), msg: z.string() })),
})

/** Pydantic prefixes messages from our own validators with "Value error, ". */
function cleanMessage(message: string): string {
  return message.replace(/^Value error, /, '')
}

export function toApiError(status: number, body: unknown): ApiError {
  const domain = domainErrorBody.safeParse(body)
  if (domain.success) {
    return new ApiError(status, domain.data.code, domain.data.detail)
  }

  const validation = validationErrorBody.safeParse(body)
  if (validation.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of validation.data.detail) {
      const field = issue.loc.at(-1)
      if (typeof field === 'string' && !(field in fieldErrors)) {
        fieldErrors[field] = cleanMessage(issue.msg)
      }
    }
    return new ApiError(status, 'validation_error', 'Check the highlighted fields.', fieldErrors)
  }

  return new ApiError(status, 'unknown', 'Something went wrong.')
}
