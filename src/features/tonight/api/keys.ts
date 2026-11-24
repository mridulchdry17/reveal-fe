export const tonightKeys = {
  drop: ['drops', 'tonight'] as const,
  likes: ['likes'] as const,
  // Right guesses in the key: each one makes the photo clearer, so it's fetched again.
  dropPhoto: (itemId: string, rightGuesses: number) => ['drop-photo', itemId, rightGuesses] as const,
  likePhoto: (likeId: string, rightGuesses: number) => ['like-photo', likeId, rightGuesses] as const,
}
