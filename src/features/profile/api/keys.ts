export const profileKeys = {
  options: ['profile', 'options'] as const,
  mine: ['profile', 'me'] as const,
  photo: ['profile', 'me', 'photo'] as const,
  voice: ['profile', 'me', 'voice'] as const,
}
