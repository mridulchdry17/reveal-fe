import createClient from 'openapi-fetch'

import { env } from '@/config/env'
import { getToken } from '@/lib/auth/token'

import type { paths } from './schema'

/** Typed client generated from the backend's OpenAPI schema (`pnpm gen:api`). */
export const api = createClient<paths>({
  baseUrl: env.VITE_API_URL,
  credentials: 'include',
  // Look up fetch per call so test mocks (MSW) installed after import still apply.
  fetch: (request) => globalThis.fetch(request),
})

// Signed-in requests carry the session token. Endpoints that don't need it ignore it.
api.use({
  onRequest({ request }) {
    const token = getToken()
    if (token) request.headers.set('Authorization', `Bearer ${token}`)
    return request
  },
})
