export const adminKeys = {
  reviews: ['admin', 'reviews'] as const,
  photo: (reviewId: string, kind: 'selfie' | 'id_card') =>
    ['admin', 'reviews', reviewId, kind] as const,
  actions: ['admin', 'actions'] as const,
}
