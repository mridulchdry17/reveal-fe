import { api } from '@/lib/api/client'

export const healthKeys = {
  all: ['health'] as const,
}

export async function getHealth() {
  const { data, error } = await api.GET('/health')
  // A 503 still carries a HealthResponse body ("degraded"), so both branches return one.
  // Network failures throw, which TanStack Query reports as an error (offline).
  return data ?? error
}
