import { Navigate, type RouteObject } from 'react-router'

import { AdminScreen } from '@/features/admin/components/AdminScreen'
import { AccountSection } from '@/features/auth/components/AccountSection'
import { SignInScreen } from '@/features/auth/components/SignInScreen'
import { IdCardScreen } from '@/features/auth/components/IdCardScreen'
import { PendingScreen } from '@/features/auth/components/PendingScreen'
import { VerifyScreen } from '@/features/auth/components/VerifyScreen'
import { ContactSection } from '@/features/profile/components/ContactSection'
import { GuessCardsSection } from '@/features/profile/components/GuessCardsSection'
import { VoiceSection } from '@/features/profile/components/VoiceSection'
import { PhotoSection } from '@/features/profile/components/PhotoSection'
import { ProfileSetupScreen } from '@/features/profile/components/ProfileSetupScreen'
import { ProfileSummary } from '@/features/profile/components/ProfileSummary'
import { ChatScreen } from '@/features/chats/components/ChatScreen'
import { ChatsScreen } from '@/features/chats/components/ChatsScreen'
import { GuessCards, type GuessCardsProps } from '@/features/guess/components/GuessCards'
import { HideListScreen } from '@/features/hide/components/HideListScreen'
import { HideSection } from '@/features/hide/components/HideSection'
import { DropReminder } from '@/features/notifications/components/DropReminder'
import { NotificationsCard } from '@/features/notifications/components/NotificationsCard'
import { YouScreen } from '@/features/settings/components/YouScreen'
import { LikesBanner } from '@/features/tonight/components/LikesBanner'
import { LikesScreen } from '@/features/tonight/components/LikesScreen'
import { TonightScreen } from '@/features/tonight/components/TonightScreen'
import { WaitlistScreen } from '@/features/waitlist/components/WaitlistScreen'

import { AppShell } from './AppShell'
import { RequireAdmin } from './RequireAdmin'
import { RequireAuth } from './RequireAuth'
import { RequireProfile } from './RequireProfile'
import { RequireVerified } from './RequireVerified'

// Their guess cards go into the drop, likes and chat; each screen says what a right guess earns.
const guessCards = (props: GuessCardsProps) => <GuessCards {...props} />

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
              // A chat fills the screen: no tab bar under the message box.
              { path: 'chats/:matchId', element: <ChatScreen guess={guessCards} /> },
              {
                element: <AppShell />,
                children: [
                  { index: true, element: <Navigate to="tonight" replace /> },
                  { path: 'tonight', element: <TonightScreen guess={guessCards} reminder={<DropReminder />} /> },
                  { path: 'chats', element: <ChatsScreen likes={<LikesBanner />} /> },
                  { path: 'likes', element: <LikesScreen guess={guessCards} /> },
                  {
                    path: 'you',
                    element: (
                      <YouScreen
                        account={<AccountSection />}
                        privacy={
                          <>
                            <NotificationsCard />
                            <HideSection />
                          </>
                        }
                        profile={
                          <div className="flex flex-col gap-3">
                            <ProfileSummary />
                            <GuessCardsSection />
                            <PhotoSection />
                            <VoiceSection />
                            <ContactSection />
                          </div>
                        }
                      />
                    ),
                  },
                  { path: 'you/hidden', element: <HideListScreen /> },
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
