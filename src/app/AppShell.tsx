import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router'

import { useLikes } from '@/features/tonight/hooks/useLikes'

type Tab = {
  to: string
  label: string
  /** Drawn on a 24px grid; `active` lets the Likes heart fill in. */
  icon: (active: boolean) => ReactNode
}

const heart = 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z'

const tabs: Tab[] = [
  {
    to: '/app/tonight',
    label: 'Drop',
    icon: () => (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  },
  { to: '/app/likes', label: 'Likes', icon: (active) => <path d={heart} fill={active ? 'currentColor' : 'none'} /> },
  { to: '/app/chats', label: 'Chats', icon: () => <path d="M5 5h14v10H9l-4 4z" /> },
  {
    to: '/app/you',
    label: 'You',
    icon: () => (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" />
      </>
    ),
  },
]

export function AppShell() {
  // How many likes are waiting on me: a small count on the Likes tab.
  const waiting = useLikes().data?.length ?? 0

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-bg text-text">
      <main className="flex-1 px-6 pt-6">
        <Outlet />
      </main>
      <nav
        aria-label="Main"
        className="sticky bottom-0 z-10 grid grid-cols-4 border-t border-border bg-bg/95 px-2 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur"
      >
        {tabs.map((tab) => {
          const badge = tab.to === '/app/likes' && waiting > 0 ? waiting : null
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              aria-label={badge ? `${tab.label}, ${badge} waiting` : undefined}
              className={({ isActive }) =>
                `flex min-h-11 flex-col items-center gap-1 py-1 text-[11px] no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text ${
                  isActive ? 'font-bold text-text' : 'font-medium text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* The active tab gets a filled ink pill behind its icon: a shape change, not colour only. */}
                  <span
                    className={`relative flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-150 ${
                      isActive ? 'bg-text text-bg' : ''
                    }`}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {tab.icon(isActive)}
                    </svg>
                    {badge && (
                      <span
                        aria-hidden="true"
                        className="absolute -top-1 right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] leading-none font-bold text-on-accent"
                      >
                        {badge > 9 ? '9+' : badge}
                      </span>
                    )}
                  </span>
                  {tab.label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
