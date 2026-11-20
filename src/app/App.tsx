import { QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { RouterProvider } from 'react-router'

import { useTheme } from '@/hooks/useTheme'
import { createQueryClient } from '@/lib/queryClient'

import { router } from './router'

export function App() {
  const [queryClient] = useState(createQueryClient)
  useTheme()

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
