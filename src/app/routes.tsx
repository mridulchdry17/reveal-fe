import { Navigate, type RouteObject } from 'react-router'

import { ChatsScreen } from '@/features/chats/components/ChatsScreen'
import { YouScreen } from '@/features/settings/components/YouScreen'
import { TonightScreen } from '@/features/tonight/components/TonightScreen'
import { WaitlistScreen } from '@/features/waitlist/components/WaitlistScreen'

import { AppShell } from './AppShell'

// Before launch, `/` is the public waitlist and the app lives under `/app`.
// At launch, `/` becomes the sign-in/landing page; the `/app` paths stay the same.
export const routes: RouteObject[] = [
  { path: '/', element: <WaitlistScreen /> },
  {
    path: '/app',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="tonight" replace /> },
      { path: 'tonight', element: <TonightScreen /> },
      { path: 'chats', element: <ChatsScreen /> },
      { path: 'you', element: <YouScreen /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]
