import createClient from 'openapi-fetch'

import { env } from '@/config/env'

import type { paths } from './schema'

/** Typed client generated from the backend's OpenAPI schema (`pnpm gen:api`). */
export const api = createClient<paths>({
  baseUrl: env.VITE_API_URL,
  credentials: 'include',
  // Look up fetch per call so test mocks (MSW) installed after import still apply.
  fetch: (request) => globalThis.fetch(request),
})
