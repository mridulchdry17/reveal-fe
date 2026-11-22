import { Navigate, type RouteObject } from 'react-router'

import { AdminScreen } from '@/features/admin/components/AdminScreen'
import { AccountSection } from '@/features/auth/components/AccountSection'
import { SignInScreen } from '@/features/auth/components/SignInScreen'
import { IdCardScreen } from '@/features/auth/components/IdCardScreen'
import { PendingScreen } from '@/features/auth/components/PendingScreen'
import { VerifyScreen } from '@/features/auth/components/VerifyScreen'
import { ProfileSetupScreen } from '@/features/profile/components/ProfileSetupScreen'
import { ProfileSummary } from '@/features/profile/components/ProfileSummary'
import { ChatsScreen } from '@/features/chats/components/ChatsScreen'
import { YouScreen } from '@/features/settings/components/YouScreen'
import { TonightScreen } from '@/features/tonight/components/TonightScreen'
import { WaitlistScreen } from '@/features/waitlist/components/WaitlistScreen'

import { AppShell } from './AppShell'
import { RequireAdmin } from './RequireAdmin'
import { RequireAuth } from './RequireAuth'
import { RequireProfile } from './RequireProfile'
import { RequireVerified } from './RequireVerified'

// Before launch, `/` is the public waitlist and the app lives under `/app`.
// At launch, `/` becomes the sign-in/landing page; the `/app` paths stay the same.
export const routes: RouteObject[] = [
  { path: '/', element: <WaitlistScreen /> },
  { path: '/sign-in', element: <SignInScreen /> },
  {
    path: '/verify',
    element: <RequireAuth />,
    children: [
      { index: true, element: <VerifyScreen /> },
      { path: 'id-card', element: <IdCardScreen /> },
      { path: 'pending', element: <PendingScreen /> },
    ],
  },
  {
    path: '/admin',
    element: <RequireAuth />,
    children: [{ element: <RequireAdmin />, children: [{ index: true, element: <AdminScreen /> }] }],
  },
  {
    path: '/profile/setup',
    element: <RequireAuth />,
    children: [
      {
        element: <RequireVerified />,
        children: [
          { index: true, element: <ProfileSetupScreen /> },
          { path: ':step', element: <ProfileSetupScreen /> },
        ],
      },
    ],
  },
  {
    path: '/app',
    element: <RequireAuth />,
    children: [
      {
        element: <RequireVerified />,
        children: [
          {
            element: <RequireProfile />,
            children: [
              {
                element: <AppShell />,
                children: [
                  { index: true, element: <Navigate to="tonight" replace /> },
                  { path: 'tonight', element: <TonightScreen /> },
                  { path: 'chats', element: <ChatsScreen /> },
                  { path: 'you', element: <YouScreen account={<AccountSection />} profile={<ProfileSummary />} /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]
