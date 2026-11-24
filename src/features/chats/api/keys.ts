export const chatKeys = {
  list: ['chats'] as const,
  thread: (matchId: string) => ['chats', matchId] as const,
  // Pieces in the key: a new piece opening fetches the photo again.
  photo: (matchId: string, pieces: number[]) => ['chats', matchId, 'photo', pieces.join(',')] as const,
  voice: (matchId: string) => ['chats', matchId, 'voice'] as const,
}
