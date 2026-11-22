import { api } from '@/lib/api/client'
import { toApiError } from '@/lib/api/errors'
import type { components } from '@/lib/api/schema'

export type Review = components['schemas']['Review']
export type AdminAction = components['schemas']['AdminActionOut']
export type LetInResult = components['schemas']['LetInResult']
export type AdminReport = components['schemas']['AdminReport']
export type PhotoKind = 'selfie' | 'id_card'

export async function getReviews(): Promise<Review[]> {
  const { data, error, response } = await api.GET('/v1/admin/reviews')
  if (data) return data
  throw toApiError(response.status, error)
}

/** One review photo. Fetched with the session token, so it can't be a plain <img src>. */
export async function getReviewPhoto(reviewId: string, kind: PhotoKind): Promise<Blob> {
  const { data, error, response } = await api.GET('/v1/admin/reviews/{review_id}/photos/{kind}', {
    params: { path: { review_id: reviewId, kind } },
    parseAs: 'blob',
  })
  if (data) return data
  throw toApiError(response.status, error)
}

export async function approveReview(reviewId: string): Promise<void> {
  const { error, response } = await api.POST('/v1/admin/reviews/{review_id}/approve', {
    params: { path: { review_id: reviewId } },
  })
  if (error) throw toApiError(response.status, error)
}

export async function rejectReview({
  reviewId,
  reason,
}: {
  reviewId: string
  reason: string
}): Promise<void> {
  const { error, response } = await api.POST('/v1/admin/reviews/{review_id}/reject', {
    params: { path: { review_id: reviewId } },
    body: { reason },
  })
  if (error) throw toApiError(response.status, error)
}

export async function letIn(body: { email: string; note?: string }): Promise<LetInResult> {
  const { data, error, response } = await api.POST('/v1/admin/let-in', { body })
  if (data) return data
  throw toApiError(response.status, error)
}

export async function getActions(): Promise<AdminAction[]> {
  const { data, error, response } = await api.GET('/v1/admin/actions')
  if (data) return data
  throw toApiError(response.status, error)
}

export async function getReports(): Promise<AdminReport[]> {
  const { data, error, response } = await api.GET('/v1/admin/reports')
  if (data) return data
  throw toApiError(response.status, error)
}
