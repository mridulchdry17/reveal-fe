export const chatKeys = {
  list: ['chats'] as const,
  thread: (matchId: string) => ['chats', matchId] as const,
}
