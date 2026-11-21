import { api } from '@/lib/api/client'
import { toApiError } from '@/lib/api/errors'
import type { components } from '@/lib/api/schema'

export type VerificationStatus = components['schemas']['VerificationStatus']
type IdCardBody = components['schemas']['Body_submit_id_card_v1_verification_id_card_post']

/** Where the signed-in user's ID card check is. Throws ApiError. */
export async function getVerificationStatus(): Promise<VerificationStatus> {
  const { data, error, response } = await api.GET('/v1/verification/me')
  if (data) return data
  throw toApiError(response.status, error)
}

/** Send the ID card photo and selfie for review. Throws ApiError. */
export async function submitIdCard(photos: {
  selfie: Blob
  idCard: Blob
}): Promise<VerificationStatus> {
  const form = new FormData()
  form.append('selfie', photos.selfie, 'selfie.jpg')
  form.append('id_card', photos.idCard, 'id-card.jpg')
  const { data, error, response } = await api.POST('/v1/verification/id-card', {
    // The schema types file fields as strings; what's actually sent is this FormData.
    body: form as unknown as IdCardBody,
    bodySerializer: (body) => body as unknown as FormData,
  })
  if (data) return data
  throw toApiError(response.status, error)
}
