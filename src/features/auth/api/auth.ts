import { api } from '@/lib/api/client'
import { toApiError } from '@/lib/api/errors'
import type { components } from '@/lib/api/schema'

export type Me = components['schemas']['Me']
export type SignInResult = components['schemas']['SignInResponse']

/** Exchange a Google credential for a Reveal session. Throws ApiError. */
export async function signInWithGoogle(credential: string): Promise<SignInResult> {
  const { data, error, response } = await api.POST('/v1/auth/google', { body: { credential } })
  if (data) return data
  throw toApiError(response.status, error)
}

/** The signed-in account. Throws ApiError (401 when the session is gone). */
export async function getMe(): Promise<Me> {
  const { data, error, response } = await api.GET('/v1/auth/me')
  if (data) return data
  throw toApiError(response.status, error)
}

export async function signOut(): Promise<void> {
  const { error, response } = await api.POST('/v1/auth/sign-out')
  // Already signed out on the server is fine.
  if (error && response.status !== 401) throw toApiError(response.status, error)
}
