import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { env } from '@/config/env'

/**
 * Shared MSW server. Tests add handlers with `server.use(...)`.
 * The tab bar's Likes badge asks for likes on every app screen, so by default no one is waiting;
 * `mockLikes()` overrides it.
 */
export const server = setupServer(http.get(`${env.VITE_API_URL}/v1/likes`, () => HttpResponse.json([])))
