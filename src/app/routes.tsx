import { Navigate, type RouteObject } from 'react-router'

import { AccountSection } from '@/features/auth/components/AccountSection'
import { SignInScreen } from '@/features/auth/components/SignInScreen'
import { VerifyScreen } from '@/features/auth/components/VerifyScreen'
import { ChatsScreen } from '@/features/chats/components/ChatsScreen'
import { YouScreen } from '@/features/settings/components/YouScreen'
import { TonightScreen } from '@/features/tonight/components/TonightScreen'
import { WaitlistScreen } from '@/features/waitlist/components/WaitlistScreen'

import { AppShell } from './AppShell'
import { RequireAuth } from './RequireAuth'
import { RequireVerified } from './RequireVerified'

// Before launch, `/` is the public waitlist and the app lives under `/app`.
// At launch, `/` becomes the sign-in/landing page; the `/app` paths stay the same.
export const routes: RouteObject[] = [
  { path: '/', element: <WaitlistScreen /> },
  { path: '/sign-in', element: <SignInScreen /> },
  {
    path: '/verify',
    element: <RequireAuth />,
    children: [{ index: true, element: <VerifyScreen /> }],
  },
  {
    path: '/app',
    element: <RequireAuth />,
    children: [
      {
        element: <RequireVerified />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, element: <Navigate to="tonight" replace /> },
              { path: 'tonight', element: <TonightScreen /> },
              { path: 'chats', element: <ChatsScreen /> },
              { path: 'you', element: <YouScreen account={<AccountSection />} /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]
