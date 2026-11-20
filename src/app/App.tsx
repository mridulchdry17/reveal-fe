import { QueryClientProvider } from '@tanstack/react-query'
import { Analytics } from '@vercel/analytics/react'
import { useState } from 'react'
import { RouterProvider } from 'react-router'

import { createQueryClient } from '@/lib/queryClient'

import { router } from './router'

export function App() {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {/* Vercel Web Analytics: cookieless page views; inactive outside Vercel deployments. */}
      <Analytics />
    </QueryClientProvider>
  )
}
