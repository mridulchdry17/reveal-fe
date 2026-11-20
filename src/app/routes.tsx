import { Navigate, type RouteObject } from 'react-router'

import { ChatsScreen } from '@/features/chats/components/ChatsScreen'
import { YouScreen } from '@/features/settings/components/YouScreen'
import { TonightScreen } from '@/features/tonight/components/TonightScreen'

import { AppShell } from './AppShell'

export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/tonight" replace /> },
      { path: 'tonight', element: <TonightScreen /> },
      { path: 'chats', element: <ChatsScreen /> },
      { path: 'you', element: <YouScreen /> },
    ],
  },
]
